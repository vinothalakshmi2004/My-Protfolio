const express = require('express');
const { streamFile } = require('../controllers/fileController');

const router = express.Router();

// GET/HEAD /api/files/:id — public file streaming from GridFS (ETag + caching)
router.get('/:id', streamFile); // Express also routes HEAD requests to GET handlers

module.exports = router;
