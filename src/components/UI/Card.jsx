const Card = ({ children, className = '', icon: Icon, title, description, ...props }) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 ${className}`}
      {...props}
    >
      {Icon && (
        <div className="mb-4 text-primary-blue-600 text-4xl">
          <Icon />
        </div>
      )}
      {title && (
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-gray-600">{description}</p>
      )}
      {children}
    </div>
  );
};

export default Card;

