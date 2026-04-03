import { Link } from 'react-router-dom';
import StudentWorkspaceNavbar from '../../components/studentDashboard/StudentWorkspaceNavbar';
import StudentWorkspaceFooter from '../../components/studentDashboard/StudentWorkspaceFooter';

const TEST_CARDS = [
  {
    title: 'Course Fit Test',
    description: 'Understand which courses align with your aptitude and interests.',
    to: '/students/course-fit-test',
  },
  {
    title: 'College Fit Test',
    description: 'Find colleges that match your budget, campus style, and goals.',
    to: '/students/college-fit-test',
  },
];

export default function TestsHubPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <StudentWorkspaceNavbar />
      <main className="student-tool-page-shell relative flex min-h-0 flex-1 flex-col">
        <div className="mx-auto w-full min-w-0 max-w-7xl shrink-0 px-4 pt-5 pb-3 sm:px-6 sm:pt-8 sm:pb-6 lg:px-8">
          <section className="rounded-[14px] border-[3px] border-black bg-[#0B0E14] p-5 shadow-[4px_4px_0_#000] sm:p-8 lg:p-10">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Fit tests hub</p>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl md:text-4xl">Student fit tests</h1>
            <p className="mt-2 max-w-2xl text-sm font-normal leading-relaxed text-slate-300 sm:text-base">
              Explore guided tests to understand your course and college fit.
            </p>
          </section>
        </div>

        <div className="mx-auto flex min-h-0 w-full min-w-0 max-w-7xl flex-1 flex-col px-4 pb-8 pt-2 sm:px-6 sm:pb-10 sm:pt-4 lg:px-8 lg:pb-12">
          <section className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
              {TEST_CARDS.map((card) => (
                <article
                  key={card.title}
                  className="flex min-w-0 flex-col rounded-[12px] border-[3px] border-black bg-white p-4 shadow-[4px_4px_0_#000] sm:p-6"
                >
                  <h2 className="text-lg font-black tracking-tight text-[#0F172A]">{card.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{card.description}</p>
                  <Link
                    to={card.to}
                    className="mt-5 inline-flex w-full min-h-[44px] items-center justify-center rounded-[10px] border-[3px] border-black bg-[#c7f36b] px-4 text-sm font-black text-[#0F172A] shadow-[3px_3px_0_#000] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none sm:w-auto sm:min-w-[160px]"
                  >
                    Open tool
                  </Link>
                </article>
              ))}
          </section>
        </div>
      </main>
      <StudentWorkspaceFooter />
    </div>
  );
}
