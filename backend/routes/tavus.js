const express = require("express");
const axios = require("axios");

const { protect } = require("../middleware/auth");

const Interview = require("../models/Interview");
const Resume = require("../models/Resume");
const JobDescription = require("../models/JobDescription");
const aiService = require("../services/aiService");
const router = express.Router();

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
    conversation_name: "HireMe AI Interview",

    properties: {
      enable_closed_captions: true,
      language: "English"
    }
  },
  {
    headers: {
      "x-api-key": process.env.TAVUS_API_KEY,
      "Content-Type": "application/json"
    }
  }
);

return res.json({
  success: true,
  conversationUrl: response.data.conversation_url,
  conversationId: response.data.conversation_id
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
  "/end-conversation",
  protect,
  async (req, res) => {
    try {

      const { conversationId } = req.body;

      if (!conversationId) {
        return res.status(400).json({
          success: false,
          message: "Conversation ID required"
        });
      }

      await axios.delete(
        `https://tavusapi.com/v2/conversations/${conversationId}`,
        {
          headers: {
            "x-api-key": process.env.TAVUS_API_KEY
          }
        }
      );

      return res.json({
        success: true
      });

    } catch (err) {

      console.log("END CONVERSATION ERROR");
      console.log(err.response?.data);

      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }
);

module.exports = router;