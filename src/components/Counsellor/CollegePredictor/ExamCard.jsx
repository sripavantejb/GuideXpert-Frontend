import { getAccentClasses } from '../../../constants/examCardConfig';

export default function ExamCard({ value, label, description, accent, selected, onSelect }) {
  const classes = getAccentClasses(accent);

  return (
    <div
      className={`
        rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden
        transition-all duration-300 ease-out
        hover:shadow-md hover:scale-105
        ${selected ? classes.selected : ''}
      `}
    >
      <div className={`${classes.strip} bg-white`} />
      <div className="p-5 pt-4 flex flex-col min-h-[200px]">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{label}</h3>
        <p className="text-sm text-gray-500 leading-relaxed flex-1 mb-4">{description}</p>
        <button
          type="button"
          onClick={() => onSelect(value)}
          className={`
            w-full rounded-lg px-4 py-2.5 text-sm font-semibold
            transition-colors duration-300
            ${classes.button}
          `}
        >
          Predict Colleges
        </button>
      </div>
    </div>
  );
}
