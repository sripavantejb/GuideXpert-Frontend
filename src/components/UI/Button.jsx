const Button = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  className = '',
  type = 'button',
  ...props 
}) => {
  const baseStyles = 'px-6 py-3 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-primary-blue-600 text-white hover:bg-primary-blue-700 focus:ring-primary-blue-500',
    secondary: 'bg-accent-yellow-500 text-white hover:bg-accent-yellow-600 focus:ring-accent-yellow-500',
    outline: 'border-2 border-primary-blue-600 text-primary-blue-600 hover:bg-primary-blue-50 focus:ring-primary-blue-500',
    ghost: 'text-primary-blue-600 hover:bg-primary-blue-50 focus:ring-primary-blue-500',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

