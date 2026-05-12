import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Download, GraduationCap, Languages, Library, Search, User, Sparkles, Globe, ArrowLeft } from 'lucide-react';
import { View, Accent } from '../types';
import { cn } from '../lib/utils';
import { auth, signIn, signOut } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getPreferredAccent, setPreferredAccent } from '../services/settingsService';

interface LayoutProps {
  currentView: View;
  setView: (view: View) => void;
  children: React.ReactNode;
}

export default function Layout({ currentView, setView, children }: LayoutProps) {
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [isInstallable, setIsInstallable] = React.useState(false);
  const [accent, setAccent] = React.useState<Accent>(getPreferredAccent());

  React.useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  const handleAccentToggle = () => {
    const newAccent = accent === 'en-GB' ? 'en-US' : 'en-GB';
    setAccent(newAccent);
    setPreferredAccent(newAccent);
  };

  React.useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const navItems = [
    { id: 'home', label: 'Dashboard', icon: GraduationCap },
    { id: 'training', label: 'Hub', icon: Book },
    { id: 'phonetics', label: 'Phonetics', icon: Languages },
    { id: 'literature', label: 'Literature', icon: Library },
    { id: 'discover', label: 'Discover', icon: Sparkles },
    { id: 'dictionary', label: 'Dictionary', icon: Search },
  ] as const;

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-sans pb-20 md:pb-0">
      {/* Desktop Navigation Rail */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-20 bg-white border-r border-[#1A1A1A]/10 flex-col items-center py-8 z-50">
        <div className="mb-12">
          <GraduationCap className="w-10 h-10 text-[#5A5A40]" />
        </div>
        
        <div className="flex-1 flex flex-col gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as View)}
              className={cn(
                "p-3 rounded-xl transition-all duration-300 group relative",
                currentView === item.id ? "bg-[#5A5A40] text-white" : "hover:bg-[#5A5A40]/10 text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="absolute left-full ml-4 px-2 py-1 bg-[#1A1A1A] text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-auto space-y-6 flex flex-col items-center">
          <button 
            onClick={handleAccentToggle}
            className="group relative p-3 rounded-xl bg-[#5A5A40]/5 text-[#5A5A40] hover:bg-[#5A5A40] hover:text-white transition-all overflow-hidden"
            title={`Current Accent: ${accent === 'en-GB' ? 'British' : 'American'}`}
          >
            <div className="flex flex-col items-center gap-0.5">
              <Globe className="w-5 h-5" />
              <span className="text-[8px] font-bold uppercase">{accent.split('-')[1]}</span>
            </div>
            <span className="absolute left-full ml-4 px-2 py-1 bg-[#1A1A1A] text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Switch to {accent === 'en-GB' ? 'American' : 'British'} English
            </span>
          </button>

          {isInstallable && (
            <button 
              onClick={handleInstall}
              className="p-3 rounded-xl bg-[#5A5A40]/5 text-[#5A5A40] hover:bg-[#5A5A40] hover:text-white transition-all animate-pulse"
              title="Install App"
            >
              <Download className="w-6 h-6" />
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 w-full h-16 bg-white border-b border-[#1A1A1A]/10 px-6 flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          {currentView !== 'home' ? (
            <button 
              onClick={() => setView('home')}
              className="p-2 -ml-2 rounded-lg hover:bg-[#5A5A40]/10 text-[#5A5A40] transition-colors flex items-center"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          ) : (
            <GraduationCap className="w-8 h-8 text-[#5A5A40]" />
          )}
          <span className="font-serif font-bold text-lg">EduSpeak</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleAccentToggle}
            className="p-2 rounded-lg bg-[#5A5A40]/10 text-[#5A5A40] text-[10px] font-bold flex items-center gap-1"
          >
             <Globe className="w-3 h-3" /> {accent.split('-')[1]}
          </button>
          {isInstallable && (
            <button onClick={handleInstall} className="text-[#5A5A40]">
              <Download className="w-6 h-6" />
            </button>
          )}
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-[#1A1A1A]/10 px-2 py-3 flex justify-around items-center z-50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as View)}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              currentView === item.id ? "text-[#5A5A40]" : "text-[#1A1A1A]/40"
            )}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] uppercase font-bold tracking-tighter">{item.label}</span>
          </button>
        ))}
      </nav>

      <main className="md:pl-20 pt-16 md:pt-0 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="p-8 max-w-7xl mx-auto"
          >
            {currentView !== 'home' && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setView('home')}
                className="hidden md:flex items-center gap-2 text-[#5A5A40] hover:text-[#5A5A40]/70 font-medium mb-8 transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </motion.button>
            )}
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.03]">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] rounded-full bg-[#5A5A40] blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[60%] rounded-full bg-[#5A5A40] blur-[120px]" />
      </div>
    </div>
  );
}
