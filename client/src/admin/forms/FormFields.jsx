/**
 * React-Hook-Form-connected fields. Use inside <AdminForm> (which provides FormProvider).
 * Each one renders <Field> (label + error) around the right control and reads its
 * error from formState automatically.
 *
 *  <TextField name="title" label="Title" required span />       span = full width on md+ (2 cols)
 *  <TextField name="summary" textarea rows={4} counter={600} />
 *  <SelectField name="scoreType" options={[...]} />
 *  <SwitchField name="visible" label="Visible on site" />
 *  <TagField name="techStack" />  <ListField name="features" />
 *  <ImageField name="thumbnail" />  <FileField name="file" accept="image-or-pdf" />  <GalleryField name="gallery" />
 */
import { Controller, get, useFormContext, useWatch } from 'react-hook-form';
import { CharCount, Field, Input, Select, Switch, Textarea } from '../components/FormControls';
import TagInput from '../components/TagInput';
import StringListInput from '../components/StringListInput';
import ImageUploader from '../components/ImageUploader';
import FileUploader from '../components/FileUploader';
import GalleryUploader from '../components/GalleryUploader';

const spanClass = (span) => (span ? 'md:col-span-2' : '');

const useFieldError = (name) => {
  const {
    formState: { errors },
  } = useFormContext();
  return get(errors, name)?.message;
};

/** Live character counter shown next to the label. */
const Counter = ({ name, max }) => {
  const value = useWatch({ name });
  return <CharCount value={value} max={max} />;
};

export const TextField = ({ name, label, required, hint, span, textarea, rows = 4, counter, className = '', ...inputProps }) => {
  const { register } = useFormContext();
  const error = useFieldError(name);
  const Control = textarea ? Textarea : Input;
  return (
    <Field
      label={label}
      htmlFor={name}
      required={required}
      error={error}
      hint={hint}
      className={`${spanClass(span)} ${className}`}
      aside={counter ? <Counter name={name} max={counter} /> : undefined}
    >
      <Control id={name} invalid={!!error} rows={textarea ? rows : undefined} {...register(name)} {...inputProps} />
    </Field>
  );
};

export const SelectField = ({ name, label, options, hint, span, required }) => {
  const { register } = useFormContext();
  const error = useFieldError(name);
  return (
    <Field label={label} htmlFor={name} error={error} hint={hint} required={required} className={spanClass(span)}>
      <Select id={name} invalid={!!error} {...register(name)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    </Field>
  );
};

export const SwitchField = ({ name, label, description, span, disabled }) => (
  <Controller
    name={name}
    render={({ field }) => (
      <div className={`rounded-lg border border-slate-200 px-3 dark:border-slate-700 ${spanClass(span)}`}>
        <Switch id={name} checked={Boolean(field.value)} onChange={field.onChange} label={label} description={description} disabled={disabled} />
      </div>
    )}
  />
);

export const TagField = ({ name, label, hint, span = true, placeholder, suggestions, maxTags }) => {
  const error = useFieldError(name);
  return (
    <Field label={label} htmlFor={name} error={error} hint={hint} className={spanClass(span)}>
      <Controller
        name={name}
        render={({ field }) => (
          <TagInput id={name} value={field.value || []} onChange={field.onChange} placeholder={placeholder} invalid={!!error} suggestions={suggestions} maxTags={maxTags} />
        )}
      />
    </Field>
  );
};

export const ListField = ({ name, label, hint, span = true, placeholder, addLabel, multiline, max }) => {
  const error = useFieldError(name);
  return (
    <Field label={label} error={error} hint={hint} className={spanClass(span)}>
      <Controller
        name={name}
        render={({ field }) => (
          <StringListInput value={field.value || []} onChange={field.onChange} placeholder={placeholder} addLabel={addLabel} multiline={multiline} max={max} />
        )}
      />
    </Field>
  );
};

export const ImageField = ({ name, label, hint, span = true, aspect = 'video' }) => {
  // Both hooks always run (no short-circuit) to keep hook order stable
  const objectError = useFieldError(name);
  const urlError = useFieldError(`${name}.url`);
  const error = objectError || urlError;
  return (
    <Field label={label} error={error} hint={hint} className={spanClass(span)}>
      <Controller name={name} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} aspect={aspect} label={label} />} />
    </Field>
  );
};

export const FileField = ({ name, label, hint, span = true, accept = 'pdf', emptyLabel }) => {
  const objectError = useFieldError(name);
  const urlError = useFieldError(`${name}.url`);
  const error = objectError || urlError;
  return (
    <Field label={label} error={error} hint={hint} className={spanClass(span)}>
      <Controller
        name={name}
        render={({ field }) => (
          <FileUploader
            value={field.value}
            onChange={(next) => field.onChange({ url: next.url, fileId: next.fileId, contentType: next.contentType || '', fileName: next.fileName })}
            accept={accept}
            emptyLabel={emptyLabel}
          />
        )}
      />
    </Field>
  );
};

export const GalleryField = ({ name, label, hint, span = true, max }) => {
  const error = useFieldError(name);
  return (
    <Field label={label} error={error} hint={hint} className={spanClass(span)}>
      <Controller name={name} render={({ field }) => <GalleryUploader value={field.value || []} onChange={field.onChange} max={max} />} />
    </Field>
  );
};

/** Visual divider with a heading inside a form grid (always full width). */
export const FormSection = ({ title, description }) => (
  <div className="border-t border-slate-100 pt-5 first:border-0 first:pt-0 dark:border-slate-800 md:col-span-2">
    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
    {description && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>}
  </div>
);
