const express = require('express');
const router = express.Router();
const pdfParse = require('pdf-parse');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const Resume = require('../models/Resume');
const aiService = require('../services/aiService');

// @route   POST /api/resume/upload
// @desc    Upload resume PDF and parse it using Gemini
router.post('/upload', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a resume file (PDF)' });
    }

    // Parse PDF text
    let pdfData;
    try {
      pdfData = await pdfParse(req.file.buffer);
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      return res.status(400).json({ success: false, message: 'Failed to extract text from PDF. Ensure it is a valid document.' });
    }

    const extractedText = pdfData.text;
    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'No readable text could be extracted from this PDF.' });
    }

    // Call Gemini AI service to parse details
    const parsedDetails = await aiService.analyzeResume(extractedText);

    // Save resume in DB
    const resumeData = {
      userId: req.user._id,
      fileName: req.file.originalname,
      extractedText: extractedText,
      name: parsedDetails.name,
      email: parsedDetails.email,
      phone: parsedDetails.phone,
      skills: parsedDetails.skills || [],
      projects: parsedDetails.projects || [],
      experience: parsedDetails.experience || [],
      education: parsedDetails.education || [],
      certifications: parsedDetails.certifications || [],
      summary: parsedDetails.summary || '',
      strengths: parsedDetails.strengths || [],
      weaknesses: parsedDetails.weaknesses || []
    };

    const resume = await Resume.create(resumeData);

    return res.status(201).json({
      success: true,
      message: 'Resume parsed and saved successfully',
      resume
    });
  } catch (error) {
    console.error('Resume upload/parse error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during resume parsing' });
  }
});

// @route   GET /api/resume/latest
// @desc    Get latest parsed resume of current user
router.get('/latest', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'No resume found. Please upload a resume first.' });
    }
    return res.json({ success: true, resume });
  } catch (error) {
    console.error('Error fetching resume:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
