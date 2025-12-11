import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, Clock, Book, ArrowRight, Sparkles, X, ChevronRight, Award, ArrowLeft, RefreshCw } from 'lucide-react';
import { generateRoadmapFromJobDescription, generateRoadmapFromText } from '../services/geminiService';
import { RoadmapItem } from '../types';

const RoadmapGenerator: React.FC = () => {
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [jdText, setJdText] = useState('');
  const [activeModuleIndex, setActiveModuleIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processResponse = (data: any) => {
    if (data.skills) {
      setSkills(data.skills);
    }
    if (data.modules) {
      const processedRoadmap = data.modules.map((item: any, idx: number) => ({
        ...item,
        id: `module-${idx}`,
        status: 'not-started'
      }));
      setRoadmap(processedRoadmap);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLoading(true);
      try {
        const data = await generateRoadmapFromJobDescription(e.target.files[0]);
        processResponse(data);
      } catch (err) {
        console.error(err);
        alert("Failed to generate roadmap. Please try again with a clear PDF or Image.");
      } finally {
        setLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Reset input to allow re-uploading same file if needed
        }
      }
    }
  };

  const handleTextSubmit = async () => {
    if (!jdText.trim()) return;
    setLoading(true);
    try {
      const data = await generateRoadmapFromText(jdText);
      processResponse(data);
    } catch (err) {
      console.error(err);
      alert("Failed to generate roadmap from text. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleModuleStatus = (index: number) => {
    setRoadmap(prev => prev.map((item, i) => {
      if (i === index) {
        return { ...item, status: 'completed' };
      }
      return item;
    }));
    setActiveModuleIndex(null); // Close modal on completion
  };

  const handleReset = () => {
    setRoadmap([]);
    setSkills([]);
    setJdText('');
    setActiveModuleIndex(null);
  };

  const completedCount = roadmap.filter(r => r.status === 'completed').length;
  const progressPercent = roadmap.length > 0 ? Math.round((completedCount / roadmap.length) * 100) : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Career Roadmap & Learning</h1>
        <p className="text-gray-500 dark:text-gray-400">Analyze job descriptions (PDF/Image), extract skills, and generate a step-by-step learning course.</p>
      </header>

      {/* 1. Input Section - Only show if no roadmap generated */}
      {roadmap.length === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 animate-in fade-in slide-in-from-bottom-2">
          {/* File Upload */}
          <div 
            onClick={() => !loading && fileInputRef.current?.click()}
            className={`bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group shadow-sm hover:shadow-md h-full min-h-[250px] ${loading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Upload Job Description</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Support for <span className="font-semibold text-gray-700 dark:text-gray-300">PDF</span> or <span className="font-semibold text-gray-700 dark:text-gray-300">Images</span></p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".pdf,image/*,application/pdf"
              onChange={handleFileUpload}
            />
          </div>

          {/* Text Input */}
          <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm flex flex-col h-full min-h-[250px] ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <FileText size={16} /> Paste Job Description
            </label>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the full job description text here..."
              className="flex-1 w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm text-gray-900 dark:text-white placeholder-gray-400 mb-4"
            />
            <button
              onClick={handleTextSubmit}
              disabled={!jdText.trim() || loading}
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
            >
              <Sparkles size={18} /> Analyze & Generate Plan
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-900 border-t-blue-700 dark:border-t-blue-400 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Extracting Skills & Creating Learning Modules...</p>
        </div>
      )}

      {!loading && roadmap.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8">
          
          {/* Back Button & Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
                <button 
                  onClick={handleReset}
                  className="mb-4 flex items-center gap-2 text-sm text-gray-500 hover:text-blue-700 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                >
                  <ArrowLeft size={16} /> Back to Input
                </button>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Generated Learning Roadmap</h2>
             </div>
             
             <button 
               onClick={handleReset}
               className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
             >
               <RefreshCw size={16} /> Analyze New JD
             </button>
          </div>

          {/* Top Section: Progress & Skills */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Skills Card */}
            <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
               <div className="flex items-center gap-2 mb-4">
                 <Sparkles className="text-blue-600" size={20} />
                 <h2 className="text-lg font-bold text-gray-900 dark:text-white">Extracted Skill Set</h2>
               </div>
               <div className="flex flex-wrap gap-2">
                 {skills.map((skill, i) => (
                   <span key={i} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-100 dark:border-blue-800">
                     {skill}
                   </span>
                 ))}
               </div>
            </div>

            {/* Progress Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-center">
               <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Your Progress</h2>
               <div className="flex items-end gap-2 mb-2">
                 <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{progressPercent}%</span>
                 <span className="text-gray-500 dark:text-gray-400 mb-1">Completed</span>
               </div>
               <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
               </div>
            </div>
          </div>

          {/* Roadmap List */}
          <div className="space-y-4">
            {roadmap.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => setActiveModuleIndex(idx)}
                className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border transition-all cursor-pointer group hover:shadow-md ${
                  item.status === 'completed' 
                    ? 'border-green-200 dark:border-green-900/50 bg-green-50/10' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                       item.status === 'completed' 
                         ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                         : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    }`}>
                       {item.status === 'completed' ? <CheckCircle size={18} /> : <span className="font-bold text-sm">{idx + 1}</span>}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {item.title}
                        {item.status === 'completed' && <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-bold">Done</span>}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{item.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                         <span className="flex items-center gap-1"><Clock size={14} /> {item.duration}</span>
                         <span className="flex items-center gap-1"><Book size={14} /> {item.topics?.length || 0} Topics</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                     <button className="px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
                        {item.status === 'completed' ? 'Review' : 'Start Lesson'} <ChevronRight size={16} />
                     </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Content Modal */}
      {activeModuleIndex !== null && roadmap[activeModuleIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
               <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{roadmap[activeModuleIndex].title}</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Module {activeModuleIndex + 1} of {roadmap.length}</p>
               </div>
               <button 
                 onClick={() => setActiveModuleIndex(null)}
                 className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors"
               >
                 <X size={24} />
               </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-8">
               {/* Topics List */}
               {roadmap[activeModuleIndex].topics && (
                 <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">Topics Covered</h3>
                    <div className="flex flex-wrap gap-2">
                       {roadmap[activeModuleIndex].topics.map((t, i) => (
                         <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm border border-gray-200 dark:border-gray-700">
                           {t}
                         </span>
                       ))}
                    </div>
                 </div>
               )}

               {/* Main Learning Text */}
               <div className="prose dark:prose-invert max-w-none">
                  <h3 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-400">Study Guide</h3>
                  {roadmap[activeModuleIndex].content ? (
                    <div className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300">
                      {roadmap[activeModuleIndex].content}
                    </div>
                  ) : (
                    <p className="italic text-gray-500">Content loading or unavailable...</p>
                  )}
               </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end gap-4">
              <button 
                onClick={() => setActiveModuleIndex(null)}
                className="px-6 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => toggleModuleStatus(activeModuleIndex)}
                className={`px-6 py-2 rounded-lg font-bold text-white transition-all shadow-md active:scale-95 flex items-center gap-2 ${
                  roadmap[activeModuleIndex].status === 'completed'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-700 hover:bg-blue-800'
                }`}
              >
                 {roadmap[activeModuleIndex].status === 'completed' ? (
                   <><CheckCircle size={18} /> Completed</>
                 ) : (
                   <><Award size={18} /> Mark as Complete</>
                 )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RoadmapGenerator;