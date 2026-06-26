/** Verified workspace imagery — primary + fallback URLs per slot */
const u = (id, w = 1200, h) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ''}&q=80`;

export const WORKSPACE_IMAGES = {
  bannerRank: [u('1523240795612-9a054b0db644', 1400, 320), u('1509062522246-3755977927d7', 1400, 320)],
  bannerCollege: [u('1562774053-701939374585', 1400, 320), u('1541339907198-e08756dedf3f', 1400, 320)],
  bannerNiat: [u('1616486338812-3dadae4b4ace', 1400, 320), u('1497366216548-37526070297c', 1400, 320)],
  updateJee: [u('1524178232363-1fb2b075b655', 240, 160), u('1427504494785-3a9ca7044f45', 240, 160)],
  updateEamcet: [u('1541339907198-e08756dedf3f', 240, 160), u('1562774053-701939374585', 240, 160)],
  updateCompare: [u('1498243691581-b145c3f54a5a', 240, 160), u('1523240795612-9a054b0db644', 240, 160)],
  updateFitCourse: [u('1427504494785-3a9ca7044f45', 240, 160), u('1522202176988-66273c2fd55f', 240, 160)],
  updateNiat: [u('1497366216548-37526070297c', 240, 160), u('1616486338812-3dadae4b4ace', 240, 160)],
  outcomeJee: [u('1498243691581-b145c3f54a5a', 800, 500), u('1524178232363-1fb2b075b655', 800, 500)],
  outcomeEamcet: [u('1562774053-701939374585', 800, 500), u('1541339907198-e08756dedf3f', 800, 500)],
  outcomePercentile: [u('1523240795612-9a054b0db644', 800, 500), u('1509062522246-3755977927d7', 800, 500)],
  outcomeTs: [u('1541339907198-e08756dedf3f', 800, 500), u('1562774053-701939374585', 800, 500)],
  outcomeKcet: [u('1524178232363-1fb2b075b655', 800, 500), u('1481627834876-b7833e8f5570', 800, 500)],
  outcomeNiat: [u('1616486338812-3dadae4b4ace', 800, 500), u('1497366216548-37526070297c', 800, 500)],
};

export const OUTCOME_IMAGES = {
  1: WORKSPACE_IMAGES.outcomeJee,
  2: WORKSPACE_IMAGES.outcomeEamcet,
  3: WORKSPACE_IMAGES.outcomePercentile,
  4: WORKSPACE_IMAGES.outcomeTs,
  5: WORKSPACE_IMAGES.outcomeKcet,
  6: WORKSPACE_IMAGES.outcomeNiat,
};
