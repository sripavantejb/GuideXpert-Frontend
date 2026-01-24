import { useState } from 'react';
import { HiMenu, HiX } from 'react-icons/hi';
import Button from '../UI/Button';
import ShinyText from '../UI/ShinyText';
import { useApplyModal } from '../../contexts/useApplyModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { openApplyModal } = useApplyModal();

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Your Journey', href: '#journey' },
    { name: 'Why GuideXpert?', href: '#why' },
    { name: 'Tools', href: '#predictor' },
  ];

  const scrollToSection = (href) => {
    setIsMenuOpen(false);
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        // Get header height to account for sticky header
        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 80;
        
        // Calculate the position with offset
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerHeight - 20; // 20px extra padding
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <button
                onClick={scrollToTop}
                className="flex items-center focus:outline-none transition-opacity duration-200 hover:opacity-80"
                aria-label="Go to top"
              >
                <img
                  src="https://res.cloudinary.com/dqataciy5/image/upload/v1769173121/guidexpert-logo-3Ifn2ZP2_ljlxlc.png"
                  alt="GuideXpert Logo"
                  className="h-28 md:h-40 object-contain"
                />
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8 items-center">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href);
                  }}
                  className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors duration-300"
                >
                  {link.name}
                </a>
              ))}
              <Button 
                onClick={openApplyModal} 
                className="bg-primary-blue-800 hover:bg-primary-blue-900 text-white px-5 py-2.5 rounded-md text-sm font-bold shadow-sm transition-all duration-300"
              >
                <ShinyText
                  text="Apply Now"
                  speed={2}
                  delay={0}
                  color="#ffffff"
                  shineColor="#e0ebff"
                  spread={120}
                  direction="left"
                  yoyo={false}
                  pauseOnHover={false}
                  disabled={false}
                />
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-600 hover:text-gray-900 transition-colors p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <HiX className="w-6 h-6" />
              ) : (
                <HiMenu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-gray-200">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href);
                  }}
                  className="block text-gray-600 hover:text-gray-900 font-medium transition-colors py-2 px-2 rounded-md hover:bg-gray-50"
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                <Button 
                  onClick={() => {
                    openApplyModal();
                    setIsMenuOpen(false);
                  }}
                  className="bg-primary-blue-800 hover:bg-primary-blue-900 text-white px-5 py-2.5 rounded-md text-sm font-bold shadow-sm"
                >
                  <ShinyText
                    text="Apply Now"
                    speed={2}
                    delay={0}
                    color="#ffffff"
                    shineColor="#e0ebff"
                    spread={120}
                    direction="left"
                    yoyo={false}
                    pauseOnHover={false}
                    disabled={false}
                  />
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;

