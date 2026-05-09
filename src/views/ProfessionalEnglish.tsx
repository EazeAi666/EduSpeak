import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, CheckCircle2, ChevronRight, Presentation, Globe, GraduationCap } from 'lucide-react';
import { cn } from '../lib/utils';
import { TRAINING_MODULES } from '../constants';
import StudySession from '../components/StudySession';
import QuizSession from '../components/QuizSession';
import { Department } from '../types';

export default function Training() {
  const [activeDept, setActiveDept] = React.useState<Department>('english');
  const [activeModuleId, setActiveModuleId] = React.useState<string | null>(null);
  const [studyTopic, setStudyTopic] = React.useState<string | null>(null);
  const [quizMode, setQuizMode] = React.useState(false);

  const filteredModules = TRAINING_MODULES.filter(m => m.department === activeDept);
  const currentModule = TRAINING_MODULES.find(m => m.id === activeModuleId);

  // Auto-select first module of department if none selected
  React.useEffect(() => {
    if (!activeModuleId || (currentModule && currentModule.department !== activeDept)) {
      setActiveModuleId(filteredModules[0]?.id || null);
    }
  }, [activeDept, activeModuleId, filteredModules, currentModule]);

  if (studyTopic && currentModule) {
    return (
      <StudySession 
        topic={studyTopic} 
        moduleTitle={currentModule.title} 
        department={currentModule.department}
        onBack={() => setStudyTopic(null)}
      />
    );
  }

  if (quizMode && currentModule) {
    return (
      <QuizSession 
        moduleTitle={currentModule.title} 
        department={currentModule.department}
        onBack={() => setQuizMode(false)}
      />
    );
  }

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-serif">Teacher Training Portal</h1>
          <p className="text-[#1A1A1A]/60 max-w-2xl">
            Advancing your communication and pedagogical skills as a professional educator in Nigeria.
          </p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl border border-[#1A1A1A]/5 shadow-sm">
          <button 
            onClick={() => setActiveDept('english')}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all",
              activeDept === 'english' ? "bg-[#5A5A40] text-white shadow-lg" : "text-[#1A1A1A]/40 hover:text-[#5A5A40]"
            )}
          >
            English
          </button>
          <button 
            onClick={() => setActiveDept('social-studies')}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all",
              activeDept === 'social-studies' ? "bg-[#5A5A40] text-white shadow-lg" : "text-[#1A1A1A]/40 hover:text-[#5A5A40]"
            )}
          >
            Social Studies
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-[#1A1A1A]/40 mb-6 px-2">Core Modules</h3>
          {filteredModules.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveModuleId(m.id)}
              className={cn(
                "w-full flex items-center p-6 rounded-[2rem] border transition-all duration-300",
                activeModuleId === m.id 
                  ? "bg-white border-[#5A5A40] shadow-xl shadow-[#5A5A40]/5 translate-x-2" 
                  : "bg-white/50 border-transparent hover:border-[#1A1A1A]/10 hover:bg-white"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center mr-4 shadow-sm",
                activeModuleId === m.id ? "bg-[#5A5A40] text-white" : "bg-white text-[#5A5A40]"
              )}>
                {m.department === 'english' ? <GraduationCap className="w-6 h-6" /> : <Globe className="w-6 h-6" />}
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-bold text-sm leading-tight">{m.title}</h4>
                <div className="text-[10px] font-mono text-[#1A1A1A]/40 mt-1 uppercase tracking-tighter">{m.topics.length} Units</div>
              </div>
              <ChevronRight className={cn("w-5 h-5 transition-transform", activeModuleId === m.id ? "rotate-90 text-[#5A5A40]" : "text-[#1A1A1A]/20")} />
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {currentModule ? (
            <motion.div
              key={currentModule.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[3rem] p-10 border border-[#1A1A1A]/5 shadow-2xl shadow-[#5A5A40]/10"
            >
              <div className="flex items-center gap-4 mb-10 pb-8 border-b border-[#1A1A1A]/5">
                <div className="bg-[#5A5A40] p-4 rounded-2xl text-white shadow-lg">
                   {currentModule.department === 'english' ? <GraduationCap className="w-8 h-8" /> : <Globe className="w-8 h-8" />}
                </div>
                <div>
                  <h2 className="text-3xl font-serif text-[#1A1A1A]">{currentModule.title}</h2>
                  <p className="text-[#1A1A1A]/40">{currentModule.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentModule.topics.map((topic, i) => (
                  <div 
                    key={topic}
                    className="p-8 bg-[#F5F2ED] rounded-[2rem] border-2 border-transparent hover:border-[#5A5A40]/30 transition-all group flex flex-col justify-between min-h-[160px]"
                  >
                    <div className="flex justify-between items-start">
                      <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-xs font-mono font-bold text-[#5A5A40] shadow-sm">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-[#1A1A1A]/10 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <div>
                      <h5 className="font-bold text-lg mb-4 text-[#1A1A1A]/80">{topic}</h5>
                      <button 
                        onClick={() => setStudyTopic(topic)}
                        className="text-xs font-bold uppercase tracking-widest text-[#5A5A40] flex items-center gap-2 group-hover:gap-3 transition-all"
                      >
                        Start Lesson <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-8 bg-[#5A5A40] rounded-[2rem] flex flex-col md:flex-row items-center justify-between text-white gap-6">
                <div className="space-y-1 text-center md:text-left">
                  <h4 className="font-bold text-xl">Module Assessment</h4>
                  <p className="text-white/60">Test your mastery of {currentModule.title}.</p>
                </div>
                <button 
                  onClick={() => setQuizMode(true)}
                  className="bg-white text-[#5A5A40] px-10 py-4 rounded-xl font-bold hover:scale-[1.05] transition-transform flex items-center gap-2 shadow-xl"
                >
                  <BookOpen className="w-5 h-5" /> Start Proficiency Quiz
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center rounded-[3rem] border-2 border-dashed border-[#1A1A1A]/10 bg-white/30 backdrop-blur-sm">
              <p className="text-[#1A1A1A]/40 font-serif italic">Select a module to begin your professional training.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
