import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, GraduationCap, Languages, Library, Search, User } from 'lucide-react';
import { View } from '../types';
import { cn } from '../lib/utils';
import { auth, signIn, signOut } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface LayoutProps {
  currentView: View;
  setView: (view: View) => void;
  children: React.ReactNode;
}

export default function Layout({ currentView, setView, children }: LayoutProps) {
  const [user, setUser] = React.useState<FirebaseUser | null>(null);

  React.useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  const navItems = [
    { id: 'home', label: 'Dashboard', icon: GraduationCap },
    { id: 'training', label: 'Training', icon: Book },
    { id: 'phonetics', label: 'Phonetics', icon: Languages },
    { id: 'literature', label: 'Literature', icon: Library },
    { id: 'dictionary', label: 'Dictionary', icon: Search },
  ] as const;

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-sans">
      {/* Navigation Rail */}
      <nav className="fixed left-0 top-0 h-full w-20 bg-white border-r border-[#1A1A1A]/10 flex flex-col items-center py-8 z-50">
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

        <div className="mt-auto">
          {user ? (
            <button 
              onClick={() => signOut()}
              className="p-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors"
              title="Sign Out"
            >
              <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-[#1A1A1A]/10" />
            </button>
          ) : (
            <button 
              onClick={() => signIn()}
              className="p-3 rounded-xl hover:bg-[#5A5A40]/10 text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors"
              title="Sign In"
            >
              <User className="w-6 h-6" />
            </button>
          )}
        </div>
      </nav>

      <main className="pl-20 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="p-8 max-w-7xl mx-auto"
          >
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
