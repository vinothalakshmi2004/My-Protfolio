/**
 * /admin/messages — contact-form inbox.
 *  - Filter (All / Unread / Read) + search
 *  - Opening a message marks it as read
 *  - Actions: Reply (mailto: with "Re: subject"), mark read/unread, delete (confirm)
 *
 * Layout: lg+ = split view (list left, message right).
 *         Below lg = list only; a message opens in a full-screen modal.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiCornerUpLeft, FiInbox, FiMail, FiRefreshCw, FiSearch, FiTrash2 } from 'react-icons/fi';
import { messagesApi } from '../../services/adminApi';
import { getErrorMessage } from '../../lib/apiClient';
import { formatDateTime, formatRelative } from '../../utils/format';
import { useConfirm } from '../context/ConfirmContext';
import { useAdminShell } from '../layout/AdminLayout';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { Card, EmptyState, PageHeader, SkeletonList, StatusBadge } from '../components/Feedback';
import { Input } from '../components/FormControls';
import Modal from '../components/Modal';
import Button from '../components/Button';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
];

/** Full message with its actions (used in the split pane and in the mobile modal). */
const MessageDetail = ({ message, onToggleRead, onDelete }) => {
  const replyHref = `mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`;
  return (
    <div className="flex h-full flex-col">
      <div className="space-y-1 border-b border-slate-100 pb-4 dark:border-slate-800">
        <h2 className="break-words text-lg font-semibold text-slate-900 dark:text-white">{message.subject}</h2>
        <p className="break-words text-sm text-slate-700 dark:text-slate-300">
          <span className="font-medium">{message.name}</span>{' '}
          <a href={`mailto:${message.email}`} className="break-all text-primary-600 hover:underline dark:text-primary-400">
            &lt;{message.email}&gt;
          </a>
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{formatDateTime(message.createdAt)}</p>
      </div>
      <div className="flex-1 whitespace-pre-wrap break-words py-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{message.message}</div>
      {/* Actions: full-width stacked buttons on phones, inline row from sm+ */}
      <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:flex-wrap">
        <Button as="a" href={replyHref} className="w-full sm:w-auto">
          <FiCornerUpLeft className="h-4 w-4" /> Reply
        </Button>
        <Button variant="secondary" onClick={() => onToggleRead(message)} className="w-full sm:w-auto">
          <FiMail className="h-4 w-4" /> Mark as {message.isRead ? 'unread' : 'read'}
        </Button>
        <Button variant="danger-ghost" onClick={() => onDelete(message)} className="w-full sm:ml-auto sm:w-auto">
          <FiTrash2 className="h-4 w-4" /> Delete
        </Button>
      </div>
    </div>
  );
};

export default function MessagesPage() {
  const confirm = useConfirm();
  const { refreshUnread } = useAdminShell();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [searchParams, setSearchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(searchParams.get('open'));

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await messagesApi.list();
      setMessages(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load messages'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => ({ all: messages.length, unread: messages.filter((m) => !m.isRead).length, read: messages.filter((m) => m.isRead).length }), [messages]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return messages.filter(
      (m) =>
        (filter === 'all' || (filter === 'unread' ? !m.isRead : m.isRead)) &&
        (!q || `${m.name} ${m.email} ${m.subject} ${m.message}`.toLowerCase().includes(q))
    );
  }, [messages, filter, query]);

  const selected = messages.find((m) => m._id === selectedId) || null;

  const setRead = useCallback(
    async (message, isRead) => {
      setMessages((prev) => prev.map((m) => (m._id === message._id ? { ...m, isRead } : m)));
      try {
        await messagesApi.setRead(message._id, isRead);
        refreshUnread();
      } catch (err) {
        setMessages((prev) => prev.map((m) => (m._id === message._id ? { ...m, isRead: !isRead } : m)));
        toast.error(getErrorMessage(err));
      }
    },
    [refreshUnread]
  );

  /** Opening a message marks it as read. */
  const open = (message) => {
    setSelectedId(message._id);
    if (searchParams.get('open')) setSearchParams({}, { replace: true });
    if (!message.isRead) setRead(message, true);
  };

  // Deep link from the overview (?open=<id>): mark it read once loaded
  useEffect(() => {
    if (selected && !selected.isRead && searchParams.get('open') === selected._id) setRead(selected, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const remove = async (message) => {
    const ok = await confirm({ title: 'Delete this message?', message: `From ${message.name} — “${message.subject}”. This cannot be undone.`, confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      await messagesApi.remove(message._id);
      setMessages((prev) => prev.filter((m) => m._id !== message._id));
      setSelectedId(null);
      refreshUnread();
      toast.success('Message deleted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const detailProps = { onToggleRead: (m) => setRead(m, !m.isRead), onDelete: remove };

  return (
    <div>
      <PageHeader
        title="Messages"
        description="Messages sent through your website's contact form."
        badge={counts.unread > 0 && <StatusBadge tone="blue">{counts.unread} unread</StatusBadge>}
        actions={
          <Button variant="secondary" onClick={load}>
            <FiRefreshCw className="h-4 w-4" /> Refresh
          </Button>
        }
      />

      {/* Toolbar: filter tabs + search stack on phones, one row from sm+ */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div role="tablist" aria-label="Filter messages" className="inline-flex rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              role="tab"
              aria-selected={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={`min-h-9 flex-1 rounded-md px-3 text-sm font-medium transition sm:flex-none ${
                filter === f.value ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {f.label} <span className="opacity-70">({counts[f.value]})</span>
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search messages…" aria-label="Search messages" className="pl-9" />
        </div>
      </div>

      {error ? (
        <EmptyState title="Couldn't load messages" description={error} action={<Button variant="secondary" onClick={load}>Try again</Button>} />
      ) : (
        // Split view on lg+: list (2/5) + detail (3/5). Below lg: list only.
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <Card className="overflow-hidden lg:col-span-2">
            {loading ? (
              <SkeletonList rows={6} />
            ) : visible.length === 0 ? (
              <EmptyState icon={FiInbox} title={messages.length ? 'No matching messages' : 'Inbox is empty'} description={messages.length ? undefined : 'Messages from your contact form will appear here.'} className="m-4" />
            ) : (
              <ul className="max-h-none divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800 lg:max-h-[70vh]">
                {visible.map((m) => (
                  <li key={m._id}>
                    <button
                      type="button"
                      onClick={() => open(m)}
                      aria-current={selectedId === m._id ? 'true' : undefined}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                        selectedId === m._id && isDesktop ? 'bg-primary-50 dark:bg-primary-500/10' : ''
                      }`}
                    >
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${m.isRead ? 'bg-transparent' : 'bg-primary-500'}`} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className={`truncate text-sm ${m.isRead ? 'text-slate-700 dark:text-slate-300' : 'font-semibold text-slate-900 dark:text-white'}`}>{m.name}</span>
                          <span className="shrink-0 text-xs text-slate-400">{formatRelative(m.createdAt)}</span>
                        </span>
                        <span className={`block truncate text-sm ${m.isRead ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>{m.subject}</span>
                        <span className="block truncate text-xs text-slate-400">{m.message}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {isDesktop && (
            <Card className="p-6 lg:col-span-3">
              {selected ? <MessageDetail message={selected} {...detailProps} /> : <EmptyState icon={FiMail} title="Select a message" description="Choose a message on the left to read it." />}
            </Card>
          )}
        </div>
      )}

      {/* Below lg: the message opens in a full-screen modal */}
      {!isDesktop && (
        <Modal open={Boolean(selected)} onClose={() => setSelectedId(null)} title="Message" size="lg">
          {selected && <MessageDetail message={selected} {...detailProps} />}
        </Modal>
      )}
    </div>
  );
}
