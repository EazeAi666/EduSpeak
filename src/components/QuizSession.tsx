import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, ArrowLeft, CheckCircle2, XCircle, ChevronRight, Award } from 'lucide-react';
import { ai, MODELS, hasApiKey } from '../lib/gemini';
import { Type } from '@google/genai';
import { QuizQuestion, Difficulty } from '../types';
import { logActivity } from '../services/historyService';
import { awardPoints } from '../services/statsService';
import { cn } from '../lib/utils';
import { Brain, Zap, Target } from 'lucide-react';

interface QuizSessionProps {
  moduleTitle: string;
  department: string;
  onBack: () => void;
}

export default function QuizSession({ moduleTitle, department, onBack }: QuizSessionProps) {
  const [difficulty, setDifficulty] = React.useState<Difficulty | null>(null);
  const [questions, setQuestions] = React.useState<QuizQuestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [score, setScore] = React.useState(0);
  const [showResult, setShowResult] = React.useState(false);

  React.useEffect(() => {
    if (showResult) {
      logActivity('quiz_completion', { moduleTitle, department, score, totalQuestions: questions.length, difficulty });
      // Award points based on performance and difficulty
      const percentage = (score / questions.length) * 100;
      if (percentage >= 50) {
        const difficultyMultiplier = difficulty === 'Advanced' ? 1.5 : difficulty === 'Intermediate' ? 1.2 : 1;
        awardPoints(Math.floor(percentage * difficultyMultiplier));
      }
    }
  }, [showResult, questions.length, score, moduleTitle, department, difficulty]);

  const fetchQuiz = async (selectedDifficulty: Difficulty) => {
    setLoading(true);
    setError(null);
    try {
      if (!hasApiKey) {
        throw new Error("AI Quiz generator is offline. Please check your API key.");
      }

      let difficultyContext = "";
      if (selectedDifficulty === 'Beginner') {
        difficultyContext = "Focus on fundamental concepts, basic terminology, and simple classroom scenarios. Questions should be straightforward and clear.";
      } else if (selectedDifficulty === 'Intermediate') {
        difficultyContext = "Focus on conceptual application, pedagogical theories, and more complex classroom management scenarios. Require active reasoning and higher-level thinking.";
      } else {
        difficultyContext = "Focus on deep critical analysis, complex multidisciplinary integration, and sophisticated professional challenges. Questions should be highly challenging, testing professional mastery and nuanced understanding.";
      }

      const prompt = `Generate 5 high-quality, professional multiple-choice questions for the NCE (National Certificate in Education) proficiency exam.
      Module: "${moduleTitle}"
      Department: "${department}"
      Difficulty Level: ${selectedDifficulty}
      
      Requirements:
      - ${difficultyContext}
      - Focus on professional teaching knowledge and classroom application in the Nigerian context.
      - Return as JSON array of objects with fields: question (string), options (array of 4 strings), correctAnswer (index 0-3), explanation (string explaining why).`;

      const response = await ai.models.generateContent({
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
      
      const text = response.text;
      
      if (text) {
        setQuestions(JSON.parse(text));
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to generate quiz.");
    } finally {
      setLoading(false);
    }
  };

  const handleDifficultySelect = (lvl: Difficulty) => {
    setDifficulty(lvl);
    fetchQuiz(lvl);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      setShowResult(true);
    }
  };

  const currentQ = questions[currentIndex];

  if (!difficulty) {
    return (
      <div className="max-w-xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <button onClick={onBack} className="text-[#1A1A1A]/40 flex items-center gap-2 mx-auto hover:text-[#1A1A1A]">
            <ArrowLeft className="w-4 h-4" /> Cancel
          </button>
          <h1 className="text-4xl font-serif">Assessment Difficulty</h1>
          <p className="text-[#1A1A1A]/60">Select your preferred level for the {moduleTitle} proficiency test.</p>
        </header>

        <div className="grid gap-4">
          {[
            { id: 'Beginner', icon: Brain, desc: 'Fundamental concepts & basic application.', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
            { id: 'Intermediate', icon: Target, desc: 'Advanced conceptual reasoning & theory.', color: 'bg-amber-50 text-amber-600 border-amber-100' },
            { id: 'Advanced', icon: Zap, desc: 'Critical analysis & complex mastery.', color: 'bg-rose-50 text-rose-600 border-rose-100' }
          ].map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => handleDifficultySelect(lvl.id as Difficulty)}
              className="group p-8 bg-white border border-[#1A1A1A]/5 rounded-[2.5rem] text-left hover:border-[#5A5A40] hover:shadow-xl transition-all flex items-center gap-6"
            >
              <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", lvl.color)}>
                <lvl.icon className="w-8 h-8" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">{lvl.id}</h3>
                  <ChevronRight className="w-5 h-5 text-[#1A1A1A]/20 group-hover:text-[#5A5A40] group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-[#1A1A1A]/40 text-sm">{lvl.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 pt-8 border-t border-[#1A1A1A]/5 space-y-6"
            >
              <div className={cn(
                "p-6 rounded-[2rem] border transition-all duration-500",
                selectedOption === currentQ.correctAnswer 
                  ? "bg-emerald-50/50 border-emerald-100" 
                  : "bg-orange-50/50 border-orange-100"
              )}>
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    selectedOption === currentQ.correctAnswer ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"
                  )}>
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A]/80">Professional Feedback</h4>
                    <p className="text-sm leading-relaxed text-[#1A1A1A]/70 italic">
                      {currentQ.explanation}
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleNext}
                className="w-full bg-[#5A5A40] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:brightness-110 shadow-lg active:scale-95 transition-all"
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
