import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { LiveMentorClient } from '../services/geminiService';
import { ChatMessage } from '../types';

const LiveMentor: React.FC = () => {
  const [active, setActive] = useState(false);
  const [transcript, setTranscript] = useState<ChatMessage[]>([]);
  const clientRef = useRef<LiveMentorClient | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     // Scroll to bottom of chat
     bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const toggleSession = async () => {
    if (active) {
      clientRef.current?.disconnect();
      setActive(false);
    } else {
      clientRef.current = new LiveMentorClient((text, isUser) => {
        setTranscript(prev => [...prev, {
          role: isUser ? 'user' : 'model',
          text,
          timestamp: Date.now()
        }]);
      });
      await clientRef.current.connect();
      setActive(true);
    }
  };

  useEffect(() => {
    return () => {
      clientRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto h-[calc(100vh-80px)] md:h-full flex flex-col">
      <header className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">SemiVoice</h1>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Real-time voice conversation with Gemini (2.5 Native Audio).</p>
      </header>

      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden relative transition-colors">
        {/* Visualizer Placeholder / Transcript Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
           {transcript.length === 0 && (
             <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500 flex-col gap-4">
               <div className={`p-6 md:p-8 rounded-full ${active ? 'bg-blue-50 dark:bg-blue-900/20 animate-pulse' : 'bg-gray-50 dark:bg-gray-700'}`}>
                 <Volume2 size={40} className={`md:w-[48px] md:h-[48px] ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-300 dark:text-gray-600'}`} />
               </div>
               <p className="text-center px-4">{active ? "Listening..." : "Press Start to begin conversation"}</p>
             </div>
           )}
           
           {transcript.map((msg, i) => (
             <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[85%] md:max-w-[80%] p-3 md:p-4 rounded-xl text-sm md:text-base ${
                 msg.role === 'user' 
                   ? 'bg-blue-600 text-white rounded-tr-none' 
                   : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
               }`}>
                 {msg.text}
               </div>
             </div>
           ))}
           <div ref={bottomRef} />
        </div>

        {/* Controls */}
        <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center transition-colors relative">
           <button
             onClick={toggleSession}
             className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
               active 
                 ? 'bg-red-500 hover:bg-red-600 text-white scale-110' 
                 : 'bg-blue-700 hover:bg-blue-800 text-white'
             }`}
           >
             {active ? <MicOff size={24} className="md:w-[28px] md:h-[28px]" /> : <Mic size={24} className="md:w-[28px] md:h-[28px]" />}
           </button>
           <span className="absolute right-4 md:right-6 text-[10px] md:text-xs font-mono text-gray-400 dark:text-gray-500">
             {active ? '● LIVE' : '○ OFF'}
           </span>
        </div>
      </div>
    </div>
  );
};

export default LiveMentor;