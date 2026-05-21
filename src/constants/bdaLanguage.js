export const BDA_LANGUAGES = [
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Telugu', label: 'Telugu' },
];

export function languageBadgeClass(language) {
  if (language === 'Hindi') return 'bg-orange-100 text-orange-900 border border-orange-200';
  if (language === 'Telugu') return 'bg-indigo-100 text-indigo-900 border border-indigo-200';
  return 'bg-gray-100 text-gray-700';
}
