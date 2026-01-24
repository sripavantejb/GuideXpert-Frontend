import { FiMail, FiPhone } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const linkClass =
  'text-gray-300 hover:text-primary-blue-300 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#001a2c] rounded';

const Footer = () => {
  const quickLinks = [
    { name: 'Privacy Policy', href: '#privacy' },
    { name: 'Terms & Conditions', href: '#terms' },
    { name: 'Counselor Login', href: '#counselor-login' },
    { name: 'About GuideXpert', href: '#about' },
  ];

  return (
    <footer
      role="contentinfo"
      className="border-t-2 border-primary-blue-800 bg-[#001a2c] text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
          {/* Left — Branding and Mission */}
          <div className="md:max-w-xs">
            <a
              href="#home"
              className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#001a2c] rounded"
              aria-label="GuideXpert home"
            >
              <img
                src="https://res.cloudinary.com/dqataciy5/image/upload/v1769173121/guidexpert-logo-3Ifn2ZP2_ljlxlc.png"
                alt="GuideXpert"
                className="h-14 md:h-16 object-contain"
              />
            </a>
            <p className="mt-4 text-gray-300 text-sm leading-relaxed tracking-tight">
              Making college and course selection transparent, personalized, and
              future-ready. Empowering counselors to guide students towards
              successful careers.
            </p>
          </div>

          {/* Middle — Contact Us */}
          <div>
            <h3 className="font-satoshi font-bold text-base text-white uppercase tracking-wider mb-6">
              Contact Us
            </h3>
            <ul className="space-y-5" role="list">
              <li className="flex gap-4">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center text-gray-400" aria-hidden>
                  <FiMail className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-white text-sm">Email Support</p>
                  <a
                    href="mailto:support@guidexpert.co.in"
                    className={`text-sm mt-0.5 inline-block ${linkClass}`}
                  >
                    support@guidexpert.co.in
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center text-gray-400" aria-hidden>
                  <FiPhone className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-white text-sm">Phone Support</p>
                  <a
                    href="tel:+918143266699"
                    className={`text-sm mt-0.5 inline-block ${linkClass}`}
                  >
                    +91 81432 66699
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center text-gray-400" aria-hidden>
                  <FaWhatsapp className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-white text-sm">WhatsApp</p>
                  <a
                    href="https://wa.me/918143266699"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm mt-0.5 inline-block ${linkClass}`}
                  >
                    +91 81432 66699
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Right — Quick Links */}
          <div>
            <h3 className="font-satoshi font-bold text-base text-white uppercase tracking-wider mb-6">
              Quick Links
            </h3>
            <ul className="space-y-3.5" role="list">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className={`text-sm ${linkClass}`}>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar — Copyright and features */}
        <div className="mt-12 pt-6 border-t border-white/8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-gray-500 text-xs tracking-tight">
            © {new Date().getFullYear()} GuideXpert. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs tracking-wide text-center md:text-right">
            Trusted by thousands of counselors · PAN‑India presence · Professional certification
          </p>
        </div>

        {/* Quote / positioning statement */}
        <blockquote className="mt-8 rounded-r-lg border-l-4 border-primary-blue-500 bg-[#252d3a] pl-5 pr-6 py-4">
          <p className="text-gray-200 text-sm md:text-base italic leading-relaxed m-0">
            Empowering counselors to transform student lives through transparent,
            personalized career guidance that shapes successful futures.
          </p>
        </blockquote>
      </div>
    </footer>
  );
};

export default Footer;
