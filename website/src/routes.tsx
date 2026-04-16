import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import HomeModern from './pages/HomeModern';
import HomeV2 from './pages/HomeV2';
import HomeV3 from './pages/HomeV3';
import HowItWorks from './pages/HowItWorks';
import Science from './pages/Science';
import Impressum from './pages/Impressum';
import Datenschutz from './pages/Datenschutz';
import AGB from './pages/AGB';
import HeroCompare from './pages/HeroCompare';
import NotFound from './pages/NotFound';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/modern" element={<HomeModern />} />
      <Route path="/v2" element={<HomeV2 />} />
      <Route path="/v3" element={<HomeV3 />} />
      <Route path="/wie-es-funktioniert" element={<HowItWorks />} />
      <Route path="/wissenschaft" element={<Science />} />
      <Route path="/impressum" element={<Impressum />} />
      <Route path="/datenschutz" element={<Datenschutz />} />
      <Route path="/agb" element={<AGB />} />
      <Route path="/hero-compare" element={<HeroCompare />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
