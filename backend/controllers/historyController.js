// controllers/historyController.js
// Handles user history retrieval and management

const History = require('../models/History');
const User    = require('../models/User');

/**
 * @route   GET /api/history
 * @desc    Get paginated history for logged-in user
 * @access  Private
 */
const getHistory = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    // Optional filter by prediction type
    const filter = { user: req.user._id };
    if (req.query.type && ['FAKE', 'REAL'].includes(req.query.type.toUpperCase())) {
      filter.prediction = req.query.type.toUpperCase();
    }

    const [history, total] = await Promise.all([
      History.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v'),
      History.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: history,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    console.error('Get history error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching history.',
    });
  }
};

/**
 * @route   GET /api/history/stats
 * @desc    Get dashboard stats: weekly activity + category distribution
 * @access  Private
 */
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // ── Weekly Activity (last 7 days) ───────────────────────────────────────
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyData = await History.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            date:       { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            prediction: '$prediction',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    // ── Category Distribution ────────────────────────────────────────────────
    const categoryData = await History.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id:   '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    // ── User aggregate stats ─────────────────────────────────────────────────
    const userStats = await User.findById(userId).select('stats');

    res.status(200).json({
      success: true,
      stats: {
        totals:      userStats.stats,
        weekly:      weeklyData,
        categories:  categoryData,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics.',
    });
  }
};

/**
 * @route   DELETE /api/history/:id
 * @desc    Delete a single history entry
 * @access  Private
 */
const deleteHistoryEntry = async (req, res) => {
  try {
    const entry = await History.findOne({
      _id:  req.params.id,
      user: req.user._id, // Ensure user owns this entry
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'History entry not found.',
      });
    }

    await entry.deleteOne();

    // Update user stats accordingly
    const statsField = entry.prediction === 'FAKE' ? 'fakeCount' : 'realCount';
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        'stats.totalChecks': -1,
        [`stats.${statsField}`]: -1,
      },
    });

    res.status(200).json({
      success: true,
      message: 'History entry deleted successfully.',
    });
  } catch (error) {
    console.error('Delete history error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error deleting history entry.',
    });
  }
};

/**
 * @route   DELETE /api/history
 * @desc    Clear all history for the logged-in user
 * @access  Private
 */
const clearHistory = async (req, res) => {
  try {
    await History.deleteMany({ user: req.user._id });

    // Reset user stats
    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        'stats.totalChecks': 0,
        'stats.fakeCount':   0,
        'stats.realCount':   0,
      },
    });

    res.status(200).json({
      success: true,
      message: 'All history cleared successfully.',
    });
  } catch (error) {
    console.error('Clear history error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error clearing history.',
    });
  }
};

module.exports = { getHistory, getStats, deleteHistoryEntry, clearHistory };