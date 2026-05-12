import React from 'react';
import { AnimatePresence } from 'motion/react';
import Layout from './components/Layout';
import Home from './views/Home';
import Phonetics from './views/Phonetics';
import Literature from './views/Literature';
import Dictionary from './views/Dictionary';
import Training from './views/ProfessionalEnglish';
import Discover from './views/Discover';
import GuestGate from './components/GuestGate';
import SplashScreen from './components/SplashScreen';
import ErrorBoundary from './components/ErrorBoundary';
import { View, Department } from './types';

export default function App() {
  const [currentView, setCurrentView] = React.useState<View>('home');
  const [showSplash, setShowSplash] = React.useState(true);
  const [trainingDept, setTrainingDept] = React.useState<Department>('english');
  const [trainingModuleId, setTrainingModuleId] = React.useState<string | null>(null);

  const navigateToTraining = (dept: Department, moduleId?: string) => {
    setTrainingDept(dept);
    if (moduleId) setTrainingModuleId(moduleId);
    setCurrentView('training');
  };

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>
      
      {!showSplash && (
        <GuestGate>
          <Layout currentView={currentView} setView={setCurrentView}>
            {currentView === 'home' && <Home setView={setCurrentView} onNavigateToTraining={navigateToTraining} />}
            {currentView === 'phonetics' && <Phonetics />}
            {currentView === 'literature' && <Literature />}
            {currentView === 'dictionary' && <Dictionary />}
            {currentView === 'training' && (
              <Training 
                initialDept={trainingDept} 
                initialModuleId={trainingModuleId}
                onDeptChange={setTrainingDept}
                onModuleChange={setTrainingModuleId}
              />
            )}
            {currentView === 'discover' && <Discover />}
          </Layout>
        </GuestGate>
      )}
    </ErrorBoundary>
  );
}
