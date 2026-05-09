import React from 'react';
import Layout from './components/Layout';
import Home from './views/Home';
import Phonetics from './views/Phonetics';
import Literature from './views/Literature';
import Dictionary from './views/Dictionary';
import Training from './views/ProfessionalEnglish';
import { View } from './types';

export default function App() {
  const [currentView, setCurrentView] = React.useState<View>('home');

  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      {currentView === 'home' && <Home setView={setCurrentView} />}
      {currentView === 'phonetics' && <Phonetics />}
      {currentView === 'literature' && <Literature />}
      {currentView === 'dictionary' && <Dictionary />}
      {currentView === 'training' && <Training />}
    </Layout>
  );
}
