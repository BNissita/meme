console.log("Tavus routes loaded");
const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "tavus route working"
    });
});

// to create a new conversation and get the URL
router.post("/create-conversation", async (req, res) => {
    try {
        console.log("REPLICA:", process.env.TAVUS_REPLICA_ID);
        console.log("PERSONA:", process.env.TAVUS_PERSONA_ID);
        const response = await axios.post(
            "https://tavusapi.com/v2/conversations",
            {
                replica_id: process.env.TAVUS_REPLICA_ID,
                persona_id: process.env.TAVUS_PERSONA_ID,

                conversation_name: "HireMe AI Interview",

                properties: {
                    enable_closed_captions: true,
                    max_call_duration: 3600,
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

        res.json({
            success: true,
            conversationId:
                response.data.conversation_id,
            conversationUrl:
                response.data.conversation_url
        });
    } catch (err) {
        console.error(err.response?.data);

        res.status(500).json({
            success: false,
            error: err.response?.data
        });
    }
});

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

module.exports = router;