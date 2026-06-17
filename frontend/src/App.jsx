import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';


// Import Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ResumeUploadPage from './pages/ResumeUploadPage';
import JDUploadPage from './pages/JDUploadPage';
import MatchAnalysisPage from './pages/MatchAnalysisPage';
import InterviewRoomPage from './pages/InterviewRoomPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import CommunityPage from './pages/CommunityPage';


/*
TESTING HOW TO MAKE A PULL REQUEST FROM KUNDANA'S FEATURE BRANCH TO NISHITHA'S MAIN BRANCH
*/
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-[#070b13] flex flex-col">
          {/* Header Navigation */}
          <Navbar />

          {/* Page Routing */}
          <main className="flex-1 pb-16">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resume"
                element={
                  <ProtectedRoute>
                    <ResumeUploadPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jd"
                element={
                  <ProtectedRoute>
                    <JDUploadPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/match"
                element={
                  <ProtectedRoute>
                    <MatchAnalysisPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/interview"
                element={
                  <ProtectedRoute>
                    <InterviewRoomPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/:id"
                element={
                  <ProtectedRoute>
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
  path="/community"
  element={
    <ProtectedRoute>
      <CommunityPage />
    </ProtectedRoute>
  }
/>
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
