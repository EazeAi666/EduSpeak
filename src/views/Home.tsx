import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, GraduationCap, Languages, Library, Search, Clock, History, Sparkles, Flame, Trophy } from 'lucide-react';
import { View } from '../types';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { updateStreak, getUserStats, UserStats } from '../services/statsService';
import { DAILY_TIPS } from '../constants';

interface HomeProps {
  setView: (view: View) => void;
}

export default function Home({ setView }: HomeProps) {
  const [history, setHistory] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState<UserStats | null>(null);

  React.useEffect(() => {
    const init = async () => {
      await updateStreak();
      const userStats = await getUserStats();
      setStats(userStats);
    };
    init();

    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'history'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    return onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${auth.currentUser?.uid}/history`);
    });
  }, []);

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
                        {new Date(item.timestamp).toLocaleDateString()}
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

          <div className="bg-[#5A5A40]/5 p-8 rounded-3xl border border-[#5A5A40]/10">
            <h3 className="text-lg font-serif mb-2">PWA Tip</h3>
            <p className="text-sm text-[#1A1A1A]/60">
              Install EduSpeak on your home screen for offline access to phonetics charts and curriculum guides.
            </p>
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
