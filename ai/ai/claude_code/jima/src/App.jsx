import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SectionWrapper from './components/SectionWrapper';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

const About = lazy(() => import('./components/About'));
const Skills = lazy(() => import('./components/Skills'));
const Services = lazy(() => import('./components/Services'));
const Portfolio = lazy(() => import('./components/Portfolio'));
const SocialProof = lazy(() => import('./components/SocialProof'));
const Contact = lazy(() => import('./components/Contact'));

function SectionFallback() {
  return (
    <div className="py-24 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-cyan/30 border-t-brand-cyan rounded-full animate-spin" />
    </div>
  );
}

const sections = [
  { id: 'about', Component: About },
  { id: 'skills', Component: Skills },
  { id: 'services', Component: Services },
  { id: 'portfolio', Component: Portfolio },
  { id: 'social-proof', Component: SocialProof },
  { id: 'contact', Component: Contact },
];

function App() {
  return (
    <div className="relative">
      <Navbar />
      <Hero />
      {sections.map(({ id, Component }) => (
        <SectionWrapper key={id} id={id}>
          <Suspense fallback={<SectionFallback />}>
            <Component />
          </Suspense>
        </SectionWrapper>
      ))}
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default App;
