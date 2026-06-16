const express = require('express');
const router = express.Router();
const pdfParse = require('pdf-parse');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const JobDescription = require('../models/JobDescription');
const aiService = require('../services/aiService');

// @route   POST /api/jd/text
// @desc    Submit JD by pasting text
router.post('/text', protect, async (req, res) => {
  const { title, company, jdText } = req.body;
  try {
    if (!jdText || jdText.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Job description text is required.' });
    }

    // Call Gemini AI service to parse JD details
    const parsedJD = await aiService.analyzeJD(jdText);

    const jdData = {
      userId: req.user._id,
      title: title || parsedJD.title || 'Untitled Position',
      company: company || parsedJD.company || '',
      jdText: jdText,
      requiredSkills: parsedJD.requiredSkills || [],
      responsibilities: parsedJD.responsibilities || [],
      experienceRequirements: parsedJD.experienceRequirements || '',
      technologies: parsedJD.technologies || [],
      softSkills: parsedJD.softSkills || []
    };

    const jd = await JobDescription.create(jdData);

    return res.status(201).json({
      success: true,
      message: 'Job description analyzed and saved successfully',
      jd
    });
  } catch (error) {
    console.error('JD text save error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during JD analysis' });
  }
});

// @route   POST /api/jd/upload
// @desc    Upload JD PDF and parse it using Gemini
router.post('/upload', protect, upload.single('jdFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a job description file (PDF)' });
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

    // Call Gemini AI service to parse JD details
    const parsedJD = await aiService.analyzeJD(extractedText);

    const jdData = {
      userId: req.user._id,
      title: parsedJD.title || 'Untitled Position',
      company: parsedJD.company || '',
      jdText: extractedText,
      requiredSkills: parsedJD.requiredSkills || [],
      responsibilities: parsedJD.responsibilities || [],
      experienceRequirements: parsedJD.experienceRequirements || '',
      technologies: parsedJD.technologies || [],
      softSkills: parsedJD.softSkills || []
    };

    const jd = await JobDescription.create(jdData);

    return res.status(201).json({
      success: true,
      message: 'Job description PDF parsed and saved successfully',
      jd
    });
  } catch (error) {
    console.error('JD upload/parse error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during JD parsing' });
  }
});

// @route   GET /api/jd/latest
// @desc    Get latest job description of current user
router.get('/latest', protect, async (req, res) => {
  try {
    const jd = await JobDescription.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (!jd) {
      return res.status(404).json({ success: false, message: 'No job description found. Please paste or upload a JD first.' });
    }
    return res.json({ success: true, jd });
  } catch (error) {
    console.error('Error fetching JD:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
