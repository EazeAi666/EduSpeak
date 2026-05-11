import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, Volume2, Bookmark, BookmarkCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { ai, MODELS, hasApiKey } from '../lib/gemini';
import { Type } from '@google/genai';
import { logActivity } from '../services/historyService';
import { awardPoints } from '../services/statsService';
import { toggleBookmark, isBookmarked, subscribeToBookmarks, Bookmark as BookmarkType } from '../services/bookmarkService';
import { getPreferredAccent } from '../services/settingsService';

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
  const [isSaved, setIsSaved] = React.useState(false);
  const [savedWords, setSavedWords] = React.useState<BookmarkType[]>([]);

  React.useEffect(() => {
    return subscribeToBookmarks('word', (bookmarks) => {
      setSavedWords(bookmarks);
    });
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const searchTerm = query.trim();
    if (!searchTerm) return;

    performSearch(searchTerm);
  };

  const handleSearchDirectly = (word: string) => {
    setQuery(word);
    performSearch(word);
  };

  const performSearch = async (searchTerm: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setIsSaved(false);
    try {
      if (!hasApiKey) {
        throw new Error("AI service is not configured. Please add VITE_GEMINI_API_KEY to your environment variables in Netlify.");
      }

      const response = await ai.models.generateContent({
        model: MODELS.TEXT,
        contents: `Provide dictionary data for the word "${searchTerm}". Include phonetic transcription (IPA), definition, and example sentence. Focus on standard educational English.`,
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
        const wordData = JSON.parse(response.text);
        setResult(wordData);
        logActivity('dictionary_search', { word: searchTerm, phonetic: wordData.phonetic });
        awardPoints(5);
        
        // Check if already bookmarked
        const saved = await isBookmarked('word', wordData.word);
        setIsSaved(saved);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!result) return;
    const newState = await toggleBookmark('word', result.word, result);
    if (newState !== undefined) {
      setIsSaved(newState);
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getPreferredAccent();
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
              <button 
                onClick={handleToggleBookmark}
                className={cn(
                  "p-3 rounded-full transition-all active:scale-95",
                  isSaved ? "bg-[#5A5A40] text-white" : "text-[#1A1A1A]/20 hover:text-[#5A5A40] bg-[#1A1A1A]/5"
                )}
              >
                {isSaved ? <BookmarkCheck className="w-7 h-7" /> : <Bookmark className="w-7 h-7" />}
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
        <div className="space-y-12">
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/30">Featured Words</h3>
            <div className="grid grid-cols-2 gap-4">
              {['Pedagogy', 'Linguistics', 'Curriculum', 'Phonology'].map(word => (
                <button 
                  key={word}
                  onClick={() => handleSearchDirectly(word)}
                  className="p-4 bg-white rounded-2xl border border-[#1A1A1A]/5 text-left hover:border-[#5A5A40]/40 transition-colors group"
                >
                  <div className="text-xs font-mono text-[#1A1A1A]/40 mb-1">Featured Word</div>
                  <div className="font-semibold">{word}</div>
                </button>
              ))}
            </div>
          </section>

          {savedWords.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-[#5A5A40]" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/30">My Vocabulary Bank</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedWords.map((item) => (
                  <motion.div 
                    layout
                    key={item.id}
                    className="p-5 bg-white rounded-2xl border border-[#1A1A1A]/5 hover:border-[#5A5A40]/20 transition-all group flex justify-between items-center"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-[#1A1A1A]">{item.itemReference}</h4>
                      <p className="text-xs text-[#1A1A1A]/40 line-clamp-1">{item.data?.definition || 'Saved for review'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                        onClick={() => speak(item.itemReference)}
                        className="p-2 bg-[#F5F2ED] rounded-lg text-[#5A5A40] hover:bg-[#5A5A40] hover:text-white transition-all"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleSearchDirectly(item.itemReference)}
                        className="p-2 bg-[#F5F2ED] rounded-lg text-[#5A5A40] hover:bg-[#5A5A40] hover:text-white transition-all"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
