export const SECTION_THEMES = {
  dark: {
    band: 'bg-slate-900 text-white',
    gradient:
      'radial-gradient(ellipse 70% 55% at 100% 0%, rgba(52, 211, 153, 0.1), transparent 55%), radial-gradient(ellipse 50% 40% at 0% 100%, rgba(59, 130, 246, 0.07), transparent 50%)',
    gridOpacity: 'opacity-[0.12]',
    gridColor: 'rgba(255,255,255,0.06)',
    headerBorder: 'border-white/10',
    title: 'text-white',
    description: 'text-slate-400',
    count: 'text-slate-500',
    card: 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07] focus-visible:ring-emerald-400/50 focus-visible:ring-offset-slate-900',
    cardTitle: 'text-white',
    cardDescription: 'text-slate-400',
    cardCta: 'text-emerald-400',
    categoryPill: 'bg-white/10 text-slate-300',
    searchInput:
      'border-white/15 bg-white/5 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-emerald-400/20',
    emptyState: 'border-white/15 bg-white/[0.03] text-slate-400',
  },
  light: {
    band: 'bg-gradient-to-b from-white via-slate-50/60 to-white text-slate-900',
    gradient:
      'radial-gradient(ellipse 65% 50% at 0% 0%, rgba(16, 185, 129, 0.06), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 80%, rgba(15, 23, 42, 0.03), transparent 50%)',
    gridOpacity: 'opacity-[0.4]',
    gridColor: 'rgba(148, 163, 184, 0.1)',
    headerBorder: 'border-slate-200',
    title: 'text-slate-900',
    description: 'text-slate-500',
    count: 'text-slate-400',
    card: 'border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:shadow-md focus-visible:ring-emerald-500/40 focus-visible:ring-offset-white',
    cardTitle: 'text-slate-900',
    cardDescription: 'text-slate-500',
    cardCta: 'text-emerald-600',
    categoryPill: 'bg-slate-100 text-slate-500',
    searchInput:
      'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 shadow-sm',
    emptyState: 'border-dashed border-slate-300 bg-white text-slate-500',
  },
};

export function getSectionTheme(index) {
  return index % 2 === 0 ? 'dark' : 'light';
}
