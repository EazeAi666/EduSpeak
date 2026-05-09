import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, ArrowLeft, CheckCircle2, XCircle, ChevronRight, Award } from 'lucide-react';
import { ai, MODELS } from '../lib/gemini';
import { Type } from '@google/genai';
import { QuizQuestion } from '../types';

interface QuizSessionProps {
  moduleTitle: string;
  department: string;
  onBack: () => void;
}

export default function QuizSession({ moduleTitle, department, onBack }: QuizSessionProps) {
  const [questions, setQuestions] = React.useState<QuizQuestion[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [score, setScore] = React.useState(0);
  const [showResult, setShowResult] = React.useState(false);

  React.useEffect(() => {
    async function fetchQuiz() {
      try {
        if (!ai.apiKey) {
          throw new Error("AI Quiz generator is offline. Please check your API key.");
        }
        const prompt = `Generate 5 high-quality, professional multiple-choice questions for a professional teaching certification (NCE) based on the module: "${moduleTitle}" in the "${department}" department. 
        Focus on practical classroom application and professional knowledge. Return as JSON array of objects with fields: question (string), options (array of 4 strings), correctAnswer (index 0-3), explanation (string explaining why).`;

        const result = await ai.models.generateContent({
          model: MODELS.TEXT,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.NUMBER },
                  explanation: { type: Type.STRING },
                },
                required: ['question', 'options', 'correctAnswer', 'explanation']
              }
            }
          }
        });
        
        if (result.text) {
          setQuestions(JSON.parse(result.text));
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to generate quiz.");
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [moduleTitle, department]);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      setShowResult(true);
    }
  };

  const currentQ = questions[currentIndex];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center px-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#5A5A40]" />
        {error ? (
          <div className="space-y-4">
             <p className="text-red-500 font-bold">{error}</p>
             <button onClick={onBack} className="text-sm font-bold uppercase tracking-widest text-[#5A5A40]">Return to Dashboard</button>
          </div>
        ) : (
          <p className="text-[#1A1A1A]/40 animate-pulse">Designing your professional assessment...</p>
        )}
      </div>
    );
  }

  if (showResult) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto bg-white rounded-[3rem] p-12 text-center shadow-2xl border border-[#1A1A1A]/5"
      >
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Award className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-serif mb-2">Assessment Complete</h2>
        <p className="text-[#1A1A1A]/40 mb-8">You've completed the {moduleTitle} proficiency test.</p>
        
        <div className="text-6xl font-bold text-[#5A5A40] mb-8">
          {Math.round((score / questions.length) * 100)}%
        </div>
        
        <div className="space-y-4">
          <p className="text-sm font-medium">You got {score} out of {questions.length} questions correct.</p>
          <button 
            onClick={onBack}
            className="w-full bg-[#1A1A1A] text-white py-4 rounded-2xl font-bold hover:scale-[1.02] transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-center px-4">
        <button onClick={onBack} className="text-[#1A1A1A]/40 flex items-center gap-2 hover:text-[#1A1A1A]">
          <ArrowLeft className="w-4 h-4" /> Quit
        </button>
        <div className="text-sm font-mono tracking-widest text-[#5A5A40]">
          QUESTION {currentIndex + 1} / {questions.length}
        </div>
      </div>

      <motion.div 
        key={currentIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-[3rem] p-10 border border-[#1A1A1A]/5 shadow-xl"
      >
        <h2 className="text-2xl font-serif mb-8 leading-snug">{currentQ.question}</h2>

        <div className="space-y-3">
          {currentQ.options.map((option, i) => {
            const isCorrect = i === currentQ.correctAnswer;
            const isSelected = i === selectedOption;
            
            return (
              <button
                key={i}
                disabled={selectedOption !== null}
                onClick={() => {
                  setSelectedOption(i);
                  if (isCorrect) setScore(score + 1);
                }}
                className={`w-full p-6 text-left rounded-2xl border transition-all duration-300 relative group
                  ${selectedOption === null 
                    ? "bg-[#F5F2ED] border-transparent hover:border-[#5A5A40] hover:bg-white" 
                    : isCorrect 
                      ? "bg-emerald-50 border-emerald-500 text-emerald-900" 
                      : isSelected 
                        ? "bg-red-50 border-red-500 text-red-900"
                        : "bg-white border-[#1A1A1A]/5 opacity-50"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {selectedOption !== null && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                  {selectedOption !== null && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                </div>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {selectedOption !== null && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-8 pt-8 border-t border-[#1A1A1A]/5 space-y-4"
            >
              <div className="text-sm text-[#1A1A1A]/60 italic bg-[#5A5A40]/5 p-4 rounded-xl">
                <span className="font-bold text-[#5A5A40] block mb-1">Professional Insight:</span>
                {currentQ.explanation}
              </div>
              <button 
                onClick={handleNext}
                className="w-full bg-[#5A5A40] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:brightness-110"
              >
                {currentIndex === questions.length - 1 ? 'Finish Assessment' : 'Next Question'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
