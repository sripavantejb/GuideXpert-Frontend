import { useState } from 'react';
import { COURSE_FIT_QUESTIONS, scoreCourseFit } from '../../data/studentDashboardMock';

export default function CourseFitQuiz() {
  const [answers, setAnswers] = useState({ q1: null, q2: null, q3: null });
  const [courses, setCourses] = useState(null);

  const setAnswer = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const submit = () => {
    if (answers.q1 == null || answers.q2 == null || answers.q3 == null) return;
    setCourses(scoreCourseFit(answers));
  };

  return (
    <section
      id="course-fit"
      className="scroll-mt-24 border-b-2 border-black bg-white px-4 py-14 sm:px-6 lg:px-8"
      aria-labelledby="course-fit-heading"
    >
      <div className="mx-auto max-w-3xl">
        <h2
          id="course-fit-heading"
          className="sd-font-display text-2xl font-extrabold text-[#0F172A] sm:text-3xl"
          style={{ fontWeight: 800 }}
        >
          Course Fit Test
        </h2>
        <p className="mt-2 text-slate-600">Answer three quick questions—we highlight best-fit courses (demo).</p>
        <div className="mt-8 space-y-6">
          {COURSE_FIT_QUESTIONS.map((q, idx) => (
            <fieldset
              key={q.id}
              className="sd-card-brutal bg-[#F8FAFC] p-6"
            >
              <legend className="sr-only">
                Question {idx + 1}
              </legend>
              <div className="mb-3 h-1.5 w-24 rounded-full border border-black bg-[#FFE89A]" />
              <p className="text-lg font-bold text-[#0F172A]">{q.text}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {q.options.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setAnswer(q.id, opt.value)}
                    className={`rounded-xl border-2 border-black px-4 py-2 text-sm font-bold transition ${
                      answers[q.id] === opt.value
                        ? 'bg-[#C7F36B] shadow-[4px_4px_0_#000]'
                        : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
          <button type="button" className="sd-btn-primary" onClick={submit}>
            See best courses
          </button>
        </div>
        {courses && (
          <div
            key={courses.join(',')}
            className="sd-result-fade-in sd-card-brutal mt-10 overflow-hidden border-2 border-black bg-gradient-to-br from-[#F7B5B5]/50 to-[#C7F36B]/40 p-8 shadow-[4px_4px_0_#000]"
          >
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#0F172A]">Best courses</p>
            <ul className="mt-4 space-y-3">
              {courses.map((c) => (
                <li
                  key={c}
                  className="sd-font-display rounded-xl border-2 border-black bg-white px-4 py-3 text-xl font-extrabold text-[#0F172A]"
                >
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
