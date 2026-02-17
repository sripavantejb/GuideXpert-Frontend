const ToggleSwitch = ({ checked, onChange, disabled = false, label, id }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) onChange(!checked);
    }
  };

  return (
    <label
      htmlFor={id}
      className={`flex items-center gap-3 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
      <div
        role="switch"
        tabIndex={disabled ? -1 : 0}
        aria-checked={checked}
        aria-label={label || 'Toggle'}
        onKeyDown={handleKeyDown}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ease-out
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
          ${checked ? 'bg-green-500' : 'bg-gray-200'}
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={() => {}}
          disabled={disabled}
          className="sr-only"
          tabIndex={-1}
        />
        <span
          className={`
            pointer-events-none absolute top-1 h-5 w-5 transform rounded-full bg-white shadow
            ring-0 transition duration-200 ease-out
            ${checked ? 'left-6' : 'left-1'}
          `}
        />
      </div>
    </label>
  );
};

export default ToggleSwitch;
