import { useState } from 'react';
import { HiMenu, HiX } from 'react-icons/hi';
import Button from '../UI/Button';
import ApplyFormModal from '../UI/ApplyFormModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Your Journey', href: '#journey' },
    { name: 'Why GuideXpert?', href: '#why' },
    { name: 'College Predictor', href: '#predictor' },
  ];

  const scrollToSection = (href) => {
    setIsMenuOpen(false);
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight" style={{ color: '#0f172a' }}>
                GuideXpert
              </h1>
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
                onClick={() => setIsModalOpen(true)} 
                className="bg-primary-blue-800 hover:bg-primary-blue-900 text-white px-5 py-2.5 rounded-md text-sm font-medium shadow-sm transition-all duration-300"
              >
                Apply Now
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
                    setIsModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="bg-primary-blue-800 hover:bg-primary-blue-900 text-white px-5 py-2.5 rounded-md text-sm font-medium shadow-sm"
                >
                  Apply Now
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <ApplyFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default Header;

