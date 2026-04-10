// routes/historyRoutes.js
// User history routes

const express = require("express");
const router  = express.Router();

const {
  getHistory,
  getStats,
  deleteHistoryEntry,
  clearHistory,
} = require('../controllers/historyController');
const { protect } = require('../middleware/authMiddleware');

// All history routes require authentication
router.use(protect);

// GET    /api/history         → Get paginated history
router.get('/', getHistory);

// GET    /api/history/stats   → Get dashboard statistics
router.get('/stats', getStats);

// DELETE /api/history         → Clear all history
router.delete('/', clearHistory);

// DELETE /api/history/:id     → Delete single entry
router.delete('/:id', deleteHistoryEntry);

module.exports = router;