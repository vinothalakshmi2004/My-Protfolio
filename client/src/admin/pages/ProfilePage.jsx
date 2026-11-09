/**
 * /admin/profile — name, headline, hero typing roles (chips), summary, About text,
 * hero greeting/availability, profile + About images, and the stats cards editor.
 */
import { useFieldArray, useForm, useFormContext, get } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import SettingsPage from '../components/SettingsPage';
import AdminForm from '../components/AdminForm';
import { SectionCard } from '../components/Feedback';
import { Input } from '../components/FormControls';
import { SortableList, DragHandle } from '../components/SortableList';
import Button from '../components/Button';
import { ImageField, SwitchField, TagField, TextField } from '../forms/FormFields';
import { fileRefSchema, optionalText, requiredText, toFileRef } from '../forms/schemaHelpers';

const schema = z.object({
  fullName: requiredText('Full name', 80),
  headline: optionalText('Headline', 150),
  typingRoles: z.array(z.string()).max(10, 'At most 10 roles'),
  summary: optionalText('Summary', 600),
  aboutLongText: optionalText('About text', 4000),
  hero: z.object({
    greeting: optionalText('Greeting', 60),
    availabilityText: optionalText('Availability text', 80),
    showAvailability: z.boolean(),
  }),
  profileImage: fileRefSchema,
  aboutImage: fileRefSchema,
  stats: z
    .array(
      z.object({
        label: requiredText('Label', 60),
        value: requiredText('Value', 20),
        subtext: optionalText('Subtext', 80),
      })
    )
    .max(8, 'At most 8 stats'),
});

const fromSettings = (s) => ({
  fullName: s.fullName || '',
  headline: s.headline || '',
  typingRoles: s.typingRoles || [],
  summary: s.summary || '',
  aboutLongText: s.aboutLongText || '',
  hero: {
    greeting: s.hero?.greeting || '',
    availabilityText: s.hero?.availabilityText || '',
    showAvailability: s.hero?.showAvailability ?? false,
  },
  profileImage: toFileRef(s.profileImage),
  aboutImage: toFileRef(s.aboutImage),
  stats: (s.stats || []).map(({ label, value, subtext }) => ({ label, value, subtext: subtext || '' })),
});

/** Stats editor: sortable rows of label / value / subtext. Phones: stacked inputs; sm+: 3 columns. */
const StatsEditor = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({ control, name: 'stats' });

  return (
    <div className="space-y-3 md:col-span-2">
      {fields.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No stats yet. They appear as cards in the About section.</p>}
      <SortableList
        items={fields}
        getId={(f) => f.id}
        onReorder={(_, { from, to }) => move(from, to)}
        className="space-y-2"
        renderItem={(field, index, handle) => (
          <div className="flex items-start gap-1.5 rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900">
            <DragHandle handle={handle} />
            <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-[7rem_minmax(0,1fr)_minmax(0,1fr)]">
              <div>
                <Input placeholder="Value (e.g. 9.0)" aria-label={`Stat ${index + 1} value`} invalid={!!get(errors, `stats.${index}.value`)} {...register(`stats.${index}.value`)} />
                <p className="mt-1 text-xs text-rose-600">{get(errors, `stats.${index}.value`)?.message}</p>
              </div>
              <div>
                <Input placeholder="Label (e.g. MCA CGPA)" aria-label={`Stat ${index + 1} label`} invalid={!!get(errors, `stats.${index}.label`)} {...register(`stats.${index}.label`)} />
                <p className="mt-1 text-xs text-rose-600">{get(errors, `stats.${index}.label`)?.message}</p>
              </div>
              <Input placeholder="Subtext (optional)" aria-label={`Stat ${index + 1} subtext`} {...register(`stats.${index}.subtext`)} />
            </div>
            <Button variant="danger-ghost" size="icon" onClick={() => remove(index)} aria-label={`Remove stat ${index + 1}`}>
              <FiTrash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />
      {fields.length < 8 && (
        <Button variant="secondary" size="sm" onClick={() => append({ label: '', value: '', subtext: '' })} className="min-h-11 lg:min-h-9">
          <FiPlus className="h-4 w-4" /> Add stat
        </Button>
      )}
    </div>
  );
};

const ProfileForm = ({ settings, save }) => {
  const methods = useForm({ resolver: zodResolver(schema), defaultValues: fromSettings(settings) });

  return (
    <AdminForm
      variant="page"
      grid={false}
      methods={methods}
      onSave={save}
      onSaved={(saved) => methods.reset(fromSettings(saved))}
      successMessage="Profile saved — refresh the website to see it"
    >
      <div className="space-y-6">
        <SectionCard title="Identity" description="Shown in the hero, navbar, footer and page title.">
          {/* Mobile: 1 column, md+: 2 columns */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <TextField name="fullName" label="Full name" required />
            <TextField name="headline" label="Headline" placeholder="e.g. MERN Stack Developer | AI Automation Engineer" />
            <TagField name="typingRoles" label="Typing animation roles" hint="Cycled in the hero (“I am a …”). Press Enter after each role." maxTags={10} />
            <TextField name="summary" label="Hero summary" textarea rows={3} counter={600} span hint="One or two sentences under your name." />
          </div>
        </SectionCard>

        <SectionCard title="Hero extras">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <TextField name="hero.greeting" label="Greeting" placeholder="Hi, I'm" />
            <TextField name="hero.availabilityText" label="Availability badge" placeholder="Available for new roles" />
            <SwitchField name="hero.showAvailability" label="Show availability badge" span />
          </div>
        </SectionCard>

        <SectionCard title="About section">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <TextField name="aboutLongText" label="About text" textarea rows={7} counter={4000} span />
          </div>
        </SectionCard>

        <SectionCard title="Images" description="Auto-compressed to WebP. Replacing an image deletes the old one.">
          {/* Mobile: images stacked; md+: side by side */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ImageField name="profileImage" label="Profile photo" aspect="square" span={false} hint="Square works best (e.g. 800×800)." />
            <ImageField name="aboutImage" label="About image (optional)" aspect="video" span={false} />
          </div>
        </SectionCard>

        <SectionCard title="Stats" description="Highlight numbers in the About section (e.g. Projects, Experience, CGPA).">
          <StatsEditor />
        </SectionCard>
      </div>
    </AdminForm>
  );
};

export default function ProfilePage() {
  return (
    <SettingsPage title="Profile & About" description="Your name, introduction, photos and highlight stats.">
      {(settings, save) => <ProfileForm settings={settings} save={save} />}
    </SettingsPage>
  );
}
