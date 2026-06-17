const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


/**
 * Clean and parse JSON response from 
 * 
 */
const parseJSONResponse = (text, fallback) => {
  try {
    let cleaned = text.trim();

    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/, "");
    }

    if (cleaned.endsWith("```")) {
      cleaned = cleaned.replace(/\s*```$/, "");
    }

    cleaned = cleaned.trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("JSON Parse Error:", error);
    console.error("Raw AI Response:", text);
    return fallback;
  }
};

const callGroq = async (prompt) => {
  console.log("Using Groq AI...");
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are a resume analysis and interview assistant. Always return valid JSON only."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.3
  });

  return response.choices[0].message.content;
};

/**
 * 1. Analyze Resume Text
 */
const analyzeResume = async (text) => {

  const prompt = `
    Analyze the following raw text extracted from a resume.
    Extract the following details and return them as a JSON object matching this schema:
    {
      "name": "Full name of candidate, default to ''",
      "email": "Email address, default to ''",
      "phone": "Phone number, default to ''",
      "skills": ["Array of skills, keywords, languages, frameworks"],
      "projects": [
        {
          "name": "Project name",
          "description": "Short description of project",
          "technologies": ["Array of technology keywords used"]
        }
      ],
      "experience": [
        {
          "role": "Job title/Role",
          "company": "Company Name",
          "duration": "Duration/dates",
          "description": "Description of work done"
        }
      ],
      "education": [
        {
          "degree": "Degree earned",
          "institution": "School/University name",
          "year": "Year of graduation"
        }
      ],
      "certifications": ["List of certifications"],

"summary": "A professional 3-sentence summary of the candidate's profile based on the resume",

"strengths": [
  "Top 3 professional strengths of this candidate"
],

"weaknesses": [
  "Top 3 improvement areas or missing elements in the profile"
],

"atsScore": 0,

"interviewReadiness": 0,

"aiSummary": "Recruiter style evaluation of the candidate in 3-5 sentences"
    }
Calculate:

atsScore:
- Based on formatting
- Skills
- Projects
- Experience
- Education
- Resume completeness

Return score between 0 and 100.

interviewReadiness:
- Based on technical skills
- Projects
- Experience
- Communication indicators
- Overall employability

Return score between 0 and 100.

aiSummary:
Write a recruiter-style verdict explaining:
- Candidate strengths
- Missing skills
- Hiring potential
- Areas for improvement

Keep it professional and concise.
    Resume Text:
    ${text}
  `;
  
  try {
    const resultText = await callGroq(prompt);
    return parseJSONResponse(resultText, getMockResumeAnalysis(text));
  } catch (error) {
    console.error("Groq analyzeResume error:", error);
    return getMockResumeAnalysis(text);
  }
};

const generateResumeInsights =
async (resume) => {

const prompt = `
You are an expert recruiter.

Analyze this resume.

Return JSON only.

{
 "atsScore": 0,
 "interviewReadiness": 0,
 "summary": "",
 "strengths": [],
 "weaknesses": []
}

Resume:
${JSON.stringify(resume)}
`;

const result =
await callGroq(prompt);

return parseJSONResponse(result);
};

/**
 * 2. Analyze Job Description Text
 */
const analyzeJD = async (text) => {

  const prompt = `
    Analyze the following job description (JD) text.
    Extract key information and return it as a JSON object matching this schema:
    {
      "title": "Job title (e.g. Software Engineer), default to 'Job Position'",
      "company": "Company name if mentioned, default to ''",
      "requiredSkills": ["Essential skills required, e.g. React, Docker"],
      "responsibilities": ["Top 4 core responsibilities"],
      "experienceRequirements": "Experience requirement summary (e.g., '2+ years' or 'Senior level')",
      "technologies": ["List of libraries, tools, tech stacks mentioned"],
      "softSkills": ["List of soft skills required, e.g. communication, collaboration"]
    }

    Job Description:
    ${text}
  `;

  try {
    const resultText = await callGroq(prompt);
    return parseJSONResponse(resultText, getMockJDAnalysis(text));
  } catch (error) {
    console.error("Gemini analyzeJD error, falling back to mock:", error);
    return getMockJDAnalysis(text);
  }
};

/**
 * 3. Match Resume against Job Description
 */
const matchResumeJD = async (resume, jd) => {

  const prompt = `
Compare the candidate resume with the job description.

IMPORTANT:

Evaluate compatibility using ALL of the following:

1. Skill Match (40%)
2. Project Relevance (20%)
3. Experience Relevance (20%)
4. Education Relevance (10%)
5. Domain Alignment (10%)

Do NOT rely only on keyword matching.

Consider:
- Technologies used in projects
- Internship/work experience
- Domain similarity
- Transferable skills
- Education background
- Certifications

If resume and JD belong to completely different domains,
clearly explain the mismatch and lower the domain alignment score.

Return ONLY valid JSON:

{
  "matchScore": 0,
  "skillMatch": 0,
  "projectRelevance": 0,
  "experienceRelevance": 0,
  "educationRelevance": 0,
  "domainAlignment": 0,
  "matchedSkills": [],
  "missingSkills": [],
  "strengths": [],
  "improvementSuggestions": []
}

Resume:
${JSON.stringify({
  name: resume.name,
  skills: resume.skills,
  projects: resume.projects,
  experience: resume.experience,
  education: resume.education,
  certifications: resume.certifications
})}

Job Description:
${JSON.stringify({
  title: jd.title,
  requiredSkills: jd.requiredSkills,
  technologies: jd.technologies,
  experienceRequirements: jd.experienceRequirements
})}
`;

  try {
  const resultText = await callGroq(prompt);

  console.log("MATCH RAW RESPONSE:");
  console.log(resultText);

  return parseJSONResponse(resultText, getMockMatch(resume, jd));
} catch (error) {
    console.error("Gemini matchResumeJD error, falling back to mock:", error);
    return getMockMatch(resume, jd);
  }
};

/**
 * 4. Run ATS Scoring and Analysis
 */
const analyzeATS = async (resume, jd) => {

  const prompt = `
  IMPORTANT:
If the resume and JD belong to different industries,
do not provide generic ATS advice.

Instead:
- Explain the domain mismatch.
- Identify missing domain-specific keywords.
- Mention whether ATS optimization would realistically help.
- Suggest more suitable job categories.
    Perform an Applicant Tracking System (ATS) scan of the candidate's resume relative to the Job Description.
    Evaluate keyword frequency, document formatting indices, use of action verbs, readability score, and skills coverage.
    Return a JSON object matching this schema:
    {
      "atsScore": 75, // Integer between 0 and 100
      "keywordMatchScore": 80, // Integer 0-100
      "formattingScore": 90, // Integer 0-100 (checks for standard sections)
      "actionVerbsScore": 70, // Integer 0-100 (checks for strong action verbs like Led, Architected, Optimized)
      "readabilityScore": 85, // Integer 0-100 (checks for clear language, bullet points)
      "recommendations": [
        "4-5 concrete recommendations to bypass ATS filters, e.g. 'Add action verbs like Optimized in your experience section', 'Include exact keyword: Node.js'"
      ]
    }

    Resume:
    ${JSON.stringify({ skills: resume.skills, summary: resume.summary, projects: resume.projects, experience: resume.experience })}

    JD:
    ${JSON.stringify({ title: jd.title, requiredSkills: jd.requiredSkills, responsibilities: jd.responsibilities, technologies: jd.technologies })}
  `;

  try {
    const resultText = await callGroq(prompt);
    return parseJSONResponse(resultText, getMockATS(resume, jd));
  } catch (error) {
    console.error("Gemini analyzeATS error, falling back to mock:", error);
    return getMockATS(resume, jd);
  }
};

/**
 * 5. Generate Interview Questions (10-15)
 */
const generateInterviewQuestions = async (resume, jd) => {
  
  const prompt = `
    Generate 10 to 12 highly relevant and challenging interview questions for a mock interview.
    The candidate's resume and target Job Description are provided below.
    Tailor questions based on candidate's experience, matching skills, and missing skills.
    Ensure questions are split across these types:
    - Technical (core concepts of tools/languages required)
    - HR (fit, career goals)
    - Behavioral (situational questions, STAR method)
    - Project-Based (deep dive into projects listed in the resume)
    
    Return a JSON object matching this schema:
    {
      "questions": [
        {
          "id": "q1", // unique id like q1, q2, q3...
          "question": "The actual question text",
          "type": "Technical" // Must be one of: 'Technical', 'HR', 'Behavioral', 'Project-Based'
        }
      ]
    }

    Resume Details:
    ${JSON.stringify({ skills: resume.skills, projects: resume.projects, experience: resume.experience })}

    JD Details:
    ${JSON.stringify({ title: jd.title, requiredSkills: jd.requiredSkills, responsibilities: jd.responsibilities })}
  `;

  try {
    const resultText = await callGroq(prompt);
    const parsed = parseJSONResponse(resultText, null);
    if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return parsed.questions;
    }
    return getMockQuestions(resume, jd);
  } catch (error) {
    console.error("Gemini generateInterviewQuestions error, falling back to mock:", error);
    return getMockQuestions(resume, jd);
  }
};

/**
 * 6. Evaluate Candidate's Answer
 */
const evaluateAnswer = async (question, answer, resume, jd) => {
  
  const prompt = `
    You are an expert tech recruiter. Evaluate the candidate's answer to the interview question below.
    Provide constructive feedback and granular scores out of 10.
    
    Question: "${question.question}"
    Question Category: "${question.type}"
    Candidate's Answer: "${answer}"
    
    Job context: ${JSON.stringify({ title: jd.title, requiredSkills: jd.requiredSkills })}
    Resume context: ${JSON.stringify({ skills: resume.skills })}

    Return a JSON object matching this schema:
    {
      "relevance": 8, // Score out of 10. Did they answer the question asked?
      "accuracy": 7, // Score out of 10. Is the technical/factual detail correct?
      "communication": 9, // Score out of 10. Is the structure and clarity of answer good?
      "completeness": 6, // Score out of 10. Did they cover all parts of the question?
      "confidence": 8, // Score out of 10. Tone, conviction, completeness of assertions.
      "score": 7.6, // Overall score for this question (0 to 10 scale)
      "feedback": "Direct, structured feedback on their response, identifying what was good.",
      "suggestions": "Actionable advice on what they missed or how they can answer this question better next time."
    }
  `;

  try {
    const resultText = await callGroq(prompt);
    return parseJSONResponse(resultText, getMockAnswerEvaluation(question, answer));
  } catch (error) {
    console.error("Gemini evaluateAnswer error, falling back to mock:", error);
    return getMockAnswerEvaluation(question, answer);
  }
};

/**
 * 7. Generate Final Interview Report
 */
const generateFinalReport = async (questions, answers) => {
  
  const prompt = `
    Analyze the candidate's performance across the entire mock interview session.
    A list of questions, candidate answers, and individual evaluations are provided.
    Compile an overall scorecard, identify critical missing concepts, list strengths & weaknesses, and generate a customized step-by-step career improvement plan.
    
    Interview Details:
    ${JSON.stringify(answers.map(a => ({
      question: a.question,
      type: a.type,
      answer: a.answer,
      score: a.evaluation?.score,
      feedback: a.evaluation?.feedback
    })))}

    Return a JSON object matching this schema:
    {
      "overallScore": 82, // Score from 0 to 100
      "technicalScore": 78, // Score from 0 to 100
      "communicationScore": 85, // Score from 0 to 100
      "problemSolvingScore": 80, // Score from 0 to 100
      "strengths": [
        "Top 3-4 strengths demonstrated during the interview"
      ],
      "weaknesses": [
        "Top 3-4 weaknesses or knowledge gaps observed"
      ],
      "missedConcepts": [
        "List of key concepts they answered incorrectly or failed to address (e.g. JWT token storage, Virtual DOM reconciliation)"
      ],
      "recommendedTopics": [
        "List of topics to study next"
      ],
      "improvementPlan": "A comprehensive, markdown-formatted structured study guide and 4-week preparation timeline tailored to correct the weaknesses identified."
    }
  `;

  try {
    const resultText = await callGroq(prompt);
    return parseJSONResponse(resultText, getMockFinalReport(questions, answers));
  } catch (error) {
    console.error("Gemini generateFinalReport error, falling back to mock:", error);
    return getMockFinalReport(questions, answers);
  }
};

// ==========================================
// HIGH FIDELITY MOCK FALLBACK DATA GENERATORS
// ==========================================

function getMockResumeAnalysis(text) {
  // Simple heuristic parsing for mock responses
  const cleanText = text.toLowerCase();
  
  // Detect skills
  const skillsList = ['react', 'node.js', 'mongodb', 'express', 'javascript', 'typescript', 'html', 'css', 'python', 'java', 'c++', 'aws', 'docker', 'kubernetes', 'git', 'sql', 'next.js', 'redux', 'graphql', 'tailwind'];
  const skills = skillsList.filter(s => cleanText.includes(s));
  if (skills.length === 0) {
    skills.push('React', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript');
  } else {
    // Titlecase
    skills.forEach((s, idx) => {
      skills[idx] = s === 'node.js' ? 'Node.js' : s.charAt(0).toUpperCase() + s.slice(1);
    });
  }

  // Detect basic contact
  let name = "Alex Mercer";
  let email = "alex.mercer@gmail.com";
  let phone = "+1 (555) 019-2834";
  
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
  const matchEmail = text.match(emailRegex);
  if (matchEmail) email = matchEmail[0];

  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const matchPhone = text.match(phoneRegex);
  if (matchPhone) phone = matchPhone[0];

  // Try to find a name from first line
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length > 0 && lines[0].length < 30 && !lines[0].includes('@')) {
    name = lines[0];
  }

  return {
    name,
    email,
    phone,
    skills,
    projects: [
      {
        name: "E-Commerce Microservices Platform",
        description: "Built a fully scalable e-commerce backend utilizing Node.js microservices, rabbitMQ, and MongoDB.",
        technologies: ["Node.js", "Express", "MongoDB", "RabbitMQ", "Docker"]
      },
      {
        name: "Real-time Chat Application",
        description: "Developed a collaborative real-time messaging application with private chat rooms and status indicators.",
        technologies: ["React", "Node.js", "Socket.io", "CSS"]
      }
    ],
    experience: [
      {
        role: "Software Developer Intern",
        company: "ByteCraft Solutions",
        duration: "June 2025 - Present",
        description: "Assisted in maintaining corporate client web portals, developing reusable React components and optimizing MongoDB queries."
      }
    ],
    education: [
      {
        degree: "Bachelor of Science in Computer Science",
        institution: "State Tech University",
        year: "2026"
      }
    ],
    certifications: ["AWS Certified Cloud Practitioner", "FreeCodeCamp Full Stack Developer Certificate"],
    summary: `A motivated and detail-oriented student developer with strong foundations in full-stack JavaScript development (MERN stack). Experience building microservices, REST APIs, and responsive frontends. Proven capability to acquire new technology stacks and build robust features.`,
    strengths: [
      "Solid understanding of Core JavaScript and React component lifecycle",
      "Hands-on experience building REST APIs with Express and Node.js",
      "Familiar with containerization concepts using Docker"
    ],
    weaknesses: [
      "Limited commercial experience with enterprise-grade cloud platforms like AWS",
      "Needs deeper experience with unit testing frameworks (Jest, Mocha)",
      "Lack of advanced system design implementation in production systems"
    ]
  };
}

function getMockJDAnalysis(text) {
  const cleanText = text.toLowerCase();
  
  // Job title heuristic
  let title = "Full Stack Developer";
  if (cleanText.includes("frontend")) title = "Frontend Engineer";
  else if (cleanText.includes("backend")) title = "Backend Engineer";
  else if (cleanText.includes("senior")) title = "Senior Full Stack Developer";
  else if (cleanText.includes("intern")) title = "Software Engineering Intern";
  
  let company = "InnovateTech Inc.";
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length > 1 && lines[0].toLowerCase().includes("job") && lines[1].length < 30) {
    company = lines[1];
  }

  // Extract skills from JD
  const skillsList = ['react', 'node.js', 'mongodb', 'express', 'javascript', 'typescript', 'aws', 'docker', 'kubernetes', 'ci/cd', 'github', 'postgresql', 'graphql', 'next.js', 'jest', 'agile', 'css', 'html'];
  const requiredSkills = skillsList.filter(s => cleanText.includes(s)).map(s => s === 'node.js' ? 'Node.js' : s.toUpperCase());
  if (requiredSkills.length === 0) {
    requiredSkills.push('React', 'Node.js', 'Express', 'MongoDB', 'REST APIs');
  }

  return {
    title,
    company,
    requiredSkills,
    responsibilities: [
      "Develop and maintain highly responsive web applications using React.js.",
      "Design and document secure, high-performing RESTful backend endpoints in Node.js.",
      "Collaborate with product managers, designers, and other engineers in an Agile team setup.",
      "Deploy, monitor, and configure services on cloud instances (AWS/GCP) using container orchestration."
    ],
    experienceRequirements: cleanText.includes("senior") ? "5+ years of experience" : cleanText.includes("mid") ? "3+ years of experience" : "1-3 years of experience",
    technologies: requiredSkills,
    softSkills: ["Communication", "Problem-Solving", "Teamwork", "Adaptability"]
  };
}

function getMockMatch(resume, jd) {
  const resumeSkillsSet = new Set((resume.skills || []).map(s => s.toLowerCase()));
  const jdSkills = jd.requiredSkills || ['react', 'node.js', 'mongodb', 'express', 'docker', 'aws'];
  
  const matchedSkills = [];
  const missingSkills = [];

  jdSkills.forEach(skill => {
    const cleanSkill = skill.toLowerCase();
    let found = false;
    for (let rSkill of resumeSkillsSet) {
      if (rSkill.includes(cleanSkill) || cleanSkill.includes(rSkill)) {
        found = true;
        break;
      }
    }
    if (found) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  // Score calculation
  const total = jdSkills.length;
  const matched = matchedSkills.length;
  const matchScore = total > 0 ? Math.round((matched / total) * 100) : 75;

  const suggestions = [
    `Enroll in a fast-track course or build a mini-project focused on ${missingSkills[0] || 'Docker/AWS'} to add it to your active skills.`,
    `Optimize your resume summary to explicitly state your experience with full-stack frameworks.`,
    `Detail a project on your resume that uses ${matchedSkills[0] || 'React'} alongside a database solution to show integrations.`
  ];

  return {
    matchScore,
    matchedSkills,
    missingSkills,
    improvementSuggestions: suggestions
  };
}

function getMockATS(resume, jd) {
  const matchResult = getMockMatch(resume, jd);
  const matchedPercent = matchResult.matchScore;

  // Let's create varying scores
  const keywordMatchScore = Math.max(45, matchedPercent);
  const formattingScore = 85; // Standard sections found
  const actionVerbsScore = 70; // Hardcoded standard
  const readabilityScore = 80;
  
  const atsScore = Math.round((keywordMatchScore * 0.4) + (formattingScore * 0.2) + (actionVerbsScore * 0.2) + (readabilityScore * 0.2));

  return {
    atsScore,
    keywordMatchScore,
    formattingScore,
    actionVerbsScore,
    readabilityScore,
    recommendations: [
      `Integrate exact matching keywords from the job description, especially: ${matchResult.missingSkills.slice(0, 3).join(', ')}.`,
      `Incorporate strong action verbs at the start of your experience bullet points (e.g., 'Engineered', 'Orchestrated', 'Refactored' instead of 'Assisted' or 'Worked on').`,
      `Ensure your resume PDF does not contain multi-column layouts, tables, or text boxes that can confuse older ATS scanning systems.`,
      `Increase keyword frequency for '${matchResult.matchedSkills[0] || 'React'}' throughout your experience statements.`
    ]
  };
}

function getMockQuestions(resume, jd) {
  const mockQuestions = [
    {
      id: "q1",
      question: "Walk me through your e-commerce microservices project. How did you design the communication layer between service instances?",
      type: "Project-Based"
    },
    {
      id: "q2",
      question: "Explain the difference between SQL and NoSQL databases. In what scenarios would you choose MongoDB over PostgreSQL?",
      type: "Technical"
    },
    {
      id: "q3",
      question: "React utilizes a Virtual DOM. Can you explain the reconciliation process and how the 'key' prop helps in optimizing renders?",
      type: "Technical"
    },
    {
      id: "q4",
      question: "Describe a scenario where you had to work with a teammate who had a fundamentally different opinion on a technology choice. How did you resolve it?",
      type: "Behavioral"
    },
    {
      id: "q5",
      question: "Node.js is described as single-threaded and non-blocking. How does it handle heavy, CPU-bound tasks without blocking the main event loop?",
      type: "Technical"
    },
    {
      id: "q6",
      question: "Why do you want to join our company, and where do you see your technical skills expanding in the next 2-3 years?",
      type: "HR"
    },
    {
      id: "q7",
      question: "What is your strategy for securing a Node.js REST API? Specifically, how do you handle JWT storage and token invalidation on logout?",
      type: "Technical"
    },
    {
      id: "q8",
      question: "Describe your most technically challenging project. What was the main blocker, and how did you overcome it?",
      type: "Project-Based"
    },
    {
      id: "q9",
      question: "How would you containerize your Node.js application using Docker? What steps can you take to minimize the final Docker image size?",
      type: "Technical"
    },
    {
      id: "q10",
      question: "Tell me about a time you made a major mistake or missed a deadline. What happened, and what did you learn from the experience?",
      type: "Behavioral"
    }
  ];

  return mockQuestions;
}

function getMockAnswerEvaluation(question, answer) {
  const wordsCount = answer.trim().split(/\s+/).length;
  
  let score = 5;
  let feedback = "Your answer was received, but was extremely short. Please try to provide more detail, using the STAR method for behavioral questions or technical examples for conceptual questions.";
  let suggestions = "Explain key terminologies, give a real-world project example, and structure your answer with a beginning, middle, and end.";

  if (wordsCount > 50) {
    score = 8.5;
    feedback = "Excellent answer! You demonstrated solid theoretical knowledge, articulated the explanation with clear structure, and mentioned relevant details.";
    suggestions = "To make this answer perfect, try to tie it explicitly to a performance optimization or a security precaution you took in a real project.";
  } else if (wordsCount > 20) {
    score = 7.0;
    feedback = "Good response. You addressed the core concept and structure of the question, showing a fair understanding.";
    suggestions = "Elaborate more on the 'why' and 'how'. For instance, describe the trade-offs of this approach compared to alternatives.";
  }

  // Category specific adjustments
  const relevance = Math.min(10, Math.round(score + 1));
  const accuracy = Math.min(10, Math.round(score + (question.type === 'Technical' ? 0 : 1)));
  const communication = Math.min(10, Math.round(score + 0.5));
  const completeness = Math.min(10, Math.round(score - 0.5));
  const confidence = Math.min(10, Math.round(score + 1.2));
  
  const finalScore = Number(((relevance + accuracy + communication + completeness + confidence) / 5).toFixed(1));

  return {
    relevance,
    accuracy,
    communication,
    completeness,
    confidence,
    score: finalScore,
    feedback,
    suggestions
  };
}

function getMockFinalReport(questions, answers) {
  // Aggregate scores from answer evaluations
  let totalScore = 0;
  let techTotal = 0, techCount = 0;
  let commTotal = 0, commCount = 0;
  let pbTotal = 0, pbCount = 0;

  answers.forEach(a => {
    const evalScore = a.evaluation?.score || 7.0;
    totalScore += evalScore;
    
    if (a.type === 'Technical') {
      techTotal += evalScore;
      techCount++;
    } else if (a.type === 'Behavioral' || a.type === 'HR') {
      commTotal += evalScore;
      commCount++;
    } else if (a.type === 'Project-Based') {
      pbTotal += evalScore;
      pbCount++;
    }
  });

  const overall = answers.length > 0 ? Math.round((totalScore / answers.length) * 10) : 75;
  const technical = techCount > 0 ? Math.round((techTotal / techCount) * 10) : 72;
  const communication = commCount > 0 ? Math.round((commTotal / commCount) * 10) : 82;
  const problemSolving = pbCount > 0 ? Math.round((pbTotal / pbCount) * 10) : 78;

  return {
    overallScore: overall,
    technicalScore: technical,
    communicationScore: communication,
    problemSolvingScore: problemSolving,
    strengths: [
      "Clearly articulated React components lifecycle and state management.",
      "Good comprehension of Node.js event-driven, non-blocking principles.",
      "Exhibited professional confidence and structured thoughts in behavioral questions."
    ],
    weaknesses: [
      "Struggled with deep details of database optimization and caching.",
      "Expressed uncertainty regarding deployment strategies and Docker multi-stage builds.",
      "Behavioral answers sometimes lacked quantitative outcomes (e.g. metrics of success)."
    ],
    missedConcepts: [
      "Docker multi-stage builds config",
      "NoSQL vs SQL performance indexing",
      "JWT token invalidation and refresh token flow"
    ],
    recommendedTopics: [
      "Docker container configurations and volume management",
      "Redis caching layer integration in Express",
      "Advanced Database indexing in MongoDB (compound and text indexes)"
    ],
    improvementPlan: `### 4-Week Interview Preparation Strategy

#### Week 1: Core Systems & Networking
- Study JWT security best practices, cookies vs localStorage storage mechanisms.
- Build a demo repo implementing Token rotation (refresh token) and logouts.
- **Resource**: OWASP Cheat Sheets for JSON Web Tokens.

#### Week 2: Database Optimizations
- Practice creating compound and text indices on local MongoDB collections.
- Explain execution plans (\`explain('executionStats')\`) to identify query performance bottlenecks.
- Read about Redis keyspaces and set up a simple caching middleware in Express.

#### Week 3: Containerization & Cloud Devops
- Review Dockerfile instructions: \`RUN\`, \`CMD\`, \`COPY\`, \`ADD\`.
- Write a multi-stage Dockerfile that reduces your final React/Vite node image size.
- Practice basic AWS deployment with EC2 and learn about load balancers.

#### Week 4: Mock Interview & STAR Method Tuning
- Structure behavioral responses around: **Situation, Task, Action, Result**.
- Highlight quantitative values (e.g., 'reduced render time by 20%', 'cut loading speed by half').
- Practice answering questions under a tight 2-minute timer constraint.
`
  };
}

module.exports = {
  analyzeResume,
  analyzeJD,
  matchResumeJD,
  analyzeATS,
  generateInterviewQuestions,
  evaluateAnswer,
  generateFinalReport,
  generateResumeInsights
};
