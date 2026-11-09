/**
 * EducationForm — degree, institution, years, score (CGPA / Percentage / Grade) and notes.
 */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdminForm from '../components/AdminForm';
import { SelectField, SwitchField, TextField } from './FormFields';
import { optionalText, requiredText, yearField } from './schemaHelpers';

const SCORE_TYPES = [
  { value: 'CGPA', label: 'CGPA' },
  { value: 'Percentage', label: 'Percentage (%)' },
  { value: 'Grade', label: 'Grade' },
];

const schema = z
  .object({
    degree: requiredText('Degree', 150),
    institution: requiredText('Institution', 150),
    location: optionalText('Location', 120),
    startYear: yearField('Start year'),
    endYear: yearField('End year'),
    scoreType: z.enum(['CGPA', 'Percentage', 'Grade']),
    score: optionalText('Score', 20),
    notes: optionalText('Notes', 500),
    visible: z.boolean(),
  })
  .refine((v) => !v.startYear || !v.endYear || Number(v.endYear) >= Number(v.startYear), {
    message: 'End year must be after the start year',
    path: ['endYear'],
  });

const toFormValues = (item) => ({
  degree: item?.degree || '',
  institution: item?.institution || '',
  location: item?.location || '',
  startYear: item?.startYear || '',
  endYear: item?.endYear || '',
  scoreType: item?.scoreType || 'CGPA',
  score: item?.score || '',
  notes: item?.notes || '',
  visible: item?.visible ?? true,
});

export default function EducationForm({ item, onSave, onCancel, onSaved, onDirtyChange, controlRef }) {
  const methods = useForm({ resolver: zodResolver(schema), defaultValues: toFormValues(item) });

  return (
    <AdminForm
      methods={methods}
      onSave={onSave}
      onCancel={onCancel}
      onSaved={onSaved}
      onDirtyChange={onDirtyChange}
      controlRef={controlRef}
      submitLabel={item ? 'Save education' : 'Add education'}
      successMessage={item ? 'Education updated' : 'Education added'}
    >
      <TextField name="degree" label="Degree / qualification" required span placeholder="e.g. Master of Computer Applications (MCA)" />
      <TextField name="institution" label="Institution" required placeholder="College / school name" />
      <TextField name="location" label="Location" placeholder="City, State" />
      <TextField name="startYear" label="Start year" inputMode="numeric" maxLength={4} placeholder="2024" />
      <TextField name="endYear" label="End year" inputMode="numeric" maxLength={4} placeholder="2026" hint="Leave empty if ongoing" />
      <SelectField name="scoreType" label="Score type" options={SCORE_TYPES} />
      <TextField name="score" label="Score" placeholder="9.0 / 90 / A+" />
      <TextField name="notes" label="Notes / honours" textarea rows={3} counter={500} span placeholder="e.g. Best Performer Award" />
      <SwitchField name="visible" label="Visible on site" span />
    </AdminForm>
  );
}
