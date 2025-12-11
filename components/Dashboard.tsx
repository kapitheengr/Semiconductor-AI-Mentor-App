import React, { useState } from 'react';
import { Sparkles, ArrowRight, Bot, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { chatWithMentor } from '../services/geminiService';
import { UserProfile } from '../types';

interface DashboardProps {
  user: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    "Explain lithography for beginner",
    "Roadmap to enter fab",
    "What is RTL Design?",
    "30-day equipment engineer plan"
  ];

  const handleSend = async (text: string) => {
    setLoading(true);
    setResponse(null);
    try {
      const res = await chatWithMentor(text);
      setResponse(res || "I couldn't generate a response. Please try again.");
    } catch (err) {
      setResponse("Error connecting to AI Mentor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-[85vh] flex flex-col items-center justify-center">
      
      <header className="mb-6 md:mb-10 text-center animate-in fade-in slide-in-from-top-4 duration-700 flex flex-col items-center w-full">
        {/* Logo - Hidden on mobile as it's in the top bar */}
        <div className="hidden md:flex items-center justify-center gap-1 mb-6 select-none opacity-80">
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

        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">
          Welcome, <span className="text-blue-700 dark:text-blue-400">{user.name.split(' ')[0]}</span>
        </h1>
        <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 px-4">
          Your personal AI Mentor is ready to assist you.
        </p>
      </header>

      {/* AI Mentor Card */}
      <div className="w-full bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all relative">
        
        {/* Decorative Background Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-24 md:h-32 w-full absolute top-0 left-0"></div>
        
        <div className="relative pt-12 md:pt-16 px-4 md:px-6 pb-6 md:pb-8 flex flex-col items-center">
          
          {/* Mentor Avatar/Image */}
          <div className="w-20 h-20 md:w-28 md:h-28 bg-white dark:bg-gray-800 rounded-full p-2 shadow-xl mb-6 z-10 flex items-center justify-center border-4 border-white dark:border-gray-700">
            <div className="w-full h-full bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
               <Bot size={40} className="md:w-[56px] md:h-[56px]" strokeWidth={1.5} />
            </div>
          </div>

          <div className="w-full max-w-2xl z-10">
            {response ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 md:p-6 rounded-2xl mb-6 text-gray-800 dark:text-gray-200 border border-blue-100 dark:border-blue-800/50 text-sm md:text-base animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 mb-3 text-blue-700 dark:text-blue-400 font-semibold text-xs md:text-sm uppercase tracking-wide">
                  <Sparkles size={16} /> Mentor Response
                </div>
                <div className="leading-relaxed">
                  <ReactMarkdown
                    components={{
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 my-3 space-y-1.5" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-3 space-y-1.5" {...props} />,
                      li: ({node, ...props}) => <li className="pl-1" {...props} />,
                      h1: ({node, ...props}) => <h1 className="text-xl font-bold my-3 text-gray-900 dark:text-white" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-lg font-bold my-2 text-gray-900 dark:text-white" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-md font-bold my-2 text-gray-900 dark:text-white" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-blue-700 dark:text-blue-400" {...props} />,
                      p: ({node, ...props}) => <p className="mb-3" {...props} />,
                    }}
                  >
                    {response}
                  </ReactMarkdown>
                </div>
                <button 
                  onClick={() => setResponse(null)}
                  className="block mt-4 text-sm font-medium text-blue-700 dark:text-blue-400 hover:underline"
                >
                  Ask another question
                </button>
              </div>
            ) : (
              <div className="text-center mb-6 md:mb-8">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-4 md:mb-6">
                  What would you like to learn today?
                </h2>
                <div className="flex flex-wrap justify-center gap-2 mb-2">
                  {quickPrompts.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => { setPrompt(q); handleSend(q); }}
                      className="px-3 py-2 md:px-4 md:py-2 bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-gray-200 dark:border-gray-600 hover:border-blue-200 dark:hover:border-blue-700 rounded-full text-xs md:text-sm text-gray-600 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="relative group">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask anything..."
                className="w-full pl-4 md:pl-6 pr-28 md:pr-32 py-4 md:py-5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 shadow-inner transition-all text-base md:text-lg"
                onKeyDown={(e) => e.key === 'Enter' && handleSend(prompt)}
              />
              <button
                onClick={() => handleSend(prompt)}
                disabled={loading || !prompt}
                className="absolute right-2 top-2 bottom-2 bg-blue-700 hover:bg-blue-800 text-white px-4 md:px-6 rounded-lg md:rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95 text-sm md:text-base"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Send <ArrowRight size={16} className="md:w-[18px] md:h-[18px]" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;