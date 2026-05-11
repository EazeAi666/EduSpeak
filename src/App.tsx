import React from 'react';
import { AnimatePresence } from 'motion/react';
import Layout from './components/Layout';
import Home from './views/Home';
import Phonetics from './views/Phonetics';
import Literature from './views/Literature';
import Dictionary from './views/Dictionary';
import Training from './views/ProfessionalEnglish';
import Discover from './views/Discover';
import AuthGate from './components/AuthGate';
import SplashScreen from './components/SplashScreen';
import { View } from './types';

export default function App() {
  const [currentView, setCurrentView] = React.useState<View>('home');
  const [showSplash, setShowSplash] = React.useState(true);

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>
      
      {!showSplash && (
        <AuthGate>
          <Layout currentView={currentView} setView={setCurrentView}>
            {currentView === 'home' && <Home setView={setCurrentView} />}
            {currentView === 'phonetics' && <Phonetics />}
            {currentView === 'literature' && <Literature />}
            {currentView === 'dictionary' && <Dictionary />}
            {currentView === 'training' && <Training />}
            {currentView === 'discover' && <Discover />}
          </Layout>
        </AuthGate>
      )}
    </>
  );
}
