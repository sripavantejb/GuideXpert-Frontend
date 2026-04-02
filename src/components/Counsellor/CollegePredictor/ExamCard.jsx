import { getAccentClasses } from '../../../constants/examCardConfig';

export default function ExamCard({ value, label, description, accent, selected, supported = true, onSelect }) {
  const classes = getAccentClasses(accent);

  return (
    <div
      className={`
        relative rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden
        transition-all duration-300 ease-out
        ${supported ? 'hover:shadow-md hover:scale-105' : 'opacity-75'}
        ${selected ? classes.selected : ''}
      `}
    >
      {!supported && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[0.6875rem] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
            Coming Soon
          </span>
        </div>
      )}
      <div className={`${classes.strip} bg-white`} />
      <div className="p-5 pt-4 flex flex-col min-h-[200px]">
        <h3 className={`text-lg font-bold mb-2 ${supported ? 'text-gray-900' : 'text-gray-400'}`}>
          {label}
        </h3>
        <p className={`text-sm leading-relaxed flex-1 mb-4 ${supported ? 'text-gray-500' : 'text-gray-400'}`}>
          {description}
        </p>
        <button
          type="button"
          disabled={!supported}
          onClick={() => supported && onSelect(value)}
          className={`
            w-full rounded-lg px-4 py-2.5 text-sm font-semibold
            transition-colors duration-300
            ${supported
              ? classes.button
              : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
            }
          `}
        >
          {supported ? 'Predict Colleges' : 'Coming Soon'}
        </button>
      </div>
    </div>
  );
}
