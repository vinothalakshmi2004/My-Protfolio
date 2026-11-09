/**
 * npm run cleanup:files [-- --dry-run] [-- --grace-minutes=30]
 *
 * Deletes GridFS files that no document references any more (orphans), e.g.
 * images uploaded in a form that was never saved, or left behind by a crash.
 *
 * Files younger than the grace period (default 30 min) are kept so an upload
 * that's sitting in an unsaved admin form isn't removed mid-edit.
 * Use --grace-minutes=0 to delete every orphan immediately.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('../config/db');
const { closeDB } = require('../config/db');
const { listAllFiles, deleteMultipleFilesFromGridFS } = require('../config/gridfs');
const { getAllReferencedFileIds } = require('../utils/fileRefs');

/**
 * Finds (and unless dryRun, deletes) orphaned files.
 * @returns {Promise<{ total, referenced, orphans: Array, deleted, bytesFreed }>}
 */
const cleanupOrphanFiles = async ({ dryRun = false, graceMinutes = 30 } = {}) => {
  const [files, referenced] = await Promise.all([listAllFiles(), getAllReferencedFileIds()]);
  const cutoff = Date.now() - graceMinutes * 60 * 1000;

  const orphans = files.filter(
    (file) => !referenced.has(file._id.toString()) && new Date(file.uploadDate).getTime() <= cutoff
  );
  const bytesFreed = orphans.reduce((sum, f) => sum + (f.length || 0), 0);
  const deleted = dryRun ? 0 : await deleteMultipleFilesFromGridFS(orphans.map((f) => f._id.toString()));

  return { total: files.length, referenced: referenced.size, orphans, deleted, bytesFreed };
};

if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const graceArg = args.find((a) => a.startsWith('--grace-minutes='));
  const graceMinutes = graceArg ? Math.max(0, Number(graceArg.split('=')[1]) || 0) : 30;

  (async () => {
    try {
      await connectDB();
      const result = await cleanupOrphanFiles({ dryRun, graceMinutes });
      console.log(`[Cleanup] Files in GridFS: ${result.total} | referenced by documents: ${result.referenced}`);
      result.orphans.forEach((f) =>
        console.log(`  - ${f._id} ${f.filename} (${(f.length / 1024).toFixed(1)} KB, uploaded ${new Date(f.uploadDate).toISOString()})`)
      );
      console.log(
        dryRun
          ? `[Cleanup] DRY RUN: ${result.orphans.length} orphan file(s) would be deleted (${(result.bytesFreed / 1024).toFixed(1)} KB)`
          : `[Cleanup] Deleted ${result.deleted} orphan file(s), freed ${(result.bytesFreed / 1024).toFixed(1)} KB`
      );
      await closeDB();
      process.exit(0);
    } catch (error) {
      console.error(`✖ Cleanup failed: ${error.message}`);
      await closeDB();
      process.exit(1);
    }
  })();
}

module.exports = { cleanupOrphanFiles };
