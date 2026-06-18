const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const aiService = require('../services/aiService');

// @route   POST /api/match/analyze
// @desc    Compare latest resume against latest JD and run ATS scan
router.post('/analyze', protect, async (req, res) => {
  try {
    // 1. Fetch latest resume
    const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (!resume) {
      return res.status(400).json({ success: false, message: 'No resume found. Please upload a resume first.' });
    }

    // 2. Fetch latest JD
    const jd = await JobDescription.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (!jd) {
      return res.status(400).json({ success: false, message: 'No job description found. Please paste or upload a JD first.' });
    }

    // 3. Run Matching Engine via Gemini
    const matchResults = await aiService.matchResumeJD(resume, jd);

    // 4. Run ATS analysis via Gemini
    const atsResults = await aiService.analyzeATS(resume, jd);

    return res.json({
      success: true,
      resumeId: resume._id,
      jdId: jd._id,
      jobTitle: jd.title,
      company: jd.company,
      matching: {
        matchScore: matchResults.matchScore || 0,
        matchedSkills: matchResults.matchedSkills || [],
        missingSkills: matchResults.missingSkills || [],
        improvementSuggestions: matchResults.improvementSuggestions || []
      },
      ats: {
        atsScore: atsResults.atsScore || 0,
        keywordMatchScore: atsResults.keywordMatchScore || 0,
        formattingScore: atsResults.formattingScore || 0,
        actionVerbsScore: atsResults.actionVerbsScore || 0,
        readabilityScore: atsResults.readabilityScore || 0,
        recommendations: atsResults.recommendations || []
      }
    });

  } catch (error) {
    console.error('Match/ATS analysis error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during compatibility analysis.' });
  }
});

module.exports = router;