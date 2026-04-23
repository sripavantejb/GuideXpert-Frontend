import { FiMail, FiPhone, FiHelpCircle } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function Help() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900" style={{ fontSize: '1.25rem', color: '#003366' }}>
          Help & Support
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Get in touch with our team for any questions or assistance</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <FiHelpCircle className="w-4 h-4" /> Contact Us
        </h3>
        <ul className="space-y-4" role="list">
          <li className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-navy/10 text-primary-navy mt-0.5" aria-hidden>
              <FiMail className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-800 text-sm mb-1">Email Support</p>
              <a
                href="mailto:support@guidexpert.co.in"
                className="text-sm text-[#003366] hover:underline focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:ring-offset-1 rounded"
              >
                support@guidexpert.co.in
              </a>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-navy/10 text-primary-navy mt-0.5" aria-hidden>
              <FiPhone className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-800 text-sm mb-1">Phone Support</p>
              <a
                href="tel:+916304153859"
                className="text-sm text-[#003366] hover:underline focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:ring-offset-1 rounded"
              >
                +91 6304-153859
              </a>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-navy/10 text-primary-navy mt-0.5" aria-hidden>
              <FaWhatsapp className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-800 text-sm mb-1">WhatsApp</p>
              <a
                href="https://wa.me/916304153659"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#003366] hover:underline focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:ring-offset-1 rounded"
              >
                +91 6304-153659
              </a>
            </div>
          </li>
        </ul>
        <p className="mt-5 text-sm text-gray-500">
          We typically respond within 24 hours. For urgent matters, please use WhatsApp or call us.
        </p>
      </div>
    </div>
  );
}
