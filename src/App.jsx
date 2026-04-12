import React, { useState } from 'react';
import { TaskProvider, useTask } from './context/TaskContext';
import TopBar from './components/TopBar';
import NavBar from './components/NavBar';
import TaskList from './components/TaskList';
import Belohnungsbank from './components/Belohnungsbank';
import Hub from './components/Hub';

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
      {view !== 'hub' && <TopBar />}
      <div className={`min-h-screen max-w-lg mx-auto ${view === 'hub' ? '' : 'bg-surface'}`}
           style={{ paddingTop: view === 'hub' ? 0 : 72, paddingBottom: 96 }}>
        {view === 'quests' && <TaskList />}
        {view === 'shop' && <Belohnungsbank />}
        {view === 'hub' && <Hub />}
        {view === 'room' && (
          <div className="px-6 pt-8 text-center">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">potted_plant</span>
            <p className="font-headline text-xl text-on-surface-variant">Zimmer — Coming Soon</p>
          </div>
        )}
        {view === 'journal' && (
          <div className="px-6 pt-8 text-center">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">menu_book</span>
            <p className="font-headline text-xl text-on-surface-variant">Journal — Coming Soon</p>
          </div>
        )}
      </div>
      <NavBar active={view} onNavigate={setView} />
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
