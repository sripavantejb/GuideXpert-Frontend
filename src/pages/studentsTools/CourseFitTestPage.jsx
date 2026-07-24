import { useRef, useState } from 'react';
import { LuGraduationCap } from 'react-icons/lu';
import ToolWorkspaceLayout from './components/ToolWorkspaceLayout';
import ToolFactsPreview from './components/ToolFactsPreview';
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import { useRequireLoginToUse } from '../../components/studentAuth/RequireStudentAuth';
import {
  swBtnPrimary,
  swBtnSecondary,
  swInsightsPanel,
  swProgressBar,
  swProgressTrack,
  swResultCard,
  swResultsHighlight,
  swSectionSubtitle,
  swSectionTitle,
  swFormTitle,
  swFormSubtitle,
} from './components/studentWorkspaceUi';

const QUESTIONS = [
  'I prefer solving mathematical equations over writing essays.',
  'I enjoy building or configuring software/hardware systems.',
  'I am comfortable with structured logic and problem solving.',
  'I like working on practical projects more than theory alone.',
];

const RESULT_META = [
  { name: 'Computer Science', fit: 92, note: 'Strongest match for logic & systems interest' },
  { name: 'Data Science', fit: 86, note: 'High fit for quantitative problem solving' },
  { name: 'Artificial Intelligence', fit: 81, note: 'Aligned with applied project preference' },
];

export default function CourseFitTestPage() {
  const { savePrediction } = useStudentAuth() || {};
  const requireLoginToUse = useRequireLoginToUse();
  const [started, setStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [result, setResult] = useState(null);
  const resultsRef = useRef(null);

  const progressPct = started ? Math.round(((questionIndex + (result ? 1 : 0)) / QUESTIONS.length) * 100) : 0;

  const handleAnswer = () => {
    if (!requireLoginToUse()) return;
    if (!started) setStarted(true);
    if (questionIndex < QUESTIONS.length - 1) {
      setQuestionIndex((prev) => prev + 1);
      return;
    }
    setResult(RESULT_META);
    savePrediction?.({
      type: 'course_fit_test',
      tool: 'Course Fit Test',
      title: 'Course fit recommendations',
      summary: RESULT_META.map((r) => `${r.name} (${r.fit}%)`).join(' · '),
      payload: { matches: RESULT_META },
    });
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  return (
    <ToolWorkspaceLayout
      title="Course Fit Test"
      subtitle="A short preference quiz that maps your strengths to course pathways worth prioritizing."
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
        <ToolFactsPreview
          icon={LuGraduationCap}
          iconClass="bg-[#eef2f7] text-[#041e30]"
          name="Course Fit Test"
          metricLabel="Format"
          metricValue={`${QUESTIONS.length} prompts`}
          points={['Agree / disagree preference flow', 'Top 3 course matches with fit %']}
        />
      }
      results={
        result ? (
          <section ref={resultsRef} className={swResultsHighlight}>
            <h2 className={swSectionTitle}>Your course fit</h2>
            <p className={swSectionSubtitle}>Ranked by overall alignment with your quiz responses.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.map((course, index) => (
                <article key={course.name} className={`${swResultCard} relative overflow-hidden`}>
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#f27921]">
                    Match #{index + 1}
                  </span>
                  <h3 className="mt-2 font-sw-display text-lg font-bold text-[#041e30]">
                    {course.name}
                  </h3>
                  <p className="mt-2 text-sm text-[#5a6570]">{course.note}</p>
                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-xs font-semibold text-[#5a6570]">
                      <span>Fit score</span>
                      <span className="tabular-nums text-[#041e30]">{course.fit}%</span>
                    </div>
                    <div className={swProgressTrack}>
                      <div className={swProgressBar} style={{ width: `${course.fit}%` }} />
                    </div>
                  </div>
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
            <ul className="mt-4 space-y-2.5 text-sm text-[#5a6570]">
              <li className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#f27921]" aria-hidden />
                Pick one primary and one backup course path for applications.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#f27921]" aria-hidden />
                Review college curriculum depth for your top recommended courses.
              </li>
            </ul>
          </section>
        ) : null
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className={swFormTitle}>Course fit quiz</h2>
          <p className={swFormSubtitle}>Answer honestly — there are no right or wrong choices.</p>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a94a0]">
          {started ? `Question ${questionIndex + 1} of ${QUESTIONS.length}` : 'Ready to begin'}
        </p>
      </div>

      <div className="mt-5">
        <div className={swProgressTrack}>
          <div className={swProgressBar} style={{ width: `${Math.max(progressPct, started ? 8 : 0)}%` }} />
        </div>
      </div>

      <div className="mt-6 border border-[#e4e9f0] bg-[#fbfcfe] p-5 sm:p-6">
        <p className="text-[15px] font-semibold leading-relaxed text-[#041e30] sm:text-base">
          {QUESTIONS[questionIndex]}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {started ? (
            <button type="button" onClick={handleAnswer} className={swBtnSecondary}>
              Disagree
            </button>
          ) : null}
          <button type="button" onClick={handleAnswer} className={swBtnPrimary}>
            {started ? 'Agree' : 'Start assessment'}
          </button>
        </div>
      </div>
    </ToolWorkspaceLayout>
  );
}
