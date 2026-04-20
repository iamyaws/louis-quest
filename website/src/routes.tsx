import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Home loads eagerly — it's the landing page
import Home from './pages/Home';

// Everything else lazy-loaded
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Science = lazy(() => import('./pages/Science'));
const FuerEltern = lazy(() => import('./pages/FuerEltern'));
const FAQ_Page = lazy(() => import('./pages/FAQ_Page'));
const Vorlagen = lazy(() => import('./pages/Vorlagen'));
const VorlageMorgen = lazy(() => import('./pages/VorlageMorgen'));
const VorlageAbend = lazy(() => import('./pages/VorlageAbend'));
const VorlageKleineGeschwister = lazy(() => import('./pages/VorlageKleineGeschwister'));
const HomeEN = lazy(() => import('./pages/HomeEN'));
const Installieren = lazy(() => import('./pages/Installieren'));
const Ratgeber = lazy(() => import('./pages/Ratgeber'));
// Private print-only utility pages; not in footer, not in sitemap, not in robots.
const PrintA6Flyer = lazy(() => import('./pages/PrintA6Flyer'));
const PrintA4Poster = lazy(() => import('./pages/PrintA4Poster'));
const PrintA4PosterHort = lazy(() => import('./pages/PrintA4PosterHort'));
const PrintA4PosterBaeckerei = lazy(() => import('./pages/PrintA4PosterBaeckerei'));
const PrintA4PosterKinderarzt = lazy(() => import('./pages/PrintA4PosterKinderarzt'));
const PrintA4PosterZaehne = lazy(() => import('./pages/PrintA4PosterZaehne'));
const PrintA4PosterAntiEngagement = lazy(() => import('./pages/PrintA4PosterAntiEngagement'));
const RatgeberMorgenTroedeln = lazy(() => import('./pages/ratgeber/MorgenTroedeln'));
const RatgeberStickerChartAlternative = lazy(() => import('./pages/ratgeber/StickerChartAlternative'));
const RatgeberDarkPatternsKinderApps = lazy(() => import('./pages/ratgeber/DarkPatternsKinderApps'));
const RatgeberAbendroutineGrundschulkind = lazy(() => import('./pages/ratgeber/AbendroutineGrundschulkind'));
const RatgeberZaehneputzenOhneStreit = lazy(() => import('./pages/ratgeber/ZaehneputzenOhneStreit'));
const RatgeberEinschulungSelbststaendigkeit = lazy(() => import('./pages/ratgeber/EinschulungSelbststaendigkeit'));
const RatgeberMorgenroutineGrundschulkind = lazy(() => import('./pages/ratgeber/MorgenroutineGrundschulkind'));
const Impressum = lazy(() => import('./pages/Impressum'));
const Datenschutz = lazy(() => import('./pages/Datenschutz'));
const AGB = lazy(() => import('./pages/AGB'));
const HeroCompare = lazy(() => import('./pages/HeroCompare'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Test variants — only loaded if someone navigates to them
const HomeModern = lazy(() => import('./pages/HomeModern'));
const HomeV2 = lazy(() => import('./pages/HomeV2'));
const HomeV3 = lazy(() => import('./pages/HomeV3'));
const AltFeatureHighlight = lazy(() => import('./pages/AltFeatureHighlight'));
const AltRoutineCards = lazy(() => import('./pages/AltRoutineCards'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-6 h-6 rounded-full border-2 border-teal/20 border-t-teal animate-spin" />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/modern" element={<HomeModern />} />
        <Route path="/v2" element={<HomeV2 />} />
        <Route path="/v3" element={<HomeV3 />} />
        <Route path="/wie-es-funktioniert" element={<HowItWorks />} />
        <Route path="/wissenschaft" element={<Science />} />
        <Route path="/fuer-eltern" element={<FuerEltern />} />
        <Route path="/faq" element={<FAQ_Page />} />
        <Route path="/vorlagen" element={<Vorlagen />} />
        <Route path="/vorlagen/morgenroutine" element={<VorlageMorgen />} />
        <Route path="/vorlagen/abendroutine" element={<VorlageAbend />} />
        <Route path="/vorlagen/kleine-geschwister" element={<VorlageKleineGeschwister />} />
        <Route path="/installieren" element={<Installieren />} />
        <Route path="/print/a6-flyer" element={<PrintA6Flyer />} />
        <Route path="/print/a4-poster" element={<PrintA4Poster />} />
        <Route path="/print/a4-poster-hort" element={<PrintA4PosterHort />} />
        <Route path="/print/a4-poster-baeckerei" element={<PrintA4PosterBaeckerei />} />
        <Route path="/print/a4-poster-kinderarzt" element={<PrintA4PosterKinderarzt />} />
        <Route path="/print/a4-poster-zaehne" element={<PrintA4PosterZaehne />} />
        <Route path="/print/a4-poster-anti-engagement" element={<PrintA4PosterAntiEngagement />} />
        <Route path="/ratgeber" element={<Ratgeber />} />
        <Route path="/ratgeber/morgen-troedeln" element={<RatgeberMorgenTroedeln />} />
        <Route path="/ratgeber/sticker-chart-alternative" element={<RatgeberStickerChartAlternative />} />
        <Route path="/ratgeber/dark-patterns-kinder-apps" element={<RatgeberDarkPatternsKinderApps />} />
        <Route path="/ratgeber/abendroutine-grundschulkind" element={<RatgeberAbendroutineGrundschulkind />} />
        <Route path="/ratgeber/zaehneputzen-ohne-streit" element={<RatgeberZaehneputzenOhneStreit />} />
        <Route path="/ratgeber/einschulung-selbststaendigkeit" element={<RatgeberEinschulungSelbststaendigkeit />} />
        <Route path="/ratgeber/morgenroutine-grundschulkind" element={<RatgeberMorgenroutineGrundschulkind />} />
        <Route path="/en" element={<HomeEN />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/datenschutz" element={<Datenschutz />} />
        <Route path="/agb" element={<AGB />} />
        <Route path="/hero-compare" element={<HeroCompare />} />
        <Route path="/alt/highlight" element={<AltFeatureHighlight />} />
        <Route path="/alt/routines" element={<AltRoutineCards />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
