const Card = ({ children, className = '', icon: Icon, title, description, ...props }) => {
  return (
    <div 
      className={`why-become-reason-card bg-white rounded-xl p-8 border border-gray-200 ${className}`}
      style={{
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.05)',
      }}
      {...props}
    >
      {Icon && (
        <div className="mb-6 text-primary-blue-600 flex justify-center" style={{
          fontSize: '3rem',
          color: '#2563eb'
        }}>
          <Icon />
        </div>
      )}
      {title && (
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 font-satoshi" style={{
          fontWeight: '700',
          color: '#0f172a',
          letterSpacing: '-0.01em',
          lineHeight: '1.3'
        }}>
          {title}
        </h3>
      )}
      {description && (
        <p className="text-base text-gray-700 font-santhosi leading-relaxed" style={{
          fontWeight: '500',
          color: '#475569',
          lineHeight: '1.6'
        }}>
          {description}
        </p>
      )}
      {children}
    </div>
  );
};

export default Card;

