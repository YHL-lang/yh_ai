import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SectionWrapper from './components/SectionWrapper';
import About from './components/About';
import Skills from './components/Skills';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import SocialProof from './components/SocialProof';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <div className="relative">
      <Navbar />
      <Hero />
      <SectionWrapper id="about">
        <About />
      </SectionWrapper>
      <SectionWrapper id="skills">
        <Skills />
      </SectionWrapper>
      <SectionWrapper id="services">
        <Services />
      </SectionWrapper>
      <SectionWrapper id="portfolio">
        <Portfolio />
      </SectionWrapper>
      <SectionWrapper id="social-proof">
        <SocialProof />
      </SectionWrapper>
      <SectionWrapper id="contact">
        <Contact />
      </SectionWrapper>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default App;
