import React from 'react';
import { motion } from 'motion/react';
import { Loader2, ArrowLeft, Volume2, Play, Pause, Square, SkipForward } from 'lucide-react';
import { ai, MODELS } from '../lib/gemini';
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

  React.useEffect(() => {
    // Cleanup synthesis on unmount
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  React.useEffect(() => {
    async function fetchContent() {
      try {
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
    utterance.rate = 0.9;
    
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
          </div>
          
          <div className="flex items-center bg-[#F5F2ED] p-2 rounded-2xl gap-2 shadow-sm border border-[#1A1A1A]/5">
            {!isSpeaking || isPaused ? (
              <button 
                onClick={handleSpeak}
                className="p-3 bg-[#5A5A40] text-white rounded-xl hover:scale-105 transition-all flex items-center gap-2 pr-4"
              >
                <Play className="w-5 h-5 fill-current" />
                <span className="text-xs font-bold uppercase tracking-widest">{isPaused ? 'Resume' : 'Listen'}</span>
              </button>
            ) : (
              <button 
                onClick={handlePause}
                className="p-3 bg-white text-[#5A5A40] border border-[#5A5A40]/20 rounded-xl hover:scale-105 transition-all flex items-center gap-2 pr-4"
              >
                <Pause className="w-5 h-5 fill-current" />
                <span className="text-xs font-bold uppercase tracking-widest">Pause</span>
              </button>
            )}
            
            {isSpeaking && (
              <button 
                onClick={handleStop}
                className="p-3 text-[#1A1A1A]/40 hover:text-red-500 transition-colors"
                title="Stop Narration"
              >
                <Square className="w-5 h-5 fill-current" />
              </button>
            )}
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#5A5A40]" />
            <p className="text-[#1A1A1A]/40 animate-pulse">Generating your professional study guide...</p>
          </div>
        ) : (
          <div className="prose prose-stone prose-lg max-w-none prose-headings:font-serif prose-headings:text-[#5A5A40]">
            <Markdown>{content}</Markdown>
          </div>
        )}
      </motion.div>
    </div>
  );
}
