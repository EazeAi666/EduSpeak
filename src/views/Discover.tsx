import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Volume2, Bookmark, BookmarkCheck, CheckCircle, ArrowRight, RefreshCw, Loader2, BookOpen, History as HistoryIcon } from 'lucide-react';
import { logActivity } from '../services/historyService';
import { toggleBookmark, isBookmarked } from '../services/bookmarkService';
import { cn } from '../lib/utils';

interface Word {
  word: string;
  phonetic: string;
  definition: string;
  example: string;
  category: 'Academic' | 'Professional' | 'Literary' | 'Idiomatic';
}

const DISCOVERY_WORDS: Word[] = [
  {
    word: 'Pedagogy',
    phonetic: '/ˈped.ə.ɡɒdʒ.i/',
    definition: 'The method and practice of teaching, especially as an academic subject or theoretical concept.',
    example: 'Modern pedagogy emphasizes student-centered learning rather than traditional lectures.',
    category: 'Academic'
  },
  {
    word: 'Eloquence',
    phonetic: '/ˈel.ə.kwəns/',
    definition: 'Fluent or persuasive speaking or writing.',
    example: 'The primary school teacher was praised for her eloquence during the graduation ceremony.',
    category: 'Literary'
  },
  {
    word: ' करिकुलम (Curriculum)',
    phonetic: '/kəˈrɪk.jə.ləm/',
    definition: 'The subjects comprising a course of study in a school or college.',
    example: 'The Nigerian NCE curriculum is being updated to reflect 21st-century teaching methods.',
    category: 'Professional'
  },
  {
    word: 'Epiphany',
    phonetic: '/ɪˈpɪf.ə.ni/',
    definition: 'A moment of sudden and great revelation or realization.',
    example: 'The student had an epiphany and finally understood the rules of phonetic transcription.',
    category: 'Literary'
  },
  {
    word: 'Didactic',
    phonetic: '/daɪˈdæk.tɪk/',
    definition: 'Intended to teach, particularly in having moral instruction as an ulterior motive.',
    example: 'Her didactic approach helped the students internalize the social studies concepts quickly.',
    category: 'Academic'
  },
  {
    word: 'Acronym',
    phonetic: '/ˈæk.rə.nɪm/',
    definition: 'An abbreviation formed from the initial letters of other words and pronounced as a word.',
    example: 'NCE is an acronym for National Certificate in Education.',
    category: 'Academic'
  },
  {
    word: 'Pragmatic',
    phonetic: '/præɡˈmæt.ɪk/',
    definition: 'Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.',
    example: 'A pragmatic teacher adapts their lesson plan based on the resources available in the classroom.',
    category: 'Professional'
  },
  {
    word: 'Rhetoric',
    phonetic: '/ˈret.ər.ɪk/',
    definition: 'The art of effective or persuasive speaking or writing, especially the use of figures of speech.',
    example: 'Mastering rhetoric is essential for any teacher who wants to inspire their students.',
    category: 'Academic'
  }
];

export default function Discover() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isLearned, setIsLearned] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const currentWord = DISCOVERY_WORDS[currentIndex];

  React.useEffect(() => {
    const checkSaved = async () => {
      const saved = await isBookmarked('word', currentWord.word);
      setIsSaved(saved);
    };
    checkSaved();
  }, [currentWord]);

  const handleNext = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % DISCOVERY_WORDS.length);
      setIsLearned(false);
      setIsRefreshing(false);
    }, 400);
  };

  const handleToggleBookmark = async () => {
    const newState = await toggleBookmark('word', currentWord.word, currentWord);
    if (newState !== undefined) {
      setIsSaved(newState);
    }
  };

  const handleLearn = async () => {
    if (isLearned) return;
    setIsLearned(true);
    await logActivity('word_discovery', { 
      word: currentWord.word, 
      category: currentWord.category 
    });
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#5A5A40]">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Vocabulary Discovery</span>
          </div>
          <h1 className="text-5xl font-serif">Expand Your Lexis</h1>
          <p className="text-lg text-[#1A1A1A]/60">Curated words for the professional Nigerian educator.</p>
        </div>
        
        <button 
          onClick={handleNext}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-6 py-3 bg-[#5A5A40]/5 text-[#5A5A40] rounded-2xl font-bold hover:bg-[#5A5A40] hover:text-white transition-all disabled:opacity-50"
        >
          {isRefreshing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          Get New Word
        </button>
      </header>

      <div className="relative">
        <AnimatePresence mode="wait">
          {!isRefreshing && (
            <motion.div
              key={currentWord.word}
              initial={{ opacity: 0, y: 20, rotateX: -10 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, y: -20, rotateX: 10 }}
              className="bg-white rounded-[3rem] border border-[#1A1A1A]/5 shadow-2xl shadow-[#5A5A40]/10 overflow-hidden"
            >
              <div className="p-8 md:p-12 space-y-8">
                <div className="flex justify-between items-start">
                  <span className="px-4 py-1.5 bg-[#5A5A40]/10 text-[#5A5A40] rounded-full text-[10px] font-bold uppercase tracking-widest">
                    {currentWord.category}
                  </span>
                  <button 
                    onClick={handleToggleBookmark}
                    className={cn(
                      "transition-all active:scale-95 p-2 rounded-full",
                      isSaved ? "text-[#5A5A40] bg-[#5A5A40]/10" : "text-[#1A1A1A]/20 hover:text-[#5A5A40]"
                    )}
                  >
                    {isSaved ? <BookmarkCheck className="w-6 h-6" /> : <Bookmark className="w-6 h-6" />}
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-6">
                    <h2 className="text-6xl md:text-7xl font-serif text-[#1A1A1A]">{currentWord.word}</h2>
                    <button 
                      onClick={() => speak(currentWord.word)}
                      className="w-14 h-14 rounded-full bg-[#F5F2ED] flex items-center justify-center text-[#5A5A40] hover:scale-110 active:scale-95 transition-all shadow-sm"
                    >
                      <Volume2 className="w-6 h-6" />
                    </button>
                  </div>
                  <p className="text-2xl font-mono text-[#5A5A40]/60 italic">{currentWord.phonetic}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-[#1A1A1A]/5">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/30">Definition</h4>
                    <p className="text-xl leading-relaxed text-[#1A1A1A]/80">{currentWord.definition}</p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/30">Example Sentence</h4>
                    <p className="text-xl leading-relaxed text-[#1A1A1A]/60 italic">"{currentWord.example}"</p>
                  </div>
                </div>

                <div className="pt-8 flex flex-col md:flex-row gap-4">
                  <button 
                    onClick={handleLearn}
                    className={cn(
                      "flex-1 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all",
                      isLearned 
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                        : "bg-[#5A5A40] text-white hover:brightness-110 shadow-xl shadow-[#5A5A40]/20 active:scale-[0.98]"
                    )}
                  >
                    {isLearned ? (
                      <>
                        <CheckCircle className="w-6 h-6" /> Learned
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-6 h-6" /> Master This Word
                      </>
                    )}
                  </button>
                  <button 
                    onClick={handleNext}
                    className="px-8 py-5 bg-[#F5F2ED] text-[#1A1A1A]/60 rounded-2xl font-bold hover:text-[#5A5A40] transition-colors flex items-center justify-center gap-2"
                  >
                    Next Word <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="bg-[#F5F2ED] py-4 px-8 border-t border-[#1A1A1A]/5 flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/30">
                <span>Part of your NCE Professional Development</span>
                <span>EduSpeak Insight</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#5A5A40] p-10 rounded-[2.5rem] text-white space-y-6">
          <h3 className="text-3xl font-serif">Why expand your vocabulary?</h3>
          <p className="text-white/70 leading-relaxed text-lg">
            As a future teacher, your words are your tools. A refined vocabulary allows you to explain complex concepts with precision and inspire students through expressive communication.
          </p>
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-bold">Improved Classroom Confidence</p>
              <p className="text-sm text-white/50">Speak with authority and clarity.</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#1A1A1A]/5 p-10 rounded-[2.5rem] flex flex-col justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-[#F5F2ED] rounded-2xl flex items-center justify-center text-[#5A5A40] mx-auto mb-2">
            <HistoryIcon className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-serif">Discovery Progress</h3>
          <p className="text-[#1A1A1A]/60">Your masters words appear in your activity feed automatically.</p>
        </div>
      </section>
    </div>
  );
}
