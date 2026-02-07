import { FiTarget, FiBarChart2, FiZap, FiClock, FiArrowRight } from 'react-icons/fi';

const tools = [
  {
    title: 'College Predictor',
    desc: 'Suggest colleges based on rank, region, budget and student preferences. Powered by historical data analysis.',
    icon: FiTarget,
    accuracy: '92%',
    features: ['Rank-based filtering', 'Region & budget preferences', 'Cut-off trend analysis'],
  },
  {
    title: 'Rank Predictor',
    desc: 'Predict expected rank from exam performance scores using statistical models.',
    icon: FiBarChart2,
    accuracy: '88%',
    features: ['Multi-exam support', 'Percentile mapping', 'Historical accuracy data'],
  },
  {
    title: 'Exam Predictor',
    desc: 'Suggest suitable competitive exams based on student profile, academic strengths, and career goals.',
    icon: FiZap,
    accuracy: '85%',
    features: ['Profile-based matching', 'Difficulty assessment', 'Preparation timeline'],
  },
  {
    title: 'Deadline Manager',
    desc: 'Track all important exam registrations, admission deadlines, and counseling round dates.',
    icon: FiClock,
    accuracy: null,
    features: ['Auto-reminders', 'Calendar sync', 'Priority tagging'],
  },
];

export default function Tools() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900" style={{ fontSize: '1.25rem', color: '#003366' }}>
          Assessment & Prediction Tools
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Comprehensive tools for data-driven counseling decisions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tools.map((t) => (
          <div key={t.title} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#003366]/5 flex items-center justify-center">
                <t.icon className="w-6 h-6 text-[#003366]" />
              </div>
              {t.accuracy && (
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  {t.accuracy} accuracy
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1" style={{ fontSize: '1.05rem' }}>{t.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{t.desc}</p>
            <ul className="space-y-1.5 mb-5">
              {t.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#003366]" /> {f}
                </li>
              ))}
            </ul>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#003366] text-white text-sm font-medium rounded-lg hover:bg-[#004080] transition-colors">
              Launch Tool <FiArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
