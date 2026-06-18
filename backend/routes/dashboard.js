const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Interview = require('../models/Interview');
const Report = require('../models/Report');
const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');

// @route   GET /api/dashboard/stats

// @desc    Get aggregated stats for candidate dashboard
router.get('/stats', protect, async (req, res) => {
  try {
    // 1. Best score from reports
    const reports = await Report.find(
      { userId: req.user._id },
      {
        overallScore: 1,
        technicalScore: 1,
        communicationScore: 1,
        problemSolvingScore: 1,
        strengths: 1,
        weaknesses: 1,
        recommendedTopics: 1,
        missedConcepts: 1,
        improvementPlan: 1,
        createdAt: 1
      }
    )
      .sort({ createdAt: -1 })
      .lean();
    let bestScore = 0;
    if (reports.length > 0) {
      bestScore = Math.max(...reports.map(r => r.overallScore));
    }
    // 2. Total Interviews completed
    const totalInterviews = reports.length;

    // 3. Check for existence of resume & JD
    const [latestResume, latestJD] = await Promise.all([
      Resume.findOne({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .lean(),

      JobDescription.findOne({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .lean()
    ]);

    const latestReport = reports.length > 0 ? reports[0] : null;
    const topStrengths =
      latestReport?.strengths || [];

    const topWeaknesses =
      latestReport?.weaknesses || [];
    const recommendedTopics =
      latestReport?.recommendedTopics || [];
    const missedConcepts =
      latestReport?.missedConcepts || [];
    const improvementPlan =
      latestReport?.improvementPlan || '';
    let recommendation = "Complete more interviews";

    if (bestScore >= 85) {
      recommendation = "Ready for technical interviews";
    } else if (bestScore >= 70) {
      recommendation = "Good progress. Continue practicing.";
    } else if (bestScore > 0) {
      recommendation = "Focus on communication and technical clarity.";
    }
    // 4. Get recent reports list

    const recentReports = reports.slice(0, 5);

    // 5. Build timeline history for charts
    const history = reports.map(r => ({
      date: new Date(r.createdAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      }),
      score: r.overallScore,
      technical: r.technicalScore,
      communication: r.communicationScore,
      problemSolving: r.problemSolvingScore
    })).reverse();
    let improvementPercentage = 0;

    if (reports.length >= 2) {
      const latest = reports[0].overallScore;
      const previous = reports[1].overallScore;

      improvementPercentage = latest - previous;
    }
    const readinessScore =
      reports.length > 0
        ? Math.round(
          reports.reduce(
            (sum, r) => sum + r.overallScore,
            0
          ) / reports.length
        )
        : 0;
    let skillChart = [];

    if (latestReport) {
      skillChart = [
        {
          skill: "Technical",
          score: latestReport.technicalScore || 0
        },
        {
          skill: "Communication",
          score: latestReport.communicationScore || 0
        },
        {
          skill: "Problem Solving",
          score: latestReport.problemSolvingScore || 0
        }
      ];
    }
    console.log("REPORTS FOUND:", reports.length);
    console.log("LATEST REPORT:", latestReport);
    return res.json({
      success: true,
      stats: {
        totalInterviews,
        bestScore,
        atsScore: 0,
        matchScore: latestReport?.overallScore || 0,
        hasResume: !!latestResume,
        hasJD: !!latestJD,
        recommendedTopics,
        missedConcepts,
        improvementPlan,

        readinessScore,
        improvementPercentage,

        topStrengths,
        topWeaknesses,

        recommendation,
        skillChart
      },
      recentReports,
      history
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error fetching stats.' });
  }
});

module.exports = router;
