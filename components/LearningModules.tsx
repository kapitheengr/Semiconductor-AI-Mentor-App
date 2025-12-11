import React, { useState, useEffect } from 'react';
import { FlaskConical, Cpu, Play, RotateCcw, BookOpen, CheckCircle, Circle, ChevronRight, ArrowLeft } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Course, UserCourseProgress } from '../types';

interface LearningModulesProps {
  progress?: UserCourseProgress;
  onCompleteTopic?: (courseId: string, topicId: string) => void;
}

const LearningModules: React.FC<LearningModulesProps> = ({ progress = {}, onCompleteTopic }) => {
  const [viewMode, setViewMode] = useState<'courses' | 'simulators'>('courses');
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);

  // --- Derived State ---
  const activeCourse = COURSES.find(c => c.id === activeCourseId);
  const activeTopic = activeCourse?.topics.find(t => t.id === activeTopicId);
  
  const getCompletionPercentage = (courseId: string) => {
    const completedTopics = progress[courseId] || [];
    const totalTopics = COURSES.find(c => c.id === courseId)?.topics.length || 0;
    if (totalTopics === 0) return 0;
    return Math.round((completedTopics.length / totalTopics) * 100);
  };

  const handleNext = () => {
    if (!activeCourse || !activeTopic) return;
    
    // Mark current as complete
    if (onCompleteTopic) {
      onCompleteTopic(activeCourse.id, activeTopic.id);
    }

    // Find next topic
    const currentIndex = activeCourse.topics.findIndex(t => t.id === activeTopicId);
    if (currentIndex < activeCourse.topics.length - 1) {
      setActiveTopicId(activeCourse.topics[currentIndex + 1].id);
      // Auto-scroll to top on mobile
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Course finished (could add a celebration modal here)
      alert("Course Completed! Well done.");
      setActiveTopicId(null);
      setActiveCourseId(null);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-full">
      <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">Learning Lab</h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Master concepts through structured courses.</p>
        </div>
        
        {/* Toggle Switch */}
        <div className="bg-gray-200 dark:bg-gray-700 p-1 rounded-lg flex md:inline-flex self-start">
          <button
            onClick={() => { setViewMode('courses'); setActiveCourseId(null); }}
            className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-md text-xs md:text-sm font-medium transition-all ${
              viewMode === 'courses' 
                ? 'bg-white dark:bg-gray-600 text-blue-700 dark:text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Courses
          </button>
          <button
            onClick={() => setViewMode('simulators')}
            className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-md text-xs md:text-sm font-medium transition-all ${
              viewMode === 'simulators' 
                ? 'bg-white dark:bg-gray-600 text-blue-700 dark:text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Simulators
          </button>
        </div>
      </header>

      {/* --- SIMULATORS VIEW --- */}
      {viewMode === 'simulators' && <SimulatorsView />}

      {/* --- COURSES VIEW (Grid) --- */}
      {viewMode === 'courses' && !activeCourseId && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4">
          {COURSES.map((course) => {
            const percent = getCompletionPercentage(course.id);
            return (
              <div 
                key={course.id}
                onClick={() => { setActiveCourseId(course.id); setActiveTopicId(course.topics[0].id); }}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 md:p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400">
                    <BookOpen size={20} className="md:w-6 md:h-6" />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{percent}%</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Complete</span>
                  </div>
                </div>
                
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {course.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mb-4 md:mb-6 line-clamp-2">
                  {course.description}
                </p>

                <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                
                <div className="mt-4 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  {percent === 0 ? 'Start Course' : 'Continue Learning'} <ChevronRight size={16} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- COURSE PLAYER VIEW --- */}
      {viewMode === 'courses' && activeCourse && activeTopic && (
        <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-200px)] min-h-[500px]">
          
          {/* Sidebar / Topic List */}
          <div className="w-full lg:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0 max-h-[300px] lg:max-h-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center gap-2 sticky top-0 z-10">
              <button 
                onClick={() => setActiveCourseId(null)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-500"
              >
                <ArrowLeft size={20} />
              </button>
              <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm md:text-base">{activeCourse.title}</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {activeCourse.topics.map((topic, idx) => {
                const isCompleted = progress[activeCourse.id]?.includes(topic.id);
                const isActive = activeTopicId === topic.id;
                
                return (
                  <button
                    key={topic.id}
                    onClick={() => setActiveTopicId(topic.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'
                    }`}
                  >
                    <div className={`flex-shrink-0 ${
                      isCompleted ? 'text-green-500' : isActive ? 'text-blue-500' : 'text-gray-300'
                    }`}>
                      {isCompleted ? <CheckCircle size={18} /> : <Circle size={18} />}
                    </div>
                    <div className="min-w-0">
                      <div className={`text-sm font-medium truncate ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                        {idx + 1}. {topic.title}
                      </div>
                      <div className="text-xs text-gray-400">{topic.duration}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden min-h-[500px]">
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wide mb-3 md:mb-4 inline-block">
                {activeCourse.title}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">{activeTopic.title}</h2>
              
              <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed space-y-4 text-sm md:text-base">
                 {/* Render content lines */}
                 {activeTopic.content.split('\n').map((line, i) => (
                   <p key={i}>{line}</p>
                 ))}
              </div>
            </div>

            <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-end sticky bottom-0">
              <button
                onClick={handleNext}
                className="bg-blue-700 hover:bg-blue-800 text-white px-6 md:px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 text-sm md:text-base w-full md:w-auto justify-center"
              >
                {progress[activeCourse.id]?.includes(activeTopic.id) ? 'Next Topic' : 'Mark Complete & Next'} 
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

// --- SIMULATORS COMPONENT (Refactored from previous version) ---

const SimulatorsView: React.FC = () => {
  const [activeModule, setActiveModule] = useState<'fab' | 'rtl'>('fab');
  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6 md:mb-8">
        <button
          onClick={() => setActiveModule('fab')}
          className={`flex-1 p-4 md:p-6 rounded-xl border-2 transition-all flex items-center justify-start sm:justify-center gap-4 ${
            activeModule === 'fab'
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-blue-300'
          }`}
        >
          <FlaskConical size={24} className="md:w-[32px] md:h-[32px]" />
          <div className="text-left">
            <div className="font-bold text-base md:text-lg">Fab Simulator</div>
            <div className="text-xs md:text-sm opacity-80">Thermal Oxidation Process</div>
          </div>
        </button>

        <button
          onClick={() => setActiveModule('rtl')}
          className={`flex-1 p-4 md:p-6 rounded-xl border-2 transition-all flex items-center justify-start sm:justify-center gap-4 ${
            activeModule === 'rtl'
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-blue-300'
          }`}
        >
          <Cpu size={24} className="md:w-[32px] md:h-[32px]" />
          <div className="text-left">
            <div className="font-bold text-base md:text-lg">Chip Design Lab</div>
            <div className="text-xs md:text-sm opacity-80">RTL & Logic Simulation</div>
          </div>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
        {activeModule === 'fab' ? <FabSimulator /> : <RTLSimulator />}
      </div>
    </div>
  );
};

// --- SIMULATOR LOGIC (Preserved) ---
// (FabSimulator and RTLSimulator components remain the same, just keeping them in this file)
const FabSimulator: React.FC = () => {
  const [temp, setTemp] = useState(1000);
  const [time, setTime] = useState(30);
  const [thickness, setThickness] = useState(0);

  useEffect(() => {
    const rateConstant = 0.05 * Math.exp((temp - 800) / 100); 
    const calculatedThickness = rateConstant * time * 10;
    setThickness(Math.min(calculatedThickness, 500));
  }, [temp, time]);

  const getOxideColor = (t: number) => {
    if (t < 20) return '#A0A0A0';
    if (t < 50) return '#94a3b8';
    if (t < 100) return '#fcd34d';
    if (t < 150) return '#f87171';
    if (t < 200) return '#60a5fa';
    if (t < 300) return '#34d399';
    return '#fbbf24';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-6 md:space-y-8">
        <div>
          <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">Process Parameters</h3>
          <div className="space-y-6">
            <div>
              <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <span>Furnace Temperature: <span className="text-blue-600 dark:text-blue-400">{temp}°C</span></span>
              </label>
              <input type="range" min="800" max="1200" step="10" value={temp} onChange={(e) => setTemp(Number(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            </div>
            <div>
              <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <span>Oxidation Time: <span className="text-blue-600 dark:text-blue-400">{time} min</span></span>
              </label>
              <input type="range" min="0" max="120" step="5" value={time} onChange={(e) => setTime(Number(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            </div>
          </div>
        </div>
        <div className="p-4 bg-blue-50 dark:bg-gray-700/50 rounded-lg border border-blue-100 dark:border-gray-600">
           <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">Oxide Thickness ($SiO_2$)</span>
            <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{thickness.toFixed(1)} nm</span>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-xl p-4 md:p-8 border border-gray-200 dark:border-gray-700 relative overflow-hidden min-h-[300px]">
        <div className="relative w-48 h-48 md:w-64 md:h-64 bg-gray-300 dark:bg-gray-700 rounded-b-lg border-2 border-gray-400 dark:border-gray-600 flex items-end justify-center shadow-inner">
           <span className="absolute bottom-4 text-gray-500 dark:text-gray-400 font-bold z-10 text-xs md:text-sm">Silicon Substrate (Si)</span>
           <div className="w-full absolute top-0 transition-all duration-500 border-b border-white/20" style={{ height: `${Math.min(thickness / 2, 100)}%`, backgroundColor: getOxideColor(thickness), opacity: 0.8 }}></div>
        </div>
        <div className="mt-4 text-xs md:text-sm text-gray-500 dark:text-gray-400 text-center">Cross-section View</div>
      </div>
    </div>
  );
};

const RTLSimulator: React.FC = () => {
  const [clock, setClock] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [waveform, setWaveform] = useState<{time: number, clk: number, q0: number, q1: number, q2: number, q3: number}[]>([]);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => { setClock(c => c + 1); }, 500);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    const isPosEdge = clock % 2 === 1;
    let nextCount = counter;
    if (isPosEdge && clock > 0) {
       nextCount = (counter + 1) % 16;
       setCounter(nextCount);
    }
    setWaveform(prev => {
       const newData = [...prev, { time: clock, clk: clock % 2, q0: (nextCount >> 0) & 1, q1: (nextCount >> 1) & 1, q2: (nextCount >> 2) & 1, q3: (nextCount >> 3) & 1 }];
       return newData.slice(-20);
    });
  }, [clock]);

  const handleReset = () => { setIsRunning(false); setClock(0); setCounter(0); setWaveform([]); };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-gray-900 rounded-lg p-3 md:p-4 font-mono text-xs md:text-sm text-gray-300 border border-gray-700 shadow-inner overflow-x-auto">
          <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-2 min-w-[300px]">
            <span className="text-blue-400 font-bold">counter_4bit.v</span>
            <div className="flex gap-2">
               <button onClick={() => setIsRunning(!isRunning)} className={`p-1.5 rounded ${isRunning ? 'bg-red-500 text-white' : 'bg-green-600 text-white'}`}>{isRunning ? 'Stop' : <Play size={16} />}</button>
               <button onClick={handleReset} className="p-1.5 rounded bg-gray-700 text-white"><RotateCcw size={16} /></button>
            </div>
          </div>
          <pre className="overflow-x-auto">{`module counter(\n    input clk, \n    input rst, \n    output reg [3:0] q\n);\n  always @(posedge clk) begin\n    if (rst) q <= 4'b0000;\n    else q <= q + 1;\n  end\nendmodule`}</pre>
        </div>
        <div className="w-full lg:w-1/3 bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600 flex flex-col items-center justify-center">
            <div className="flex gap-4 font-bold text-xl"><span className="text-blue-600 dark:text-blue-400">Q = {counter}</span></div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-2 md:p-4 rounded-xl border border-gray-200 dark:border-gray-700 h-48 md:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={waveform}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="time" hide />
            <YAxis domain={[0, 1.2]} hide />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', color: '#fff' }} />
            <Line type="stepAfter" dataKey="clk" stroke="#60a5fa" dot={false} isAnimationActive={false} />
            <Line type="stepAfter" dataKey="q0" stroke="#34d399" dot={false} isAnimationActive={false} />
            <Line type="stepAfter" dataKey="q1" stroke="#f87171" dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- COURSE CONTENT DATA ---

const COURSES: Course[] = [
  {
    id: 'basic-semi',
    title: 'Basic Semiconductor Physics',
    description: 'Understand the fundamental building blocks of electronics: Atoms, Bands, and PN Junctions.',
    icon: 'Atom',
    topics: [
      {
        id: 'bp-1',
        title: 'Introduction to Silicon',
        duration: '10 min',
        content: `Silicon is the second most abundant element in the Earth's crust and the heart of modern electronics. 
        
        It is a semiconductor, meaning its conductivity lies between conductors (like copper) and insulators (like glass).
        
        Silicon has 4 valence electrons, allowing it to form a crystal lattice structure. Pure silicon acts as an insulator at absolute zero, but as temperature increases, electrons can break free and conduct electricity.`
      },
      {
        id: 'bp-2',
        title: 'Energy Bands & Band Gap',
        duration: '15 min',
        content: `In solids, electron energy levels merge to form bands:
        
        1. Valence Band: Filled with electrons involved in bonding.
        2. Conduction Band: Empty or partially filled; electrons here can move freely.
        
        The gap between these is the "Band Gap".
        - Metals: Overlapping bands (Gap = 0).
        - Insulators: Large gap (> 3 eV).
        - Semiconductors: Small gap (~1.1 eV for Si). This small gap allows us to control conductivity via Doping.`
      },
      {
        id: 'bp-3',
        title: 'PN Junction Basics',
        duration: '20 min',
        content: `When we join P-type silicon (doped with Boron, creating "Holes") and N-type silicon (doped with Phosphorus, creating extra "Electrons"), interesting things happen at the boundary.
        
        Electrons from the N-side diffuse to the P-side, and Holes from P to N. This creates a "Depletion Region" devoid of free carriers, creating an electric field.
        
        This structure forms a Diode, which allows current to flow in only one direction (Forward Bias).`
      }
    ]
  },
  {
    id: 'manufacturing',
    title: 'Semiconductor Manufacturing',
    description: 'From sand to silicon chips. Learn the step-by-step fabrication process used in Fabs.',
    icon: 'Factory',
    topics: [
      {
        id: 'mfg-1',
        title: 'Wafer Production',
        duration: '15 min',
        content: `The process begins with sand (Silica). It is purified to 99.9999999% (9N) purity.
        
        1. Melting: High purity silicon is melted in a crucible.
        2. Crystal Pulling (Czochralski method): A seed crystal is dipped and slowly pulled out, forming a single crystal ingot (boule).
        3. Slicing: The ingot is sliced into thin discs called Wafers (300mm standard today).
        4. Polishing: Wafers are polished to atomic flatness.`
      },
      {
        id: 'mfg-2',
        title: 'Photolithography',
        duration: '25 min',
        content: `This is the most critical and expensive step. It transfers circuit patterns onto the wafer.
        
        1. Photoresist Coating: A light-sensitive liquid is spun onto the wafer.
        2. Exposure: UV light (or EUV) is shone through a Mask (Reticle) containing the circuit pattern.
        3. Development: Exposed areas are dissolved away (positive resist), leaving the pattern on the wafer.
        
        Think of it like developing a photograph, but on a microscopic scale.`
      },
      {
        id: 'mfg-3',
        title: 'Etching & Deposition',
        duration: '20 min',
        content: `After lithography, we need to add or remove materials based on the pattern.
        
        Etching (Removal):
        - Wet Etch: Uses chemicals (acids). Isotropic (eats in all directions).
        - Dry Etch (Plasma): Uses ions to bombard the surface. Anisotropic (cuts straight down), essential for small transistors.
        
        Deposition (Adding):
        - PVD (Sputtering): Physical vapor deposition for metals.
        - CVD (Chemical Vapor Deposition): Gases react to form solid layers (like dielectrics).`
      }
    ]
  },
  {
    id: 'equipment',
    title: 'Semiconductor Equipment',
    description: 'Deep dive into the massive machines that make nano-scale manufacturing possible.',
    icon: 'Wrench',
    topics: [
      {
        id: 'eq-1',
        title: 'Lithography Scanners (ASML)',
        duration: '20 min',
        content: `The Scanner is the most complex machine in a Fab. ASML is the leader here.
        
        - EUV (Extreme Ultraviolet) Systems: Use light with 13.5nm wavelength.
        - Light Source: Generated by firing lasers at falling droplets of tin 50,000 times a second.
        - Optics: Uses mirrors (not lenses) because glass absorbs EUV. The mirrors are polished so perfectly that if they were the size of Germany, the highest bump would be less than a millimeter.`
      },
      {
        id: 'eq-2',
        title: 'Etch Chambers (Lam/Applied)',
        duration: '15 min',
        content: `Etch tools use Plasma to carve features.
        
        - RF Generators: Create high-frequency fields to strip electrons from gas atoms, creating plasma.
        - Magnetic Confinement: Magnets control the path of ions to ensure they hit the wafer at exactly 90 degrees.
        - End-point detection: Sensors detect chemical changes in the exhaust to know exactly when the layer is fully removed.`
      },
      {
        id: 'eq-3',
        title: 'Metrology & Inspection (KLA)',
        duration: '15 min',
        content: `You can't fix what you can't measure.
        
        - CD-SEM (Critical Dimension Scanning Electron Microscope): Measures the width of lines to nanometer precision.
        - Optical Inspection: Scans wafers for defects (particles, scratches).
        - Overlay Metrology: Checks if the new layer aligns perfectly with the previous one. Misalignment reduces Yield.`
      }
    ]
  }
];

export default LearningModules;