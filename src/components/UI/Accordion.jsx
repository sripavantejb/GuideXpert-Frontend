import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const Accordion = ({ items, className = '' }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => {
        const panelId = `accordion-panel-${index}`;
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="border border-gray-200 rounded-xl overflow-hidden bg-white transition-all duration-300 hover:shadow-md"
            style={{
              boxShadow: isOpen ? '0 4px 12px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
              borderRadius: '0.75rem'
            }}
          >
            <button
              type="button"
              onClick={() => toggleItem(index)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="w-full px-6 py-5 flex justify-between items-center bg-white hover:bg-gray-50 transition-all duration-200"
              style={{
                borderBottom: isOpen ? '1px solid #e5e7eb' : 'none'
              }}
            >
              <span 
                className="font-semibold text-left pr-4 transition-colors duration-200"
                style={{
                  fontWeight: '600',
                  color: isOpen ? '#003366' : '#374151',
                  fontSize: '16px',
                  lineHeight: '1.5'
                }}
              >
                {item.title}
              </span>
              <FiChevronDown
                className="flex-shrink-0 transition-transform duration-300"
                style={{
                  color: '#003366',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
                aria-hidden
              />
            </button>
            {isOpen && (
              <div 
                id={panelId}
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
        );
      })}
    </div>
  );
};

export default Accordion;

