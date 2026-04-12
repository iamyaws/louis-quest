import React, { useState } from 'react';
import { TaskProvider, useTask } from './context/TaskContext';
import TopBar from './components/TopBar';
import NavBar from './components/NavBar';
import TaskList from './components/TaskList';
import Belohnungsbank from './components/Belohnungsbank';
import Hub from './components/Hub';
import Sanctuary from './components/Sanctuary';
import Journal from './components/Journal';
import HeldenKodex from './components/HeldenKodex';
import HeroCreator from './components/HeroCreator';

function AppContent() {
  const { loading } = useTask();
  const [view, setView] = useState('quests');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface">
        <p className="font-headline text-xl font-bold text-primary">Laden...</p>
      </div>
    );
  }

  return (
    <>
      {view === 'hero-creator' ? (
        <HeroCreator onComplete={(cfg) => { console.log('Hero config:', cfg); setView('hub'); }} />
      ) : (
        <>
          {!['hub', 'care'].includes(view) && <TopBar />}
          <div className={`min-h-screen max-w-lg mx-auto ${['hub', 'care'].includes(view) ? '' : 'bg-surface'}`}
               style={{ paddingTop: ['hub', 'care'].includes(view) ? 0 : 72, paddingBottom: 96 }}>
            {view === 'quests' && <TaskList />}
            {view === 'shop' && <Belohnungsbank />}
            {view === 'hub' && <Hub onNavigate={setView} />}
            {view === 'care' && <Sanctuary />}
            {view === 'journal' && <Journal />}
            {view === 'kodex' && <HeldenKodex />}
          </div>
          <NavBar active={view} onNavigate={setView} />
        </>
      )}
    </>
  );
}

function ErrorBoundary({ children }) {
  const [error, setError] = React.useState(null);
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-surface px-6 text-center">
        <div className="text-5xl mb-4">😿</div>
        <h2 className="font-headline text-xl font-bold text-error mb-2">Ups! Da ist etwas schiefgelaufen.</h2>
        <p className="font-body text-on-surface-variant mb-6">Keine Sorge, deine Daten sind sicher gespeichert.</p>
        <button
          onClick={() => { setError(null); window.location.reload(); }}
          className="bg-primary-container text-white px-8 py-3 rounded-full font-label font-bold"
        >
          Nochmal versuchen
        </button>
      </div>
    );
  }
  return (
    <ErrorBoundaryInner onError={setError}>
      {children}
    </ErrorBoundaryInner>
  );
}

class ErrorBoundaryInner extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(e) { return { hasError: true, error: e }; }
  componentDidCatch(e) { this.props.onError(e); }
  render() { return this.state.hasError ? null : this.props.children; }
}

export default function App() {
  return (
    <ErrorBoundary>
      <TaskProvider>
        <AppContent />
      </TaskProvider>
    </ErrorBoundary>
  );
}
