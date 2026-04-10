// controllers/analyzeController.js
// Handles news analysis - sends content to ML service, stores results

const axios  = require('axios');
const User    = require('../models/User');
const History = require('../models/History');

// ─── Keywords used for quick client-side highlighting (returned to frontend) ─
const SUSPICIOUS_PATTERNS = [
  'breaking', 'exclusive', 'shocking', 'unbelievable', 'secret', 'exposed',
  'they don\'t want you to know', 'mainstream media', 'deep state', 'hoax',
  'conspiracy', 'cover-up', 'bombshell', 'urgent', 'must share', 'viral',
  'anonymous sources', 'insiders say', 'allegedly', 'rumored',
];

/**
 * @route   POST /api/analyze
 * @desc    Analyze a news text or URL for fake/real classification
 * @access  Private (requires JWT)
 */
const analyze = async (req, res) => {
  const { text, url, inputType = 'text' } = req.body;

  // ── Input Validation ───────────────────────────────────────────────────────
  if (!text && !url) {
    return res.status(400).json({
      success: false,
      message: 'Please provide either news text or a URL to analyze.',
    });
  }

  const contentToAnalyze = text || '';

  if (contentToAnalyze.trim().length < 20) {
    return res.status(400).json({
      success: false,
      message: 'Please provide at least 20 characters of news content.',
    });
  }

  try {
    // ── Call Python ML Service ───────────────────────────────────────────────
    let mlResult;
    try {
      const mlResponse = await axios.post(
        `${process.env.ML_SERVICE_URL}/predict`,
        { text: contentToAnalyze },
        { timeout: 15000 } // 15 second timeout
      );
      mlResult = mlResponse.data;
    } catch (mlError) {
      console.error('ML service error:', mlError.message);
      // Fallback: Return error if ML service is down
      return res.status(503).json({
        success: false,
        message: 'Analysis service is temporarily unavailable. Please try again.',
      });
    }

    const { prediction, confidence, explanation, suspicious_words } = mlResult;

    // ── Find suspicious words in the text ───────────────────────────────────
    const foundSuspiciousWords = suspicious_words?.length
      ? suspicious_words
      : SUSPICIOUS_PATTERNS.filter(word =>
          contentToAnalyze.toLowerCase().includes(word.toLowerCase())
        );

    // ── Store result in History collection ──────────────────────────────────
    const historyEntry = await History.create({
      user:           req.user._id,
      inputType,
      content:        contentToAnalyze.substring(0, 500), // Store truncated
      sourceUrl:      url || null,
      prediction,
      confidence:     Math.round(confidence),
      explanation:    explanation || generateExplanation(prediction, confidence),
      suspiciousWords: foundSuspiciousWords.slice(0, 10), // Max 10 words
      category:       mlResult.category || 'General',
    });

    // ── Update user aggregate stats ──────────────────────────────────────────
    const statsUpdate = {
      $inc: {
        'stats.totalChecks': 1,
        [`stats.${prediction === 'FAKE' ? 'fakeCount' : 'realCount'}`]: 1,
      },
    };
    await User.findByIdAndUpdate(req.user._id, statsUpdate);

    // ── Send Response ────────────────────────────────────────────────────────
    res.status(200).json({
      success: true,
      result: {
        id:              historyEntry._id,
        prediction,
        confidence:      Math.round(confidence),
        explanation:     historyEntry.explanation,
        suspiciousWords: foundSuspiciousWords,
        category:        historyEntry.category,
        analyzedAt:      historyEntry.createdAt,
      },
    });
  } catch (error) {
    console.error('Analyze error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error processing analysis. Please try again.',
    });
  }
};

/**
 * Generate a human-readable explanation when ML service doesn't provide one
 */
const generateExplanation = (prediction, confidence) => {
  if (prediction === 'FAKE') {
    if (confidence > 85)
      return 'This article contains multiple indicators commonly associated with misinformation, including sensational language, unverified claims, and patterns consistent with fabricated content.';
    if (confidence > 70)
      return 'This article shows several characteristics of potentially misleading content. Treat with caution and verify through credible sources.';
    return 'This article has some characteristics that may indicate misleading information. We recommend cross-referencing with trusted news outlets.';
  } else {
    if (confidence > 85)
      return 'This article demonstrates high credibility indicators: factual tone, verifiable claims, and language patterns consistent with legitimate journalism.';
    if (confidence > 70)
      return 'This article appears to be legitimate news based on its language patterns and structural characteristics.';
    return 'This content shows more characteristics of real news than fake, though we recommend verifying details through primary sources.';
  }
};

module.exports = { analyze };