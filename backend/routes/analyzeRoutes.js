// routes/analyzeRoutes.js
const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const { analyze }  = require('../controllers/analyzeController');
const { protect }  = require('../middleware/authMiddleware');

// POST /api/analyze → Analyze news text or URL (protected)
router.post(
  '/',
  protect,
  [
    body('text')
      .optional()
      .isString().withMessage('Text must be a string')
      .isLength({ max: 5000 }).withMessage('Text cannot exceed 5000 characters'),
    body('url')
      .optional()
      .isURL().withMessage('Please provide a valid URL'),
  ],
  analyze
);

module.exports = router;
