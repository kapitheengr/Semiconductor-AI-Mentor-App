import React, { useState } from 'react';
import { Search, MapPin, Briefcase, ExternalLink, Globe } from 'lucide-react';
import { findSemiconductorJobs } from '../services/geminiService';
import { JobListing } from '../types';

const JobSearch: React.FC = () => {
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("0-2 Years");
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!role || !location) {
      alert("Please enter both a role and a location.");
      return;
    }
    setLoading(true);
    setJobs([]);
    try {
      const data = await findSemiconductorJobs(role, location, experience);
      if (data.jobs) {
        setJobs(data.jobs);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to fetch jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">SemiJobs</h1>
        <p className="text-gray-500 dark:text-gray-400">Search for open roles across LinkedIn, Naukri, Glassdoor, and more.</p>
      </header>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 transition-colors">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Role</label>
          <input 
            type="text" 
            placeholder="e.g. Physical Design Engineer"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white"
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
          <input 
            type="text" 
            placeholder="e.g. Bangalore, India"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white"
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience</label>
          <select 
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white"
          >
            <option>Fresher / Internship</option>
            <option>0-2 Years</option>
            <option>3-5 Years</option>
            <option>5-10 Years</option>
            <option>10+ Years</option>
          </select>
        </div>
        <div className="md:col-span-1 flex items-end">
           <button 
             onClick={handleSearch}
             disabled={loading}
             className="w-full bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-medium h-[42px] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
           >
             {loading ? 'Searching...' : <><Search size={18} /> Find Jobs</>}
           </button>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500 transition-all group flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400">
                <Briefcase size={20} />
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 truncate max-w-[120px]">
                {job.platform}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{job.title}</h3>
            <div className="text-blue-600 dark:text-blue-400 font-medium text-sm mb-4">{job.company}</div>
            
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-4">
              <MapPin size={14} /> {job.location}
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-3 flex-1">
              {job.snippet}
            </p>
            
            <a 
              href={`https://www.google.com/search?q=${encodeURIComponent(`${job.title} ${job.company} ${job.platform} job`)}`}
              target="_blank" 
              rel="noreferrer"
              className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-semibold transition-colors"
            >
              Search & Apply <ExternalLink size={14} />
            </a>
          </div>
        ))}

        {!loading && jobs.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <Globe size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Enter your criteria above to search for jobs.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSearch;