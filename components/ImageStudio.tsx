import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Wand2, Film, Download, Upload } from 'lucide-react';
import { generateSemiconductorImage, editSemiconductorImage, animateImageWithVeo, fileToGenerativePart } from '../services/geminiService';

const ImageStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'edit' | 'animate'>('generate');
  const [prompt, setPrompt] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [sourceImage, setSourceImage] = useState<string | null>(null); // For edit/animate
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAction = async () => {
    if (!prompt && activeTab !== 'animate') return;
    setLoading(true);
    setResultImage(null);
    setResultVideo(null);

    try {
      if (activeTab === 'generate') {
        const img = await generateSemiconductorImage(prompt);
        setResultImage(img);
      } else if (activeTab === 'edit') {
        if (!sourceImage) { alert("Please upload an image to edit"); return; }
        // We pass the base64 data directly (stripping data:image... prefix inside service if needed, but handled there)
        const base64 = sourceImage.split(',')[1];
        const img = await editSemiconductorImage(base64, prompt);
        setResultImage(img);
      } else if (activeTab === 'animate') {
        if (!sourceImage) { alert("Please upload an image to animate"); return; }
        const base64 = sourceImage.split(',')[1];
        const videoUrl = await animateImageWithVeo(base64, prompt || "Animate naturally");
        setResultVideo(videoUrl);
      }
    } catch (e) {
      console.error(e);
      alert("Generation failed. See console.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Semiconductor Image Studio</h1>
        <p className="text-gray-500 dark:text-gray-400">Generate diagrams, edit schematics, or animate processes.</p>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button 
             onClick={() => { setActiveTab('generate'); setSourceImage(null); }}
             className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 ${
               activeTab === 'generate' 
                 ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-b-2 border-blue-700 dark:border-blue-400' 
                 : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
             }`}
          >
             <ImageIcon size={18} /> Generate (Flash Image)
          </button>
          <button 
             onClick={() => setActiveTab('edit')}
             className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 ${
               activeTab === 'edit' 
                 ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-b-2 border-blue-700 dark:border-blue-400' 
                 : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
             }`}
          >
             <Wand2 size={18} /> Edit (Nano Banana)
          </button>
          <button 
             onClick={() => setActiveTab('animate')}
             className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 ${
               activeTab === 'animate' 
                 ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-b-2 border-blue-700 dark:border-blue-400' 
                 : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
             }`}
          >
             <Film size={18} /> Animate (Veo)
          </button>
        </div>

        <div className="p-6">
          {/* Inputs */}
          <div className="space-y-4">
            {(activeTab === 'edit' || activeTab === 'animate') && (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                 {sourceImage ? (
                   <img src={sourceImage} alt="Source" className="max-h-48 mx-auto rounded shadow-sm" />
                 ) : (
                   <div className="text-gray-500 dark:text-gray-400 flex flex-col items-center">
                      <Upload size={32} className="mb-2" />
                      <span className="text-sm font-medium">Click to Upload Source Image</span>
                   </div>
                 )}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  activeTab === 'generate' ? "E.g., Cross section of a FinFET transistor, schematic style" :
                  activeTab === 'edit' ? "E.g., Add labels to the gate oxide" :
                  "E.g., Zoom into the chip structure (Optional)"
                }
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400"
              />
              <button
                onClick={handleAction}
                disabled={loading}
                className="bg-blue-700 text-white px-8 rounded-lg font-bold hover:bg-blue-800 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {loading ? 'Processing...' : 'Run Magic'}
              </button>
            </div>
          </div>

          {/* Output Area */}
          {(resultImage || resultVideo) && (
            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
               <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-4">Generated Output</h3>
               <div className="inline-block relative group">
                  {resultImage && <img src={resultImage} alt="Result" className="max-h-[400px] rounded-lg shadow-lg" />}
                  {resultVideo && (
                    <video controls autoPlay loop className="max-h-[400px] rounded-lg shadow-lg">
                      <source src={resultVideo} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                  
                  {resultImage && (
                    <a href={resultImage} download="gemini_output.png" className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-md text-gray-700 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Download size={20} />
                    </a>
                  )}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageStudio;