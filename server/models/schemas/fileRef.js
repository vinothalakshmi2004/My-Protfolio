const mongoose = require('mongoose');

/**
 * Reusable sub-schema for a reference to a file stored in GridFS.
 *   url    -> public URL served by GET /api/files/:fileId (e.g. "/api/files/65f...")
 *   fileId -> GridFS ObjectId as a string ('' when empty)
 * Any document field shaped like this is discovered automatically by
 * utils/fileRefs.js so replaced/deleted files are cleaned out of GridFS.
 */
const FileRefSchema = new mongoose.Schema(
  {
    url: { type: String, default: '', trim: true },
    fileId: { type: String, default: '', trim: true },
  },
  { _id: false }
);

/** Same as FileRefSchema plus contentType (used where image OR pdf is allowed). */
const TypedFileRefSchema = new mongoose.Schema(
  {
    url: { type: String, default: '', trim: true },
    fileId: { type: String, default: '', trim: true },
    contentType: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const emptyFileRef = () => ({ url: '', fileId: '' });

module.exports = { FileRefSchema, TypedFileRefSchema, emptyFileRef };
