import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-display">Hier ist Ronki nicht zu Hause.</h1>
      <p>Die Seite, die du suchst, gibt es nicht.</p>
      <Link to="/" className="underline">Zurück zur Startseite</Link>
    </main>
  );
}
