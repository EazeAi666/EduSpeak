import React from 'react';
import { motion } from 'motion/react';
import { GraduationCap } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#F5F2ED] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Decorative Elements */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1.2, opacity: 0.05 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-0 flex items-center justify-center p-20"
      >
        <GraduationCap className="w-full h-full text-[#5A5A40]" />
      </motion.div>

      <div className="relative z-10 flex flex-col items-center space-y-8 text-center">
        {/* Icon Animation */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-32 h-32 bg-[#5A5A40] rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-[#5A5A40]/30"
        >
          <GraduationCap className="w-16 h-16 text-white" />
        </motion.div>

        {/* Text Animation */}
        <div className="space-y-4">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-6xl font-serif text-[#1A1A1A] tracking-tight"
          >
            EduSpeak
          </motion.h1>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="h-0.5 w-24 bg-[#5A5A40]/20 mx-auto rounded-full"
          />
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-sm font-bold uppercase tracking-[0.3em] text-[#5A5A40]/60"
          >
            NCE English Hub
          </motion.p>
        </div>

        {/* Attribution */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-[-150px] w-[300px]"
        >
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/30">
            Build by
          </p>
          <div className="flex flex-col items-center mt-2 space-y-1">
            <span className="text-xs font-serif text-[#5A5A40]">SWAL Organization</span>
            <span className="text-[10px] text-[#1A1A1A]/40">&</span>
            <span className="text-xs font-serif text-[#5A5A40]">Adesina Technologies</span>
          </div>
        </motion.div>
      </div>

      {/* Loading Indicator */}
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 3.5, ease: "linear" }}
        className="absolute bottom-0 left-0 right-0 h-1 bg-[#5A5A40] origin-left"
      />
    </motion.div>
  );
}
