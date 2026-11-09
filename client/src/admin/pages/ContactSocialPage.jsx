/**
 * /admin/contact-social — public contact details (e-mail, phone with "show publicly"
 * toggle, WhatsApp, location, intro text) and the dynamic social links list
 * (add / edit / delete / hide / drag to reorder; platform dropdown + custom URL).
 * GitHub and LinkedIn are regular rows here, so they're fully editable.
 */
import { useFieldArray, useForm, useFormContext, useWatch, get, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import SettingsPage from '../components/SettingsPage';
import AdminForm from '../components/AdminForm';
import { SectionCard } from '../components/Feedback';
import { Input, Select, Switch } from '../components/FormControls';
import { SortableList, DragHandle } from '../components/SortableList';
import Button from '../components/Button';
import { SwitchField, TextField } from '../forms/FormFields';
import { isSafeUrl, normalizeUrl, optionalText } from '../forms/schemaHelpers';
import { SOCIAL_PLATFORMS, getSocialIcon } from '../../utils/icons';

const PHONE_RE = /^([+\d][\d\s\-().]{3,29})?$/;
const SOCIAL_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

/** Smart URL normalisation per platform (plain e-mail -> mailto:, WhatsApp number -> wa.me link). */
const normalizeSocialUrl = (platform, value) => {
  const v = (value || '').trim();
  if (!v) return '';
  if (/^[^\s@/:]+@[^\s@/]+\.[^\s@/]+$/.test(v)) return `mailto:${v}`;
  if (platform === 'whatsapp' && /^[+\d][\d\s-]{5,}$/.test(v)) return `https://wa.me/${v.replace(/\D/g, '')}`;
  return normalizeUrl(v);
};

const schema = z.object({
  contact: z.object({
    email: z.union([z.literal(''), z.string().trim().email('Enter a valid e-mail')]),
    phone: z.string().trim().regex(PHONE_RE, 'Enter a valid phone number'),
    showPhonePublicly: z.boolean(),
    whatsapp: z.string().trim().regex(PHONE_RE, 'Enter a valid phone number (digits, +, spaces)'),
    location: optionalText('Location', 120),
    intro: optionalText('Intro', 600),
    responseTime: optionalText('Response time', 60),
  }),
  socialLinks: z
    .array(
      z
        .object({
          platform: z.string().min(1, 'Choose a platform'),
          label: optionalText('Label', 60),
          url: z.string().trim().min(1, 'URL is required').max(500),
          visible: z.boolean(),
        })
        .refine((l) => isSafeUrl(normalizeSocialUrl(l.platform, l.url), SOCIAL_PROTOCOLS), {
          message: 'Enter a valid link (https://…, an e-mail, or a phone number for WhatsApp)',
          path: ['url'],
        })
    )
    .max(20, 'At most 20 links'),
});

const fromSettings = (s) => ({
  contact: {
    email: s.contact?.email || '',
    phone: s.contact?.phone || '',
    showPhonePublicly: s.contact?.showPhonePublicly ?? false,
    whatsapp: s.contact?.whatsapp || '',
    location: s.contact?.location || '',
    intro: s.contact?.intro || '',
    responseTime: s.contact?.responseTime || '',
  },
  socialLinks: (s.socialLinks || []).map((l) => ({ platform: l.platform, label: l.label || '', url: l.url, visible: l.visible !== false })),
});

const toPayload = (values) => ({
  contact: values.contact,
  socialLinks: values.socialLinks.map((l) => ({
    platform: l.platform,
    label: l.label || SOCIAL_PLATFORMS.find((p) => p.value === l.platform)?.label || '',
    url: normalizeSocialUrl(l.platform, l.url),
    icon: l.platform,
    visible: l.visible,
  })),
});

/** One social link row: icon preview, platform select, label, URL, visibility, delete. */
const SocialLinkRow = ({ index, handle, onRemove }) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();
  const platform = useWatch({ name: `socialLinks.${index}.platform` });
  const Icon = getSocialIcon({ platform });
  const urlError = get(errors, `socialLinks.${index}.url`)?.message;
  const placeholder = platform === 'email' ? 'you@example.com' : platform === 'whatsapp' ? '+91 98765 43210' : 'https://…';

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start gap-1.5">
        <DragHandle handle={handle} />
        <span className="flex h-11 w-9 shrink-0 items-center justify-center text-slate-600 dark:text-slate-300" aria-hidden="true">
          <Icon className="h-5 w-5" />
        </span>
        {/* Phones: platform + label on one row, URL full width below; lg+: all in one row */}
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 lg:grid-cols-[10rem_9rem_minmax(0,1fr)]">
          <Select aria-label={`Link ${index + 1} platform`} {...register(`socialLinks.${index}.platform`)}>
            {SOCIAL_PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
          <Input placeholder="Label (optional)" aria-label={`Link ${index + 1} label`} {...register(`socialLinks.${index}.label`)} />
          <div className="col-span-2 lg:col-span-1">
            <Input placeholder={placeholder} inputMode={platform === 'whatsapp' ? 'tel' : 'url'} aria-label={`Link ${index + 1} URL`} invalid={!!urlError} {...register(`socialLinks.${index}.url`)} />
            {urlError && <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{urlError}</p>}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-1 sm:flex-row">
          <Controller
            name={`socialLinks.${index}.visible`}
            render={({ field }) => (
              <span className="flex h-11 items-center px-1" title={field.value ? 'Visible' : 'Hidden'}>
                <Switch size="sm" checked={field.value} onChange={field.onChange} />
              </span>
            )}
            control={control}
          />
          <Button variant="danger-ghost" size="icon" onClick={onRemove} aria-label={`Delete link ${index + 1}`}>
            <FiTrash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const SocialLinksEditor = () => {
  const { control } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({ control, name: 'socialLinks' });

  return (
    <div className="space-y-3">
      {fields.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No social links. Add GitHub, LinkedIn and more.</p>}
      <SortableList
        items={fields}
        getId={(f) => f.id}
        onReorder={(_, { from, to }) => move(from, to)}
        className="space-y-2"
        renderItem={(field, index, handle) => <SocialLinkRow index={index} handle={handle} onRemove={() => remove(index)} />}
      />
      {fields.length < 20 && (
        <Button variant="secondary" size="sm" onClick={() => append({ platform: 'portfolio', label: '', url: '', visible: true })} className="min-h-11 lg:min-h-9">
          <FiPlus className="h-4 w-4" /> Add social link
        </Button>
      )}
    </div>
  );
};

const ContactSocialForm = ({ settings, save }) => {
  const methods = useForm({ resolver: zodResolver(schema), defaultValues: fromSettings(settings) });

  return (
    <AdminForm
      variant="page"
      grid={false}
      methods={methods}
      onSave={save}
      toPayload={toPayload}
      onSaved={(saved) => methods.reset(fromSettings(saved))}
      successMessage="Contact details saved"
    >
      <div className="space-y-6">
        <SectionCard title="Contact details" description="Shown in the Contact section and footer.">
          {/* Mobile: 1 column, md+: 2 columns */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <TextField name="contact.email" label="Public e-mail" type="email" inputMode="email" placeholder="you@example.com" />
            <TextField name="contact.location" label="Location" placeholder="City, State" />
            <TextField name="contact.phone" label="Phone" type="tel" inputMode="tel" placeholder="+91 98765 43210" />
            <TextField name="contact.whatsapp" label="WhatsApp (optional)" type="tel" inputMode="tel" placeholder="+91 98765 43210" hint="Shown as a WhatsApp chat link when filled." />
            <SwitchField name="contact.showPhonePublicly" label="Show phone number publicly" description="Off = the phone is never sent to the website (only you see it here)." span />
            <TextField name="contact.intro" label="Contact intro" textarea rows={3} counter={600} span />
            <TextField name="contact.responseTime" label="Response time" placeholder="Within 24 hours" />
          </div>
        </SectionCard>

        <SectionCard title="Social links" description="Shown in the hero, contact section and footer. Drag to reorder, toggle to hide.">
          <SocialLinksEditor />
        </SectionCard>
      </div>
    </AdminForm>
  );
};

export default function ContactSocialPage() {
  return (
    <SettingsPage title="Contact & Social" description="How visitors can reach you.">
      {(settings, save) => <ContactSocialForm settings={settings} save={save} />}
    </SettingsPage>
  );
}
