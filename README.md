# HireMe AI 

AI-Powered Interview Preparation and Resume Evaluation Platform

## 📌 Overview

HireMe AI is a MERN Stack application designed to help students and job seekers prepare for interviews through AI-driven resume analysis, job description matching, mock interviews, and personalized performance reports.

The platform evaluates a candidate's readiness for a specific role by comparing their resume against a job description, generating tailored interview questions, conducting AI-powered mock interviews, and providing actionable feedback.

---

## ✨ Features

### 🔐 Authentication

* User Registration & Login
* JWT-based Authentication
* Protected Routes
* Secure Password Storage

### 📄 Resume Management

* Upload Resume (PDF)
* Resume Parsing and Text Extraction
* Resume History Tracking
* Resume Analysis

### 💼 Job Description Analysis

* Paste or Upload Job Descriptions
* AI-Powered JD Parsing
* JD History Management
* Skill Extraction

### 🎯 Resume-JD Matching

* Compatibility Score Calculation
* Skill Gap Analysis
* Matched Skills Identification
* Missing Skills Detection
* Improvement Recommendations

### 🤖 AI Interview Preparation

* Dynamic Interview Question Generation
* Questions based on Resume and Job Description
* Technical & Behavioral Question Support
* Personalized Interview Experience

### 🎥 Virtual Interview Experience

* Tavus AI Avatar Integration
* Real-Time AI Interview Sessions
* Voice-Based Interaction
* Closed Captions Support

### 📊 Reports & Analytics

* Interview Performance Reports
* Technical Skill Evaluation
* Communication Assessment
* Strengths and Weaknesses Analysis
* Personalized Improvement Plan

### 🌐 Community Platform

* Discussion Forums
* Job Posting Section
* Community Interaction
* Post Management

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* Axios
* React Router DOM
* Recharts

### Backend

* Node.js
* Express.js
* JWT Authentication
* Multer
* PDF-Parse

### Database

* MongoDB Atlas
* Mongoose ODM

### AI & External Services

* Groq API
* Tavus Conversational AI
* Gemini AI

---

```bash
HireMe-AI/
│
├── frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   │
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   └── icons/
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── MatchScoreCard.jsx
│   │   │   ├── ReportCharts.jsx
│   │   │   └── CommunityPostCard.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ResumeUploadPage.jsx
│   │   │   ├── JDUploadPage.jsx
│   │   │   ├── MatchAnalysisPage.jsx
│   │   │   ├── InterviewGuidelinesPage.jsx
│   │   │   ├── InterviewCallPage.jsx
│   │   │   ├── ReportsPage.jsx
│   │   │   ├── CommunityPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Resume.js
│   │   ├── JobDescription.js
│   │   ├── Interview.js
│   │   ├── Report.js
│   │   └── CommunityPost.js
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── resume.js
│   │   ├── jd.js
│   │   ├── match.js
│   │   ├── interview.js
│   │   ├── tavus.js
│   │   ├── dashboard.js
│   │   └── communityRoutes.js
│   │
│   ├── services/
│   │   └── aiService.js
│   │
│   ├── uploads/
│   │
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── .gitignore
├── README.md
└── LICENSE
```

## ⚙️ Installation

### Clone Repository

```bash
git clone <repository-url>
cd HireMe-AI
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

Create a `.env` file inside backend folder.

```env
PORT=5050

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GROQ_API_KEY=your_groq_api_key

TAVUS_API_KEY=your_tavus_api_key

TAVUS_REPLICA_ID=your_replica_id

TAVUS_PERSONA_ID=your_persona_id
```

---

## 🚀 Application Workflow

```text
User Login/Register
        ↓
Upload Resume
        ↓
Upload Job Description
        ↓
Resume-JD Matching
        ↓
AI Interview Question Generation
        ↓
Tavus AI Interview
        ↓
Performance Evaluation
        ↓
Final Report & Recommendations
```

---

## 🔒 Security Features

* Cookie based Authentication
* Protected API Routes
* Password Hashing
* Input Validation
* Secure Environment Variables
* User Authorization Checks

---

## 📈 Future Enhancements

* Google Sign-In
* Real-Time Interview Analytics
* Video Recording Support
* ATS Optimization Suggestions
* Multi-Language Interviews
* Recruiter Dashboard
* Interview Transcript Analysis

---

## 👨‍💻 Team

Developed as part of a MERN Stack and AI-powered interview preparation project.

---

## 📄 License

This project is developed for educational and demonstration purposes.
