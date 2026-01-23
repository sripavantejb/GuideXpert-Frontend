import { useState } from 'react';

const Accordion = ({ items, className = '' }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-xl overflow-hidden bg-white transition-all duration-300 hover:shadow-md"
          style={{
            boxShadow: openIndex === index 
              ? '0 4px 12px rgba(0, 0, 0, 0.08)' 
              : '0 1px 3px rgba(0, 0, 0, 0.05)',
            borderRadius: '0.75rem'
          }}
        >
          <button
            onClick={() => toggleItem(index)}
            className="w-full px-6 py-5 flex justify-between items-center bg-white hover:bg-gray-50 transition-all duration-200"
            style={{
              borderBottom: openIndex === index ? '1px solid #e5e7eb' : 'none'
            }}
          >
            <span 
              className="font-semibold text-left pr-4 transition-colors duration-200"
              style={{
                fontWeight: '600',
                color: openIndex === index ? '#0f172a' : '#374151',
                fontSize: '16px',
                lineHeight: '1.5'
              }}
            >
              {item.title}
            </span>
            <span
              className="text-xl transition-all duration-300 flex-shrink-0"
              style={{
                color: '#7c3aed',
                transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            >
              ▼
            </span>
          </button>
          {openIndex === index && (
            <div 
              className="px-6 py-5 bg-gray-50 animate-fade-in"
              style={{
                backgroundColor: '#f9fafb',
                color: '#475569',
                lineHeight: '1.7',
                fontSize: '15px'
              }}
            >
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Accordion;

