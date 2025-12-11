import React, { useState } from 'react';
import { UserProfile } from '../types';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    education: 'Undergraduate'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      onLogin(formData);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700 transition-colors">
        <div className="flex flex-col items-center mb-10">
          {/* Logo */}
          <div className="flex items-center justify-center gap-1 mb-2 select-none">
             <span className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-400 tracking-tighter">SEMIC</span>
             <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 md:w-10 md:h-10 text-blue-700 dark:text-blue-400">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
                <path d="M8 3V21" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
                <path d="M16 3V21" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
                <path d="M3 8H21" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
                <path d="M3 16H21" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
                <rect x="10" y="5" width="4" height="4" fill="currentColor" />
                <rect x="5" y="10" width="4" height="4" fill="currentColor" />
                <rect x="15" y="15" width="4" height="4" fill="currentColor" />
             </svg>
             <span className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-400 tracking-tighter">NVERSE</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-center text-sm">Your gateway to the chip industry</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-gray-900 dark:text-white"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Jane Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-gray-900 dark:text-white"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="jane@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
                <input
                  type="number"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-gray-900 dark:text-white"
                  value={formData.age}
                  onChange={e => setFormData({...formData, age: e.target.value})}
                  placeholder="22"
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Education</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-gray-900 dark:text-white"
                  value={formData.education}
                  onChange={e => setFormData({...formData, education: e.target.value})}
                >
                  <option>High School</option>
                  <option>Undergraduate</option>
                  <option>Graduate (MS/PhD)</option>
                  <option>Professional</option>
                </select>
             </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-lg transition-colors shadow-md"
          >
            Start Learning
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;