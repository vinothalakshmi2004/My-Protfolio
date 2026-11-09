/**
 * FileUploader — single-file uploader for PDFs (resume) or "image or PDF" (certificates).
 *
 *  value:    { url, fileId, contentType?, fileName? }
 *  onChange: receives { url, fileId, contentType, fileName } after upload, or empty values on remove
 *  accept:   'pdf' | 'image-or-pdf'
 *
 * Shows the current file with Preview (opens inline in a new tab) and Download
 * (?download=1) links, plus Replace / Remove. Drag & drop + progress bar like ImageUploader.
 */
import { useRef, useState } from 'react';
import { FiDownload, FiExternalLink, FiFileText, FiRefreshCw, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import { fileUrl } from '../../lib/apiClient';
import { IMAGE_RULES, PDF_RULES, useFileUpload } from '../hooks/useFileUpload';
import { formatBytes } from '../../utils/format';
import UploadProgress from './UploadProgress';
import Button from './Button';

const RULE_SETS = { pdf: [PDF_RULES], 'image-or-pdf': [IMAGE_RULES, PDF_RULES] };

export const FileUploader = ({ value, onChange, accept = 'pdf', disabled = false, emptyLabel, meta, hideRemove = false, className = '' }) => {
  const rules = RULE_SETS[accept];
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const { upload, cancel, release, progress, uploading, error } = useFileUpload(rules);

  const hasFile = Boolean(value?.url);
  const isImage = (value?.contentType || '').startsWith('image/');
  const name = value?.fileName || (isImage ? 'Image' : 'Document.pdf');

  const handleFile = async (file) => {
    if (!file || disabled) return;
    const result = await upload(file);
    if (result) {
      if (value?.fileId) release(value.fileId);
      onChange({ url: result.url, fileId: result.fileId, contentType: result.contentType, fileName: file.name, size: result.size });
    }
  };

  const remove = () => {
    if (value?.fileId) release(value.fileId);
    onChange({ url: '', fileId: '', contentType: '', fileName: '' });
  };

  const dropHandlers = {
    onDragOver: (e) => {
      e.preventDefault();
      if (!disabled) setDragOver(true);
    },
    onDragLeave: () => setDragOver(false),
    onDrop: (e) => {
      e.preventDefault();
      setDragOver(false);
      handleFile(e.dataTransfer.files?.[0]);
    },
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept={rules.map((r) => r.accept).join(',')}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      {uploading ? (
        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <UploadProgress progress={progress} onCancel={cancel} />
        </div>
      ) : hasFile ? (
        <div {...dropHandlers} className={`rounded-xl border p-3 sm:p-4 ${dragOver ? 'border-primary-500 ring-2 ring-primary-500/30' : 'border-slate-200 dark:border-slate-700'}`}>
          {/* Mobile: file info above the buttons; sm+: info left, buttons right */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {isImage ? (
                <img src={fileUrl(value.url)} alt="" width="56" height="56" loading="lazy" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
              ) : (
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                  <FiFileText className="h-6 w-6" />
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-white" title={name}>
                  {name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{meta || (value.size ? formatBytes(value.size) : isImage ? 'Image' : 'PDF document')}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button as="a" variant="secondary" size="sm" href={fileUrl(value.url)} target="_blank" rel="noopener noreferrer" className="min-h-11 lg:min-h-9">
                <FiExternalLink className="h-4 w-4" /> Preview
              </Button>
              {!isImage && (
                <Button as="a" variant="secondary" size="sm" href={fileUrl(value.url, { download: true })} className="min-h-11 lg:min-h-9">
                  <FiDownload className="h-4 w-4" /> Download
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={disabled} className="min-h-11 lg:min-h-9">
                <FiRefreshCw className="h-4 w-4" /> Replace
              </Button>
              {!hideRemove && (
                <Button variant="danger-ghost" size="sm" onClick={remove} disabled={disabled} className="min-h-11 lg:min-h-9">
                  <FiTrash2 className="h-4 w-4" /> Remove
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          {...dropHandlers}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-60 ${
            dragOver ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50'
          }`}
        >
          <FiUploadCloud className="h-8 w-8 text-primary-500" aria-hidden="true" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            <span className="text-primary-600 dark:text-primary-400">{emptyLabel || 'Click to upload'}</span>
            <span className="hidden sm:inline"> or drag & drop</span>
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{rules.map((r) => r.hint).join(' · or ')}</span>
        </button>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default FileUploader;
