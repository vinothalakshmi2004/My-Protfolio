/**
 * TagInput — chip/tag editor for string arrays (tech stack, typing roles, ...).
 *
 *  value: string[]   onChange(string[])
 *  Add:    Enter, comma or Tab (or paste "a, b, c")
 *  Remove: × on a chip, or Backspace in the empty input
 * Duplicates (case-insensitive) are ignored.
 */
import { useId, useState } from 'react';
import { FiX } from 'react-icons/fi';

export const TagInput = ({ value = [], onChange, placeholder = 'Type and press Enter', maxTags = 40, maxLength = 60, invalid, id, suggestions = [] }) => {
  const [draft, setDraft] = useState('');
  const listId = useId();
  const inputId = id || listId;

  const addTags = (raw) => {
    const incoming = raw
      .split(',')
      .map((t) => t.trim().slice(0, maxLength))
      .filter(Boolean);
    if (!incoming.length) return;
    const lower = new Set(value.map((t) => t.toLowerCase()));
    const next = [...value];
    incoming.forEach((tag) => {
      if (!lower.has(tag.toLowerCase()) && next.length < maxTags) {
        next.push(tag);
        lower.add(tag.toLowerCase());
      }
    });
    onChange(next);
    setDraft('');
  };

  const removeAt = (index) => onChange(value.filter((_, i) => i !== index));

  const onKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',' || (e.key === 'Tab' && draft.trim())) && !e.nativeEvent.isComposing) {
      e.preventDefault();
      addTags(draft);
    } else if (e.key === 'Backspace' && !draft && value.length) {
      removeAt(value.length - 1);
    }
  };

  return (
    <div
      className={`flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-lg border bg-white px-2 py-1.5 shadow-sm focus-within:ring-2 dark:bg-slate-900 ${
        invalid
          ? 'border-rose-400 focus-within:ring-rose-500/30'
          : 'border-slate-300 focus-within:border-primary-500 focus-within:ring-primary-500/30 dark:border-slate-700'
      }`}
    >
      {value.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          className="inline-flex max-w-full items-center gap-1 rounded-md bg-primary-50 py-1 pl-2 pr-1 text-sm font-medium text-primary-700 dark:bg-primary-500/15 dark:text-primary-200"
        >
          <span className="truncate">{tag}</span>
          <button
            type="button"
            onClick={() => removeAt(index)}
            aria-label={`Remove ${tag}`}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-primary-100 hover:text-rose-600 dark:hover:bg-primary-500/25"
          >
            <FiX className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
      <input
        id={inputId}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => draft.trim() && addTags(draft)}
        onPaste={(e) => {
          const text = e.clipboardData.getData('text');
          if (text.includes(',')) {
            e.preventDefault();
            addTags(text);
          }
        }}
        list={suggestions.length ? `${inputId}-suggestions` : undefined}
        placeholder={value.length ? '' : placeholder}
        aria-invalid={invalid || undefined}
        className="min-w-[8rem] flex-1 border-0 bg-transparent px-1 py-1 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-slate-100 sm:text-sm"
      />
      {suggestions.length > 0 && (
        <datalist id={`${inputId}-suggestions`}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
    </div>
  );
};

export default TagInput;
