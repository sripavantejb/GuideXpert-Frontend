import './Loader.css';

const sizeMap = {
  small: 'loader--small',
  medium: 'loader--medium',
  large: 'loader--large',
};

const Loader = ({ size = 'medium', className = '', ...props }) => {
  const sizeClass = sizeMap[size] || sizeMap.medium;
  return (
    <span
      className={`loader ${sizeClass} ${className}`.trim()}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <span className="loader-spinner" aria-hidden />
    </span>
  );
};

export default Loader;
