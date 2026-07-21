/** Local Pixar-style vector Lottie animations (LottieFiles Simple License). */
const base = '/students-animations';

export const STUDENT_LOTTIES = {
  rank: `${base}/analytics.json`,
  college: `${base}/reading-books.json`,
  branch: `${base}/choose-path.json`,
  counselling: `${base}/mentor.json`,
  study: `${base}/student-study.json`,
  learning: `${base}/online-learning.json`,
  chat: `${base}/team-chat.json`,
  graduation: `${base}/graduation.json`,
  success: `${base}/success.json`,
  decision: `${base}/decision.json`,
  tools: `${base}/student-study.json`,
  compare: `${base}/decision.json`,
  'fit-course': `${base}/online-learning.json`,
  'fit-college': `${base}/reading-books.json`,
  deadline: `${base}/success.json`,
  cta: `${base}/graduation.json`,
  heroCollege: `${base}/reading-books.json`,
  heroRank: `${base}/analytics.json`,
  heroFit: `${base}/student-study.json`,
};

export const HERO_SLIDE_LOTTIES = {
  'college-opportunities': STUDENT_LOTTIES.heroCollege,
  'rank-clarity': STUDENT_LOTTIES.heroRank,
  'fit-path': STUDENT_LOTTIES.heroFit,
};
