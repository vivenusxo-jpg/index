
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, Subject, ScheduleItem, GenerationResponse, Intensity, Theme, Mood } from './types';
import { ICONS, THEMES } from './constants';
import { generatePeachySchedule } from './services/geminiService';
import PomodoroTimer from './components/PomodoroTimer';

// Fix: Added missing PeachTree component for syllabus mastery visualization
const PeachTree: React.FC<{ progress: number }> = ({ progress }) => {
  const isGrown = progress >= 100;
  const isGrowing = progress > 30;
  
  return (
    <div className="relative w-12 h-12 flex items-center justify-center bg-pink-50 rounded-2xl border-2 border-white shadow-sm overflow-hidden shrink-0">
      <div className="text-2xl transition-all duration-700 transform" style={{ 
        filter: progress > 0 ? 'none' : 'grayscale(1) opacity(0.3)',
        scale: isGrown ? '1.1' : isGrowing ? '1' : '0.9',
      }}>
        {isGrown ? '🍑' : isGrowing ? '🌸' : '🌱'}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('index_profile_v5');
    return saved ? JSON.parse(saved) : {
      name: '',
      wakeUpTime: '07:00',
      sleepTime: '23:00',
      subjects: [],
      intensity: 'medium',
      theme: 'peach',
      onboardingComplete: false
    };
  });

  const activeTheme = useMemo(() => THEMES[profile.theme], [profile.theme]);

  const [scheduleData, setScheduleData] = useState<GenerationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [reflection, setReflection] = useState('');
  const [mood, setMood] = useState<Mood>('productive');
  const [waterCount, setWaterCount] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [completedGoals, setCompletedGoals] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem('index_profile_v5', JSON.stringify(profile));
  }, [profile]);

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.name && profile.subjects.length > 0) {
      setProfile(prev => ({ ...prev, onboardingComplete: true }));
      generateDailyPlan();
    }
  };

  const addSubject = () => {
    const newSubject: Subject = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      strengthRating: 5,
      syllabusSize: 10,
      completedTopics: 0,
      currentTopic: ''
    };
    setProfile(prev => ({ ...prev, subjects: [...prev.subjects, newSubject] }));
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setProfile(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const generateDailyPlan = async () => {
    setLoading(true);
    try {
      const result = await generatePeachySchedule(profile);
      setScheduleData(result);
    } catch (error) {
      console.error("Failed to generate schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGoal = (goal: string) => {
    setCompletedGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const currentTask = useMemo(() => {
    if (!scheduleData) return "Deep Work Session";
    return scheduleData.schedule.find(s => s.category === 'study' || s.category === 'frog')?.task || "Deep Work Session";
  }, [scheduleData]);

  if (!profile.onboardingComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 transition-all duration-700 font-['Quicksand']" style={{ background: activeTheme.bg }}>
        <div className="bg-white rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(255,100,100,0.15)] p-12 w-full max-w-2xl border-b-[16px] border-[#FFF0F0] relative overflow-hidden">
          <div className="absolute top-[-80px] left-[-80px] w-64 h-64 bg-pink-100/20 rounded-full blur-3xl"></div>
          
          <div className="text-center mb-10 relative z-10">
            <h1 className="text-6xl font-black text-gray-800 tracking-tighter flex items-center justify-center gap-3">
              Index <span className="animate-bounce-slow text-5xl">🍓</span>
            </h1>
            <p className="text-gray-400 font-bold mt-2 italic text-xs tracking-[0.4em] uppercase opacity-60">Elite Productivity • Sweet Aesthetic</p>
          </div>

          <form onSubmit={handleOnboardingSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Name your grind</label>
              <input
                required
                type="text"
                className="w-full bg-[#FAF5F5] border-4 border-transparent focus:border-pink-100 rounded-[2rem] px-8 py-5 outline-none transition-all font-black text-xl shadow-inner text-gray-700"
                placeholder="The Academic Weapon..."
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Study Intensity</label>
                <select
                  className="w-full bg-[#FAF5F5] rounded-2xl px-5 py-4 font-black outline-none shadow-inner text-xs border-2 border-transparent focus:border-pink-100 transition-all appearance-none cursor-pointer"
                  value={profile.intensity}
                  onChange={e => setProfile({ ...profile, intensity: e.target.value as Intensity })}
                >
                  <option value="low">🌸 Cozy Mode</option>
                  <option value="medium">🍓 Focused Mode</option>
                  <option value="high">🔥 Hardcore Grind</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Theme</label>
                <div className="flex gap-2 bg-[#FAF5F5] p-2 rounded-2xl shadow-inner">
                  {(Object.keys(THEMES) as Theme[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setProfile({ ...profile, theme: t })}
                      className={`w-10 h-10 rounded-xl border-4 transition-all hover:scale-110 ${profile.theme === t ? 'border-gray-800 shadow-lg' : 'border-white'}`}
                      style={{ background: THEMES[t].accent }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">The Syllabus</label>
                <button
                  type="button"
                  onClick={addSubject}
                  className="bg-gray-800 text-white text-[9px] font-black px-5 py-2.5 rounded-full hover:bg-black transition-all shadow-md active:scale-95 uppercase tracking-widest"
                >
                  + Add Subject
                </button>
              </div>
              <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-2">
                {profile.subjects.map(sub => (
                  <div key={sub.id} className="bg-pink-50/20 p-5 rounded-[2.5rem] border-2 border-[#FFF0F0] flex flex-col gap-3 group hover:bg-white transition-all shadow-sm">
                    <div className="flex gap-4">
                      <input
                        required
                        className="flex-1 bg-white rounded-xl px-5 py-3 text-sm font-black border-2 border-transparent focus:border-pink-100 outline-none shadow-sm"
                        placeholder="Subject (e.g. Maths)"
                        value={sub.name}
                        onChange={e => updateSubject(sub.id, { name: e.target.value })}
                      />
                      <div className="flex flex-col items-center bg-white rounded-xl px-4 py-2 shadow-sm border border-pink-50">
                        <span className="text-[8px] font-black text-pink-300 mb-1 uppercase">Rating: {sub.strengthRating}</span>
                        <input 
                          type="range" min="1" max="10" 
                          className="w-20 accent-[#FF4D6D] cursor-pointer"
                          value={sub.strengthRating}
                          onChange={e => updateSubject(sub.id, { strengthRating: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-2 shadow-sm border border-pink-50">
                         <span className="text-[9px] font-black text-gray-400 uppercase">Units:</span>
                         <input
                          type="number"
                          className="w-full text-xs font-black outline-none bg-transparent"
                          value={sub.syllabusSize}
                          onChange={e => updateSubject(sub.id, { syllabusSize: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setProfile(prev => ({ ...prev, subjects: prev.subjects.filter(s => s.id !== sub.id) }))}
                        className="bg-white text-pink-200 hover:text-pink-500 rounded-xl text-[9px] font-black uppercase transition-all shadow-sm hover:shadow-md border border-pink-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#FF4D6D] hover:bg-[#FF5E78] text-white font-black py-6 rounded-[3rem] shadow-[0_20px_40px_-10px_rgba(255,77,109,0.4)] transition-all active:scale-[0.97] text-xl uppercase tracking-[0.3em] mt-4 border-b-8 border-[#C53030]"
            >
              GENERATE MASTERPLAN 🍓
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-all duration-700 pb-48 font-['Quicksand']" style={{ background: activeTheme.bg }}>
      {/* Focus Mode Overlay */}
      {isFocusMode && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#0F0F0F]/95 backdrop-blur-3xl p-8 animate-in fade-in duration-1000">
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
             {[...Array(15)].map((_, i) => (
              <div 
                key={i} 
                className="absolute text-5xl animate-float select-none"
                style={{ 
                  left: `${Math.random() * 100}%`, 
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${12 + Math.random() * 8}s`
                }}
              >
                🍓
              </div>
            ))}
          </div>

          <div className="max-w-xl w-full text-center space-y-12 relative z-10">
            <div className="space-y-4">
              <div className="inline-block px-4 py-1.5 rounded-full bg-pink-500/20 text-pink-400 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Index 🍓 Focus Active</div>
              <h1 className="text-6xl font-black text-white tracking-tighter drop-shadow-2xl">{currentTask}</h1>
              <p className="text-gray-400 italic text-xl font-medium px-12 leading-relaxed opacity-60">
                "Small steps lead to massive gains. Keep crushing it."
              </p>
            </div>

            <div className="transform scale-125 transition-all">
              <PomodoroTimer onFocusChange={setIsFocusMode} />
            </div>

            <button 
              onClick={() => setIsFocusMode(false)}
              className="group flex items-center gap-3 mx-auto bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white px-10 py-5 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.4em] transition-all border border-white/10 active:scale-95"
            >
              Leave Focus ☁️
            </button>
          </div>
        </div>
      )}

      {/* Aesthetic Header */}
      <header className={`bg-white/95 backdrop-blur-3xl border-b-[8px] border-[#FFF0F0] sticky top-0 z-[60] px-12 py-8 flex justify-between items-center shadow-[0_16px_32px_-8px_rgba(255,100,100,0.1)] transition-all duration-500 ${isFocusMode ? 'translate-y-[-200%]' : 'translate-y-0'}`}>
        <div className="flex items-center gap-6 group cursor-pointer">
          <div className="w-16 h-16 rounded-[2.2rem] flex items-center justify-center text-5xl shadow-inner border-4 border-pink-50 transition-all group-hover:rotate-12 group-hover:scale-110" style={{ background: activeTheme.secondary }}>🍓</div>
          <div>
            <h2 className="text-4xl font-black text-gray-800 leading-none tracking-tighter">Index</h2>
            <div className="flex items-center gap-3 mt-2">
               <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest bg-pink-50 px-3 py-1 rounded-full">{profile.intensity} Grind</span>
               <span className="w-2 h-2 bg-pink-100 rounded-full animate-pulse"></span>
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-5 bg-white px-8 py-4 rounded-[2.5rem] border-4 border-[#F0F7FF] shadow-[0_8px_16px_rgba(0,0,0,0.05)] transition-all hover:scale-105 group">
            <span className="text-4xl group-hover:animate-bounce">💧</span>
            <div className="text-left">
              <span className="block text-[8px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Stay Hydrated</span>
              <span className="font-black text-[#4299E1] text-2xl leading-none">{waterCount} / 8 <span className="text-[10px] opacity-30 uppercase">cups</span></span>
            </div>
            <button 
              onClick={() => setWaterCount(c => Math.min(c + 1, 15))} 
              className="bg-[#4299E1] text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-2xl hover:bg-[#3182CE] transition-all shadow-lg active:scale-90 border-2 border-white"
            >
              +
            </button>
          </div>
          <button
            onClick={() => setProfile(prev => ({ ...prev, onboardingComplete: false }))}
            className="w-16 h-16 bg-white border-4 border-pink-50 rounded-[2.2rem] flex items-center justify-center text-3xl hover:bg-pink-50 transition-all text-gray-200 hover:text-[#FF4D6D] shadow-sm"
          >
            ⚙️
          </button>
        </div>
      </header>

      <main className={`max-w-7xl mx-auto px-12 mt-16 lg:grid lg:grid-cols-12 gap-16 transition-all duration-700 ${isFocusMode ? 'opacity-0 scale-95 blur-3xl pointer-events-none' : 'opacity-100 scale-100'}`}>
        
        {/* LEFT: TIMELINE & TASKS */}
        <div className="lg:col-span-8 space-y-16">
          {loading ? (
            <div className="bg-white rounded-[5rem] p-48 flex flex-col items-center justify-center text-center shadow-2xl border-b-[20px] border-[#FFF0F0]">
              <div className="relative mb-14">
                <div className="w-44 h-44 border-[16px] border-pink-50 border-t-[#FF4D6D] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-8xl animate-pulse">🍓</div>
              </div>
              <h3 className="text-6xl font-black text-gray-800 tracking-tighter">Harvesting Focus...</h3>
              <p className="text-gray-400 font-black mt-6 max-w-sm mx-auto uppercase text-xs tracking-[0.4em] leading-loose opacity-60">Peachy is allocating time based on strength ratings and the 25/5 cycle.</p>
            </div>
          ) : scheduleData ? (
            <>
              {/* Daily Strategy Card */}
              <div className="bg-white rounded-[4.5rem] p-12 shadow-2xl border-4 border-white flex flex-col md:flex-row gap-12 relative overflow-hidden group">
                <div className="absolute top-[-50px] left-[-50px] text-[20rem] opacity-[0.02] pointer-events-none font-black italic select-none text-pink-500">GRIND</div>
                
                <div className="md:w-3/5 space-y-8 relative z-10">
                  <div className="bg-pink-50/30 p-8 rounded-[3.5rem] border-2 border-pink-100/30 shadow-inner">
                    <h3 className="text-[11px] font-black text-pink-500 uppercase tracking-[0.5em] mb-4">Coach Index 🍓 Strategy</h3>
                    <p className="text-2xl font-black text-gray-700 leading-tight italic">"{scheduleData.recommendation}"</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-red-50/40 p-6 rounded-[2.5rem] border border-red-100/50">
                      <span className="text-[10px] font-black text-red-400 uppercase tracking-widest block mb-4">Priority Frogs</span>
                      <div className="flex flex-wrap gap-2">
                        {scheduleData.assessment.weakSubjects.map(s => (
                          <span key={s} className="bg-white text-red-400 px-4 py-2 rounded-full text-[10px] font-black shadow-sm border border-red-50">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-green-50/40 p-6 rounded-[2.5rem] border border-green-100/50">
                      <span className="text-[10px] font-black text-green-400 uppercase tracking-widest block mb-4">Maintenance</span>
                      <div className="flex flex-wrap gap-2">
                        {scheduleData.assessment.strongSubjects.map(s => (
                          <span key={s} className="bg-white text-green-400 px-4 py-2 rounded-full text-[10px] font-black shadow-sm border border-green-50">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:w-2/5 flex flex-col justify-center text-center p-12 bg-gray-50/50 rounded-[4.5rem] border-4 border-white shadow-2xl relative group">
                  <div className="text-9xl mb-4 transition-transform group-hover:scale-110 group-hover:rotate-12 drop-shadow-lg">🍓</div>
                  <h4 className="text-8xl font-black text-gray-800 tracking-tighter leading-none">{scheduleData.assessment.totalStudyHours}h</h4>
                  <span className="text-[11px] font-black text-gray-300 uppercase tracking-[0.6em] mt-5">Daily Mastery Goal</span>
                </div>
              </div>

              {/* Checklist Section */}
              <div className="bg-white rounded-[4rem] p-12 shadow-xl border-4 border-[#FFF0F0] relative">
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-[0.5em] mb-10 flex items-center gap-4">
                  <span className="text-3xl">🎯</span> Today's Checklist
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scheduleData.dailyGoals.map((goal, i) => (
                    <button 
                      key={i}
                      onClick={() => toggleGoal(goal)}
                      className={`flex items-center gap-4 p-6 rounded-[2.5rem] text-left transition-all border-2 ${
                        completedGoals.includes(goal) 
                        ? 'bg-green-50/50 border-green-100 text-green-700 opacity-60' 
                        : 'bg-gray-50/50 border-transparent hover:border-pink-100 text-gray-700'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-inner ${
                        completedGoals.includes(goal) ? 'bg-green-400 text-white' : 'bg-white text-gray-300'
                      }`}>
                        {completedGoals.includes(goal) ? '🍓' : '○'}
                      </div>
                      <span className="font-bold text-sm tracking-tight">{goal}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Timeline */}
              <div className="space-y-12 relative">
                 <div className="absolute left-[40px] md:left-[115px] top-12 bottom-12 w-3 bg-pink-100/20 rounded-full shadow-inner"></div>
                 
                 {scheduleData.schedule.map((item, idx) => (
                  <div key={idx} className="relative z-10 flex flex-col md:flex-row items-start gap-10 md:gap-20 group transition-all duration-700">
                    <div className="hidden md:flex flex-col items-center w-36 pt-6 shrink-0">
                      <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest mb-4 group-hover:text-pink-500 transition-colors">{item.time}</span>
                      <div className={`w-28 h-28 rounded-[3.5rem] shadow-2xl flex items-center justify-center text-6xl border-4 border-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 ${
                        item.category === 'frog' ? 'bg-[#FF4D6D] text-white shadow-pink-200 animate-pulse-slow' :
                        item.category === 'study' ? 'bg-white text-blue-400 shadow-blue-50 border-blue-50' :
                        item.category === 'exercise' ? 'bg-green-50 text-green-400 shadow-green-50 border-green-50' :
                        item.category === 'meal' ? 'bg-[#FFF0F0] text-pink-400 shadow-pink-50 border-pink-50' :
                        'bg-white text-gray-400 border-gray-100 shadow-sm'
                      }`}>
                        {item.category === 'frog' ? '🍓' : item.icon}
                      </div>
                      <span className="text-[10px] font-black text-gray-300 mt-5 bg-gray-50/80 px-4 py-1.5 rounded-full border-2 border-white shadow-sm">{item.durationMinutes} MIN</span>
                    </div>

                    <div className={`flex-1 bg-white p-12 rounded-[4.5rem] shadow-sm border-2 border-transparent transition-all duration-500 group-hover:border-pink-100 group-hover:shadow-[0_48px_96px_-24px_rgba(255,100,100,0.2)] ${
                      item.category === 'frog' ? 'ring-[20px] ring-pink-50/50 border-pink-200' : ''
                    }`}>
                       <div className="flex justify-between items-center mb-6">
                         <div className="flex items-center gap-4">
                           <span className={`text-[10px] font-black uppercase tracking-[0.5em] px-5 py-2 rounded-full border-2 ${
                             item.category === 'frog' ? 'text-pink-500 border-pink-100 bg-pink-50/50' :
                             item.category === 'study' ? 'text-blue-400 border-blue-100 bg-blue-50/30' :
                             item.category === 'exercise' ? 'text-green-400 border-green-100 bg-green-50/30' :
                             'text-gray-400 border-gray-100 bg-gray-50/50'
                           }`}>
                             {item.category === 'frog' ? 'Index 🍓 First' : item.category}
                           </span>
                           {item.pomodoroCycle && (
                             <span className="text-[10px] font-black text-pink-200 uppercase tracking-widest bg-pink-50/30 px-3 py-1 rounded-2xl">Cycle {item.pomodoroCycle}/4</span>
                           )}
                         </div>
                         <input type="checkbox" className="w-11 h-11 rounded-full border-[6px] border-[#FAF5F5] text-pink-500 focus:ring-pink-100 cursor-pointer transition-all hover:scale-110 checked:bg-pink-500 checked:border-white shadow-2xl" />
                       </div>
                       <h4 className="text-4xl font-black text-gray-800 mb-6 tracking-tighter group-hover:text-pink-500 transition-colors leading-tight">{item.task}</h4>
                       
                       <div className="relative bg-[#FAF5F5] p-8 rounded-[3rem] border-2 border-white shadow-inner">
                         <p className="text-[13px] text-gray-500 font-bold italic leading-relaxed relative z-10 pl-5 border-l-4 border-pink-200">
                           "{item.quote}"
                         </p>
                       </div>
                    </div>
                  </div>
                 ))}
              </div>
            </>
          ) : (
             <div className="bg-white rounded-[6rem] p-48 text-center shadow-2xl border-4 border-dashed border-pink-100 group">
               <span className="text-[12rem] mb-12 block animate-bounce-slow grayscale group-hover:grayscale-0 transition-all">🍓</span>
               <h3 className="text-4xl font-black text-gray-300 uppercase tracking-[0.5em] mb-12">Orchard Sleeping...</h3>
               <button onClick={generateDailyPlan} className="bg-[#FF4D6D] text-white px-20 py-8 rounded-[4rem] font-black shadow-[0_30px_60px_-15px_rgba(255,77,109,0.5)] hover:bg-[#FF5E78] transition-all uppercase tracking-[0.4em] text-2xl active:scale-95 border-b-[10px] border-[#C53030]">
                 Plant Routine 🍓
               </button>
             </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="lg:col-span-4 space-y-16">
          <PomodoroTimer onFocusChange={setIsFocusMode} />

          {/* Growth Tracker */}
          <div className="bg-white rounded-[4.5rem] p-12 shadow-2xl border-4 border-white relative overflow-hidden group">
            <h3 className="text-[11px] font-black text-gray-800 uppercase tracking-[0.5em] mb-14 flex items-center gap-5">
              <span className="text-4xl">🌱</span> Syllabus Mastery
            </h3>
            <div className="space-y-12">
              {profile.subjects.map(sub => {
                const progress = Math.round((sub.completedTopics / sub.syllabusSize) * 100) || 0;
                return (
                  <div key={sub.id} className="relative group/sub">
                    <div className="flex justify-between items-end mb-4">
                      <div className="flex items-center gap-5">
                        <PeachTree progress={progress} />
                        <div>
                          <h5 className="text-lg font-black text-gray-700 leading-none mb-2 group-hover/sub:text-pink-500 transition-colors">{sub.name}</h5>
                          <p className="text-[11px] font-black text-pink-300 uppercase tracking-widest">Strength: {sub.strengthRating}/10</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-black text-gray-300">{progress}%</span>
                    </div>
                    <div className="h-6 bg-pink-50/20 rounded-full border-2 border-white shadow-inner overflow-hidden flex items-center p-1 group-hover/sub:shadow-xl transition-all">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 relative shadow-sm ${
                          sub.strengthRating <= 5 ? 'bg-red-400/70' : 'bg-pink-400/70'
                        }`} 
                        style={{ width: `${progress}%` }}
                      >
                         <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-shimmer"></div>
                      </div>
                    </div>
                    <div className="mt-5 flex justify-between items-center px-2">
                      <button 
                        onClick={() => updateSubject(sub.id, { completedTopics: Math.max(0, sub.completedTopics - 1) })}
                        className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-lg text-gray-300 hover:bg-pink-50 hover:text-pink-500 transition-all font-black border-2 border-white shadow-sm"
                      >
                        -
                      </button>
                      <span className="text-[11px] font-black text-gray-200 uppercase tracking-widest">{sub.completedTopics} / {sub.syllabusSize} <span className="opacity-40 uppercase">Units</span></span>
                      <button 
                        onClick={() => updateSubject(sub.id, { completedTopics: Math.min(sub.syllabusSize, sub.completedTopics + 1) })}
                        className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-lg text-gray-300 hover:bg-pink-50 hover:text-pink-500 transition-all font-black border-2 border-white shadow-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
              {profile.subjects.length === 0 && (
                <div className="text-center py-10 opacity-30 grayscale cursor-default">
                  <span className="text-8xl mb-6 block">🍓</span>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">No subjects planted yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Aesthetic Journal Reflection */}
          <div className="bg-white rounded-[4.5rem] p-12 border-b-[20px] border-pink-50 shadow-2xl relative overflow-hidden transition-all duration-1000" style={{ backgroundColor: activeTheme.secondary + '50' }}>
            <div className="absolute top-[-30px] right-[-30px] text-9xl opacity-[0.08] select-none pointer-events-none">📝</div>
            <h3 className="text-[11px] font-black text-gray-700 uppercase tracking-[0.5em] mb-10 flex items-center gap-4">
               Sunset Reflection
            </h3>
            
            <div className="flex justify-between gap-3 mb-10">
              {(['productive', 'tired', 'happy', 'stressed', 'chill'] as Mood[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`flex-1 aspect-square rounded-[2.2rem] flex flex-col items-center justify-center transition-all duration-500 shadow-md border-4 ${mood === m ? 'bg-white scale-110 shadow-2xl border-pink-200 ring-[10px] ring-pink-50/50' : 'bg-white/50 grayscale border-transparent hover:grayscale-0 hover:bg-white/80'}`}
                >
                  <span className="text-4xl mb-1">{m === 'productive' ? '🔥' : m === 'tired' ? '🥱' : m === 'happy' ? '🍓' : m === 'stressed' ? '😵‍💫' : '☁️'}</span>
                  <span className={`text-[10px] font-black uppercase mt-1 tracking-tighter ${mood === m ? 'text-pink-500' : 'text-gray-400 opacity-40'}`}>{m}</span>
                </button>
              ))}
            </div>

            <textarea
              className="w-full bg-white/95 rounded-[3.5rem] p-10 text-sm font-black text-gray-600 outline-none focus:ring-[24px] focus:ring-white/50 resize-none min-h-[250px] border-4 border-transparent transition-all placeholder:text-gray-300 shadow-inner leading-relaxed"
              placeholder="What was your hardest frog today? How did you conquer it? Write to your future self..."
              value={reflection}
              onChange={e => setReflection(e.target.value)}
            ></textarea>
            
            <button className="mt-10 w-full bg-gray-800 text-white font-black py-7 rounded-[3.5rem] text-[12px] uppercase tracking-[0.5em] transition-all shadow-2xl hover:bg-black active:scale-95 flex items-center justify-center gap-5 border-b-[8px] border-gray-600">
               Seal the Chapter 🍓
            </button>
          </div>
        </div>
      </main>

      {/* Control Bar Hub */}
      <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-3xl border-4 border-white px-24 py-12 rounded-[7rem] shadow-[0_64px_128px_-32px_rgba(255,100,100,0.4)] flex items-center gap-32 z-[100] transition-all duration-500 hover:scale-105 active:scale-[0.98] ${isFocusMode ? 'translate-y-[300%]' : 'translate-y-0'}`}>
        <button className="flex flex-col items-center gap-5 group">
          <span className="text-6xl transition-all group-hover:-translate-y-5 group-hover:rotate-6">🏠</span>
          <span className="text-[13px] font-black text-gray-300 uppercase tracking-[0.5em] group-hover:text-pink-500">Plan</span>
        </button>
        
        <div className="relative">
          <div className="absolute inset-0 bg-pink-400 blur-[96px] opacity-40 animate-pulse"></div>
          <button 
            onClick={generateDailyPlan} 
            className="relative bg-[#FF4D6D] w-36 h-36 rounded-full flex items-center justify-center text-white shadow-[0_40px_80px_-20px_rgba(255,77,109,0.8)] active:scale-90 transition-all hover:bg-[#FF5E78] -mt-32 border-[14px] border-white group"
          >
            <svg className={`w-20 h-20 transition-transform duration-1000 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <button className="flex flex-col items-center gap-5 group">
          <span className="text-6xl transition-all group-hover:-translate-y-5 group-hover:-rotate-6">🏆</span>
          <span className="text-[13px] font-black text-gray-300 uppercase tracking-[0.5em] group-hover:text-pink-500">Mastery</span>
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(15px, -30px) rotate(5deg); }
          66% { transform: translate(-20px, 20px) rotate(-5deg); }
        }
        .animate-float {
          animation: float ease-in-out infinite;
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite ease-in-out;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(1.02); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s infinite ease-in-out;
        }
      `}} />
    </div>
  );
};

export default App;
