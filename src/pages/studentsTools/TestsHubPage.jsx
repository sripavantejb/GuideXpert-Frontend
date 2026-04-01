import { Link } from 'react-router-dom';
import ToolNavBar from './components/ToolNavBar';

const TEST_CARDS = [
  {
    title: 'Course Fit Test',
    description: 'Understand which courses align with your aptitude and interests.',
    to: '/students/course-fit-test',
    accent: '#C7F36B',
  },
  {
    title: 'College Fit Test',
    description: 'Find colleges that match your budget, campus style, and goals.',
    to: '/students/college-fit-test',
    accent: '#B7E5FF',
  },
];

export default function TestsHubPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] px-4 py-8 sm:px-6 lg:px-8">
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="mx-auto max-w-7xl space-y-8">
        <ToolNavBar />

        <section className="rounded-[14px] border-2 border-black bg-[#0B1327] p-6 text-white shadow-[6px_6px_0px_#000]">
          <p className="mb-2 inline-flex rounded-md border border-slate-600 bg-[#1E293B] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-300">
            Discovery Tests Hub
          </p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Student Fit Tests</h1>
          <p className="mt-2 text-sm text-slate-300 sm:text-base">
            Explore guided tests to understand your course and college fit.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          {TEST_CARDS.map((card) => (
            <article
              key={card.title}
              className="rounded-[14px] border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1"
            >
              <div
                className="mb-4 h-2 rounded-full border border-black"
                style={{ backgroundColor: card.accent }}
              />
              <h2 className="text-xl font-black text-[#0F172A]">{card.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.description}</p>
              <Link
                to={card.to}
                className="mt-5 inline-flex rounded-[12px] border-2 border-black bg-[#C7F36B] px-4 py-2 text-sm font-black text-[#0F172A] shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-0.5 hover:bg-[#b0d95d]"
              >
                Open Tool -&gt;
              </Link>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
