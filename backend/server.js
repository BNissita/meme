require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const tavusRoutes = require("./routes/tavus");

// Import routes
const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resume');
const jdRoutes = require('./routes/jd');
const matchRoutes = require('./routes/match');
const interviewRoutes = require('./routes/interview');
const dashboardRoutes = require('./routes/dashboard');
const communityRoutes = require("./routes/communityRoutes");


// Initialize app
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors()); // Allow all cross-origins for seamless hackathon integrations
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/community", communityRoutes);

app.get('/test-gemini', async (req, res) => {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash'
    });

    const result = await model.generateContent('Hello');

    res.json({
      success: true,
      text: result.response.text()
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
      details: error
    });
  }
});
// Simple healthcheck route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'HireMe AI API server is running.' });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/jd', jdRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/interview-call', interviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
// app.use("/api/livekit", require("./routes/livekit"));
// app.use("/api/recording", require("./routes/recording"));
app.use("/api/tavus", require("./routes/tavus"));

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`HireMe AI Server running on port ${PORT}`);
});
