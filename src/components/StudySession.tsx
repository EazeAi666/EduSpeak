import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, ArrowLeft, Volume2, Play, Pause, Square, SkipForward } from 'lucide-react';
import { ai, MODELS, hasApiKey } from '../lib/gemini';
import Markdown from 'react-markdown';

interface StudySessionProps {
  topic: string;
  moduleTitle: string;
  department: string;
  onBack: () => void;
}

export default function StudySession({ topic, moduleTitle, department, onBack }: StudySessionProps) {
  const [content, setContent] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [playbackRate, setPlaybackRate] = React.useState(1);
  const [viewMode, setViewMode] = React.useState<'reading' | 'audiobook'>('reading');

  React.useEffect(() => {
    // Cleanup synthesis on unmount
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  React.useEffect(() => {
    async function fetchContent() {
      try {
        if (!hasApiKey) {
          throw new Error("AI service is not configured. Please add GEMINI_API_KEY to environment variables.");
        }

        const prompt = `As an expert educator in ${department}, provide a detailed, professional study guide for NCE (National Certificate in Education) students on the topic: "${topic}" within the module "${moduleTitle}". 
        Include:
        1. Learning Objectives
        2. Core Concepts explained simply but professionally
        3. Practical classroom applications
        4. Key vocabulary defined
        Use Markdown formatting.`;

        const result = await ai.models.generateContent({
          model: MODELS.TEXT,
          contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });
        
        if (result.text) {
          setContent(result.text);
        }
      } catch (err) {
        console.error(err);
        setContent("Failed to load study content. Please check your connection.");
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, [topic, moduleTitle, department]);

  const handleSpeak = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = content.replace(/[#*`]/g, ''); // Remove markdown symbols for better speech
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-GB';
    utterance.rate = playbackRate;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const changeRate = (rate: number) => {
    setPlaybackRate(rate);
    if (isSpeaking && !isPaused) {
      // Re-start with new rate if currently playing
      // Note: SynthesisUtterance rate can't be changed mid-speech easily in all browsers
      // So we restart from the beginning or just apply for next play.
      // For simplicity, we just set the state and user can restart if they want, 
      // or we handle it by cancelling and re-speaking.
      handleStop();
      setTimeout(() => handleSpeak(), 100);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <button 
        onClick={() => {
          handleStop();
          onBack();
        }}
        className="flex items-center gap-2 text-[#5A5A40] hover:bg-[#5A5A40]/5 px-4 py-2 rounded-xl transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Module
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] p-10 border border-[#1A1A1A]/5 shadow-xl"
      >
        <header className="mb-10 border-b border-[#1A1A1A]/5 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase tracking-widest text-[#5A5A40] mb-2">{department} Training</div>
            <h1 className="text-4xl font-serif">{topic}</h1>
            <p className="text-[#1A1A1A]/40">{moduleTitle}</p>
            
            <div className="pt-4 flex gap-2">
              <button 
                onClick={() => setViewMode('reading')}
                className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full transition-all ${
                  viewMode === 'reading' ? 'bg-[#5A5A40] text-white' : 'text-[#1A1A1A]/40 hover:text-[#5A5A40]'
                }`}
              >
                Reading Mode
              </button>
              <button 
                onClick={() => setViewMode('audiobook')}
                className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full transition-all ${
                  viewMode === 'audiobook' ? 'bg-[#5A5A40] text-white' : 'text-[#1A1A1A]/40 hover:text-[#5A5A40]'
                }`}
              >
                Audiobook Mode
              </button>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center bg-[#F5F2ED] p-1 rounded-[2rem] gap-1 shadow-inner border border-[#1A1A1A]/5">
              {!isSpeaking || isPaused ? (
                <button 
                  onClick={handleSpeak}
                  className="px-6 py-4 bg-[#5A5A40] text-white rounded-full hover:scale-105 transition-all flex items-center gap-3 shadow-lg"
                >
                  <Play className="w-6 h-6 fill-current" />
                  <span className="text-sm font-bold uppercase tracking-widest">{isPaused ? 'Resume' : 'Listen Now'}</span>
                </button>
              ) : (
                <button 
                  onClick={handlePause}
                  className="px-6 py-4 bg-white text-[#5A5A40] border border-[#5A5A40]/20 rounded-full hover:scale-105 transition-all flex items-center gap-3 shadow-md"
                >
                  <Pause className="w-6 h-6 fill-current" />
                  <span className="text-sm font-bold uppercase tracking-widest">Pause Mode</span>
                </button>
              )}
              
              {isSpeaking && (
                <button 
                  onClick={handleStop}
                  className="p-4 text-[#1A1A1A]/30 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  title="Stop Narration"
                >
                  <Square className="w-6 h-6 fill-current" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-mono text-[#1A1A1A]/30 uppercase tracking-tighter">Playback Speed</span>
              <div className="flex gap-1.5">
                {[0.75, 1, 1.25, 1.5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => changeRate(rate)}
                    className={`text-[10px] font-bold w-10 h-6 flex items-center justify-center rounded-full transition-all border ${
                      playbackRate === rate 
                        ? 'bg-[#5A5A40] text-white border-transparent shadow-sm' 
                        : 'bg-white text-[#1A1A1A]/40 border-[#1A1A1A]/5 hover:text-[#5A5A40]'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#5A5A40]" />
            <p className="text-[#1A1A1A]/40 animate-pulse">Generating your professional study guide...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'reading' ? (
              <motion.div 
                key="reading"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="prose prose-stone prose-lg max-w-none prose-headings:font-serif prose-headings:text-[#5A5A40]"
              >
                <Markdown>{content}</Markdown>
              </motion.div>
            ) : (
              <motion.div 
                key="audio"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="py-20 flex flex-col items-center text-center space-y-12"
              >
                <div className="relative">
                  <div className={`w-64 h-64 rounded-full bg-[#F5F2ED] border-8 border-[#5A5A40]/10 flex items-center justify-center transition-all duration-1000 ${isSpeaking && !isPaused ? 'scale-110 shadow-2xl' : 'scale-100 shadow-none'}`}>
                    <div className="flex items-center gap-1.5 h-20">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <motion.div
                          key={i}
                          animate={isSpeaking && !isPaused ? {
                            height: [20, 60, 30, 80, 40][i-1],
                            opacity: [0.3, 1, 0.5, 1, 0.4][i-1]
                          } : { height: 8, opacity: 0.2 }}
                          transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            repeatType: "reverse",
                            delay: i * 0.1
                          }}
                          className="w-2 bg-[#5A5A40] rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                  {isSpeaking && !isPaused && (
                    <div className="absolute inset-0 border-4 border-[#5A5A40] rounded-full animate-ping opacity-20" />
                  )}
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-2xl font-serif text-[#5A5A40]">Listening to: {topic}</h3>
                  <p className="text-[#1A1A1A]/40 max-w-md mx-auto italic">
                    "Relax and absorb the concepts. You can adjust the playback speed in the header controls."
                  </p>
                </div>

                {!isSpeaking && (
                  <button 
                    onClick={handleSpeak}
                    className="flex items-center gap-3 bg-[#5A5A40] text-white px-8 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition-all"
                  >
                    <Play className="w-6 h-6 fill-current" /> Start Audiobook
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
