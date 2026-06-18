console.log("Tavus routes loaded");
const express = require("express");
const axios = require("axios");

const { protect } = require("../middleware/auth");

const Interview = require("../models/Interview");
const Resume = require("../models/Resume");
const JobDescription = require("../models/JobDescription");
const aiService = require("../services/aiService");
const router = express.Router();
const Report = require("../models/Report");

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "tavus route working"
  });
});

// to create a new conversation and get the URL
router.post(
  "/create-conversation",
  protect,
  async (req, res) => {
    try {

      console.log("===== START =====");

      console.log("USER:", req.user);


      const resume = await Resume.findOne({
        userId: req.user._id
      }).sort({ createdAt: -1 });

      console.log("RESUME FOUND:", !!resume);

      const jd = await JobDescription.findOne({
        userId: req.user._id
      }).sort({ createdAt: -1 });

      console.log("JD FOUND:", !!jd);


      if (!resume) {
        return res.status(400).json({
          success: false,
          error: "Resume required"
        });
      }

      if (!jd) {
        return res.status(400).json({
          success: false,
          error: "Job Description required"
        });
      }

      const questions =
        await aiService.generateInterviewQuestions(
          resume,
          jd
        );

      console.log(
        "QUESTIONS:",
        questions?.length
      );

      console.log(
        "API KEY:",
        process.env.TAVUS_API_KEY
      );

      console.log(
        "REPLICA:",
        process.env.TAVUS_REPLICA_ID
      );

      console.log(
        "PERSONA:",
        process.env.TAVUS_PERSONA_ID
      );

      const response = await axios.post(
        "https://tavusapi.com/v2/conversations",
        {
          replica_id: process.env.TAVUS_REPLICA_ID,
          persona_id: process.env.TAVUS_PERSONA_ID,
          conversation_name: "HireMe AI Interview"
        },
        {
          headers: {
            "x-api-key": process.env.TAVUS_API_KEY,
            "Content-Type": "application/json"
          }
        }
      );
      await Interview.updateMany(
        {
          userId: req.user._id,
          status: "in-progress"
        },
        {
          status: "completed"
        }
      );
      const interview = await Interview.create({
        userId: req.user._id,
        resumeId: resume._id,
        jdId: jd._id,

        questions,

        status: "in-progress",

        tavusConversationId:
          response.data.conversation_id,

        tavusConversationUrl:
          response.data.conversation_url
      });
      console.log(
        "CONVERSATION ID:",
        response.data.conversation_id
      );
      return res.json({
        success: true,
        conversationUrl: response.data.conversation_url,
        conversationId: response.data.conversation_id,
        interviewId: interview._id
      });


    } catch (err) {

      console.log("FULL ERROR");
      console.log(err);

      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }
);

console.log("FINALIZE ROUTE REGISTERED");
router.post(
  "/finalize/:conversationId",
  protect,
  async (req, res) => {
    try {

      const interview =
        await Interview.findOne({
          tavusConversationId:
            req.params.conversationId
        });

      if (!interview) {
        return res.status(404).json({
          success: false,
          error: "Interview not found"
        });
      }

      if (interview.status === "completed") {

        const existingReport =
          await Report.findOne({
            interviewId: interview._id
          });

        if (existingReport) {
          return res.json({
            success: true,
            reportId: existingReport._id
          });
        }
      }

      let transcript = [];
      let perceptionAnalysis = null;

      let attempts = 0;
      const maxAttempts = 12;

      while (attempts < maxAttempts) {

        const tavusResponse =
          await axios.get(
            `https://tavusapi.com/v2/conversations/${req.params.conversationId}?verbose=true`,
            {
              headers: {
                "x-api-key":
                  process.env.TAVUS_API_KEY
              }
            }
          );

        const events =
          tavusResponse.data.events || [];

        transcript = [];
        perceptionAnalysis = null;

        for (const event of events) {

          if (
            event.event_type ===
            "application.transcription_ready"
          ) {
            transcript =
              event.properties?.transcript || [];
          }

          if (
            event.event_type ===
            "application.perception_analysis"
          ) {
            perceptionAnalysis =
              event.properties || null;
          }
        }

        console.log(
          `Attempt ${attempts + 1}`
        );

        console.log(
          "Transcript Length:",
          transcript.length
        );

        console.log(
          "Perception Found:",
          !!perceptionAnalysis
        );

        if (
          transcript.length > 0
        ) {
          console.log(
            "Tavus processing completed"
          );
          break;
        }

        await new Promise(resolve =>
          setTimeout(resolve, 5000)
        );

        attempts++;
      }
      if (
        transcript.length === 0
      ) {
        return res.status(202).json({
          success: false,
          processing: true,
          message:
            "Transcript still processing. Try again in a few seconds."
        });
      }

      interview.transcript = transcript;
      interview.perceptionAnalysis =
        perceptionAnalysis;

      interview.status = "completed";

      await interview.save();
      console.log(
        "Generating Tavus report..."
      );

      console.log(
        "Transcript Length:",
        transcript.length
      );

      console.log(
        "Perception Found:",
        !!perceptionAnalysis
      );
      const resume =
        await Resume.findById(
          interview.resumeId
        );

      const jd =
        await JobDescription.findById(
          interview.jdId
        );

      const reportData =
        await aiService.generateTavusReport(
          resume,
          jd,
          transcript,
          perceptionAnalysis
        );

      console.log(
        "REPORT DATA:",
        JSON.stringify(reportData, null, 2)
      );
      const report =
        await Report.create({

          userId:
            interview.userId,

          interviewId:
            interview._id,

          ...reportData,

          transcript,
          perceptionAnalysis
        });
      console.log(
        "REPORT CREATED:",
        report._id
      );

      return res.json({
        success: true,

        reportId:
          report._id,

        transcriptLength:
          transcript.length,

        perceptionFound:
          !!perceptionAnalysis
      });

    } catch (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }
);

// to fetch conversation details and results
router.get(
  "/interview-results/:conversationId",
  async (req, res) => {
    try {
      const response = await axios.get(
        `https://tavusapi.com/v2/conversations/${req.params.conversationId}?verbose=true`,
        {
          headers: {
            "x-api-key": process.env.TAVUS_API_KEY
          }
        }
      );

      res.json(response.data);
    } catch (err) {
      console.error(err.response?.data);

      res.status(500).json({
        error: err.response?.data
      });
    }
  }
);
router.post(
  "/finalize-test/:conversationId",
  async (req, res) => {
    return res.json({
      success: true,
      id: req.params.conversationId
    });
  }
);

router.get(
  "/report/:reportId",
  protect,
  async (req, res) => {
    try {

      const report =
        await Report.findById(
          req.params.reportId
        );

      if (!report) {
        return res.status(404).json({
          success: false,
          error: "Report not found"
        });
      }

      res.json({
        success: true,
        report
      });

    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }
);

router.get(
  "/my-reports",
  protect,
  async (req, res) => {
    try {

      const reports =
        await Report.find({
          userId: req.user._id
        })
          .sort({
            createdAt: -1
          });

      res.json({
        success: true,
        reports
      });

    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }
);

router.get(
  "/transcript/:reportId",
  protect,
  async (req, res) => {
    try {

      const report =
        await Report.findById(
          req.params.reportId
        );

      if (!report) {
        return res.status(404).json({
          success: false,
          error: "Report not found"
        });
      }

      res.json({
        success: true,
        transcript:
          report.transcript || []
      });

    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }
);

module.exports = router;