/**
 * Upload pipeline: multer (memory only, never disk) -> validation -> sharp optimisation.
 *
 *  Images: .jpg .jpeg .png .webp  (max MAX_IMAGE_MB, default 5MB)
 *          -> auto-rotated, resized to max 1600px wide, converted to WebP q80
 *  PDFs:   .pdf                   (max MAX_PDF_MB, default 10MB)
 *          -> stored as-is after a magic-byte check
 *
 * Both the MIME type AND the file extension must match an allowed pair.
 * Optional query ?type=image | ?type=pdf restricts the accepted kind
 * (e.g. the resume uploader sends ?type=pdf).
 */
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const IMAGE_MIMES = ['image/jpeg', 'image/jpg', 'image/pjpeg', 'image/png', 'image/webp'];
const PDF_EXTENSIONS = ['.pdf'];
const PDF_MIMES = ['application/pdf', 'application/x-pdf'];

const MAX_IMAGE_MB = Number(process.env.MAX_IMAGE_MB) || 5;
const MAX_PDF_MB = Number(process.env.MAX_PDF_MB) || 10;
const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;
const MAX_PDF_BYTES = MAX_PDF_MB * 1024 * 1024;
const IMAGE_MAX_WIDTH = 1600;
const WEBP_QUALITY = 80;

const badRequest = (message) => Object.assign(new Error(message), { statusCode: 400 });

/** Returns 'image' | 'pdf' | null based on BOTH extension and mimetype. */
const detectKind = (file) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();
  if (IMAGE_EXTENSIONS.includes(ext) && IMAGE_MIMES.includes(mime)) return 'image';
  if (PDF_EXTENSIONS.includes(ext) && PDF_MIMES.includes(mime)) return 'pdf';
  return null;
};

const fileFilter = (req, file, cb) => {
  const kind = detectKind(file);
  const wanted = req.query.type;
  if (!kind) {
    return cb(
      badRequest(
        `Invalid file type. Allowed: images (.jpg, .jpeg, .png, .webp up to ${MAX_IMAGE_MB}MB) and PDF (.pdf up to ${MAX_PDF_MB}MB).`
      )
    );
  }
  if ((wanted === 'image' || wanted === 'pdf') && wanted !== kind) {
    return cb(badRequest(wanted === 'pdf' ? 'Only PDF files are allowed here.' : 'Only image files are allowed here.'));
  }
  req.uploadKind = kind;
  return cb(null, true);
};

// memoryStorage keeps the file in RAM only long enough to process + stream it into GridFS
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: Math.max(MAX_IMAGE_BYTES, MAX_PDF_BYTES), files: 1 },
  fileFilter,
});

/** "My Résumé (final).pdf" -> "My_Resume_final" (safe base name, no extension) */
const safeBaseName = (originalName) =>
  path
    .parse(originalName || 'file')
    .name.normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80) || 'file';

/**
 * After multer: enforce per-kind size limits, verify content, optimise images.
 * Produces req.processedFile = { buffer, filename, originalName, contentType, size, metadata }.
 */
const processFile = async (req, res, next) => {
  const file = req.file;
  if (!file) return next(badRequest('No file uploaded. Send the file in a multipart field named "file".'));

  try {
    if (req.uploadKind === 'image') {
      if (file.size > MAX_IMAGE_BYTES) throw badRequest(`Image exceeds the maximum size of ${MAX_IMAGE_MB}MB.`);

      let output;
      try {
        output = await sharp(file.buffer, { failOn: 'error' })
          .rotate() // respect EXIF orientation from phone cameras
          .resize({ width: IMAGE_MAX_WIDTH, withoutEnlargement: true })
          .webp({ quality: WEBP_QUALITY })
          .toBuffer({ resolveWithObject: true });
      } catch {
        throw badRequest('The image appears to be corrupted or is not a valid image.');
      }

      req.processedFile = {
        buffer: output.data,
        filename: `${safeBaseName(file.originalname)}.webp`,
        originalName: file.originalname,
        contentType: 'image/webp',
        size: output.data.length,
        metadata: { kind: 'image', width: output.info.width, height: output.info.height },
      };
    } else {
      if (file.size > MAX_PDF_BYTES) throw badRequest(`PDF exceeds the maximum size of ${MAX_PDF_MB}MB.`);
      // Real PDFs start with "%PDF-" — rejects renamed executables/HTML
      if (file.buffer.subarray(0, 5).toString('latin1') !== '%PDF-') {
        throw badRequest('The file is not a valid PDF document.');
      }
      req.processedFile = {
        buffer: file.buffer,
        filename: `${safeBaseName(file.originalname)}.pdf`,
        originalName: file.originalname,
        contentType: 'application/pdf',
        size: file.buffer.length,
        metadata: { kind: 'pdf' },
      };
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  uploadSingle: upload.single('file'),
  processFile,
  MAX_IMAGE_MB,
  MAX_PDF_MB,
};
