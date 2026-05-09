import React from 'react';
import { motion } from 'motion/react';
import { Play } from 'lucide-react';
import { PHONEMES } from '../constants';
import { Phoneme } from '../types';
import { cn } from '../lib/utils';

export default function Phonetics() {
  const [selected, setSelected] = React.useState<Phoneme | null>(null);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const vowels = PHONEMES.filter(p => p.type === 'vowel');
  const diphthongs = PHONEMES.filter(p => p.type === 'diphthong');
  const consonants = PHONEMES.filter(p => p.type === 'consonant');

  const PhonemeGrid = ({ title, items }: { title: string, items: Phoneme[] }) => (
    <div className="space-y-4">
      <h3 className="text-sm font-mono uppercase tracking-widest text-[#1A1A1A]/40 italic pl-2 border-l-2 border-[#5A5A40]">
        {title}
      </h3>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
        {items.map((p) => (
          <button
            key={p.symbol}
            onClick={() => {
              setSelected(p);
              speak(p.example);
            }}
            className={cn(
              "aspect-square flex flex-col items-center justify-center rounded-xl transition-all duration-300 border",
              selected?.symbol === p.symbol 
                ? "bg-[#5A5A40] text-white border-transparent scale-105 shadow-lg" 
                : "bg-white text-[#1A1A1A] border-[#1A1A1A]/5 hover:border-[#5A5A40]/40"
            )}
          >
            <span className="text-2xl font-medium">/{p.symbol}/</span>
            <span className={cn("text-[10px] mt-1 opacity-60 uppercase tracking-tighter", selected?.symbol === p.symbol ? "text-white/80" : "")}>{p.example}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif">Phonetics Lab</h1>
          <p className="text-[#1A1A1A]/60">Interactive IPA Chart for English Teachers.</p>
        </div>
        
        {selected && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 max-w-md bg-white p-6 rounded-2xl border border-[#5A5A40]/20 shadow-sm flex gap-6 items-center"
          >
            <div className="w-16 h-16 bg-[#5A5A40]/5 rounded-full flex items-center justify-center text-3xl font-bold text-[#5A5A40]">
              /{selected.symbol}/
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold capitalize">{selected.example}</span>
                <button 
                  onClick={() => speak(selected.example)}
                  className="p-2 bg-[#5A5A40] text-white rounded-lg hover:brightness-110"
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>
              </div>
              <p className="text-sm text-[#1A1A1A]/60 mt-1 leading-tight">{selected.description}</p>
            </div>
          </motion.div>
        )}
      </header>

      <div className="space-y-12">
        <PhonemeGrid title="Monophthongs (Pure Vowels)" items={vowels} />
        <PhonemeGrid title="Diphthongs (Gliding Vowels)" items={diphthongs} />
        <PhonemeGrid title="Consonants (Selection)" items={consonants} />
      </div>

      <div className="mt-12 p-8 bg-white rounded-3xl border border-[#1A1A1A]/5">
        <h3 className="text-xl font-serif mb-4">Transcription Practice</h3>
        <p className="text-[#1A1A1A]/60 mb-6">Can you transcribe these common words? (Coming soon)</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Teacher', 'Education', 'Nigeria'].map(word => (
            <div key={word} className="p-4 bg-[#F5F2ED] rounded-xl flex justify-between items-center group">
              <span className="font-medium">{word}</span>
              <button 
                onClick={() => speak(word)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-[#5A5A40]"
              >
                <Play className="w-5 h-5 fill-current" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
