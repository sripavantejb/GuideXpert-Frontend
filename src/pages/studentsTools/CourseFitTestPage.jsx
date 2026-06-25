import { useRef, useState } from 'react';
import ToolWorkspaceLayout from './components/ToolWorkspaceLayout';
import {
  swBtnPrimary,
  swBtnSecondary,
  swInsightsPanel,
  swResultCard,
  swResultsHighlight,
  swSectionSubtitle,
  swSectionTitle,
  swWorkspaceTitle,
} from './components/studentWorkspaceUi';

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
        <div className="space-y-1 text-sm text-slate-600">
          <p>Questions: <span className="font-semibold text-slate-900">10</span> (demo set)</p>
          <p>Output: <span className="font-semibold text-slate-900">Top 3 course matches</span></p>
        </div>
      }
      results={
        result ? (
          <section ref={resultsRef} className={swResultsHighlight}>
            <h2 className={swSectionTitle}>Results</h2>
            <p className={swSectionSubtitle}>Recommendations ranked by overall fit from your quiz responses.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {result.map((course) => (
                <article key={course} className={swResultCard}>
                  <p className="font-semibold text-slate-900">{course}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null
      }
      insights={
        result ? (
          <section className={swInsightsPanel}>
            <h3 className={swSectionTitle}>Next steps</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>Pick one primary and one backup course path for applications.</li>
              <li>Review college curriculum depth for your top recommended courses.</li>
            </ul>
          </section>
        ) : null
      }
    >
      <h2 className={swWorkspaceTitle}>Course fit quiz</h2>
      <p className={swSectionSubtitle}>Answer each question to access your course-fit result.</p>
      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Question {Math.min(questionIndex + 1, QUESTIONS.length)} / 10
        </p>
        <p className="mt-3 text-base font-medium text-slate-900">{QUESTIONS[questionIndex]}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={handleAnswer} className={swBtnSecondary}>
            Disagree
          </button>
          <button type="button" onClick={handleAnswer} className={swBtnPrimary}>
            {started ? 'Agree' : 'Start test'}
          </button>
        </div>
      </div>
    </ToolWorkspaceLayout>
  );
}
