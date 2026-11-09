/**
 * CertificationForm — title, issuer, issue month, credential URL and the certificate
 * itself as an image OR a PDF (the landing page shows the image, or a "View PDF" button).
 */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdminForm from '../components/AdminForm';
import { FileField, SwitchField, TextField } from './FormFields';
import { monthField, normalizeUrl, requiredText, typedFileRefSchema, urlField } from './schemaHelpers';

const schema = z.object({
  title: requiredText('Title', 150),
  issuer: requiredText('Issuer', 120),
  issueDate: monthField('Issue date'),
  credentialUrl: urlField('Credential URL'),
  file: typedFileRefSchema,
  visible: z.boolean(),
});

const toFormValues = (item) => ({
  title: item?.title || '',
  issuer: item?.issuer || '',
  issueDate: item?.issueDate || '',
  credentialUrl: item?.credentialUrl || '',
  file: { url: item?.file?.url || '', fileId: item?.file?.fileId || '', contentType: item?.file?.contentType || '' },
  visible: item?.visible ?? true,
});

const toPayload = (values) => ({
  ...values,
  credentialUrl: normalizeUrl(values.credentialUrl),
  file: { url: values.file.url, fileId: values.file.fileId, contentType: values.file.fileId ? values.file.contentType : '' },
});

export default function CertificationForm({ item, onSave, onCancel, onSaved, onDirtyChange, controlRef }) {
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
      submitLabel={item ? 'Save certification' : 'Add certification'}
      successMessage={item ? 'Certification updated' : 'Certification added'}
    >
      <TextField name="title" label="Certificate title" required span placeholder="e.g. Cloud Computing with AWS" />
      <TextField name="issuer" label="Issuing organisation" required placeholder="e.g. Infosys Springboard" />
      <TextField name="issueDate" label="Issue date" type="month" placeholder="YYYY-MM" />
      <TextField name="credentialUrl" label="Credential / verification URL" type="url" inputMode="url" span placeholder="https://…" />
      <FileField
        name="file"
        label="Certificate file"
        accept="image-or-pdf"
        emptyLabel="Upload certificate"
        hint="An image is shown on the card; a PDF gets a “View PDF” button."
      />
      <SwitchField name="visible" label="Visible on site" span />
    </AdminForm>
  );
}
