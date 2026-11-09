const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const {
  uploadToGridFS,
  findFileById,
  getFileContentType,
  getDownloadStream,
  deleteFileFromGridFS,
} = require('../config/gridfs');

/** RFC 6266 / 5987 Content-Disposition with an ASCII fallback + UTF-8 filename. */
const contentDisposition = (type, filename) => {
  const ascii = filename.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_');
  return `${type}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
};

/**
 * @desc    Upload one image or PDF into GridFS (images are converted to WebP first)
 * @route   POST /api/upload   (multipart field "file", optional ?type=image|pdf)
 * @access  Private
 */
const uploadFile = asyncHandler(async (req, res) => {
  const { buffer, filename, originalName, contentType, metadata } = req.processedFile;
  const result = await uploadToGridFS(buffer, {
    filename,
    contentType,
    originalName,
    metadata: { ...metadata, uploadedBy: String(req.admin._id) },
  });
  return successResponse(res, result, 'File uploaded successfully', 201);
});

/**
 * @desc    Delete a file from GridFS
 * @route   DELETE /api/upload/:id
 * @access  Private
 */
const deleteFile = asyncHandler(async (req, res) => {
  const deleted = await deleteFileFromGridFS(req.params.id);
  if (!deleted) return errorResponse(res, 'File not found', 404);
  return successResponse(res, { id: req.params.id }, 'File deleted');
});

/**
 * @desc    Stream a stored file. Supports ETag / If-None-Match (304).
 *          Images: cached for 1 year (immutable — a new upload always gets a new id).
 *          PDFs:   inline by default, ?download=1 forces "attachment" with the original filename.
 * @route   GET|HEAD /api/files/:id
 * @access  Public
 */
const streamFile = asyncHandler(async (req, res) => {
  const file = await findFileById(req.params.id);
  if (!file) return errorResponse(res, 'File not found', 404);

  const contentType = getFileContentType(file);
  const isPdf = contentType === 'application/pdf';
  const etag = `"${file._id.toString()}-${file.length}"`;

  res.setHeader('ETag', etag);
  res.setHeader('Last-Modified', new Date(file.uploadDate).toUTCString());
  res.setHeader(
    'Cache-Control',
    contentType.startsWith('image/') ? 'public, max-age=31536000, immutable' : 'public, max-age=86400'
  );

  if (isPdf) {
    const name = file.metadata?.originalName || file.filename || 'document.pdf';
    res.setHeader('Content-Disposition', contentDisposition(req.query.download === '1' ? 'attachment' : 'inline', name));
    // Let the browser's built-in PDF viewer render it (and allow the admin preview iframe)
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('X-Frame-Options');
  }

  // Conditional request: client already has this exact file
  if (req.fresh) return res.status(304).end();

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', file.length);
  if (req.method === 'HEAD') return res.status(200).end();

  const stream = getDownloadStream(req.params.id);
  stream.on('error', (err) => {
    console.error(`[GridFS] Stream error for ${req.params.id}: ${err.message}`);
    if (!res.headersSent) errorResponse(res, 'Error streaming file', 500);
    else res.destroy(err);
  });
  return stream.pipe(res);
});

module.exports = { uploadFile, deleteFile, streamFile };
