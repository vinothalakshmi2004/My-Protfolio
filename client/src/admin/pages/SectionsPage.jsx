/**
 * /admin/sections — show/hide each landing-page section (its navbar link hides too),
 * drag to reorder them, and edit each section's navbar label, badge, title and subtitle.
 * Hero (top) and footer (bottom) are always shown.
 */
import { useState } from 'react';
import { Controller, useFieldArray, useForm, useFormContext, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiChevronDown, FiEye, FiEyeOff } from 'react-icons/fi';
import SettingsPage from '../components/SettingsPage';
import AdminForm from '../components/AdminForm';
import { Card, StatusBadge } from '../components/Feedback';
import { Field, Input, Switch, Textarea } from '../components/FormControls';
import { SortableList, DragHandle } from '../components/SortableList';
import { getSectionContent, normaliseSectionOrder } from '../../utils/sections';

const sectionSchema = z.object({
  key: z.string(),
  visible: z.boolean(),
  navLabel: z.string().trim().min(1, 'Navbar label is required').max(40),
  badge: z.string().trim().max(60),
  title: z.string().trim().min(1, 'Title is required').max(120),
  subtitle: z.string().trim().max(300),
});
const schema = z.object({ sections: z.array(sectionSchema) });

const fromSettings = (s) => ({
  sections: normaliseSectionOrder(s.sectionOrder).map((key) => ({
    key,
    visible: s.sectionVisibility?.[key] !== false,
    ...getSectionContent(s, key),
  })),
});

const toPayload = ({ sections }) => ({
  sectionOrder: sections.map((s) => s.key),
  sectionVisibility: Object.fromEntries(sections.map((s) => [s.key, s.visible])),
  sectionContent: Object.fromEntries(sections.map(({ key, navLabel, badge, title, subtitle }) => [key, { navLabel, badge, title, subtitle }])),
});

/** One section row: handle, name, visibility switch, expandable heading editor. */
const SectionRow = ({ index, handle }) => {
  const { register, formState } = useFormContext();
  const [open, setOpen] = useState(false);
  const [key, visible, navLabel] = useWatch({ name: [`sections.${index}.key`, `sections.${index}.visible`, `sections.${index}.navLabel`] });
  const errors = formState.errors.sections?.[index] || {};
  const hasError = Object.keys(errors).length > 0;

  return (
    <Card className={`overflow-hidden ${visible ? '' : 'opacity-75'}`}>
      <div className="flex items-center gap-1 p-2 sm:gap-2">
        <DragHandle handle={handle} />
        <span className="flex h-9 w-6 shrink-0 items-center justify-center text-sm font-semibold text-slate-400">{index + 1}</span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-lg px-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <span className="min-w-0">
            <span className="block truncate font-medium text-slate-900 dark:text-white">{navLabel || key}</span>
            <span className="block text-xs capitalize text-slate-500 dark:text-slate-400">{key} section</span>
          </span>
          {hasError && <StatusBadge tone="rose">Fix fields</StatusBadge>}
          <FiChevronDown className={`ml-auto h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {/* Visibility: icon + switch; the label text only appears from sm+ */}
        <Controller
          name={`sections.${index}.visible`}
          render={({ field }) => (
            <label className="flex min-h-11 shrink-0 cursor-pointer items-center gap-2 px-1">
              {field.value ? <FiEye className="h-4 w-4 text-emerald-500" aria-hidden="true" /> : <FiEyeOff className="h-4 w-4 text-slate-400" aria-hidden="true" />}
              <span className="hidden text-xs text-slate-500 sm:inline">{field.value ? 'Shown' : 'Hidden'}</span>
              <Switch size="sm" checked={field.value} onChange={field.onChange} />
            </label>
          )}
        />
      </div>

      {(open || hasError) && (
        // Heading editor: 1 column on mobile, 2 columns on md+
        <div className="grid grid-cols-1 gap-4 border-t border-slate-100 px-4 py-4 dark:border-slate-800 md:grid-cols-2">
          <Field label="Navbar label" required error={errors.navLabel?.message}>
            <Input invalid={!!errors.navLabel} {...register(`sections.${index}.navLabel`)} />
          </Field>
          <Field label="Badge (small text above the title)" error={errors.badge?.message}>
            <Input {...register(`sections.${index}.badge`)} />
          </Field>
          <Field label="Title" required error={errors.title?.message} className="md:col-span-2">
            <Input invalid={!!errors.title} {...register(`sections.${index}.title`)} />
          </Field>
          <Field label="Subtitle" error={errors.subtitle?.message} className="md:col-span-2">
            <Textarea rows={2} {...register(`sections.${index}.subtitle`)} />
          </Field>
        </div>
      )}
    </Card>
  );
};

const SectionsEditor = () => {
  const { control } = useFormContext();
  const { fields, move } = useFieldArray({ control, name: 'sections' });
  return (
    <div className="space-y-3">
      <Card className="flex items-center gap-3 border-dashed px-4 py-3 text-sm text-slate-500 dark:text-slate-400">Hero — always first</Card>
      <SortableList
        items={fields}
        getId={(f) => f.id}
        onReorder={(_, { from, to }) => move(from, to)}
        className="space-y-3"
        renderItem={(field, index, handle) => <SectionRow index={index} handle={handle} />}
      />
      <Card className="flex items-center gap-3 border-dashed px-4 py-3 text-sm text-slate-500 dark:text-slate-400">Footer — always last</Card>
    </div>
  );
};

const SectionsForm = ({ settings, save }) => {
  const methods = useForm({ resolver: zodResolver(schema), defaultValues: fromSettings(settings) });
  return (
    <AdminForm
      variant="page"
      grid={false}
      methods={methods}
      onSave={save}
      toPayload={toPayload}
      onSaved={(saved) => methods.reset(fromSettings(saved))}
      successMessage="Layout saved"
    >
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        Drag sections to change their order. Hidden sections (and their navbar links) disappear from the website. Sections with no
        items (e.g. no certifications) are hidden automatically.
      </p>
      <SectionsEditor />
    </AdminForm>
  );
};

export default function SectionsPage() {
  return (
    <SettingsPage title="Sections & Layout" description="Order, visibility and headings of the landing-page sections.">
      {(settings, save) => <SectionsForm settings={settings} save={save} />}
    </SettingsPage>
  );
}
