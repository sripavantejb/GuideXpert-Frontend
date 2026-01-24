import { 
  FaFacebook, 
  FaTwitter, 
  FaLinkedin, 
  FaInstagram 
} from 'react-icons/fa';

const Footer = () => {
  const companyLinks = [
    { name: 'About Us', href: '#about' },
    { name: 'Careers', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Contact Us', href: '#contact' },
  ];

  const quickLinks = [
    { name: 'Student Login', href: '#student-login' },
    { name: 'Counselor Login', href: '#counselor-login' },
    { name: 'Privacy Policy', href: '#privacy' },
    { name: 'Terms & Conditions', href: '#terms' },
  ];

  const socialLinks = [
    { icon: FaFacebook, href: '#', label: 'Facebook' },
    { icon: FaTwitter, href: '#', label: 'Twitter' },
    { icon: FaLinkedin, href: '#', label: 'LinkedIn' },
    { icon: FaInstagram, href: '#', label: 'Instagram' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {/* Left Section - Logo, Tagline, and Contact */}
          <div className="space-y-6">
          <div>
              <img
                src="https://res.cloudinary.com/dqataciy5/image/upload/v1769173121/guidexpert-logo-3Ifn2ZP2_ljlxlc.png"
                alt="GuideXpert Logo"
                className="h-28 md:h-40 mb-3 object-contain"
              />
              <p className="text-gray-300 text-sm leading-relaxed">
              Empowering students to find their dream careers.
            </p>
          </div>

            {/* Contact Information */}
            <div className="pt-4">
              <h3 className="text-white font-bold text-base mb-4">Contact</h3>
              <div className="space-y-2.5 text-sm text-gray-300">
                <p>
                  <span className="font-semibold text-white">Address:</span>{' '}
                  <a href="#" className="hover:text-white transition-colors">To be announced</a>
                </p>
                <p>
                  <span className="font-semibold text-white">Email:</span>{' '}
                  <a href="mailto:info@guidexpert.com" className="hover:text-white transition-colors">info@guidexpert.com</a>
                </p>
                <p>
                  <span className="font-semibold text-white">Phone:</span>{' '}
                  <a href="#" className="hover:text-white transition-colors">To be announced</a>
                </p>
              </div>
            </div>
          </div>

          {/* Middle Section - Company Links */}
          <div>
            <h3 className="text-white font-bold text-base mb-5">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Section - Quick Links */}
          <div>
            <h3 className="text-white font-bold text-base mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar - Copyright, Back to top & Social Media */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} GuideXpert. All rights reserved.
            </p>
            <a href="#home" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
              Back to top
            </a>
          </div>
          <div className="flex space-x-5">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="text-white hover:text-gray-300 transition-colors duration-200"
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

