/** Static JEE hero preview (score 180 / 300) for Students Dashboard hero card. */

const JEE_PREVIEW_SCORE = 180;
const JEE_MAX_SCORE = 300;

function jeeCollegesForScore(score) {
  if (score >= 220) {
    return [
      { name: 'IIT Bombay', course: 'CSE', chance: 'Medium', chanceColor: 'amber' },
      { name: 'IIT Madras', course: 'EE', chance: 'High', chanceColor: 'emerald' },
      { name: 'BITS Pilani', course: 'CS', chance: 'High', chanceColor: 'emerald' },
    ];
  }
  if (score >= 130) {
    return [
      { name: 'NIT Trichy', course: 'CSE', chance: 'Medium', chanceColor: 'amber' },
      { name: 'NIT Warangal', course: 'ECE', chance: 'High', chanceColor: 'emerald' },
      { name: 'IIIT Hyderabad', course: 'ECE', chance: 'Low', chanceColor: 'red' },
    ];
  }
  return [
    { name: 'COEP Pune', course: 'Mech', chance: 'High', chanceColor: 'emerald' },
    { name: 'JNTU Hyderabad', course: 'CSE', chance: 'High', chanceColor: 'emerald' },
    { name: 'DTU Delhi', course: 'ECE', chance: 'Low', chanceColor: 'red' },
  ];
}

export function getJeeHeroPreviewData(score = JEE_PREVIEW_SCORE) {
  const maxScore = JEE_MAX_SCORE;
  const estRank = Math.max(1, Math.round(150000 * Math.pow(1 - score / maxScore, 2.5)) + 120);
  const percentile = 90 + (score / maxScore) * 9.99;
  const colleges = jeeCollegesForScore(score);

  return {
    exam: 'JEE',
    score,
    maxScore,
    estRank,
    percentile,
    colleges,
    scorePercent: (score / maxScore) * 100,
  };
}

export const HERO_PREVIEW_DATA = getJeeHeroPreviewData();
