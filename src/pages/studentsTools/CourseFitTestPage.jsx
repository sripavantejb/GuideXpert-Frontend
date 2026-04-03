import { useRef, useState } from 'react';
import ToolWorkspaceLayout from './components/ToolWorkspaceLayout';

const QUESTIONS = [
  'I prefer solving mathematical equations over writing essays.',
  'I enjoy building or configuring software/hardware systems.',
  'I am comfortable with structured logic and problem solving.',
  'I like working on practical projects more than theory alone.',
];

export default function CourseFitTestPage() {
  const [started, setStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [result, setResult] = useState(null);
  const resultsRef = useRef(null);

  const handleAnswer = () => {
    if (!started) setStarted(true);
    if (questionIndex < QUESTIONS.length - 1) {
      setQuestionIndex((prev) => prev + 1);
      return;
    }
    setResult(['Computer Science', 'Data Science', 'AI']);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  return (
    <ToolWorkspaceLayout
      title="Course Fit Test"
      subtitle="Take a short preference quiz to identify courses aligned with your strengths."
      compactHero
      howItWorks={[
        'Each answer updates your fit profile across aptitude and interest dimensions.',
        'The scoring model maps your profile to course archetypes.',
        'Final recommendations prioritize courses with the strongest fit score.',
      ]}
      whatThisToolDoes={[
        'Analyzes your response pattern to recommend suitable course pathways.',
        'Gives direction for choosing programs that fit your aptitude and interests.',
      ]}
      inputGuide={[
        'Agree / Disagree: Choose the option that best represents your preference.',
        'Progress Indicator: Shows which question number you are on in the test flow.',
      ]}
      preview={
        <div className="space-y-2 text-sm font-bold">
          <p>Questions: 10 (demo set enabled)</p>
          <p>Output: Top 3 course matches</p>
        </div>
      }
      results={
        result ? (
          <section ref={resultsRef} className="rounded-[14px] border-2 border-black bg-[#c7f36b]/35 p-6 shadow-[4px_4px_0px_#000]">
            <h2 className="text-2xl font-black text-[#0F172A]">Results Panel</h2>
            <p className="mt-1 text-sm text-slate-600">How to read this result: recommendations are ranked by overall fit from your quiz responses.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {result.map((course) => (
                <article key={course} className="rounded-[12px] border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000]">
                  <p className="text-sm font-black text-[#0F172A]">{course}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null
      }
      insights={
        result ? (
          <section className="rounded-[14px] border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000]">
            <h3 className="text-xl font-black text-[#0F172A]">Next Step Suggestions</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>Pick one primary and one backup course path for applications.</li>
              <li>Review college curriculum depth for your top recommended courses.</li>
            </ul>
          </section>
        ) : null
      }
    >
      <h2 className="text-2xl font-black text-[#0F172A]">Input Workspace</h2>
      <p className="mt-1 text-sm text-slate-600">Click Start Test and answer each question to access your course-fit result.</p>
      <div className="mt-5 rounded-[12px] border-2 border-black bg-slate-50 p-5">
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">
          Question {Math.min(questionIndex + 1, QUESTIONS.length)} / 10
        </p>
        <p className="mt-2 text-base font-semibold text-[#0F172A]">{QUESTIONS[questionIndex]}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleAnswer}
            className="rounded-[12px] border-2 border-black bg-white px-5 py-2 text-sm font-black shadow-[3px_3px_0px_#000] transition-all hover:-translate-y-0.5"
          >
            Disagree
          </button>
          <button
            type="button"
            onClick={handleAnswer}
            className="rounded-[12px] border-2 border-black bg-[#c7f36b] px-5 py-2 text-sm font-black shadow-[3px_3px_0px_#000] transition-all hover:-translate-y-0.5"
          >
            {started ? 'Agree' : 'Start Test'}
          </button>
        </div>
      </div>
    </ToolWorkspaceLayout>
  );
}
