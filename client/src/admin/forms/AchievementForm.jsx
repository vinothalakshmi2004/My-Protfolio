/**
 * AchievementForm — title, date, description and an optional image.
 */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdminForm from '../components/AdminForm';
import { ImageField, SwitchField, TextField } from './FormFields';
import { fileRefSchema, monthField, optionalText, requiredText, toFileRef } from './schemaHelpers';

const schema = z.object({
  title: requiredText('Title', 150),
  date: monthField('Date'),
  description: optionalText('Description', 1000),
  image: fileRefSchema,
  visible: z.boolean(),
});

const toFormValues = (item) => ({
  title: item?.title || '',
  date: item?.date || '',
  description: item?.description || '',
  image: toFileRef(item?.image),
  visible: item?.visible ?? true,
});

export default function AchievementForm({ item, onSave, onCancel, onSaved, onDirtyChange, controlRef }) {
  const methods = useForm({ resolver: zodResolver(schema), defaultValues: toFormValues(item) });

  return (
    <AdminForm
      methods={methods}
      onSave={onSave}
      onCancel={onCancel}
      onSaved={onSaved}
      onDirtyChange={onDirtyChange}
      controlRef={controlRef}
      submitLabel={item ? 'Save achievement' : 'Add achievement'}
      successMessage={item ? 'Achievement updated' : 'Achievement added'}
    >
      <TextField name="title" label="Title" required placeholder="e.g. Best Performer Award" />
      <TextField name="date" label="Date" type="month" placeholder="YYYY-MM" />
      <TextField name="description" label="Description" textarea rows={4} counter={1000} span />
      <ImageField name="image" label="Image (optional)" aspect="video" />
      <SwitchField name="visible" label="Visible on site" span />
    </AdminForm>
  );
}
