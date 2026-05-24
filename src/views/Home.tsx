import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, GraduationCap, Languages, Library, Search, Clock, History, Sparkles, Flame, Trophy, Bookmark, BookmarkCheck, Volume2, Type as TypeIcon, Quote, Hash, Smartphone, Download, QrCode, Share2, Plus, ArrowUpRight } from 'lucide-react';
import { View, Department } from '../types';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType, getEffectiveUserId } from '../lib/firebase';
import { updateStreak, getUserStats, UserStats } from '../services/statsService';
import { DAILY_TIPS, PRACTICE_WORDS } from '../constants';
import { toggleBookmark, isBookmarked } from '../services/bookmarkService';
import { getPreferredAccent } from '../services/settingsService';
import { cn } from '../lib/utils';

interface HomeProps {
  setView: (view: View) => void;
  onNavigateToTraining: (dept: Department, moduleId: string) => void;
}

export default function Home({ setView, onNavigateToTraining }: HomeProps) {
  const [history, setHistory] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState<UserStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [connectionError, setConnectionError] = React.useState(false);
  const [isWordSaved, setIsWordSaved] = React.useState(false);

  // PWA installation states
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [isInstallable, setIsInstallable] = React.useState(false);
  const [activeInstallTab, setActiveInstallTab] = React.useState<'native' | 'ios' | 'qr'>('native');

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If app is already installed or running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("Please check your browser menu (e.g., three dots or share button) and select 'Add to Home screen' or 'Install' to add the app manually.");
      return;
    }
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } catch (e) {
      console.error('Error triggering PWA install:', e);
    }
  };

  // Word of the day logic
  const today = new Date().toDateString();
  const wordIndex = Math.abs(today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % PRACTICE_WORDS.length;
  const wordOfDay = PRACTICE_WORDS[wordIndex];

  const init = async () => {
    try {
      // Don't let streak update block the whole app if it fails due to transient offline state
      updateStreak().catch(e => console.warn('Streak update deferred:', e));
      
      const userStats = await getUserStats();
      setStats(userStats);
      
      // Check if word of day is saved
      const saved = await isBookmarked('word', wordOfDay);
      setIsWordSaved(saved);
      
      setConnectionError(false);
    } catch (err) {
      console.error('Stats init error:', err);
      // If we have some stats or local state, maybe we don't need to show the error
      if (String(err).includes('offline') || String(err).includes('unavailable')) {
        // We permit continuing in a "limited" mode if offline
        console.log('Continuing in offline mode');
      } else {
        setConnectionError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWord = async () => {
    const newState = await toggleBookmark('word', wordOfDay, { word: wordOfDay, definition: 'Mastered from home dashboard' });
    if (newState !== undefined) setIsWordSaved(newState);
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getPreferredAccent();
    window.speechSynthesis.speak(utterance);
  };

  React.useEffect(() => {
    init();

    const uid = getEffectiveUserId();
    const q = query(
      collection(db, 'users', uid, 'history'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setConnectionError(false);
    }, (error) => {
      console.error('History sync error:', error);
      if (error.message.includes('offline')) {
        setConnectionError(true);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Sparkles className="w-12 h-12 text-[#5A5A40] animate-pulse" />
        <p className="font-serif italic text-lg text-[#1A1A1A]/40">Gathering resources...</p>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="p-12 bg-white rounded-[3rem] border border-[#1A1A1A]/5 shadow-2xl shadow-[#5A5A40]/10 max-w-md mx-6">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <History className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-3xl font-serif mb-4">Connection Issues</h2>
          <p className="text-[#1A1A1A]/60 mb-8 text-sm leading-relaxed">
            We're having trouble connecting to your Firebase project. This usually happens if:<br/><br/>
            1. <b>Firestore API</b> is not enabled in your Google Cloud Console.<br/>
            2. <b>Security Rules</b> are not published (they must allow guest access now).<br/>
            3. <b>API Key Restrictions</b> are blocking this domain (AI Studio Preview).
          </p>
          <div className="space-y-4">
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-[#5A5A40] text-white rounded-2xl hover:brightness-110 transition-all font-bold shadow-lg shadow-[#5A5A40]/20"
            >
              Retry Connection
            </button>
            <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/30">Verification Portal</p>
          </div>
        </div>
      </div>
    );
  }

  // Cycle tips based on current date
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const dailyTip = DAILY_TIPS[dayOfYear % DAILY_TIPS.length];

  const cards = [
    {
      id: 'training',
      title: 'Professional Hub',
      description: 'Master classroom delivery, Social Studies, and Academic Writing for your NCE training.',
      icon: GraduationCap,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      id: 'phonetics',
      title: 'Phonetics Lab',
      description: 'Interactive IPA chart and pronunciation guide. Master English sounds and transcriptions.',
      icon: Languages,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'literature',
      title: 'Literature Library',
      description: 'Explore classic and Nigerian literature. Poems and analysis for the modern teacher.',
      icon: Library,
      color: 'bg-orange-50 text-orange-600',
    },
    {
      id: 'dictionary',
      title: 'Intelligent Dictionary',
      description: 'Search words, get phonetic transcriptions, and listen to AI-powered pronunciation.',
      icon: Search,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      id: 'discover',
      title: 'Word Discovery',
      description: 'Explore curated academic and professional words to enhance your teaching vocabulary.',
      icon: Sparkles,
      color: 'bg-amber-50 text-amber-600',
    },
  ] as const;

  const quickMasteries = [
    { title: 'Punctuation', icon: TypeIcon, color: 'text-blue-500', bgColor: 'bg-blue-50', moduleId: 'punc-1', dept: 'specialized' },
    { title: 'Figures of Speech', icon: Quote, color: 'text-purple-500', bgColor: 'bg-purple-50', moduleId: 'lit-figures-1', dept: 'specialized' },
    { title: 'Synonyms', icon: Hash, color: 'text-emerald-500', bgColor: 'bg-emerald-50', moduleId: 'vocab-1', dept: 'specialized' },
  ];

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <h1 className="text-5xl font-serif font-medium tracking-tight">
            Welcome, <span className="italic">Future Educator</span>
          </h1>
          <p className="text-xl text-[#1A1A1A]/60 max-w-2xl leading-relaxed">
            Your comprehensive portal for excellence in English and Social Studies. Designed for NCE students in Nigeria to bridge the gap between learning and teaching.
          </p>
        </div>

        {stats && (
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex gap-4">
              <div className="bg-amber-50 p-4 rounded-2xl flex items-center gap-3 border border-amber-100">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-amber-500/60 leading-none mb-1">Level {stats.level}</p>
                  <p className="text-xl font-bold leading-none">{stats.points}</p>
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-2xl flex items-center gap-3 border border-orange-100">
                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-orange-500/60 leading-none mb-1">Day Streak</p>
                  <p className="text-xl font-bold leading-none">{stats.streak}</p>
                </div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl flex items-center gap-3 border border-emerald-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-500/60 leading-none mb-1">Best Streak</p>
                  <p className="text-xl font-bold leading-none">{stats.bestStreak}</p>
                </div>
              </div>
            </div>
            {stats.streak > 0 && (
              <p className="text-sm font-medium text-[#5A5A40] bg-[#5A5A40]/10 px-4 py-2 rounded-full hidden md:block">
                {stats.streak >= 3 ? 'You are on fire! 🔥' : 'Keep the momentum going!'}
              </p>
            )}
          </div>
        )}
      </header>

      <section className="bg-white rounded-[3rem] p-10 border border-[#1A1A1A]/5 shadow-xl shadow-[#5A5A40]/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#5A5A40]/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-[#5A5A40]/10 transition-colors" />
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-[#5A5A40]">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest">Master Word of the Day</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-6">
                <h2 className="text-6xl font-serif text-[#1A1A1A]">{wordOfDay}</h2>
                <button 
                  onClick={() => speak(wordOfDay)}
                  className="w-12 h-12 rounded-full bg-[#F5F2ED] flex items-center justify-center text-[#5A5A40] hover:scale-110 active:scale-95 transition-all shadow-sm"
                >
                  <Volume2 size={20} />
                </button>
              </div>
              <p className="text-[#1A1A1A]/60 italic text-lg max-w-md">
                Master this important term to elevate your professional teaching vocabulary.
              </p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={handleSaveWord}
                className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg ${
                  isWordSaved 
                    ? "bg-[#5A5A40] text-white shadow-[#5A5A40]/20" 
                    : "bg-[#F5F2ED] text-[#1A1A1A]/60 hover:text-[#5A5A40]"
                }`}
              >
                {isWordSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                {isWordSaved ? 'Saved to Bank' : 'Save Word'}
              </button>
              <button 
                onClick={() => setView('dictionary')}
                className="px-8 py-4 bg-white border border-[#1A1A1A]/5 text-[#1A1A1A]/40 hover:text-[#5A5A40] hover:border-[#5A5A40]/20 rounded-2xl font-bold transition-all"
              >
                Find Synonyms
              </button>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-[#5A5A40]/5 p-8 rounded-[2.5rem] border border-[#5A5A40]/10 space-y-4">
              <div className="flex items-center gap-2 text-[#5A5A40]/60">
                <History className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Teaching Usage</span>
              </div>
              <p className="text-[#1A1A1A]/70 italic leading-relaxed">
                "Effective <strong>{wordOfDay}</strong> in our Social Studies curriculum helps students relate theoretical concepts to their daily experiences in the local community."
              </p>
              <div className="pt-2 text-[10px] font-mono text-[#1A1A1A]/30 uppercase tracking-[0.2em]">
                Suggested NCE Context
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-serif px-2">Teacher Preparation Modules</h2>
          <button 
            onClick={() => setView('training')}
            className="text-xs font-bold uppercase tracking-widest text-[#5A5A40] hover:underline"
          >
            View All Training
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {quickMasteries.map((m) => (
            <button
              key={m.title}
              onClick={() => onNavigateToTraining(m.dept as Department, m.moduleId)}
              className="flex items-center gap-4 p-6 bg-white border border-[#1A1A1A]/5 rounded-[2rem] hover:border-[#1A1A1A]/20 transition-all group"
            >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", m.bgColor, m.color)}>
                <m.icon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/40 mb-0.5">Specialized</p>
                <h4 className="font-bold text-sm tracking-tight">{m.title}</h4>
              </div>
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card, index) => (
            <motion.button
              key={card.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setView(card.id as View)}
              className="group flex flex-col text-left p-8 bg-white border border-[#1A1A1A]/5 rounded-3xl hover:border-[#1A1A1A]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#5A5A40]/5"
            >
              <div className={`w-12 h-12 rounded-2xl ${card.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <card.icon className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">{card.title}</h3>
              <p className="text-[#1A1A1A]/60 leading-relaxed mb-6 italic">
                {card.description}
              </p>
              <div className="mt-auto flex items-center text-sm font-semibold group-hover:translate-x-2 transition-transform">
                Get Started <BookOpen className="ml-2 w-4 h-4" />
              </div>
            </motion.button>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-[#1A1A1A]/5 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <History className="w-5 h-5 text-[#5A5A40]" />
              <h2 className="text-xl font-serif">Recent Activity</h2>
            </div>
            
            <div className="space-y-4">
              {history.length > 0 ? (
                history.map((item) => (
                  <div key={item.id} className="flex gap-4 items-start pb-4 border-b border-[#1A1A1A]/5 last:border-0">
                    <div className="mt-1 w-2 h-2 rounded-full bg-[#5A5A40]/40 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">
                        {item.activityType === 'dictionary_search' && `Searched for "${item.content?.word}"`}
                        {item.activityType === 'quiz_completion' && `Completed ${item.content?.moduleTitle} quiz`}
                        {item.activityType === 'pronunciation_practice' && `Practiced sound /${item.content?.phoneme}/`}
                        {item.activityType === 'literature_read' && `Read "${item.content?.title}"`}
                        {item.activityType === 'user_login' && `Signed in to portal`}
                        {item.activityType === 'word_discovery' && `Mastered word "${item.content?.word}"`}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-[#1A1A1A]/40 uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        {(() => {
                          if (!item.timestamp) return '';
                          const date = item.timestamp.toDate ? item.timestamp.toDate() : new Date(item.timestamp);
                          return date.toLocaleDateString();
                        })()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center space-y-2">
                  <p className="text-sm text-[#1A1A1A]/40">No recent activity logged.</p>
                  <p className="text-[10px] uppercase tracking-widest text-[#5A5A40]">Start exploring to see history here</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-[#1A1A1A]/5 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-[#5A5A40]" />
              <h2 className="text-xl font-serif">Offline Installation</h2>
            </div>
            
            <p className="text-sm text-[#1A1A1A]/60 leading-relaxed">
              Install <strong>EduSpeak</strong> on your phone to run it in offline-first mode, directly from your home screen just like a native app.
            </p>

            {/* Tab selection */}
            <div className="grid grid-cols-3 gap-1 bg-[#F5F2ED] p-1 rounded-xl text-xs">
              <button
                onClick={() => setActiveInstallTab('native')}
                key="tab-native"
                className={cn(
                  "py-1.5 rounded-lg font-bold transition-all cursor-pointer",
                  activeInstallTab === 'native' ? "bg-[#5A5A40] text-white shadow" : "text-[#1A1A1A]/50 hover:text-[#5A5A40]"
                )}
              >
                In-App Install {isInstallable ? '🟢' : ''}
              </button>
              <button
                onClick={() => setActiveInstallTab('ios')}
                key="tab-ios"
                className={cn(
                  "py-1.5 rounded-lg font-bold transition-all cursor-pointer",
                  activeInstallTab === 'ios' ? "bg-[#5A5A40] text-white shadow" : "text-[#1A1A1A]/50 hover:text-[#5A5A40]"
                )}
              >
                iOS / Safari
              </button>
              <button
                onClick={() => setActiveInstallTab('qr')}
                key="tab-qr"
                className={cn(
                  "py-1.5 rounded-lg font-bold transition-all cursor-pointer",
                  activeInstallTab === 'qr' ? "bg-[#5A5A40] text-white shadow" : "text-[#1A1A1A]/50 hover:text-[#5A5A40]"
                )}
              >
                Scan QR
              </button>
            </div>

            {/* Tab content */}
            <div className="space-y-4">
              {activeInstallTab === 'native' && (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-xs text-[#1A1A1A]/70 leading-relaxed">
                    If you are using Google Chrome or any compatible desktop or Android browser, you can install the app instantly.
                  </p>
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-3 bg-[#5A5A40] hover:bg-[#5A5A40]/95 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Install Native App
                  </button>
                  {!isInstallable && (
                    <p className="text-[10px] text-[#1A1A1A]/40 text-center uppercase tracking-wider leading-relaxed">
                      If the button is inactive, simply use your browser's menu (e.g. three dots) and select <b>"Install"</b> or <b>"Add to Home screen"</b>.
                    </p>
                  )}
                </div>
              )}

              {activeInstallTab === 'ios' && (
                <div className="space-y-3 text-xs text-[#1A1A1A]/75 animate-fade-in">
                  <p className="leading-relaxed font-medium">Safari on iOS/iPhone requires manual installation:</p>
                  <ol className="list-decimal pl-4 space-y-2 text-[#1A1A1A]/75">
                    <li>Open <b>Safari</b> on your iPhone or iPad</li>
                    <li>Tap the <b>Share</b> button <span className="inline-flex items-center justify-center p-1 bg-[#F5F2ED] rounded border border-[#1A1A1A]/5"><Share2 className="w-3 h-3 text-[#5A5A40]" /></span> at the bottom</li>
                    <li>Scroll down and select <b>"Add to Home Screen"</b> <span className="inline-flex items-center justify-center p-1 bg-[#F5F2ED] rounded border border-[#1A1A1A]/5"><Plus className="w-3 h-3 text-[#5A5A40]" /></span></li>
                  </ol>
                  <p className="text-[10px] text-[#1A1A1A]/40 italic">Once added, slide to your home screen and open the brand-new icon for the full application experience.</p>
                </div>
              )}

              {activeInstallTab === 'qr' && (
                <div className="space-y-3 flex flex-col items-center text-center animate-fade-in">
                  <p className="text-xs text-[#1A1A1A]/70 leading-relaxed">
                    Scan this QR code with your phone camera to open and install the application directly onto your mobile device:
                  </p>
                  <div className="bg-[#F5F2ED] p-3 rounded-2xl border border-[#1A1A1A]/5 shadow-inner">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.href)}`}
                      alt="Install QR Code"
                      className="w-32 h-32 object-contain"
                      id="pwa-qr-img"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-[#5A5A40] hover:underline flex items-center gap-1 mt-1"
                  >
                    Open Live Link <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="bg-[#5A5A40] rounded-[2rem] p-12 text-white overflow-hidden relative">
        <div className="relative z-10 max-w-xl space-y-6">
          <div className="flex items-center gap-2 text-white/60">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Today's Teaching Tip</span>
          </div>
          <p className="text-2xl md:text-3xl font-serif italic leading-snug">
            "{dailyTip}"
          </p>
          <div className="pt-4">
            <span className="text-xs tracking-widest uppercase opacity-60">Daily Inspiration for the Nigerian Educator</span>
          </div>
        </div>
        <div className="absolute right-[-5%] top-[-20%] w-[50%] h-[140%] bg-white/5 rounded-full blur-3xl rotate-12" />
      </section>
    </div>
  );
}
