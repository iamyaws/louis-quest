import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import Science from './pages/Science';
import Impressum from './pages/Impressum';
import Datenschutz from './pages/Datenschutz';
import NotFound from './pages/NotFound';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/wie-es-funktioniert" element={<HowItWorks />} />
      <Route path="/wissenschaft" element={<Science />} />
      <Route path="/impressum" element={<Impressum />} />
      <Route path="/datenschutz" element={<Datenschutz />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
