/**
 * ContactSection — public contact details from settings (e-mail, phone only if the
 * owner made it public, WhatsApp, location, response time, socials) plus the
 * contact form (POST /api/contact). Includes a hidden honeypot field for bots.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiClock, FiMail, FiMapPin, FiPhone, FiSend } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa6';
import Section from '../components/Section';
import SocialLinks from '../components/SocialLinks';
import { publicApi } from '../services/publicApi';
import { getErrorMessage } from '../lib/apiClient';

const EMPTY = { name: '', email: '', subject: '', message: '', website: '' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Mirrors the server-side validation rules so users get instant feedback. */
const validate = ({ name, email, subject, message }) => {
  const errors = {};
  if (name.trim().length < 2) errors.name = 'Please enter your name (at least 2 characters)';
  if (!EMAIL_RE.test(email.trim())) errors.email = 'Please enter a valid e-mail address';
  if (subject.trim().length < 2) errors.subject = 'Please enter a subject (at least 2 characters)';
  const len = message.trim().length;
  if (len < 5) errors.message = 'Message must be at least 5 characters';
  else if (len > 3000) errors.message = 'Message must be at most 3000 characters';
  return errors;
};

/** One contact detail row (icon + label + value/link). */
const InfoRow = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-4">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand dark:text-brand-light">
      <Icon className="h-5 w-5" aria-hidden="true" />
    </div>
    <div className="min-w-0">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="break-words text-sm font-bold text-slate-800 dark:text-slate-100">{children}</div>
    </div>
  </div>
);

const inputClass = (hasError) =>
  `w-full min-h-11 rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-shadow placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:opacity-60 dark:bg-slate-800/80 dark:text-white ${
    hasError ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:ring-brand dark:border-slate-700'
  }`;

export const ContactSection = ({ settings, content, muted }) => {
  const { contact = {}, socialLinks = [] } = settings;
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  const whatsappDigits = (contact.whatsapp || '').replace(/\D/g, '');
  const hasDetails = contact.email || contact.phone || whatsappDigits || contact.location || contact.responseTime;

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`contact-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setSending(true);
    try {
      const res = await publicApi.submitContact({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        website: form.website, // honeypot — empty for humans
      });
      toast.success(res?.message || 'Thank you! Your message has been sent.');
      setForm(EMPTY);
    } catch (err) {
      // Map server validation errors back onto the fields when present
      const fieldErrors = Object.fromEntries((err?.response?.data?.errors || []).map((x) => [x.field, x.message]));
      if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
      toast.error(getErrorMessage(err, 'Unable to send your message right now. Please try again later.'));
    } finally {
      setSending(false);
    }
  };

  const field = (name, label, props = {}) => (
    <div className={props.wrapperClass || ''}>
      <label htmlFor={`contact-${name}`} className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
        {label} <span className="text-rose-500">*</span>
      </label>
      {props.textarea ? (
        <textarea
          id={`contact-${name}`}
          name={name}
          rows={5}
          value={form[name]}
          onChange={onChange}
          disabled={sending}
          maxLength={3000}
          aria-invalid={Boolean(errors[name])}
          aria-describedby={errors[name] ? `contact-${name}-error` : undefined}
          placeholder={props.placeholder}
          className={`${inputClass(errors[name])} resize-y`}
        />
      ) : (
        <input
          id={`contact-${name}`}
          name={name}
          type={props.type || 'text'}
          value={form[name]}
          onChange={onChange}
          disabled={sending}
          autoComplete={props.autoComplete}
          aria-invalid={Boolean(errors[name])}
          aria-describedby={errors[name] ? `contact-${name}-error` : undefined}
          placeholder={props.placeholder}
          className={inputClass(errors[name])}
        />
      )}
      {errors[name] && (
        <p id={`contact-${name}-error`} className="mt-1 text-xs text-rose-500">
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <Section id="contact" content={content} muted={muted}>
      {/* Mobile/tablet: info card above the form. lg+: side by side (5/12 info, 7/12 form) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        {(hasDetails || contact.intro || socialLinks.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="min-w-0 lg:col-span-5"
          >
            <div className="h-full space-y-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900 sm:p-8">
              {contact.intro && (
                <p className="whitespace-pre-line break-words text-sm leading-relaxed text-slate-600 dark:text-slate-300">{contact.intro}</p>
              )}

              <div className="space-y-4">
                {contact.email && (
                  <InfoRow icon={FiMail} label="E-mail">
                    <a href={`mailto:${contact.email}`} className="break-all transition-colors hover:text-brand dark:hover:text-brand-light">
                      {contact.email}
                    </a>
                  </InfoRow>
                )}
                {contact.phone && (
                  <InfoRow icon={FiPhone} label="Phone">
                    <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`} className="transition-colors hover:text-brand dark:hover:text-brand-light">
                      {contact.phone}
                    </a>
                  </InfoRow>
                )}
                {whatsappDigits && (
                  <InfoRow icon={FaWhatsapp} label="WhatsApp">
                    <a
                      href={`https://wa.me/${whatsappDigits}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-brand dark:hover:text-brand-light"
                    >
                      {contact.whatsapp}
                    </a>
                  </InfoRow>
                )}
                {contact.location && (
                  <InfoRow icon={FiMapPin} label="Location">
                    {contact.location}
                  </InfoRow>
                )}
                {contact.responseTime && (
                  <InfoRow icon={FiClock} label="Response time">
                    {contact.responseTime}
                  </InfoRow>
                )}
              </div>

              {socialLinks.length > 0 && (
                <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Online profiles</div>
                  <SocialLinks links={socialLinks} variant="pill" />
                </div>
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`min-w-0 ${hasDetails || contact.intro || socialLinks.length ? 'lg:col-span-7' : 'lg:col-span-8 lg:col-start-3'}`}
        >
          <form
            onSubmit={onSubmit}
            noValidate
            className="space-y-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900 sm:p-8"
          >
            {/* Name + e-mail: stacked on phones, two columns on sm+ */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {field('name', 'Your name', { autoComplete: 'name', placeholder: 'e.g. Jane Doe' })}
              {field('email', 'E-mail address', { type: 'email', autoComplete: 'email', placeholder: 'e.g. jane@company.com' })}
            </div>
            {field('subject', 'Subject', { placeholder: 'What is this about?' })}
            {field('message', 'Message', { textarea: true, placeholder: 'Share some details…' })}

            {/* Honeypot: invisible to people, bots tend to fill it in */}
            <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
              <label htmlFor="contact-website">Website</label>
              <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={onChange} />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="bg-gradient-brand inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-8 py-3.5 font-bold text-white shadow-md transition-all hover:shadow-lg hover:shadow-brand/25 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-70"
            >
              {sending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                  Sending…
                </>
              ) : (
                <>
                  <FiSend className="h-4 w-4" aria-hidden="true" />
                  Send Message
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </Section>
  );
};

export default ContactSection;
