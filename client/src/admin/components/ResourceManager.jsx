/**
 * ResourceManager — the complete "list + add/edit drawer + delete + reorder + hide" screen,
 * shared by Projects, Experience, Education, Skills, Certifications and Achievements.
 *
 * Props:
 *  title, description, itemName ("project"), api (createResourceApi result)
 *  columns          DataTable column config
 *  Form             component({ item, onSave, onCancel, onDirtyChange, controlRef })
 *  searchText(item) enables the search box (text to match against)
 *  filter           { label, getValue(item) } enables a dropdown filter built from the data
 *  getTitle(item)   used in confirmations / toasts
 *
 * Drag-to-reorder is disabled while searching/filtering (reordering a subset is ambiguous).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiEdit2, FiPlus, FiSearch, FiTrash2, FiX } from 'react-icons/fi';
import { getErrorMessage } from '../../lib/apiClient';
import { useConfirm } from '../context/ConfirmContext';
import { useResourceList } from '../hooks/useResourceList';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import DataTable from './DataTable';
import FormDrawer from './FormDrawer';
import Button from './Button';
import { Input, Select, Switch } from './FormControls';
import { EmptyState, PageHeader, StatusBadge } from './Feedback';

export const ResourceManager = ({ title, description, itemName, api, columns, Form, searchText, filter, getTitle = (i) => i.title, emptyIcon }) => {
  const confirm = useConfirm();
  const { items, loading, error, reload, save, remove, reorder, setVisible } = useResourceList(api);
  const [query, setQuery] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [editing, setEditing] = useState(null); // null = closed, {} = new, item = edit
  const [drawerDirty, setDrawerDirty] = useState(false);
  const formControl = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Deep link from the Overview quick actions: /admin/<resource>?new=1 opens the "Add" drawer
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditing({});
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Warn before navigating away with an open, edited drawer
  useUnsavedChanges(Boolean(editing) && drawerDirty);

  const filterOptions = useMemo(
    () => (filter ? [...new Set(items.map(filter.getValue).filter(Boolean))].sort((a, b) => a.localeCompare(b)) : []),
    [items, filter]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (item) => (!q || (searchText?.(item) || '').toLowerCase().includes(q)) && (!filterValue || filter?.getValue(item) === filterValue)
    );
  }, [items, query, filterValue, searchText, filter]);

  const isFiltering = Boolean(query.trim() || filterValue);
  const hiddenCount = items.filter((i) => i.visible === false).length;

  const openNew = () => setEditing({});
  const close = useCallback(() => {
    setEditing(null);
    setDrawerDirty(false);
  }, []);
  // X button / Escape / backdrop go through the form's cancel (asks if dirty, cleans uploads)
  const requestClose = () => (formControl.current ? formControl.current.cancel() : close());

  const handleSave = (data) => save(editing?._id || null, data);

  const handleDelete = async (item) => {
    const ok = await confirm({
      title: `Delete this ${itemName}?`,
      message: (
        <>
          <strong className="break-words">“{getTitle(item)}”</strong> will be permanently deleted, together with any images or files attached to it.
          This cannot be undone.
        </>
      ),
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    try {
      const result = await remove(item._id);
      toast.success(`Deleted${result?.filesDeleted ? ` (${result.filesDeleted} file${result.filesDeleted === 1 ? '' : 's'} removed)` : ''}`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not delete'));
    }
  };

  const tableColumns = [
    ...columns,
    {
      key: '__status',
      header: 'Status',
      width: '7rem',
      wideOnly: true, // the visibility switch already shows the state on smaller tables
      render: (item) => (
        <StatusBadge tone={item.visible === false ? 'gray' : 'green'} dot>
          {item.visible === false ? 'Hidden' : 'Visible'}
        </StatusBadge>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        badge={!loading && <StatusBadge tone="violet">{items.length} total{hiddenCount ? ` · ${hiddenCount} hidden` : ''}</StatusBadge>}
        actions={
          <Button onClick={openNew} className="w-full sm:w-auto">
            <FiPlus className="h-4 w-4" /> Add {itemName}
          </Button>
        }
      />

      {(searchText || filter) && items.length > 0 && (
        // Toolbar: search + filter stack on mobile, sit in one row from sm+
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          {searchText && (
            <div className="relative flex-1">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${title.toLowerCase()}…`}
                aria-label={`Search ${title}`}
                className="pl-9"
              />
            </div>
          )}
          {filter && filterOptions.length > 0 && (
            <Select value={filterValue} onChange={(e) => setFilterValue(e.target.value)} aria-label={filter.label} className="sm:w-56">
              <option value="">All {filter.label.toLowerCase()}</option>
              {filterOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          )}
          {isFiltering && (
            <Button
              variant="ghost"
              onClick={() => {
                setQuery('');
                setFilterValue('');
              }}
            >
              <FiX className="h-4 w-4" /> Clear
            </Button>
          )}
        </div>
      )}

      {isFiltering && <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">Drag-to-reorder is paused while searching or filtering.</p>}
      {!isFiltering && items.length > 1 && (
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">Drag the ⋮⋮ handle to change the order shown on the website.</p>
      )}

      {error ? (
        <EmptyState
          title="Couldn't load the list"
          description={error}
          action={
            <Button variant="secondary" onClick={reload}>
              Try again
            </Button>
          }
        />
      ) : (
        <DataTable
          caption={title}
          items={filtered}
          columns={tableColumns}
          loading={loading}
          sortable
          reorderDisabled={isFiltering}
          onReorder={reorder}
          rowClassName={(item) => (item.visible === false ? 'opacity-70' : '')}
          empty={
            isFiltering ? (
              <EmptyState icon={FiSearch} title="No matches" description="Try a different search or filter." />
            ) : (
              <EmptyState
                icon={emptyIcon}
                title={`No ${title.toLowerCase()} yet`}
                description={`Add your first ${itemName} — it will appear on the website straight away.`}
                action={
                  <Button onClick={openNew}>
                    <FiPlus className="h-4 w-4" /> Add {itemName}
                  </Button>
                }
              />
            )
          }
          actions={(item) => (
            <>
              <Switch
                size="sm"
                checked={item.visible !== false}
                onChange={(next) => setVisible(item._id, next)}
                id={`vis-${item._id}`}
              />
              <span className="sr-only">Visible on site</span>
              <Button variant="ghost" size="icon" onClick={() => setEditing(item)} aria-label={`Edit ${getTitle(item)}`} title="Edit">
                <FiEdit2 className="h-4 w-4" />
              </Button>
              <Button variant="danger-ghost" size="icon" onClick={() => handleDelete(item)} aria-label={`Delete ${getTitle(item)}`} title="Delete">
                <FiTrash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        />
      )}

      <FormDrawer
        open={Boolean(editing)}
        onRequestClose={requestClose}
        title={editing?._id ? `Edit ${itemName}` : `Add ${itemName}`}
        description={editing?._id ? getTitle(editing) : undefined}
      >
        {editing && (
          <Form
            key={editing._id || 'new'}
            item={editing._id ? editing : null}
            onSave={handleSave}
            onCancel={close}
            onSaved={close}
            onDirtyChange={setDrawerDirty}
            controlRef={formControl}
          />
        )}
      </FormDrawer>
    </div>
  );
};

export default ResourceManager;
