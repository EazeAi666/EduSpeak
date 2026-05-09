import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, GraduationCap, Languages, Library, Search } from 'lucide-react';
import { View } from '../types';

interface HomeProps {
  setView: (view: View) => void;
}

export default function Home({ setView }: HomeProps) {
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <p className="text-[#1A1A1A]/60 leading-relaxed mb-6">
              {card.description}
            </p>
            <div className="mt-auto flex items-center text-sm font-semibold group-hover:translate-x-2 transition-transform">
              Get Started <BookOpen className="ml-2 w-4 h-4" />
            </div>
          </motion.button>
        ))}
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
