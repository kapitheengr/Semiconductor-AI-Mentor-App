import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Map, 
  BookOpen, 
  Image as ImageIcon, 
  Users, 
  Mic,
  LogOut,
  Moon,
  Sun,
  Briefcase,
  Menu,
  X,
  FlaskConical
} from 'lucide-react';
import { AppView, UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  setView: (view: AppView) => void;
  user: UserProfile;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, user, darkMode, toggleDarkMode, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: AppView.DASHBOARD, label: 'SemiCoach AI', icon: LayoutDashboard },
    { id: AppView.ROADMAP, label: 'My Roadmap', icon: Map },
    { id: AppView.LEARNING, label: 'Learning Lab', icon: FlaskConical },
    { id: AppView.QUIZ, label: 'Assessment', icon: BookOpen },
    { id: AppView.IMAGE_STUDIO, label: 'Image Studio', icon: ImageIcon },
    { id: AppView.PROFESSIONAL, label: 'Connect Pros', icon: Users },
    { id: AppView.JOBS, label: 'SemiJobs', icon: Briefcase },
    { id: AppView.LIVE_MENTOR, label: 'SemiVoice', icon: Mic },
  ];

  const handleNavClick = (view: AppView) => {
    setView(view);
    setMobileMenuOpen(false);
  };

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 z-30 transition-colors">
        <div className="flex items-center gap-1 select-none">
           <span className="text-xl font-bold text-blue-700 dark:text-blue-400 tracking-tighter">SEMIC</span>
           <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-blue-700 dark:text-blue-400">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
              <path d="M8 3V21" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
              <path d="M16 3V21" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
              <path d="M3 8H21" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
              <path d="M3 16H21" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
              <rect x="10" y="5" width="4" height="4" fill="currentColor" />
              <rect x="5" y="10" width="4" height="4" fill="currentColor" />
              <rect x="15" y="15" width="4" height="4" fill="currentColor" />
           </svg>
           <span className="text-xl font-bold text-blue-700 dark:text-blue-400 tracking-tighter">NVERSE</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm animate-in fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop Fixed / Mobile Drawer) */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between lg:justify-center border-b border-gray-100 dark:border-gray-700 h-16 lg:h-auto">
           {/* Logo */}
           <div className="flex items-center justify-center gap-1 select-none">
             <span className="text-2xl font-bold text-blue-700 dark:text-blue-400 tracking-tighter">SEMIC</span>
             <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-blue-700 dark:text-blue-400">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
                <path d="M8 3V21" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
                <path d="M16 3V21" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
                <path d="M3 8H21" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
                <path d="M3 16H21" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
                <rect x="10" y="5" width="4" height="4" fill="currentColor" />
                <rect x="5" y="10" width="4" height="4" fill="currentColor" />
                <rect x="15" y="15" width="4" height="4" fill="currentColor" />
             </svg>
             <span className="text-2xl font-bold text-blue-700 dark:text-blue-400 tracking-tighter">NVERSE</span>
           </div>
           
           {/* Close Button (Mobile Only) */}
           <button 
             onClick={() => setMobileMenuOpen(false)}
             className="lg:hidden p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
           >
             <X size={20} />
           </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">Menu</div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 lg:py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === item.id 
                  ? 'bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4 bg-white dark:bg-gray-800">
           {/* Dark Mode Toggle */}
           <button 
             onClick={() => { toggleDarkMode(); setMobileMenuOpen(false); }}
             className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
           >
             <span className="flex items-center gap-2">
               {darkMode ? <Moon size={16} /> : <Sun size={16} />} 
               {darkMode ? 'Dark Mode' : 'Light Mode'}
             </span>
             <div className={`w-8 h-4 rounded-full relative transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${darkMode ? 'left-4.5' : 'left-0.5'}`} style={{ left: darkMode ? 'calc(100% - 14px)' : '2px' }}></div>
             </div>
           </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.education}</p>
            </div>
          </div>
          <button 
             onClick={onLogout}
             className="w-full flex items-center justify-center gap-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-gray-50 dark:bg-gray-900 transition-colors duration-200 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
};

export default Layout;