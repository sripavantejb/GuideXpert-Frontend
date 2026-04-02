/**
 * Tailwind class groups for exam cards — keyed by ENTRANCE_EXAMS[].accent
 */
export const EXAM_ACCENT_CLASSES = {
  blue: {
    strip: 'border-t-4 border-blue-500',
    selected: 'ring-2 ring-blue-200 border-blue-200',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  indigo: {
    strip: 'border-t-4 border-indigo-500',
    selected: 'ring-2 ring-indigo-200 border-indigo-200',
    button: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  },
  teal: {
    strip: 'border-t-4 border-teal-500',
    selected: 'ring-2 ring-teal-200 border-teal-200',
    button: 'bg-teal-600 hover:bg-teal-700 text-white',
  },
  green: {
    strip: 'border-t-4 border-emerald-500',
    selected: 'ring-2 ring-emerald-200 border-emerald-200',
    button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  orange: {
    strip: 'border-t-4 border-orange-500',
    selected: 'ring-2 ring-orange-200 border-orange-200',
    button: 'bg-orange-600 hover:bg-orange-700 text-white',
  },
  purple: {
    strip: 'border-t-4 border-purple-500',
    selected: 'ring-2 ring-purple-200 border-purple-200',
    button: 'bg-purple-600 hover:bg-purple-700 text-white',
  },
};

export function getAccentClasses(accent) {
  return EXAM_ACCENT_CLASSES[accent] || EXAM_ACCENT_CLASSES.blue;
}
