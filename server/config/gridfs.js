/**
 * GridFS helpers — ALL uploaded files (images + PDFs) live inside MongoDB
 * in the "uploads" bucket (collections: uploads.files + uploads.chunks).
 * Nothing is ever written to local disk or a third-party storage provider.
 */
const mongoose = require('mongoose');

const BUCKET_NAME = 'uploads';
const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;

let bucket = null;
let bucketDb = null;

/** True when `id` is a 24-char hex string (a valid GridFS file id). */
const isValidFileId = (id) => typeof id === 'string' && OBJECT_ID_RE.test(id);

/**
 * Returns the GridFSBucket bound to the current mongoose connection.
 * Re-created automatically if the connection's db object changes (tests, reconnects).
 */
const getGridFSBucket = () => {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not established yet');
  }
  if (!bucket || bucketDb !== db) {
    bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: BUCKET_NAME });
    bucketDb = db;
  }
  return bucket;
};

/** Direct handle to the uploads.files metadata collection. */
const filesCollection = () => mongoose.connection.db.collection(`${BUCKET_NAME}.files`);

/**
 * Stores a buffer in GridFS.
 * @param {Buffer} buffer
 * @param {{ filename: string, contentType: string, originalName?: string, metadata?: object }} info
 * @returns {Promise<{ fileId, url, filename, contentType, size }>}
 */
const uploadToGridFS = (buffer, { filename, contentType, originalName, metadata = {} }) =>
  new Promise((resolve, reject) => {
    try {
      const uploadStream = getGridFSBucket().openUploadStream(filename, {
        // contentType lives in metadata (top-level option is deprecated in driver v6+)
        metadata: {
          contentType,
          originalName: originalName || filename,
          uploadedAt: new Date(),
          ...metadata,
        },
      });
      const fileId = uploadStream.id.toString();

      uploadStream.once('error', reject);
      uploadStream.once('finish', () =>
        resolve({
          fileId,
          url: `/api/files/${fileId}`,
          filename,
          contentType,
          size: buffer.length,
        })
      );
      uploadStream.end(buffer);
    } catch (error) {
      reject(error);
    }
  });

/** Returns the uploads.files document for an id, or null. */
const findFileById = async (id) => {
  if (!isValidFileId(id)) return null;
  return filesCollection().findOne({ _id: new mongoose.Types.ObjectId(id) });
};

/** Content type of a stored file (metadata first, legacy top-level field second). */
const getFileContentType = (file) =>
  file?.metadata?.contentType || file?.contentType || 'application/octet-stream';

/** Opens a readable stream for a stored file. */
const getDownloadStream = (id) => getGridFSBucket().openDownloadStream(new mongoose.Types.ObjectId(id));

/**
 * Deletes one file (chunks + metadata). Never throws: returns true if deleted.
 */
const deleteFileFromGridFS = async (id) => {
  if (!isValidFileId(id)) return false;
  try {
    const file = await findFileById(id);
    if (!file) return false;
    await getGridFSBucket().delete(file._id);
    return true;
  } catch (error) {
    console.warn(`[GridFS] Could not delete file ${id}: ${error.message}`);
    return false;
  }
};

/** Deletes many files; resolves to the number actually deleted. */
const deleteMultipleFilesFromGridFS = async (ids = []) => {
  const unique = [...new Set(ids.filter(isValidFileId))];
  const results = await Promise.all(unique.map((id) => deleteFileFromGridFS(id)));
  return results.filter(Boolean).length;
};

/** Lists metadata of every stored file (used by the cleanup script and tests). */
const listAllFiles = () => filesCollection().find({}).toArray();

module.exports = {
  BUCKET_NAME,
  isValidFileId,
  getGridFSBucket,
  uploadToGridFS,
  findFileById,
  getFileContentType,
  getDownloadStream,
  deleteFileFromGridFS,
  deleteMultipleFilesFromGridFS,
  listAllFiles,
};
