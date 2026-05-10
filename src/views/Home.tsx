import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, GraduationCap, Languages, Library, Search, Clock, History } from 'lucide-react';
import { View } from '../types';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

interface HomeProps {
  setView: (view: View) => void;
}

export default function Home({ setView }: HomeProps) {
  const [history, setHistory] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'history'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    return onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const cards = [
    {
      id: 'training',
      title: 'Professional Training',
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
  ] as const;

  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <h1 className="text-5xl font-serif font-medium tracking-tight">
          Welcome, <span className="italic">Future Educator</span>
        </h1>
        <p className="text-xl text-[#1A1A1A]/60 max-w-2xl leading-relaxed">
          Your comprehensive portal for excellence in English and Phonetics. Designed for NCE students in Nigeria to bridge the gap between learning and teaching.
        </p>
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
          <h2 className="text-3xl font-serif">Today's Teaching Tip</h2>
          <p className="text-lg text-white/80 italic">
            "Effective language teaching is not just about rules, but about building confidence in communication. Encourage your students to speak without fear of errors."
          </p>
          <div className="pt-4">
            <span className="text-xs tracking-widest uppercase opacity-60">Daily Inspiration for Teachers</span>
          </div>
        </div>
        <div className="absolute right-[-5%] top-[-20%] w-[50%] h-[140%] bg-white/5 rounded-full blur-3xl rotate-12" />
      </section>
    </div>
  );
}
