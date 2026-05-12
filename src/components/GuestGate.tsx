import React from 'react';
import { User, LogIn, GraduationCap, ChevronRight } from 'lucide-react';
import { setGuestNickname, getGuestNickname } from '../lib/firebase';

export default function GuestGate({ children }: { children: React.ReactNode }) {
  const [nickname, setNickname] = React.useState(getGuestNickname());
  const [input, setInput] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setIsSubmitting(true);
    // Simulate a small delay for "setting up profile"
    setTimeout(() => {
      setGuestNickname(input.trim());
      setNickname(input.trim());
      setIsSubmitting(false);
    }, 800);
  };

  if (!nickname) {
    return (
      <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center p-6 bg-[radial-gradient(#5A5A40_1px,transparent_1px)] [background-size:20px_20px] [background-opacity:0.05]">
        <div className="max-w-md w-full bg-white p-10 rounded-[3rem] border border-[#1A1A1A]/5 shadow-[0_32px_64px_-12px_rgba(90,90,64,0.15)] text-center space-y-8 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#5A5A40]/5 rounded-bl-[5rem] -mr-16 -mt-16" />
          
          <div className="w-24 h-24 bg-[#5A5A40] rounded-[2rem] flex items-center justify-center mx-auto rotate-3 shadow-xl">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl font-serif tracking-tight text-[#1A1A1A]">Welcome to EduSpeak</h1>
            <p className="text-[#1A1A1A]/60 leading-relaxed">
              Nigeria's professional learning platform. Enter a nickname to begin your lesson and save your progress.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#5A5A40]/40 group-focus-within:text-[#5A5A40] transition-colors">
                <User size={20} />
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your nickname..."
                className="w-full pl-14 pr-6 py-5 bg-[#F5F2ED] rounded-2xl border-none focus:ring-2 focus:ring-[#5A5A40] transition-all text-lg"
                autoFocus
              />
            </div>
            
            <button 
              type="submit"
              disabled={isSubmitting || !input.trim()}
              className="w-full py-5 bg-[#5A5A40] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-[#5A5A40]/20 disabled:opacity-50 disabled:scale-100"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Start Learning <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[#1A1A1A]/5">
            <p className="text-[10px] uppercase font-mono tracking-[0.3em] text-[#1A1A1A]/30">
              NCE Teacher Certification Portal • Nigeria
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
