import { useState } from 'react';
import ApplyFormModal from '../UI/ApplyFormModal';
import Button from '../UI/Button';

const ApplySection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section 
      className="py-20 md:py-28 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" style={{
            fontWeight: '700',
            letterSpacing: '-0.02em',
            color: '#0f172a',
            lineHeight: '1.1'
          }}>
            Apply to Become a GuideXpert Counselor
          </h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto" style={{
            fontWeight: '500',
            lineHeight: '1.6',
            color: '#475569'
          }}>
            Ready to embark on a rewarding journey as a certified GuideXpert Counselor? Fill out the form below to get started.
          </p>
        </div>

        <div 
          className="rounded-2xl p-12 md:p-16 text-center mx-auto relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #e0f2fe 100%)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            borderRadius: '1.5rem',
            maxWidth: '700px',
            border: '1px solid rgba(255, 255, 255, 0.5)'
          }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400 opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-400 opacity-10 rounded-full -ml-20 -mb-20"></div>
          
          <div className="relative z-10">
            <p className="text-gray-900 mb-10 leading-relaxed max-w-lg mx-auto" style={{
              fontWeight: '500',
              lineHeight: '1.7',
              color: '#1e293b',
              fontSize: '18px'
            }}>
              Take the first step towards a fulfilling career. Join our network of certified counselors and make a real difference in students' lives.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-12 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-xl"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.5)',
                fontSize: '17px',
                fontWeight: '600',
                borderRadius: '0.75rem'
              }}
            >
              Start Your Application
            </button>
          </div>
        </div>

        <ApplyFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Apply to Become a GuideXpert Counselor"
        />
      </div>
    </section>
  );
};

export default ApplySection;

