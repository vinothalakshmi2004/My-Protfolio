/**
 * /admin/seo — page title, meta description, keywords, social share (OG) image,
 * favicon, theme colours and footer text. Includes a live Google-style preview.
 */
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SettingsPage from '../components/SettingsPage';
import AdminForm from '../components/AdminForm';
import { SectionCard } from '../components/Feedback';
import { Field, Input } from '../components/FormControls';
import { ImageField, TextField } from '../forms/FormFields';
import { fileRefSchema, optionalText, toFileRef } from '../forms/schemaHelpers';

const HEX = /^#[0-9a-f]{6}$/i;

const schema = z.object({
  seo: z.object({
    title: optionalText('Title', 120),
    description: optionalText('Description', 320),
    keywords: optionalText('Keywords', 300),
    ogImage: fileRefSchema,
  }),
  favicon: fileRefSchema,
  theme: z.object({
    primaryColor: z.string().regex(HEX, 'Use a hex colour like #7c3aed'),
    secondaryColor: z.string().regex(HEX, 'Use a hex colour like #ec4899'),
  }),
  footerText: optionalText('Footer text', 200),
});

const fromSettings = (s) => ({
  seo: {
    title: s.seo?.title || '',
    description: s.seo?.description || '',
    keywords: s.seo?.keywords || '',
    ogImage: toFileRef(s.seo?.ogImage),
  },
  favicon: toFileRef(s.favicon),
  theme: { primaryColor: s.theme?.primaryColor || '#7c3aed', secondaryColor: s.theme?.secondaryColor || '#ec4899' },
  footerText: s.footerText || '',
});

/** Live preview of how the page may look in Google results. */
const SearchPreview = ({ fallbackTitle }) => {
  const [title, description] = useWatch({ name: ['seo.title', 'seo.description'] });
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950 md:col-span-2">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Search result preview</p>
      <p className="truncate text-xs text-emerald-700 dark:text-emerald-400">{window.location.host}</p>
      <p className="line-clamp-1 break-words text-lg text-blue-700 dark:text-blue-400">{title || fallbackTitle || 'Page title'}</p>
      <p className="line-clamp-2 break-words text-sm text-slate-600 dark:text-slate-300">{description || 'Add a description to control the text shown under your title.'}</p>
    </div>
  );
};

/** Colour picker + hex text input kept in sync. */
const ColorField = ({ name, label }) => (
  <Controller
    name={name}
    render={({ field, fieldState }) => (
      <Field label={label} error={fieldState.error?.message}>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={HEX.test(field.value) ? field.value : '#000000'}
            onChange={(e) => field.onChange(e.target.value)}
            aria-label={`${label} picker`}
            className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-slate-300 bg-white p-1 dark:border-slate-700 dark:bg-slate-900"
          />
          <Input value={field.value} onChange={(e) => field.onChange(e.target.value)} onBlur={field.onBlur} invalid={!!fieldState.error} maxLength={7} className="font-mono uppercase" />
        </div>
      </Field>
    )}
  />
);

const SeoForm = ({ settings, save }) => {
  const methods = useForm({ resolver: zodResolver(schema), defaultValues: fromSettings(settings) });
  return (
    <AdminForm variant="page" grid={false} methods={methods} onSave={save} onSaved={(saved) => methods.reset(fromSettings(saved))} successMessage="SEO & branding saved">
      <div className="space-y-6">
        <SectionCard title="Search engines" description="Recommended: title ≤ 60 characters, description ≤ 160.">
          {/* Mobile: 1 column, md+: 2 columns */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <TextField name="seo.title" label="Site title" counter={60} span placeholder="Your Name | Role" />
            <TextField name="seo.description" label="Meta description" textarea rows={3} counter={160} span />
            <TextField name="seo.keywords" label="Keywords" span hint="Comma separated" />
            <SearchPreview fallbackTitle={settings.fullName} />
          </div>
        </SectionCard>

        <SectionCard title="Images" description="OG image appears when your link is shared (ideal 1200×630). Favicon is the browser-tab icon (square).">
          {/* Mobile: stacked; md+: OG image wider than the favicon */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <ImageField name="seo.ogImage" label="Social share image (OG)" aspect="wide" span={false} />
            <ImageField name="favicon" label="Favicon" aspect="square" span={false} hint="Square image, e.g. 512×512." />
          </div>
        </SectionCard>

        <SectionCard title="Branding" description="Accent colours used across the website.">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <ColorField name="theme.primaryColor" label="Primary colour" />
            <ColorField name="theme.secondaryColor" label="Secondary colour" />
            <TextField name="footerText" label="Footer text" counter={200} className="sm:col-span-2" />
          </div>
        </SectionCard>
      </div>
    </AdminForm>
  );
};

export default function SeoPage() {
  return (
    <SettingsPage title="SEO & Branding" description="How your site appears in search results, browser tabs and link previews.">
      {(settings, save) => <SeoForm settings={settings} save={save} />}
    </SettingsPage>
  );
}
