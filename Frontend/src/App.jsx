import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';
import './App.css';
import Home from './pages/home/Home';
import Header from './components/header/Header';
import Resume from './pages/resume/Resume';
import Sidebar from './components/sidebar/Sidebar';
import ProfilePage from './pages/profilePage/ProfilePage';
import RankingPage from './pages/ranking/RankingPage';
import { ResumeProvider } from './context/ResumeContext';
import { ThemeProvider } from './context/ThemeContext';
import InterviewStatus from './pages/interviewStatus/InterviewStatus';
import ShortlistPage from './pages/shortlist/ShortlistPage';
import Dashboard from './pages/dashboard/Dashboard';
import BookTable from './pages/book/BookTable';
import MyBookings from './pages/myBookings/MyBookings';
import AllBookings from './pages/allBookings/AllBookings';
import Tournaments from './pages/tournaments/Tournaments';
import FindPlayers from './pages/findPlayers/FindPlayers';
import Leaderboard from './pages/leaderboard/Leaderboard';
import Settings from './pages/settings/Settings';

function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const handleSidebarToggle = (isExpanded) => {
    setIsSidebarExpanded(isExpanded);
  };

  return (
    <ThemeProvider>
      <ResumeProvider>
        <Router>
          <div className="App">
            <Header />
            <Sidebar onToggle={handleSidebarToggle} />
            <main className={`main-content ${!isSidebarExpanded ? 'sidebar-collapsed' : ''}`}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/book" element={<BookTable />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/all-bookings" element={<AllBookings />} />
                <Route path="/tournaments" element={<Tournaments />} />
                <Route path="/find-players" element={<FindPlayers />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/parse-resume" element={<Resume />} />
                <Route path="/shortlist-resume" element={<Home />} />
                <Route path="/profile/:candidateName" element={<ProfilePage />} />
                <Route path="/ranked" element={<RankingPage />} />
                <Route path="/status" element={<InterviewStatus />} />
                <Route path="/shortlist" element={<ShortlistPage />} />
              </Routes>
            </main>
            
            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              reverseOrder={false}
              gutter={8}
              containerClassName=""
              containerStyle={{}}
              toastOptions={{
                // Default options for all toasts
                className: '',
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#333',
                  borderRadius: '10px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(166, 163, 162, 0.15)',
                  padding: '16px',
                  fontSize: '14px',
                  fontWeight: '500',
                },
                // Default options for specific types
                success: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#28a745',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#dc3545',
                    secondary: '#fff',
                  },
                },
                loading: {
                  duration: Infinity,
                  iconTheme: {
                    primary: '#ec4001',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </ResumeProvider>
    </ThemeProvider>
  );
}

export default App;