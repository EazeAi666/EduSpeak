import React from 'react';
import { motion } from 'motion/react';
import { BookMarked, ChevronRight, Hash, Quote, Library } from 'lucide-react';
import { POEMS } from '../constants';
import { Poem } from '../types';
import { cn } from '../lib/utils';

export default function Literature() {
  const [selected, setSelected] = React.useState<Poem | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* Sidebar - List */}
      <div className="lg:col-span-4 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-serif">Literature Corner</h1>
          <p className="text-[#1A1A1A]/60">Classics and Nigerian heritage.</p>
        </header>

        <div className="space-y-3">
          {POEMS.map((poem) => (
            <button
              key={poem.id}
              onClick={() => setSelected(poem)}
              className={cn(
                "w-full text-left p-6 rounded-[2rem] transition-all duration-300 border",
                selected?.id === poem.id 
                  ? "bg-[#5A5A40] text-white border-transparent shadow-xl translate-x-2" 
                  : "bg-white border-[#1A1A1A]/5 hover:bg-[#5A5A40]/5"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={cn("text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-full",
                  selected?.id === poem.id ? "bg-white/20 text-white" : "bg-black/5 text-[#1A1A1A]/60"
                )}>
                  {poem.category}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-1">{poem.title}</h3>
              <p className={cn("text-sm transition-colors", 
                selected?.id === poem.id ? "text-white/70" : "text-[#1A1A1A]/40"
              )}>
                {poem.author}
              </p>
            </button>
          ))}
        </div>

        <div className="p-6 bg-white rounded-[2rem] border border-[#1A1A1A]/5">
          <h4 className="font-serif text-lg mb-4">Request a Poem</h4>
          <p className="text-sm text-[#1A1A1A]/60 leading-relaxed mb-6">
            Looking for a specific Nigerian or classic poem for your lesson? Ask our AI Librarian.
          </p>
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Poem title or author..."
              className="w-full bg-[#F5F2ED] rounded-2xl py-3 px-4 text-sm outline-none border border-transparent focus:border-[#5A5A40]/20 transition-all"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#5A5A40] text-white rounded-xl">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Viewer */}
      <div className="lg:col-span-8 min-h-[600px]">
        {selected ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[3rem] p-12 border border-[#1A1A1A]/5 shadow-2xl shadow-[#5A5A40]/5 sticky top-8"
          >
            <div className="flex justify-between items-start mb-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-px bg-[#5A5A40]" />
                  <span className="text-sm font-mono uppercase tracking-[0.3em] text-[#5A5A40]">{selected.author}</span>
                </div>
                <h2 className="text-6xl font-serif font-medium leading-tight">{selected.title}</h2>
              </div>
              <button className="p-4 bg-[#F5F2ED] text-[#1A1A1A] rounded-2xl hover:bg-[#5A5A40] hover:text-white transition-all">
                <BookMarked className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              <div className="md:col-span-7">
                <div className="prose prose-lg prose-stone max-w-none">
                  <div className="whitespace-pre-line text-xl leading-[1.8] font-serif text-[#1A1A1A]/80 italic">
                    {selected.content}
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 space-y-8">
                <section className="bg-[#F5F2ED] p-8 rounded-3xl space-y-4 border border-[#1A1A1A]/5">
                  <div className="flex items-center gap-2 text-[#5A5A40]">
                    <Quote className="w-5 h-5" />
                    <h4 className="font-bold uppercase text-xs tracking-widest">Literary Analysis</h4>
                  </div>
                  <p className="text-[#1A1A1A]/70 leading-relaxed italic">
                    {selected.analysis}
                  </p>
                </section>

                <section className="space-y-4">
                  <h4 className="font-bold uppercase text-xs tracking-widest text-[#1A1A1A]/40">Teaching Focus</h4>
                  <div className="space-y-2">
                    {['Cultural Motif', 'Metaphorical Bridge', 'Sound Patterns'].map((topic) => (
                      <div key={topic} className="flex items-center gap-3 p-3 bg-white border border-[#1A1A1A]/10 rounded-xl hover:translate-x-1 transition-transform cursor-pointer">
                        <Hash className="w-4 h-4 text-[#5A5A40]" />
                        <span className="text-sm font-medium">{topic}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="h-full flex items-center justify-center bg-white/50 border border-dashed border-[#1A1A1A]/10 rounded-[3rem]">
            <div className="text-center space-y-4 max-w-sm">
              <Library className="w-16 h-16 text-[#1A1A1A]/10 mx-auto" />
              <h3 className="text-xl font-serif text-[#1A1A1A]/40">Select a piece from the library to begin reading.</h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
