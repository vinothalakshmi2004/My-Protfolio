/**
 * Zod building blocks shared by the admin forms (mirrors the server's express-validator rules,
 * so most mistakes are caught before a request is even sent).
 */
import { z } from 'zod';

/** "github.com/me" -> "https://github.com/me" (same normalisation as the server). */
export const normalizeUrl = (value = '') => {
  const v = String(value).trim();
  if (!v) return '';
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return v;
  if (/^[\w-]+(\.[\w-]+)+/.test(v)) return `https://${v}`;
  return v;
};

export const isSafeUrl = (value, protocols = ['http:', 'https:']) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return protocols.includes(url.protocol) && (!url.protocol.startsWith('http') || Boolean(url.hostname));
  } catch {
    return false;
  }
};

/** Optional http(s) link. */
export const urlField = (label = 'Link') =>
  z
    .string()
    .trim()
    .max(500, `${label} is too long`)
    .refine((v) => isSafeUrl(normalizeUrl(v)), `${label} must be a valid link, e.g. https://example.com`);

/** Required text with a max length. */
export const requiredText = (label, max = 150) => z.string().trim().min(1, `${label} is required`).max(max, `${label} must be at most ${max} characters`);

/** Optional text with a max length. */
export const optionalText = (label, max = 200) => z.string().trim().max(max, `${label} must be at most ${max} characters`);

export const fileRefSchema = z.object({ url: z.string(), fileId: z.string() });
export const typedFileRefSchema = z.object({ url: z.string(), fileId: z.string(), contentType: z.string().optional().default('') });

/** "YYYY-MM" or empty (HTML month input format). */
export const monthField = (label = 'Date') =>
  z
    .string()
    .trim()
    .regex(/^(\d{4}-(0[1-9]|1[0-2]))?$/, `${label} must look like 2026-01`);

/** 4-digit year or empty. */
export const yearField = (label = 'Year') =>
  z
    .string()
    .trim()
    .regex(/^((19|20)\d{2})?$/, `${label} must be a 4-digit year`);

export const emptyFileRef = () => ({ url: '', fileId: '' });

/** Picks { url, fileId } from a stored value (or empty). */
export const toFileRef = (value) => ({ url: value?.url || '', fileId: value?.fileId || '' });
