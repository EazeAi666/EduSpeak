import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Mic, Square, Loader2, RefreshCw, CheckCircle, AlertCircle, Sparkles, Search, History, Clock, Trophy } from 'lucide-react';
import { PHONEMES, PRACTICE_WORDS } from '../constants';
import { Phoneme } from '../types';
import { cn } from '../lib/utils';
import { ai, MODELS, hasApiKey } from '../lib/gemini';
import { Type } from "@google/genai";
import TranscriptionChallenge from '../components/TranscriptionChallenge';
import { logActivity } from '../services/historyService';
import { awardPoints } from '../services/statsService';
import { getPreferredAccent } from '../services/settingsService';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType, getEffectiveUserId } from '../lib/firebase';

export default function Phonetics() {
  const [selected, setSelected] = React.useState<Phoneme | null>(null);
  const [isRecording, setIsRecording] = React.useState(false);
  const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ score: number; comment: string } | null>(null);
  const [practiceHistory, setPracticeHistory] = React.useState<any[]>([]);
  const [suggestedWords, setSuggestedWords] = React.useState<string[]>([]);
  const [classroomTerms, setClassroomTerms] = React.useState<string[]>([]);

  React.useEffect(() => {
    // Randomize words on mount
    const shuffled = [...PRACTICE_WORDS].sort(() => 0.5 - Math.random());
    setSuggestedWords(shuffled.slice(0, 5));
    setClassroomTerms(shuffled.slice(5, 11));

    const uid = getEffectiveUserId();
    const q = query(
      collection(db, 'users', uid, 'history'),
      where('activityType', '==', 'pronunciation_practice'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    return onSnapshot(q, (snapshot) => {
      setPracticeHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${uid}/history`);
    });
  }, []);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getPreferredAccent();
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setFeedback(null);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const playRecording = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audio.play();
    }
  };

  const analyzePronunciation = async () => {
    if (!audioBlob || !selected) return;

    setIsAnalyzing(true);
    try {
      if (!hasApiKey) {
        throw new Error("AI Analysis requires an API key in environment variables.");
      }

      // Convert blob to base64 using a Promise for proper async handling
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      const prompt = selected.symbol === '?' 
        ? `You are an expert phonetician. Analyze the user's pronunciation of the word "${selected.example}". Compare it to standard Received Pronunciation (RP).
           Rate the accuracy from 0-100 and provide concise, actionable advice for improvement (e.g., focus on the long vowel, stress the first syllable).`
        : `You are a professional phonetics expert. Analyze the user's pronunciation of the sound /${selected.symbol}/ as in the word "${selected.example}".
           Focus on clarity, stress, and correct articulation of the specific phoneme according to Received Pronunciation (RP).
           Provide a score and concise advice for improvement.`;

      const result = await ai.models.generateContent({
        model: MODELS.TEXT,
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: audioBlob.type || 'audio/webm',
                  data: base64Audio
                }
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { 
                type: Type.NUMBER,
                description: "Accuracy score from 0-100"
              },
              comment: { 
                type: Type.STRING,
                description: "Concise feedback and advice"
              }
            },
            required: ["score", "comment"]
          }
        }
      });

      if (result.text) {
        const feedbackData = JSON.parse(result.text);
        setFeedback(feedbackData);
        logActivity('pronunciation_practice', { 
          phoneme: selected.symbol, 
          word: selected.example, 
          score: feedbackData.score 
        });
        
        if (feedbackData.score >= 70) {
          await awardPoints(30);
        }
      }
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
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
            id={`phoneme-${p.symbol}`}
            onClick={() => {
              setSelected(p);
              speak(p.example);
              setFeedback(null);
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
      <header className="flex flex-col lg:flex-row justify-between items-start gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif">Phonetics Lab</h1>
          <p className="text-[#1A1A1A]/60">Master English sounds with AI-powered feedback.</p>
        </div>
        
        {selected && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 w-full max-w-2xl bg-white p-8 rounded-[2.5rem] border border-[#5A5A40]/20 shadow-xl flex flex-col gap-6 relative"
          >
            <button 
              onClick={() => setSelected(null)}
              className="flex items-center gap-2 text-[#5A5A40]/60 hover:text-[#5A5A40] transition-colors font-mono text-[10px] uppercase tracking-widest group border-b border-[#5A5A40]/10 pb-2 w-fit"
            >
              <RefreshCw className="w-3 h-3 rotate-180 group-hover:rotate-0 transition-transform" />
              Back to Chart
            </button>
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 bg-[#5A5A40]/5 rounded-full flex items-center justify-center text-4xl font-bold text-[#5A5A40] border-2 border-[#5A5A40]/10">
                /{selected.symbol}/
              </div>
              <button 
                onClick={() => speak(selected.example)}
                className="flex items-center gap-2 px-4 py-2 bg-[#5A5A40] text-white rounded-full text-sm font-semibold hover:brightness-110 transition-all"
              >
                <Play className="w-4 h-4 fill-current" /> Play Sound
              </button>
            </div>

            <div className="flex-1 space-y-6 w-full">
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold capitalize mb-1">{selected.example}</h2>
                <p className="text-sm text-[#1A1A1A]/60 leading-relaxed">{selected.description}</p>
              </div>

              <div className="h-px bg-[#1A1A1A]/5 w-full" />

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {!isRecording ? (
                    <button 
                      onClick={startRecording}
                      className="w-full sm:w-auto px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-all shadow-sm"
                    >
                      <Mic className="w-5 h-5" /> Practice Recording
                    </button>
                  ) : (
                    <button 
                      onClick={stopRecording}
                      className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 animate-pulse shadow-lg"
                    >
                      <Square className="w-5 h-5 fill-current" /> Stop & Analyze
                    </button>
                  )}

                  {audioBlob && !isRecording && (
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                      <button 
                        onClick={playRecording}
                        className="w-full sm:w-auto px-6 py-3 bg-white border border-[#5A5A40]/20 text-[#5A5A40] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#5A5A40]/5 transition-all shadow-sm"
                      >
                        <Play className="w-5 h-5" /> Review Recording
                      </button>
                      <button 
                        onClick={analyzePronunciation}
                        disabled={isAnalyzing}
                        className="w-full sm:w-auto px-6 py-3 bg-[#5A5A40] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50 shadow-sm"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" /> Analyzing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-5 h-5" /> Get AI Feedback
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {feedback && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "p-4 rounded-2xl border flex gap-4 items-start",
                        feedback.score >= 80 ? "bg-emerald-50 border-emerald-100" : "bg-orange-50 border-orange-100"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg",
                        feedback.score >= 80 ? "bg-emerald-500 text-white" : "bg-orange-500 text-white"
                      )}>
                        {feedback.score >= 80 ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{feedback.score}% Accuracy</span>
                          <span className="text-xs uppercase tracking-widest opacity-60">AI Evaluation</span>
                        </div>
                        <p className="text-sm text-[#1A1A1A]/70 italic leading-relaxed">{feedback.comment}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </header>

      <div className="space-y-12">
        <PhonemeGrid title="Monophthongs (Pure Vowels)" items={vowels} />
        <PhonemeGrid title="Diphthongs (Gliding Vowels)" items={diphthongs} />
        <PhonemeGrid title="Consonants (Selection)" items={consonants} />
      </div>

      <section className="mt-12 bg-white rounded-[3rem] border border-[#5A5A40]/10 p-10 space-y-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-3xl font-serif">Advanced Pronunciation Coach</h2>
            <p className="text-[#1A1A1A]/60 italic font-medium">Practice any word from the NCE curriculum. Record yourself and receive a detailed phonetic analysis compared to the standard Received Pronunciation (RP).</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#5A5A40]/10 text-[#5A5A40] rounded-full text-xs font-mono tracking-widest uppercase">
            <Sparkles className="w-4 h-4" /> AI Powered
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A]/40">Input Target Word</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="e.g. Pedagogy, Curriculum..."
                  className="flex-1 bg-[#F5F2ED] border-none rounded-xl px-4 py-3 outline-none focus:ring-2 ring-[#5A5A40]/20 font-medium transition-all"
                  id="custom-word-input"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.currentTarget as HTMLInputElement).value;
                      if (val) {
                        setSelected({
                          symbol: '?',
                          example: val,
                          description: `Practicing custom word: ${val}`,
                          type: 'vowel' // dummy
                        });
                        speak(val);
                      }
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    const el = document.getElementById('custom-word-input') as HTMLInputElement;
                    if (el.value) {
                      setSelected({
                        symbol: '?',
                        example: el.value,
                        description: `Practicing custom word: ${el.value}`,
                        type: 'vowel'
                      });
                      speak(el.value);
                    }
                  }}
                  className="p-3 bg-[#5A5A40] text-white rounded-xl shadow-lg hover:brightness-110 transition-all"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 bg-[#F5F2ED] rounded-2xl border border-[#1A1A1A]/5 space-y-4">
              <p className="text-sm text-[#1A1A1A]/60 italic">"Recording your voice helps you identify 'phonetic shifts' where your native tongue might influence your English delivery. This is crucial for professional teachers."</p>
              <div className="flex flex-wrap gap-2">
                {suggestedWords.map(w => (
                  <button 
                    key={w}
                    onClick={() => {
                      setSelected({ 
                        symbol: '?', 
                        example: w, 
                        description: `Practicing curriculum term: ${w}`,
                        type: 'vowel'
                      });
                      speak(w);
                      const el = document.getElementById('custom-word-input') as HTMLInputElement;
                      if (el) el.value = w;
                    }}
                    className="px-3 py-1 bg-white border border-[#1A1A1A]/10 rounded-full text-xs hover:border-[#5A5A40] transition-colors"
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#1A1A1A] rounded-[2rem] p-8 text-white relative overflow-hidden flex flex-col justify-center items-center text-center space-y-6">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#5A5A40] via-transparent to-transparent" />
            </div>
            
            <div className="relative z-10 w-full space-y-6">
              <h4 className="text-lg font-serif">Quick Instructions</h4>
              <ul className="text-sm text-white/60 space-y-3">
                <li>1. Choose or type a word to practice</li>
                <li>2. Listen to the standard pronunciation</li>
                <li>3. Record yourself clearly</li>
                <li>4. Compare and get AI score</li>
              </ul>
              
              <div className="pt-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#5A5A40] font-bold">Standard: Received Pronunciation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-12 p-8 bg-white rounded-3xl border border-[#1A1A1A]/5">
        <h3 className="text-xl font-serif mb-4">Common Classroom Terms</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {classroomTerms.map(word => (
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

      <div className="space-y-6 pt-12 border-t border-[#1A1A1A]/5">
        <div className="space-y-2 mb-8">
          <h2 className="text-3xl font-serif text-[#1A1A1A]">Spelling & Transcription Practice</h2>
          <p className="text-[#1A1A1A]/60">Translate phonetic symbols back into valid English words.</p>
        </div>
        <TranscriptionChallenge />
      </div>

      <section className="mt-12 bg-white rounded-[2.5rem] border border-[#1A1A1A]/5 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-[#5A5A40]/10 rounded-xl text-[#5A5A40]">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-serif text-[#1A1A1A]">Recent Practice Sessions</h2>
            <p className="text-xs text-[#1A1A1A]/40 uppercase tracking-widest font-bold">Track your pronunciation progress</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {practiceHistory.length > 0 ? (
            practiceHistory.map((session) => (
              <motion.div 
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#F5F2ED] p-6 rounded-[2rem] border border-[#1A1A1A]/5 space-y-4 hover:border-[#5A5A40]/20 transition-all group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg font-bold text-[#5A5A40] border border-[#1A1A1A]/5 shadow-sm">
                      /{session.content?.phoneme}/
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1A1A1A] capitalize">{session.content?.word}</h4>
                      <div className="flex items-center gap-1 text-[10px] text-[#1A1A1A]/40 uppercase tracking-tighter">
                        <Clock className="w-3 h-3" />
                        {(() => {
                          if (!session.timestamp) return '';
                          const date = session.timestamp.toDate ? session.timestamp.toDate() : new Date(session.timestamp);
                          return date.toLocaleDateString();
                        })()}
                      </div>
                    </div>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 shadow-sm",
                    session.content?.score >= 80 ? "bg-emerald-500 text-white" : "bg-orange-500 text-white"
                  )}>
                    <Trophy className="w-3 h-3" />
                    {session.content?.score}%
                  </div>
                </div>
                
                <button 
                  onClick={() => speak(session.content?.word)}
                  className="w-full py-2 bg-white text-[#5A5A40] text-[10px] font-bold uppercase tracking-widest rounded-xl border border-[#1A1A1A]/5 group-hover:bg-[#5A5A40] group-hover:text-white transition-all active:scale-95"
                >
                  Listen Again
                </button>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-[#F5F2ED]/50 rounded-[2rem] border border-dashed border-[#1A1A1A]/10">
              <p className="text-[#1A1A1A]/40 text-sm">No practice history available yet.</p>
              <p className="text-[10px] uppercase tracking-widest text-[#5A5A40] mt-1">Select a phoneme and start practice to see it here</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
