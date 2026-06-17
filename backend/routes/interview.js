const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Interview = require('../models/Interview');
const Report = require('../models/Report');
const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const aiService = require('../services/aiService');

// @route   POST /api/interview/start
// @desc    Start a new mock interview

router.post('/start', protect, async (req, res) => {
  const { demoMode } = req.body;
  try {
    const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (!resume) {
      return res.status(400).json({ success: false, message: 'Please upload a resume before starting the mock interview.' });
    }

    const jd = await JobDescription.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (!jd) {
      return res.status(400).json({ success: false, message: 'Please paste or upload a Job Description before starting the mock interview.' });
    }

    // Generate questions via AI
    let questions = await aiService.generateInterviewQuestions(resume, jd);

    // If demoMode is enabled, limit questions to 3 for quick evaluation
    if (demoMode && questions.length > 3) {
      questions = questions.slice(0, 3);
    }

    // Terminate any existing in-progress interviews for this user
    await Interview.updateMany({ userId: req.user._id, status: 'in-progress' }, { status: 'completed' });

    const interview = await Interview.create({
      userId: req.user._id,
      resumeId: resume._id,
      jdId: jd._id,
      questions: questions,
      answers: [],
      status: 'in-progress',
      currentQuestionIndex: 0
    });

    return res.status(201).json({
      success: true,
      interview
    });
  } catch (error) {
    console.error('Start interview error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error starting interview.' });
  }
});

// @route   GET /api/interview/active
// @desc    Get current active interview
router.get('/active', protect, async (req, res) => {
  try {
    const interview = await Interview.findOne({ userId: req.user._id, status: 'in-progress' });
    if (!interview) {
      return res.status(404).json({ success: false, message: 'No active mock interview session found.' });
    }
    return res.json({ success: true, interview });
  } catch (error) {
    console.error('Get active interview error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// @route   POST /api/interview/answer
// @desc    Submit answer for current question
router.post('/answer', protect, async (req, res) => {
  const { answer } = req.body;
  try {
    if (!answer || answer.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Answer text cannot be empty.' });
    }

    const interview = await Interview.findOne({ userId: req.user._id, status: 'in-progress' });
    if (!interview) {
      return res.status(404).json({ success: false, message: 'No active interview session found.' });
    }

    const currentIndex = interview.currentQuestionIndex;
    if (currentIndex >= interview.questions.length) {
      return res.status(400).json({ success: false, message: 'All questions have already been answered.' });
    }

    const currentQuestion = interview.questions[currentIndex];

    // Fetch resume and JD context
    const resume = await Resume.findById(interview.resumeId);
    const jd = await JobDescription.findById(interview.jdId);

    // Evaluate answer via AI
    const evaluation = await aiService.evaluateAnswer(currentQuestion, answer, resume, jd);

    // Save answer and evaluation
    interview.answers.push({
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      type: currentQuestion.type,
      answer,
      evaluation
    });

    interview.currentQuestionIndex += 1;

    let isCompleted = false;
    if (interview.currentQuestionIndex >= interview.questions.length) {
      interview.status = 'completed';
      isCompleted = true;
    }

    console.log("QUESTIONS:");
    console.log(interview.questions);

    console.log("ANSWERS:");
    console.log(interview.answers);
    await interview.save();

    return res.json({
      success: true,
      evaluation,
      isCompleted,
      nextQuestionIndex: interview.currentQuestionIndex,
      totalQuestions: interview.questions.length
    });

  } catch (error) {
    console.error('Submit answer error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error evaluating answer.' });
  }
});

// @route   POST /api/interview/finalize
// @desc    End active interview early or finalize completed one, generate final report
router.post('/finalize', protect, async (req, res) => {
  try {
    const interview = await Interview.findOne({ userId: req.user._id, status: 'in-progress' });

    let targetInterview = interview;
    if (!targetInterview) {
      targetInterview = await Interview.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    }

    if (!targetInterview) {
      return res.status(404).json({ success: false, message: 'No interview sessions found to finalize.' });
    }

    // Mark as completed
    targetInterview.status = 'completed';
    await targetInterview.save();

    // Check if there are answers to compile
    if (targetInterview.answers.length === 0) {
      return res.status(400).json({ success: false, message: 'Cannot generate a report for an interview with no answers.' });
    }

    // Check if report already exists for this interview
    const existingReport = await Report.findOne({ interviewId: targetInterview._id });
    if (existingReport) {
      return res.json({ success: true, report: existingReport });
    }

    // Call Gemini AI service to generate final report
    const reportData = await aiService.generateFinalReport(targetInterview.questions, targetInterview.answers);

    const report = await Report.create({
      userId: req.user._id,
      interviewId: targetInterview._id,
      overallScore: reportData.overallScore || 70,
      technicalScore: reportData.technicalScore || 70,
      communicationScore: reportData.communicationScore || 70,
      problemSolvingScore: reportData.problemSolvingScore || 70,
      strengths: reportData.strengths || [],
      weaknesses: reportData.weaknesses || [],
      missedConcepts: reportData.missedConcepts || [],
      recommendedTopics: reportData.recommendedTopics || [],
      improvementPlan: reportData.improvementPlan || ''
    });
    console.log("REPORT CREATED:", report._id);

    return res.status(201).json({
      success: true,
      report
    });

  } catch (error) {
    console.error('Finalize interview error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error generating final report.' });
  }
});

// @route   GET /api/interview/reports
// @desc    Get all reports for user
router.get('/reports', protect, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, reports });
  } catch (error) {
    console.error('Get reports error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// @route   GET /api/interview/reports/:id
// @desc    Get single report details with actual question evaluation averages
router.get('/reports/:id', protect, async (req, res) => {
  try {
    const reportObj = await Report.findById(req.params.id);
    if (!reportObj) {
      return res.status(404).json({ success: false, message: 'Report card not found.' });
    }
    // Check ownership
    if (reportObj.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Unauthorized access.' });
    }

    const report = reportObj.toObject();

    // Query the associated interview to aggregate exact response evaluation coordinates
    const interview = await Interview.findById(report.interviewId);
    let avgRelevance = 0;
    let avgCompleteness = 0;
    let avgAccuracy = 0;
    let avgConfidence = 0;

    if (interview && interview.answers && interview.answers.length > 0) {
      const answeredCount = interview.answers.length;
      let totalRelevance = 0;
      let totalCompleteness = 0;
      let totalAccuracy = 0;
      let totalConfidence = 0;

      interview.answers.forEach(ans => {
        if (ans.evaluation) {
          totalRelevance += ans.evaluation.relevance || 0;
          totalCompleteness += ans.evaluation.completeness || 0;
          totalAccuracy += ans.evaluation.accuracy || 0;
          totalConfidence += ans.evaluation.confidence || 0;
        }
      });

      // Convert from 0-10 base to 0-100 percentage metric for capability chart
      avgRelevance = Math.round((totalRelevance / answeredCount) * 10);
      avgCompleteness = Math.round((totalCompleteness / answeredCount) * 10);
      avgAccuracy = Math.round((totalAccuracy / answeredCount) * 10);
      avgConfidence = Math.round((totalConfidence / answeredCount) * 10);
    } else {
      // Fallback fallback to overall score if details are missing
      avgRelevance = report.overallScore;
      avgCompleteness = report.overallScore;
      avgAccuracy = report.overallScore;
      avgConfidence = report.overallScore;
    }

    report.avgRelevance = avgRelevance;
    report.avgCompleteness = avgCompleteness;
    report.avgAccuracy = avgAccuracy;
    report.avgConfidence = avgConfidence;

    return res.json({ success: true, report });
  } catch (error) {
    console.error('Get single report error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = router;
