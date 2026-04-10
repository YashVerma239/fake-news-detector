// routes/authRoutes.js
// Authentication routes with input validation

const express    = require('express');
const { body }   = require('express-validator');
const router     = express.Router();

const { signup, login, getMe } = require('../controllers/authController');
const { protect }              = require('../middleware/authMiddleware');

// ─── Validation Rules ─────────────────────────────────────────────────────────

const signupValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('email')
    .normalizeEmail()
    .isEmail().withMessage('Please enter a valid email address'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),
];

const loginValidation = [
  body('email').normalizeEmail().isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// ─── Routes ──────────────────────────────────────────────────────────────────

// POST /api/auth/signup  → Register new user
router.post('/signup', signupValidation, signup);

// POST /api/auth/login   → Authenticate and get token
router.post('/login', loginValidation, login);

// GET  /api/auth/me      → Get current user profile (protected)
router.get('/me', protect, getMe);

module.exports = router;