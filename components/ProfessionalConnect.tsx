import React, { useState } from 'react';
import { Search, MapPin, Building2, Linkedin, ExternalLink } from 'lucide-react';
import { generateProfessionalGuidance } from '../services/geminiService';
import { ProfessionalProfile } from '../types';

const ProfessionalConnect: React.FC = () => {
  const [goal, setGoal] = useState("Process Engineer");
  const [region, setRegion] = useState("United States");
  const [profiles, setProfiles] = useState<ProfessionalProfile[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setProfiles([]);
    setCompanies([]);
    try {
      const data = await generateProfessionalGuidance(goal, region);
      if (data.profiles) setProfiles(data.profiles);
      if (data.recommended_companies) setCompanies(data.recommended_companies);
    } catch (e) {
      alert("Could not fetch professional data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Connect with Professionals</h1>
        <p className="text-gray-500 dark:text-gray-400">Find real industry experts to guide your journey using AI search.</p>
      </header>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 flex flex-col md:flex-row gap-4 transition-colors">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Role</label>
          <input 
            type="text" 
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Region</label>
          <input 
            type="text" 
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex items-end">
           <button 
             onClick={handleSearch}
             disabled={loading}
             className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-2 rounded-lg font-medium h-[42px] flex items-center gap-2 transition-colors disabled:opacity-50"
           >
             {loading ? 'Searching...' : <><Search size={18} /> Find Mentors</>}
           </button>
        </div>
      </div>

      {companies.length > 0 && (
         <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Top Companies for this Role</h3>
            <div className="flex flex-wrap gap-2">
               {companies.map((c, i) => (
                 <span key={i} className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm text-blue-700 dark:text-blue-400 font-medium flex items-center gap-1">
                   <Building2 size={14} /> {c}
                 </span>
               ))}
            </div>
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profiles.map((profile, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{profile.name}</h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium">{profile.title}</p>
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm mt-1">
                  <Building2 size={14} /> {profile.company}
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400">
                <Linkedin size={20} />
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-3">{profile.description}</p>
            
            <a 
              href={`https://www.google.com/search?q=${encodeURIComponent(`${profile.name} ${profile.title} ${profile.company} LinkedIn`)}`}
              target="_blank" 
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Find on LinkedIn via Google <ExternalLink size={14} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfessionalConnect;