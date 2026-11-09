/**
 * /admin/account — change the login e-mail and the password.
 * Both require the current password. The server returns a fresh token, so this
 * session continues while every other session (old tokens) is signed out.
 */
import { useState } from 'react';
import { get, useForm, useFormContext, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiCheck, FiEye, FiEyeOff, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../../services/adminApi';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import AdminForm from '../components/AdminForm';
import { PageHeader, SectionCard } from '../components/Feedback';
import { Field, Input } from '../components/FormControls';

/** Password input with a show/hide toggle (44px button). */
const PasswordField = ({ name, label, autoComplete, hint }) => {
  const [show, setShow] = useState(false);
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = get(errors, name)?.message;
  return (
    <Field label={label} htmlFor={name} error={error} hint={hint}>
      <div className="relative">
        <Input id={name} type={show ? 'text' : 'password'} autoComplete={autoComplete} invalid={!!error} className="pr-12" {...register(name)} />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          aria-pressed={show}
          className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-r-lg text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:hover:text-slate-200"
        >
          {show ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
        </button>
      </div>
    </Field>
  );
};

/** Live checklist of the password rules (matches the server). */
const PasswordRules = () => {
  const value = useWatch({ name: 'newPassword' }) || '';
  const rules = [
    ['At least 8 characters', value.length >= 8],
    ['Contains a letter', /[A-Za-z]/.test(value)],
    ['Contains a number', /\d/.test(value)],
  ];
  return (
    <ul className="space-y-1 text-xs md:col-span-2">
      {rules.map(([label, ok]) => (
        <li key={label} className={`flex items-center gap-1.5 ${ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
          {ok ? <FiCheck className="h-3.5 w-3.5" /> : <FiX className="h-3.5 w-3.5" />} {label}
        </li>
      ))}
    </ul>
  );
};

const emailSchema = z.object({
  newEmail: z.string().trim().min(1, 'New e-mail is required').email('Enter a valid e-mail address'),
  currentPassword: z.string().min(1, 'Current password is required'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'At least 8 characters')
      .max(128, 'At most 128 characters')
      .regex(/[A-Za-z]/, 'Must contain a letter')
      .regex(/\d/, 'Must contain a number'),
    confirmPassword: z.string().min(1, 'Please confirm the new password'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })
  .refine((v) => v.newPassword !== v.currentPassword, { message: 'Choose a different password', path: ['newPassword'] });

export default function AccountPage() {
  const { admin, applySession } = useAuth();
  const emailForm = useForm({ resolver: zodResolver(emailSchema), defaultValues: { newEmail: '', currentPassword: '' } });
  const passwordForm = useForm({ resolver: zodResolver(passwordSchema), defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' } });
  const [emailDirty, setEmailDirty] = useState(false);
  const [passwordDirty, setPasswordDirty] = useState(false);

  // One navigation guard for both forms
  useUnsavedChanges(emailDirty || passwordDirty);

  return (
    <div>
      <PageHeader title="Account" description="Your admin login credentials." />
      <div className="space-y-6">
        <SectionCard title="Login e-mail" description={admin?.email ? `Currently: ${admin.email}` : undefined}>
          <AdminForm
            variant="page"
            guardNavigation={false}
            methods={emailForm}
            onDirtyChange={setEmailDirty}
            onSave={({ newEmail, currentPassword }) => authApi.changeEmail(newEmail, currentPassword)}
            onSaved={(session) => {
              applySession(session);
              emailForm.reset({ newEmail: '', currentPassword: '' });
            }}
            submitLabel="Change e-mail"
            successMessage="Login e-mail updated"
          >
            <Field label="New e-mail" htmlFor="newEmail" error={emailForm.formState.errors.newEmail?.message}>
              <Input id="newEmail" type="email" autoComplete="email" invalid={!!emailForm.formState.errors.newEmail} {...emailForm.register('newEmail')} />
            </Field>
            <PasswordField name="currentPassword" label="Current password" autoComplete="current-password" />
          </AdminForm>
        </SectionCard>

        <SectionCard title="Password" description="Changing it signs out every other device.">
          <AdminForm
            variant="page"
            guardNavigation={false}
            methods={passwordForm}
            onDirtyChange={setPasswordDirty}
            onSave={({ currentPassword, newPassword }) => authApi.changePassword(currentPassword, newPassword)}
            onSaved={(session) => {
              applySession(session);
              passwordForm.reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }}
            submitLabel="Change password"
            successMessage="Password changed"
          >
            <PasswordField name="currentPassword" label="Current password" autoComplete="current-password" />
            <div className="hidden md:block" aria-hidden="true" />
            <PasswordField name="newPassword" label="New password" autoComplete="new-password" />
            <PasswordField name="confirmPassword" label="Confirm new password" autoComplete="new-password" />
            <PasswordRules />
          </AdminForm>
        </SectionCard>
      </div>
    </div>
  );
}
