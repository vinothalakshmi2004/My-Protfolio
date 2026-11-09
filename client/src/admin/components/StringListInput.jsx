/**
 * StringListInput — dynamic list of text rows (project features, experience bullets).
 *
 *  value: string[]   onChange(string[])
 *  Each row: drag handle (reorder), text field, remove button. "Add" appends an empty row.
 *  Empty rows are dropped by the server, so the admin can leave a blank row safely.
 */
import { useRef } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { SortableList, DragHandle } from './SortableList';
import { Input, Textarea } from './FormControls';
import Button from './Button';

export const StringListInput = ({ value = [], onChange, placeholder = 'Add an item', addLabel = 'Add item', multiline = false, max = 30 }) => {
  // Stable ids per row so drag-and-drop + React keys survive edits
  const idsRef = useRef([]);
  const counter = useRef(0);
  while (idsRef.current.length < value.length) idsRef.current.push(`row-${(counter.current += 1)}`);
  idsRef.current.length = value.length;
  const rows = value.map((text, index) => ({ id: idsRef.current[index], text }));

  const update = (index, text) => onChange(value.map((v, i) => (i === index ? text : v)));
  const remove = (index) => {
    idsRef.current.splice(index, 1);
    onChange(value.filter((_, i) => i !== index));
  };
  const add = () => onChange([...value, '']);
  const reorder = (nextRows) => {
    idsRef.current = nextRows.map((r) => r.id);
    onChange(nextRows.map((r) => r.text));
  };

  const Control = multiline ? Textarea : Input;

  return (
    <div className="space-y-2">
      <SortableList
        items={rows}
        getId={(row) => row.id}
        onReorder={reorder}
        className="space-y-2"
        renderItem={(row, index, handle) => (
          <div className="flex items-start gap-1.5 rounded-lg bg-white dark:bg-slate-900">
            <DragHandle handle={handle} />
            <Control
              value={row.text}
              onChange={(e) => update(index, e.target.value)}
              placeholder={placeholder}
              rows={multiline ? 2 : undefined}
              aria-label={`Item ${index + 1}`}
              className="flex-1"
            />
            <Button variant="danger-ghost" size="icon" onClick={() => remove(index)} aria-label={`Remove item ${index + 1}`}>
              <FiTrash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />
      {value.length < max && (
        <Button variant="secondary" size="sm" onClick={add} className="min-h-11 lg:min-h-9">
          <FiPlus className="h-4 w-4" /> {addLabel}
        </Button>
      )}
    </div>
  );
};

export default StringListInput;
