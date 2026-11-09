/**
 * ExperienceForm — company, role, dates (month pickers; end date disabled for a current role),
 * bullet points (sortable list), optional company logo and visibility.
 */
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdminForm from '../components/AdminForm';
import { FormSection, ImageField, ListField, SwitchField, TextField } from './FormFields';
import { fileRefSchema, monthField, optionalText, requiredText, toFileRef } from './schemaHelpers';

const schema = z
  .object({
    company: requiredText('Company', 120),
    role: requiredText('Role', 120),
    location: optionalText('Location', 120),
    startDate: monthField('Start date'),
    endDate: monthField('End date'),
    isCurrent: z.boolean(),
    bullets: z.array(z.string().max(600, 'Each point must be at most 600 characters')).max(20),
    companyLogo: fileRefSchema,
    visible: z.boolean(),
  })
  .refine((v) => v.isCurrent || !v.startDate || !v.endDate || v.endDate >= v.startDate, {
    message: 'End date must be after the start date',
    path: ['endDate'],
  });

const toFormValues = (item) => ({
  company: item?.company || '',
  role: item?.role || '',
  location: item?.location || '',
  startDate: item?.startDate || '',
  endDate: item?.endDate || '',
  isCurrent: item?.isCurrent ?? false,
  bullets: item?.bullets?.length ? item.bullets : [''],
  companyLogo: toFileRef(item?.companyLogo),
  visible: item?.visible ?? true,
});

const toPayload = (values) => ({
  ...values,
  endDate: values.isCurrent ? '' : values.endDate,
  bullets: values.bullets.map((b) => b.trim()).filter(Boolean),
});

/** Clears + disables the end date while "I currently work here" is on. */
const EndDateField = () => {
  const isCurrent = useWatch({ name: 'isCurrent' });
  return <TextField name="endDate" label="End date" type="month" disabled={isCurrent} placeholder="YYYY-MM" hint={isCurrent ? 'Shown as “Present”' : undefined} />;
};

export default function ExperienceForm({ item, onSave, onCancel, onSaved, onDirtyChange, controlRef }) {
  const methods = useForm({ resolver: zodResolver(schema), defaultValues: toFormValues(item) });
  const isCurrent = methods.watch('isCurrent');
  useEffect(() => {
    if (isCurrent) methods.setValue('endDate', '', { shouldDirty: true });
  }, [isCurrent, methods]);

  return (
    <AdminForm
      methods={methods}
      onSave={onSave}
      toPayload={toPayload}
      onCancel={onCancel}
      onSaved={onSaved}
      onDirtyChange={onDirtyChange}
      controlRef={controlRef}
      submitLabel={item ? 'Save experience' : 'Add experience'}
      successMessage={item ? 'Experience updated' : 'Experience added'}
    >
      <TextField name="role" label="Role / job title" required placeholder="e.g. AI Automation Engineer" />
      <TextField name="company" label="Company" required placeholder="e.g. ZenXAI" />
      <TextField name="location" label="Location" placeholder="City, State or Remote" span />
      <SwitchField name="isCurrent" label="I currently work here" span />
      <TextField name="startDate" label="Start date" type="month" placeholder="YYYY-MM" />
      <EndDateField />

      <FormSection title="Highlights" description="One achievement or responsibility per row." />
      <ListField name="bullets" label="Bullet points" placeholder="What did you build or improve?" addLabel="Add bullet" multiline max={20} />

      <FormSection title="Display" />
      <ImageField name="companyLogo" label="Company logo (optional)" aspect="square" span={false} />
      <SwitchField name="visible" label="Visible on site" />
    </AdminForm>
  );
}
