import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, Play, Volume2, Bookmark, BookmarkCheck } from 'lucide-react';
import { ai, MODELS } from '../lib/gemini';
import { Type } from '@google/genai';

interface WordData {
  word: string;
  phonetic: string;
  definition: string;
  example: string;
  synonyms: string[];
}

export default function Dictionary() {
  const [query, setQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<WordData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      if (!ai.apiKey) {
        throw new Error("AI service is not configured. Please add GEMINI_API_KEY to your environment variables in Netlify / Shared Settings.");
      }

      const response = await ai.models.generateContent({
        model: MODELS.TEXT,
        contents: `Provide dictionary data for the word "${query}". Include phonetic transcription (IPA), definition, and example sentence. Focus on standard educational English.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              phonetic: { type: Type.STRING },
              definition: { type: Type.STRING },
              example: { type: Type.STRING },
              synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['word', 'phonetic', 'definition', 'example']
          }
        }
      });
      
      if (response.text) {
        setResult(JSON.parse(response.text));
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-serif">Intelligent Dictionary</h1>
        <p className="text-[#1A1A1A]/60">AI-powered word discovery for advanced English training.</p>
      </header>

      <form onSubmit={handleSearch} className="relative group">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Look up a word..."
          className="w-full bg-white border-2 border-[#1A1A1A]/5 rounded-2xl py-6 px-14 text-xl focus:border-[#5A5A40]/40 outline-none transition-all shadow-sm"
        />
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-[#1A1A1A]/20 group-focus-within:text-[#5A5A40] transition-colors" />
        <button 
          disabled={loading}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#5A5A40] text-white px-6 py-3 rounded-xl hover:brightness-110 disabled:opacity-50 transition-all font-semibold"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
        </button>
      </form>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm flex gap-3 items-center"
          >
            <p>{error}</p>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-3xl p-10 border border-[#1A1A1A]/5 shadow-xl shadow-[#5A5A40]/5 space-y-8"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h2 className="text-5xl font-serif font-bold text-[#1A1A1A]">{result.word}</h2>
                <div className="flex items-center gap-4">
                  <span className="text-[#5A5A40] font-mono text-xl">/{result.phonetic}/</span>
                  <button 
                    onClick={() => speak(result.word)}
                    className="p-2 bg-[#5A5A40]/10 text-[#5A5A40] rounded-full hover:bg-[#5A5A40]/20 transition-colors"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <button className="p-3 text-[#1A1A1A]/20 hover:text-[#5A5A40] transition-colors">
                <Bookmark className="w-7 h-7" />
              </button>
            </div>

            <div className="h-px bg-[#1A1A1A]/5 w-full" />

            <div className="space-y-6">
              <section className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#1A1A1A]/40">Definition</h3>
                <p className="text-xl leading-relaxed">{result.definition}</p>
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#1A1A1A]/40">Contextual Example</h3>
                <p className="text-lg italic text-[#1A1A1A]/60 bg-[#F5F2ED] p-4 rounded-xl border-l-4 border-[#5A5A40]">
                  "{result.example}"
                </p>
              </section>

              {result.synonyms && result.synonyms.length > 0 && (
                <section className="space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#1A1A1A]/40">Synonyms</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.synonyms.map(syn => (
                      <span key={syn} className="px-3 py-1 bg-white border border-[#1A1A1A]/10 rounded-full text-sm">
                        {syn}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !loading && (
        <div className="grid grid-cols-2 gap-4">
          {['Pedagogy', 'Linguistics', 'Curriculum', 'Phonology'].map(word => (
            <button 
              key={word}
              onClick={() => {
                setQuery(word);
                // Trigger search manually would need a ref or state effect
              }}
              className="p-4 bg-white rounded-2xl border border-[#1A1A1A]/5 text-left hover:border-[#5A5A40]/40 transition-colors group"
            >
              <div className="text-xs font-mono text-[#1A1A1A]/40 mb-1">Featured Word</div>
              <div className="font-semibold">{word}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
