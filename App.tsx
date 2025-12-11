import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import RoadmapGenerator from './components/RoadmapGenerator';
import QuizArena from './components/QuizArena';
import ImageStudio from './components/ImageStudio';
import ProfessionalConnect from './components/ProfessionalConnect';
import LiveMentor from './components/LiveMentor';
import LearningModules from './components/LearningModules';
import JobSearch from './components/JobSearch';
import { AppView, UserProfile, UserCourseProgress } from './types';

const App: React.FC = () => {
  // Initialize user from localStorage to persist login
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const savedUser = localStorage.getItem('semiconverse_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  // Initialize progress from localStorage
  const [courseProgress, setCourseProgress] = useState<UserCourseProgress>(() => {
    try {
      const savedProgress = localStorage.getItem('semiconverse_progress');
      return savedProgress ? JSON.parse(savedProgress) : {};
    } catch (e) {
      return {};
    }
  });

  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [darkMode, setDarkMode] = useState(false);

  // Toggle dark class on HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleLogin = (u: UserProfile) => {
    console.log("Saving user profile to database...", u);
    setUser(u);
    localStorage.setItem('semiconverse_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('semiconverse_user');
    setCurrentView(AppView.DASHBOARD);
  };

  const handleTopicComplete = (courseId: string, topicId: string) => {
    setCourseProgress(prev => {
      const currentCourseProgress = prev[courseId] || [];
      if (currentCourseProgress.includes(topicId)) return prev;

      const newProgress = {
        ...prev,
        [courseId]: [...currentCourseProgress, topicId]
      };
      localStorage.setItem('semiconverse_progress', JSON.stringify(newProgress));
      return newProgress;
    });
  };

  if (!user) {
    return <Login onLogin={handleLogin} />; // Login handles its own dark mode styles if needed, or inherits
  }

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard user={user} />;
      case AppView.ROADMAP:
        return <RoadmapGenerator />;
      case AppView.LEARNING:
        return (
          <LearningModules 
            progress={courseProgress} 
            onCompleteTopic={handleTopicComplete} 
          />
        );
      case AppView.QUIZ:
        return <QuizArena />;
      case AppView.IMAGE_STUDIO:
        return <ImageStudio />;
      case AppView.PROFESSIONAL:
        return <ProfessionalConnect />;
      case AppView.JOBS:
        return <JobSearch />;
      case AppView.LIVE_MENTOR:
        return <LiveMentor />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      setView={setCurrentView} 
      user={user}
      darkMode={darkMode}
      toggleDarkMode={toggleDarkMode}
      onLogout={handleLogout}
    >
      {renderView()}
    </Layout>
  );
};

export default App;