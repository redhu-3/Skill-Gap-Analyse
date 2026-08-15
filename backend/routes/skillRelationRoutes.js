// backend/routes/skillRelationRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, verifyRoles } = require('../middleware/authMiddleware');
const { importCSV } = require('../controllers/skillRelationImportController');

// Multer: store CSV in memory (max 5 MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

// POST /api/skill-relations/import  –  admin only
router.post(
  '/import',
  protect,
  verifyRoles(['admin']),
  upload.single('csv'),
  importCSV
);

module.exports = router;
