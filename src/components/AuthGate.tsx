import React from 'react';
import { auth, signIn } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GraduationCap, LogIn, Loader2 } from 'lucide-react';
import { logActivity } from '../services/historyService';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      
      if (u) {
        // Initialize user profile
        try {
          const userRef = doc(db, 'users', u.uid);
          await setDoc(userRef, {
            uid: u.uid,
            email: u.email,
            lastActive: new Date().toISOString()
          }, { merge: true });
          
          await logActivity('user_login', { email: u.email });
        } catch (err) {
          console.error('Failed to initialize user profile:', err);
        }
      }
    });
  }, []);

  const handleSignIn = async () => {
    setError(null);
    try {
      await signIn();
    } catch (err) {
      console.error('Sign in error:', err);
      if (err instanceof Error) {
        if (err.message.includes('auth/popup-blocked')) {
          setError('Sign-in popup was blocked by your browser. Please allow popups for this site.');
        } else if (err.message.includes('auth/unauthorized-domain')) {
          setError('This domain is not authorized for Google Sign-in. Please add it to your Firebase authorized domains.');
        } else {
          setError('Failed to sign in. Please try again.');
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#5A5A40] animate-spin" />
          <p className="font-serif text-lg">Authenticating with EduSphere...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] border border-[#1A1A1A]/5 shadow-2xl text-center space-y-8">
          <div className="w-20 h-20 bg-[#5A5A40]/10 rounded-full flex items-center justify-center mx-auto">
            <GraduationCap className="w-10 h-10 text-[#5A5A40]" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-serif">Welcome to EduSpeak</h1>
            <p className="text-[#1A1A1A]/60">Access Nigeria's professional teaching certification curriculum and interactive phonetics training.</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 italic">
              {error}
            </div>
          )}

          <button 
            onClick={handleSignIn}
            className="w-full py-4 bg-[#5A5A40] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-lg active:scale-95"
          >
            <LogIn className="w-5 h-5" /> Continue with Google
          </button>
          <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/30 font-mono">NCE Teacher Certification Portal</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
