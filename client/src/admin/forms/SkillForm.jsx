/**
 * SkillForm — a skill category ("Frontend") with a sortable list of skills.
 * Each skill row: name, optional level, optional logo (auto-detected from the name when empty).
 * Rows: stacked on phones (name full width, level + icon below), one line from sm+.
 */
import { useForm, useFieldArray, useFormContext, get } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import AdminForm from '../components/AdminForm';
import { SortableList, DragHandle } from '../components/SortableList';
import { Field, Input, Select } from '../components/FormControls';
import Button from '../components/Button';
import { SwitchField, TextField, FormSection } from './FormFields';
import { requiredText } from './schemaHelpers';
import { SKILL_ICON_OPTIONS, getSkillIcon } from '../../utils/icons';

const LEVELS = ['', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

const schema = z.object({
  category: requiredText('Category', 60),
  items: z
    .array(
      z.object({
        name: z.string().trim().max(60, 'Max 60 characters'),
        level: z.enum(LEVELS),
        icon: z.string(),
      })
    )
    .max(80, 'At most 80 skills per category'),
  visible: z.boolean(),
});

const toFormValues = (item) => ({
  category: item?.category || '',
  items: (item?.items?.length ? item.items : [{ name: '' }]).map((s) => ({ name: s.name || '', level: s.level || '', icon: s.icon || '' })),
  visible: item?.visible ?? true,
});

const toPayload = (values) => ({ ...values, items: values.items.filter((s) => s.name.trim()) });

/** One editable skill row with a live icon preview. */
const SkillRow = ({ index, handle, onRemove }) => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();
  const [name, icon] = watch([`items.${index}.name`, `items.${index}.icon`]);
  const Icon = getSkillIcon({ name, icon });
  const nameError = get(errors, `items.${index}.name`)?.message;

  return (
    <div className="flex items-start gap-1.5 rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900">
      <DragHandle handle={handle} />
      {/* Phones: name on its own line, selects below; sm+: everything on one row */}
      <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_9rem_9rem]">
        <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
          <span className="flex h-11 w-9 shrink-0 items-center justify-center text-slate-500 dark:text-slate-400" aria-hidden="true">
            {Icon ? <Icon className="h-5 w-5" /> : <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />}
          </span>
          <Input placeholder="Skill name" aria-label={`Skill ${index + 1} name`} invalid={!!nameError} {...register(`items.${index}.name`)} />
        </div>
        <Select aria-label={`Skill ${index + 1} level`} {...register(`items.${index}.level`)}>
          {LEVELS.map((level) => (
            <option key={level || 'none'} value={level}>
              {level || 'No level'}
            </option>
          ))}
        </Select>
        <Select aria-label={`Skill ${index + 1} logo`} {...register(`items.${index}.icon`)}>
          <option value="">Auto logo</option>
          {SKILL_ICON_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>
      <Button variant="danger-ghost" size="icon" onClick={onRemove} aria-label={`Remove skill ${index + 1}`}>
        <FiTrash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

const SkillItemsEditor = () => {
  const { control } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({ control, name: 'items' });

  return (
    <Field label="Skills" hint="Drag to reorder. Empty rows are ignored." className="md:col-span-2">
      <div className="space-y-2">
        <SortableList
          items={fields}
          getId={(f) => f.id}
          onReorder={(_, { from, to }) => move(from, to)}
          className="space-y-2"
          renderItem={(field, index, handle) => <SkillRow index={index} handle={handle} onRemove={() => remove(index)} />}
        />
        <Button variant="secondary" size="sm" onClick={() => append({ name: '', level: '', icon: '' })} className="min-h-11 lg:min-h-9">
          <FiPlus className="h-4 w-4" /> Add skill
        </Button>
      </div>
    </Field>
  );
};

export default function SkillForm({ item, onSave, onCancel, onSaved, onDirtyChange, controlRef }) {
  const methods = useForm({ resolver: zodResolver(schema), defaultValues: toFormValues(item) });

  return (
    <AdminForm
      methods={methods}
      onSave={onSave}
      toPayload={toPayload}
      onCancel={onCancel}
      onSaved={onSaved}
      onDirtyChange={onDirtyChange}
      controlRef={controlRef}
      submitLabel={item ? 'Save category' : 'Create category'}
      successMessage={item ? 'Skills updated' : 'Skill category created'}
    >
      <TextField name="category" label="Category name" required placeholder="e.g. Frontend" />
      <SwitchField name="visible" label="Visible on site" />
      <FormSection title="Skills in this category" />
      <SkillItemsEditor />
    </AdminForm>
  );
}
