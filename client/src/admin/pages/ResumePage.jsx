/**
 * /admin/resume — upload / replace / delete the resume PDF.
 * Changes are saved immediately: uploading a new PDF updates settings.resume and the
 * server deletes the previous file from GridFS. The landing page "Download Resume"
 * button always points at the current file with ?download=1.
 */
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FiDownload, FiExternalLink, FiFileText, FiRefreshCw, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import SettingsPage from '../components/SettingsPage';
import { SectionCard, StatusBadge } from '../components/Feedback';
import UploadProgress from '../components/UploadProgress';
import Button from '../components/Button';
import { PDF_RULES, useFileUpload } from '../hooks/useFileUpload';
import { useConfirm } from '../context/ConfirmContext';
import { fileUrl, getErrorMessage } from '../../lib/apiClient';
import { uploadApi } from '../../services/adminApi';
import { formatBytes, formatDateTime } from '../../utils/format';

const RULES = [PDF_RULES];

const ResumeManager = ({ settings, save }) => {
  const confirm = useConfirm();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { upload, cancel, progress, uploading, error } = useFileUpload(RULES);
  const resume = settings.resume || {};
  const hasResume = Boolean(resume.url);

  const handleFile = async (file) => {
    if (!file) return;
    const result = await upload(file);
    if (!result) return;
    setBusy(true);
    try {
      await save({ resume: { url: result.url, fileId: result.fileId, fileName: file.name } });
      toast.success(hasResume ? 'Resume replaced — the old file was deleted' : 'Resume uploaded');
    } catch (err) {
      await uploadApi.remove(result.fileId).catch(() => {}); // don't leave an orphan behind
      toast.error(getErrorMessage(err, 'Could not save the resume'));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Delete resume?',
      message: 'The “Download Resume” button will disappear from your website until you upload a new one.',
      confirmLabel: 'Delete resume',
    });
    if (!ok) return;
    setBusy(true);
    try {
      await save({ resume: { url: '', fileId: '' } });
      toast.success('Resume deleted');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not delete the resume'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <input
        ref={inputRef}
        type="file"
        accept={PDF_RULES.accept}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      <SectionCard
        title="Current resume"
        actions={hasResume ? <StatusBadge tone="green" dot>Live on website</StatusBadge> : <StatusBadge tone="gray">No resume</StatusBadge>}
      >
        {hasResume ? (
          // Mobile: details above full-width buttons; sm+: details left, buttons right
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                <FiFileText className="h-7 w-7" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900 dark:text-white" title={resume.fileName}>
                  {resume.fileName || 'Resume.pdf'}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {resume.size ? `${formatBytes(resume.size)} · ` : ''}
                  {resume.updatedAt ? `Updated ${formatDateTime(resume.updatedAt)}` : ''}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <Button as="a" variant="secondary" href={fileUrl(resume.url)} target="_blank" rel="noopener noreferrer">
                <FiExternalLink className="h-4 w-4" /> Preview
              </Button>
              <Button as="a" variant="secondary" href={fileUrl(resume.url, { download: true })}>
                <FiDownload className="h-4 w-4" /> Download
              </Button>
              <Button onClick={() => inputRef.current?.click()} disabled={uploading || busy}>
                <FiRefreshCw className="h-4 w-4" /> Replace
              </Button>
              <Button variant="danger-ghost" onClick={handleDelete} loading={busy && !uploading} disabled={uploading}>
                <FiTrash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">No resume uploaded. The “Download Resume” button is hidden on your website.</p>
        )}
      </SectionCard>

      <SectionCard title={hasResume ? 'Upload a new version' : 'Upload your resume'} description="PDF only, max 10MB. It goes live immediately.">
        {uploading || busy ? (
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            {uploading ? <UploadProgress progress={progress} onCancel={cancel} /> : <p className="text-sm text-slate-600 dark:text-slate-300">Saving…</p>}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
            className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-10 text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
              dragOver ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50'
            }`}
          >
            <FiUploadCloud className="h-9 w-9 text-primary-500" aria-hidden="true" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              <span className="text-primary-600 dark:text-primary-400">Choose a PDF</span>
              <span className="hidden sm:inline"> or drag it here</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{PDF_RULES.hint}</span>
          </button>
        )}
        {error && (
          <p role="alert" className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">
            {error}
          </p>
        )}
      </SectionCard>
    </div>
  );
};

export default function ResumePage() {
  return (
    <SettingsPage title="Resume" description="The PDF behind the “Download Resume” button.">
      {(settings, save) => <ResumeManager settings={settings} save={save} />}
    </SettingsPage>
  );
}
