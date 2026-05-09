import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Mic, Square, Loader2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { PHONEMES } from '../constants';
import { Phoneme } from '../types';
import { cn } from '../lib/utils';
import { ai, MODELS } from '../lib/gemini';
import TranscriptionChallenge from '../components/TranscriptionChallenge';

export default function Phonetics() {
  const [selected, setSelected] = React.useState<Phoneme | null>(null);
  const [isRecording, setIsRecording] = React.useState(false);
  const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ score: number; comment: string } | null>(null);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
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

  const analyzePronunciation = async () => {
    if (!audioBlob || !selected) return;

    setIsAnalyzing(true);
    try {
      if (!ai.apiKey) {
        throw new Error("AI Analysis requires an API key in environment variables.");
      }
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];

        const prompt = `You are a professional phonetics expert. Analyze the user's pronunciation of the sound /${selected.symbol}/ as in the word "${selected.example}".
        Provide feedback in JSON format: { "score": number (0-100), "comment": string (concise advice for improvement) }. 
        Focus on clarity, stress, and correct articulation of the specific phoneme.`;

        const result = await ai.models.generateContent({
          model: MODELS.TEXT, // Using text model for now, but in a real case we'd send the audio part
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: 'audio/webm',
                    data: base64Audio
                  }
                }
              ]
            }
          ]
        });

        if (result.text) {
          const feedbackData = JSON.parse(result.text);
          setFeedback(feedbackData);
        }
      };
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
            className="flex-1 w-full max-w-2xl bg-white p-8 rounded-[2.5rem] border border-[#5A5A40]/20 shadow-xl flex flex-col md:flex-row gap-8 items-center"
          >
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
          </motion.div>
        )}
      </header>

      <div className="space-y-12">
        <PhonemeGrid title="Monophthongs (Pure Vowels)" items={vowels} />
        <PhonemeGrid title="Diphthongs (Gliding Vowels)" items={diphthongs} />
        <PhonemeGrid title="Consonants (Selection)" items={consonants} />
      </div>

      <div className="mt-12 p-8 bg-white rounded-3xl border border-[#1A1A1A]/5">
        <h3 className="text-xl font-serif mb-4">Common Classroom Terms</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Curriculum', 'Pedagogy', 'Linguistics', 'Education', 'Assessment'].map(word => (
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
    </div>
  );
}
