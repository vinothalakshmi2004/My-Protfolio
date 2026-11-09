const express = require('express');
const { uploadFile, deleteFile } = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle, processFile } = require('../middleware/uploadMiddleware');
const { rules } = require('../middleware/validationMiddleware');
const validators = require('../validators');

const router = express.Router();
router.use(protect); // uploads are admin-only

// POST /api/upload — multipart "file" (+ optional ?type=image|pdf) -> GridFS
router.post('/', uploadSingle, processFile, uploadFile);
// DELETE /api/upload/:id — remove a file from GridFS
router.delete('/:id', rules(validators.idParam()), deleteFile);

module.exports = router;
