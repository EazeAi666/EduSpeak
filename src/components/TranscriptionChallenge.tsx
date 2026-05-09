import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, Sparkles, CheckCircle, XCircle, Brain, RefreshCw } from 'lucide-react';
import { ai, MODELS } from '../lib/gemini';
import { Type } from '@google/genai';
import { cn } from '../lib/utils';

interface Challenge {
  transcription: string;
  correctWord: string;
  hint: string;
}

export default function TranscriptionChallenge() {
  const [challenge, setChallenge] = React.useState<Challenge | null>(null);
  const [userAnswer, setUserAnswer] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ isCorrect: boolean; message: string } | null>(null);
  const [validating, setValidating] = React.useState(false);

  const generateChallenge = async () => {
    setLoading(true);
    setFeedback(null);
    setUserAnswer('');
    try {
      if (!ai.apiKey) {
        throw new Error("AI Challenge generator is offline. Please check your API key.");
      }
      const prompt = `As a phonetics expert, provide one English word and its phonetic transcription (IPA) for a spelling challenge. 
      The word should be relevant to education or general academic vocabulary.
      Return as JSON: { "transcription": string, "correctWord": string, "hint": string }`;

      const result = await ai.models.generateContent({
        model: MODELS.TEXT,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              transcription: { type: Type.STRING },
              correctWord: { type: Type.STRING },
              hint: { type: Type.STRING }
            },
            required: ['transcription', 'correctWord', 'hint']
          }
        }
      });

      if (result.text) {
        setChallenge(JSON.parse(result.text));
      }
    } catch (err) {
      console.error('Challenge generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge || !userAnswer.trim()) return;

    setValidating(true);
    try {
      const prompt = `The user is attempting to spell the word for the transcription /${challenge.transcription}/. 
      The user wrote: "${userAnswer}". The correct word is "${challenge.correctWord}".
      Is the user's answer correct? (Allow minor typos if they capture the sound, but prioritize correct spelling).
      Return as JSON: { "isCorrect": boolean, "message": string (short feedback) }`;

      const result = await ai.models.generateContent({
        model: MODELS.TEXT,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isCorrect: { type: Type.BOOLEAN },
              message: { type: Type.STRING }
            },
            required: ['isCorrect', 'message']
          }
        }
      });

      if (result.text) {
        setFeedback(JSON.parse(result.text));
      }
    } catch (err) {
      console.error('Validation error:', err);
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-[#1A1A1A]/5 shadow-xl shadow-[#5A5A40]/5 space-y-8">
      <div className="flex justify-between items-center bg-[#5A5A40]/5 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-[#5A5A40]" />
          <h3 className="text-xl font-serif font-bold text-[#1A1A1A]">Transcription Mastery</h3>
        </div>
        <button 
          onClick={generateChallenge}
          disabled={loading}
          className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#5A5A40] hover:bg-[#5A5A40]/10 px-4 py-2 rounded-xl transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {challenge ? 'Next Challenge' : 'Start Practice'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {challenge ? (
          <motion.div
            key={challenge.transcription}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            <div className="text-center py-10 space-y-4">
              <div className="text-sm font-mono uppercase tracking-[0.3em] text-[#1A1A1A]/40 mb-2">Identify the word</div>
              <div className="text-5xl md:text-6xl font-bold text-[#5A5A40] italic tracking-tighter">
                /{challenge.transcription}/
              </div>
              <div className="text-sm text-[#1A1A1A]/60 italic font-medium">
                Hint: {challenge.hint}
              </div>
            </div>

            <form onSubmit={validateAnswer} className="relative">
              <input 
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type the word here..."
                className={cn(
                  "w-full bg-[#F5F2ED] border-2 border-transparent rounded-2xl py-6 px-8 text-2xl focus:border-[#5A5A40]/40 outline-none transition-all shadow-inner",
                  feedback?.isCorrect ? "bg-emerald-50 border-emerald-500" : feedback?.isCorrect === false ? "bg-red-50 border-red-500" : ""
                )}
                autoFocus
              />
              <button 
                disabled={validating || !userAnswer.trim()}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#5A5A40] text-white p-4 rounded-xl hover:scale-105 disabled:opacity-50 transition-all shadow-lg"
              >
                {validating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
              </button>
            </form>

            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-6 rounded-2xl flex gap-4 items-center border",
                    feedback.isCorrect ? "bg-emerald-50 border-emerald-100 text-emerald-900" : "bg-red-50 border-red-100 text-red-900"
                  )}
                >
                  {feedback.isCorrect ? <CheckCircle className="w-7 h-7 text-emerald-500 flex-shrink-0" /> : <XCircle className="w-7 h-7 text-red-500 flex-shrink-0" />}
                  <div>
                    <div className="font-bold text-lg">{feedback.isCorrect ? 'Excellent!' : 'Keep Trying'}</div>
                    <p className="text-sm opacity-80">{feedback.message}</p>
                  </div>
                  {feedback.isCorrect && (
                    <button 
                      onClick={generateChallenge}
                      className="ml-auto bg-emerald-500 text-white px-6 py-2 rounded-xl text-sm font-bold"
                    >
                      Next
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-[#1A1A1A]/10 rounded-[2rem] space-y-6">
            <div className="w-20 h-20 bg-[#5A5A40]/5 rounded-full flex items-center justify-center mx-auto">
              <Brain className="w-10 h-10 text-[#5A5A40]/20" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-serif text-[#1A1A1A]/60">Ready to test your transcription skills?</h4>
              <p className="text-[#1A1A1A]/40 max-w-xs mx-auto">See a phonetic transcription and guess the correctly spelled English word.</p>
            </div>
            <button 
              onClick={generateChallenge}
              className="bg-[#5A5A40] text-white px-10 py-4 rounded-xl font-bold hover:scale-105 transition-all shadow-xl"
            >
              Generate First Word
            </button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
