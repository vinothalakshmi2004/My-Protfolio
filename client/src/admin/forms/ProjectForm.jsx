/**
 * ProjectForm — add/edit a project: text, category, tech stack (tags), features (list),
 * links, thumbnail, gallery (multi-upload, sortable), featured + visible toggles.
 */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdminForm from '../components/AdminForm';
import { FormSection, GalleryField, ImageField, ListField, SwitchField, TagField, TextField } from './FormFields';
import { fileRefSchema, normalizeUrl, optionalText, requiredText, toFileRef, urlField } from './schemaHelpers';

export const PROJECT_CATEGORIES = ['MERN', 'E-commerce', 'Admin Dashboard', 'AI Automation', 'Frontend', 'Backend', 'Mobile'];

const schema = z.object({
  title: requiredText('Title', 150),
  slug: z
    .string()
    .trim()
    .max(80)
    .regex(/^[a-z0-9-]*$/i, 'Use only letters, numbers and dashes'),
  category: optionalText('Category', 60),
  shortDescription: optionalText('Short description', 400),
  fullDescription: optionalText('Full description', 6000),
  techStack: z.array(z.string()).max(40, 'At most 40 technologies'),
  features: z.array(z.string().max(300, 'Each feature must be at most 300 characters')).max(40),
  githubUrl: urlField('GitHub URL'),
  liveUrl: urlField('Live URL'),
  thumbnail: fileRefSchema,
  gallery: z.array(fileRefSchema).max(20, 'At most 20 gallery images'),
  featured: z.boolean(),
  visible: z.boolean(),
});

const toFormValues = (item) => ({
  title: item?.title || '',
  slug: item?.slug || '',
  category: item?.category || 'MERN',
  shortDescription: item?.shortDescription || '',
  fullDescription: item?.fullDescription || '',
  techStack: item?.techStack || [],
  features: item?.features || [],
  githubUrl: item?.githubUrl || '',
  liveUrl: item?.liveUrl || '',
  thumbnail: toFileRef(item?.thumbnail),
  gallery: (item?.gallery || []).map(toFileRef),
  featured: item?.featured ?? false,
  visible: item?.visible ?? true,
});

const toPayload = (values) => ({
  ...values,
  slug: values.slug.toLowerCase(),
  githubUrl: normalizeUrl(values.githubUrl),
  liveUrl: normalizeUrl(values.liveUrl),
  features: values.features.map((f) => f.trim()).filter(Boolean),
});

export default function ProjectForm({ item, onSave, onCancel, onSaved, onDirtyChange, controlRef }) {
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
      submitLabel={item ? 'Save project' : 'Create project'}
      successMessage={item ? 'Project updated' : 'Project created'}
    >
      <FormSection title="Basics" />
      <TextField name="title" label="Title" required span placeholder="e.g. Smart Admission Management System" />
      <TextField name="category" label="Category" list="project-categories" placeholder="MERN" hint="Pick one or type your own" />
      <datalist id="project-categories">
        {PROJECT_CATEGORIES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <TextField name="slug" label="URL slug" placeholder="auto-generated from the title" hint="Leave empty to generate it automatically" />
      <TextField name="shortDescription" label="Short description" textarea rows={3} counter={400} span hint="Shown on the project card" />
      <TextField name="fullDescription" label="Full description" textarea rows={6} counter={6000} span hint="Shown in the project details popup" />

      <FormSection title="Tech & features" />
      <TagField name="techStack" label="Tech stack" placeholder="React, Node.js… (press Enter after each)" />
      <ListField name="features" label="Key features" placeholder="Describe a feature" addLabel="Add feature" />

      <FormSection title="Links" />
      <TextField name="githubUrl" label="GitHub URL" type="url" inputMode="url" placeholder="https://github.com/…" />
      <TextField name="liveUrl" label="Live URL" type="url" inputMode="url" placeholder="https://…" />

      <FormSection title="Images" description="Images are compressed to WebP automatically." />
      <ImageField name="thumbnail" label="Thumbnail" aspect="video" />
      <GalleryField name="gallery" label="Gallery" hint="Drag to reorder. The first image is shown first in the details popup." max={20} />

      <FormSection title="Display" />
      <SwitchField name="featured" label="Featured" description="Highlight this project" />
      <SwitchField name="visible" label="Visible on site" description="Hidden projects stay in the dashboard" />
    </AdminForm>
  );
}
