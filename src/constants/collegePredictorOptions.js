/**
 * Option lists for the College Predictor (earlywave v1/v2 API).
 * Each exam `value` must match route params and backend EXAM_API_MAP keys where applicable.
 *
 * AP EAMCET reservation codes verified against beta API: use **spaced** labels (e.g. `OC GIRLS`), not
 * Karnataka-style `1G` — `1G` returns a minimal list; AP category strings match the official EAPCET form.
 */

const CUTOFF_UPPER_BOUND = 500000;

/**
 * Convert a student's rank into a [cutoff_from, cutoff_to] range.
 * Formula reverse-engineered from CollegeDost JS bundles.
 */
export function rankToCutoff(rank) {
  const r = Number(rank);
  if (!Number.isFinite(r) || r <= 0) return [0, 0];

  let buffer;
  if (r <= 50) buffer = 3;
  else if (r <= 100) buffer = 10;
  else if (r <= 1000) buffer = 30;
  else if (r <= 5000) buffer = 50;
  else if (r <= 10000) buffer = 100;
  else if (r <= 16000) buffer = 500;
  else if (r <= 30000) buffer = 800;
  else if (r <= 50000) buffer = 1000;
  else if (r <= 100000) buffer = 1200;
  else buffer = 2000;

  return [Math.max(1, r - buffer), CUTOFF_UPPER_BOUND];
}

/** Official EAPCET-style category strings (value === label) — verified HTTP 200 on beta for AP_EAMCET + AU. */
export const AP_EAMCET_RESERVATION_OPTIONS = [
  { value: 'OC GIRLS', label: 'OC GIRLS' },
  { value: 'BCC GIRLS', label: 'BCC GIRLS' },
  { value: 'BCB BOYS', label: 'BCB BOYS' },
  { value: 'OC EWS BOYS', label: 'OC EWS BOYS' },
  { value: 'ST GIRLS', label: 'ST GIRLS' },
  { value: 'ST BOYS', label: 'ST BOYS' },
  { value: 'OC EWS GIRLS', label: 'OC EWS GIRLS' },
  { value: 'BCA GIRLS', label: 'BCA GIRLS' },
  { value: 'BCE BOYS', label: 'BCE BOYS' },
  { value: 'BCD GIRLS', label: 'BCD GIRLS' },
  { value: 'BCE GIRLS', label: 'BCE GIRLS' },
  { value: 'BCD BOYS', label: 'BCD BOYS' },
  { value: 'SC BOYS', label: 'SC BOYS' },
  { value: 'BCC BOYS', label: 'BCC BOYS' },
  { value: 'SC GIRLS', label: 'SC GIRLS' },
  { value: 'BCB GIRLS', label: 'BCB GIRLS' },
  { value: 'BCA BOYS', label: 'BCA BOYS' },
];

/**
 * AP EAMCET district filter: earlywave expects **short district_enum codes**, not full names.
 * Sending display names (e.g. "Visakhapatnam") yields a single promoted college; codes like VSP/GTR work.
 * Codes differ by counselling **region** (AU vs SVU). Derived from live API responses (district_enum).
 */
export const AP_EAMCET_DISTRICT_OPTIONS_BY_ADMISSION = {
  AU: [
    { value: 'EG', label: 'East Godavari' },
    { value: 'GTR', label: 'Guntur' },
    { value: 'KRI', label: 'Krishna' },
    { value: 'PKS', label: 'Prakasam' },
    { value: 'SKL', label: 'Srikakulam' },
    { value: 'VSP', label: 'Visakhapatnam' },
    { value: 'VZM', label: 'Vizianagaram' },
    { value: 'WG', label: 'West Godavari' },
  ],
  SVU: [
    { value: 'ATP', label: 'Anantapur' },
    { value: 'CTR', label: 'Chittoor / Tirupati' },
    { value: 'KDP', label: 'Kadapa (YSR)' },
    { value: 'KNL', label: 'Kurnool' },
    { value: 'NLR', label: 'Sri Potti Sriramulu Nellore' },
  ],
};

/** @param {string} admission AU | SVU */
export function getApEamcetDistrictOptions(admission) {
  const key = String(admission || '').trim();
  return AP_EAMCET_DISTRICT_OPTIONS_BY_ADMISSION[key] ?? AP_EAMCET_DISTRICT_OPTIONS_BY_ADMISSION.AU;
}

/**
 * TS EAMCET category strings (value === label) — verified HTTP 200 on beta for TS_EAMCET + admission **DEFAULT**.
 * Order matches reference UI. Admission must be `DEFAULT` (not GENERAL) for this exam on earlywave.
 */
export const TS_EAMCET_RESERVATION_OPTIONS = [
  { value: 'OC BOYS', label: 'OC BOYS' },
  { value: 'OC GIRLS', label: 'OC GIRLS' },
  { value: 'BCC GIRLS', label: 'BCC GIRLS' },
  { value: 'BCB BOYS', label: 'BCB BOYS' },
  { value: 'OC EWS BOYS', label: 'OC EWS BOYS' },
  { value: 'ST GIRLS', label: 'ST GIRLS' },
  { value: 'ST BOYS', label: 'ST BOYS' },
  { value: 'OC EWS GIRLS', label: 'OC EWS GIRLS' },
  { value: 'BCA GIRLS', label: 'BCA GIRLS' },
  { value: 'BCE BOYS', label: 'BCE BOYS' },
  { value: 'BCD GIRLS', label: 'BCD GIRLS' },
  { value: 'BCE GIRLS', label: 'BCE GIRLS' },
  { value: 'BCD BOYS', label: 'BCD BOYS' },
  { value: 'SC BOYS', label: 'SC BOYS' },
  { value: 'BCC BOYS', label: 'BCC BOYS' },
  { value: 'SC GIRLS', label: 'SC GIRLS' },
  { value: 'BCB GIRLS', label: 'BCB GIRLS' },
  { value: 'BCA BOYS', label: 'BCA BOYS' },
  { value: 'EWS GEN OU', label: 'EWS GEN OU' },
];

/**
 * TNEA community codes — verified HTTP 200 on beta for `TNEA` + `admission_category_name_enum: DEFAULT`
 * (GENERAL yields INVALID_ADMISSION_CATEGORY_NAME_ENUM). Values are short CAP-style codes (OC, BC, …).
 */
export const TNEA_RESERVATION_OPTIONS = [
  { value: 'OC', label: 'OC (Open Competition)' },
  { value: 'BC', label: 'BC (Backward Class)' },
  { value: 'BCM', label: 'BCM (Backward Class Muslim)' },
  { value: 'MBC', label: 'MBC (Most Backward Class)' },
  { value: 'SC', label: 'SC (Scheduled Caste)' },
  { value: 'SCA', label: 'SCA (SC – Arunthathiyar)' },
  { value: 'ST', label: 'ST (Scheduled Tribe)' },
];

/**
 * Tamil Nadu revenue districts for college-location filter (value === label).
 * Spelling aligned to `indian-states-districts.json` and earlywave sample `Chennai` (HTTP 200).
 */
export const TNEA_DISTRICT_OPTIONS = [
  { value: 'Ariyalur', label: 'Ariyalur' },
  { value: 'Chennai', label: 'Chennai' },
  { value: 'Coimbatore', label: 'Coimbatore' },
  { value: 'Cuddalore', label: 'Cuddalore' },
  { value: 'Dharmapuri', label: 'Dharmapuri' },
  { value: 'Dindigul', label: 'Dindigul' },
  { value: 'Erode', label: 'Erode' },
  { value: 'Kanchipuram', label: 'Kanchipuram' },
  { value: 'Kanyakumari', label: 'Kanyakumari' },
  { value: 'Karur', label: 'Karur' },
  { value: 'Krishnagiri', label: 'Krishnagiri' },
  { value: 'Madurai', label: 'Madurai' },
  { value: 'Nagapattinam', label: 'Nagapattinam' },
  { value: 'Namakkal', label: 'Namakkal' },
  { value: 'Nilgiris', label: 'Nilgiris' },
  { value: 'Perambalur', label: 'Perambalur' },
  { value: 'Pudukkottai', label: 'Pudukkottai' },
  { value: 'Ramanathapuram', label: 'Ramanathapuram' },
  { value: 'Salem', label: 'Salem' },
  { value: 'Sivaganga', label: 'Sivaganga' },
  { value: 'Thanjavur', label: 'Thanjavur' },
  { value: 'Theni', label: 'Theni' },
  { value: 'Thoothukudi (Tuticorin)', label: 'Thoothukudi (Tuticorin)' },
  { value: 'Tiruchirappalli', label: 'Tiruchirappalli' },
  { value: 'Tirunelveli', label: 'Tirunelveli' },
  { value: 'Tiruppur', label: 'Tiruppur' },
  { value: 'Tiruvallur', label: 'Tiruvallur' },
  { value: 'Tiruvannamalai', label: 'Tiruvannamalai' },
  { value: 'Tiruvarur', label: 'Tiruvarur' },
  { value: 'Vellore', label: 'Vellore' },
  { value: 'Viluppuram', label: 'Viluppuram' },
  { value: 'Virudhunagar', label: 'Virudhunagar' },
].sort((a, b) => a.value.localeCompare(b.value));

/**
 * KEAM category codes — verified HTTP 200 on beta for `KEAM` + `admission_category_name_enum: DEFAULT`
 * (GENERAL yields INVALID_ADMISSION_CATEGORY_NAME_ENUM). Probe: `node scripts/probeKeamPredictor.js` (GuideXpert-Backend).
 */
export const KEAM_RESERVATION_OPTIONS = [
  { value: 'SM', label: 'SM (State Merit)' },
  { value: 'EW', label: 'EW (EWS)' },
  { value: 'EZ', label: 'EZ (Ezhava)' },
  { value: 'MU', label: 'MU (Muslim)' },
  { value: 'BH', label: 'BH (Backward Hindu)' },
  { value: 'LA', label: 'LA (Latin Catholic)' },
  { value: 'DV', label: 'DV (Differently Abled)' },
  { value: 'VK', label: 'VK (Viswakarma)' },
  { value: 'KN', label: 'KN (SIUC Nadar)' },
  { value: 'BX', label: 'BX (Backward Christian)' },
  { value: 'KU', label: 'KU (Kudumbi)' },
  { value: 'ST', label: 'ST (Scheduled Tribe)' },
  { value: 'SC', label: 'SC (Scheduled Caste)' },
  { value: 'FW', label: 'FW (Forward)' },
  { value: 'YN', label: 'YN' },
  { value: 'CC', label: 'CC (Community)' },
  { value: 'MG', label: 'MG (Management)' },
];

/**
 * Kerala revenue districts for KEAM college-location filter (value === label).
 * Spelling from `indian-states-districts.json` (state: Kerala). Upstream often returns empty `district_enum`;
 * we apply `filterCollegesForKeamDistrictPredictor` on the client using address text (see `KEAM_DISTRICT_ADDRESS_KEYWORDS`).
 */
export const KEAM_DISTRICT_OPTIONS = [
  { value: 'Alappuzha', label: 'Alappuzha' },
  { value: 'Ernakulam', label: 'Ernakulam' },
  { value: 'Idukki', label: 'Idukki' },
  { value: 'Kannur', label: 'Kannur' },
  { value: 'Kasaragod', label: 'Kasaragod' },
  { value: 'Kollam', label: 'Kollam' },
  { value: 'Kottayam', label: 'Kottayam' },
  { value: 'Kozhikode', label: 'Kozhikode' },
  { value: 'Malappuram', label: 'Malappuram' },
  { value: 'Palakkad', label: 'Palakkad' },
  { value: 'Pathanamthitta', label: 'Pathanamthitta' },
  { value: 'Thiruvananthapuram', label: 'Thiruvananthapuram' },
  { value: 'Thrissur', label: 'Thrissur' },
  { value: 'Wayanad', label: 'Wayanad' },
].sort((a, b) => a.value.localeCompare(b.value));

/**
 * Maps shared `BRANCH_CODES` values to earlywave KEAM `branch_code` strings.
 * Beta KEAM data uses CIV/MEC; sending CE/ME yields zero colleges.
 */
export function mapKeamBranchCodesForApi(uiCodes) {
  if (!Array.isArray(uiCodes)) return [];
  const m = { CE: 'CIV', ME: 'MEC' };
  return uiCodes.map((c) => m[c] || c);
}

/**
 * KEAM responses often have empty `district_enum`; sending district names upstream returns 0 rows.
 * We match selected Kerala districts against `college_address` (plus `district_enum` when set).
 */
const KEAM_DISTRICT_ADDRESS_KEYWORDS = {
  Alappuzha: ['alappuzha', 'alleppey'],
  Ernakulam: ['ernakulam', 'kochi', 'cochin', 'edappally', 'aluva'],
  Idukki: ['idukki', 'munnar', 'thodupuzha'],
  Kannur: ['kannur', 'thalassery', 'payyannur'],
  Kasaragod: ['kasaragod', 'kasargod'],
  Kollam: ['kollam', 'quilon'],
  Kottayam: ['kottayam', 'pala', 'ettumanoor'],
  Kozhikode: ['kozhikode', 'calicut', 'vadakara'],
  Malappuram: ['malappuram', 'manjeri', 'tirur'],
  Palakkad: ['palakkad', 'palghat', 'ottapalam'],
  Pathanamthitta: ['pathanamthitta', 'thiruvalla'],
  Thiruvananthapuram: ['thiruvananthapuram', 'trivandrum'],
  Thrissur: ['thrissur', 'trichur', 'guruvayur'],
  Wayanad: ['wayanad', 'kalpetta', 'sulthan bathery'],
};

export function keamCollegeMatchesDistrictFilters(college, selectedDistrictValues) {
  if (!Array.isArray(selectedDistrictValues) || selectedDistrictValues.length === 0) return true;
  const hay = `${college?.college_address || ''} ${college?.district_enum || ''}`.toLowerCase();
  return selectedDistrictValues.some((dist) => {
    const keys = KEAM_DISTRICT_ADDRESS_KEYWORDS[dist] || [String(dist).toLowerCase()];
    return keys.some((k) => hay.includes(k));
  });
}

export function filterCollegesForKeamDistrictPredictor(colleges, selectedDistrictValues) {
  if (!Array.isArray(colleges)) return [];
  if (!selectedDistrictValues?.length) return colleges;
  return colleges.filter((c) => keamCollegeMatchesDistrictFilters(c, selectedDistrictValues));
}

/**
 * Telangana districts for TS EAMCET: earlywave expects **district_enum** short codes (like AP).
 * Labels aligned to TS geography; verified from TS_EAMCET + DEFAULT + OC BOYS responses on beta.
 */
/**
 * JEE base categories — the user picks one of these; the system expands it into
 * multiple quota-suffixed codes via getJeeReservationCategoryCodes() before sending.
 * value = base code used in expansion (must match upstream prefix before _QUOTA).
 */
export const JEE_RESERVATION_OPTIONS = [
  { value: 'OPEN', label: 'OPEN' },
  { value: 'OPEN (PwD)', label: 'OPEN (PwD)' },
  { value: 'EWS', label: 'EWS' },
  { value: 'EWS (PwD)', label: 'EWS (PwD)' },
  { value: 'OBC-NCL', label: 'OBC-NCL' },
  { value: 'OBC-NCL (PwD)', label: 'OBC-NCL (PwD)' },
  { value: 'SC', label: 'SC' },
  { value: 'SC (PwD)', label: 'SC (PwD)' },
  { value: 'ST', label: 'ST' },
  { value: 'ST (PwD)', label: 'ST (PwD)' },
];

/** Whitelist of valid expanded reservation codes for JEE Mains and JEE Advanced (from CollegeDost upstream). */
export const JEE_MAINS_ADVANCE_RESERVATION_QUOTAS = [
  'OPEN_HS', 'OPEN_GIRLS_HS', 'EWS_HS', 'EWS_GIRLS_HS',
  'OBC-NCL_HS', 'OBC-NCL_GIRLS_HS', 'SC_HS', 'SC_GIRLS_HS',
  'OPEN_OS', 'OPEN_GIRLS_OS', 'EWS_OS', 'OBC-NCL_OS', 'OBC-NCL_GIRLS_OS',
  'SC_OS', 'SC_GIRLS_OS', 'ST_OS', 'OBC-NCL (PwD)_GIRLS_OS',
  'OPEN (PwD)_HS', 'OPEN (PwD)_OS', 'EWS_GIRLS_OS', 'ST_GIRLS_OS',
  'EWS (PwD)_OS', 'ST_HS', 'EWS (PwD)_HS', 'SC (PwD)_HS', 'ST_GIRLS_HS',
  'OPEN (PwD)_GIRLS_OS', 'OBC-NCL (PwD)_OS', 'ST (PwD)_OS', 'SC (PwD)_OS',
  'OBC-NCL (PwD)_HS', 'OPEN (PwD)_GIRLS_HS', 'OBC-NCL (PwD)_GIRLS_HS',
  'ST (PwD)_HS', 'EWS (PwD)_GIRLS_OS', 'SC (PwD)_GIRLS_OS',
  'EWS (PwD)_GIRLS_HS', 'ST (PwD)_GIRLS_OS',
  'OPEN_GO', 'OPEN_GIRLS_GO', 'OBC-NCL_GO', 'OBC-NCL_GIRLS_GO',
  'SC_GO', 'ST_GO', 'EWS_GO', 'SC_GIRLS_GO', 'EWS_GIRLS_GO', 'ST_GIRLS_GO',
  'OPEN_JK', 'OPEN_GIRLS_JK', 'SC_JK', 'SC_GIRLS_JK', 'ST_JK', 'ST_GIRLS_JK',
  'EWS_JK', 'OBC-NCL_JK', 'OPEN_LA', 'OPEN (PwD)_JK', 'EWS_GIRLS_JK',
  'OBC-NCL_GIRLS_JK', 'OPEN_GIRLS_LA', 'OBC-NCL (PwD)_JK', 'SC (PwD)_GIRLS_HS',
  'OPEN_AI', 'OPEN_GIRLS_AI', 'OPEN (PwD)_AI', 'EWS_AI', 'EWS_GIRLS_AI',
  'OBC-NCL_AI', 'OBC-NCL_GIRLS_AI', 'OBC-NCL (PwD)_AI',
  'SC_AI', 'SC_GIRLS_AI', 'SC (PwD)_AI', 'ST_AI', 'ST_GIRLS_AI', 'ST (PwD)_AI',
  'OPEN (PwD)_GIRLS_AI', 'EWS (PwD)_AI', 'OBC-NCL (PwD)_GIRLS_AI',
  'EWS (PwD)_GIRLS_AI', 'SC (PwD)_GIRLS_AI',
];

const _jeeQuotasSet = new Set(JEE_MAINS_ADVANCE_RESERVATION_QUOTAS);

/**
 * Expand a base JEE category + gender into the array of reservation_category_codes
 * that the upstream API expects.
 *
 * @param {'JEE_MAINS_2024'|'JEE_ADVANCE_2024'|string} examEnum - upstream exam enum
 * @param {'Male'|'Female'|'male'|'female'|string} gender
 * @param {string} baseCategory - e.g. 'OPEN', 'OBC-NCL', 'SC (PwD)'
 * @returns {string[]}
 */
export function getJeeReservationCategoryCodes(examEnum, gender, baseCategory) {
  const isFemale = String(gender || '').toLowerCase() === 'female';
  const base = String(baseCategory || '').trim();
  if (!base) return [];

  if (examEnum === 'JEE_MAINS_2024') {
    const quotas = ['AI', 'GO', 'HS', 'JK', 'LA', 'OS'];
    const codes = [];
    for (const q of quotas) {
      const code = isFemale ? `${base}_GIRLS_${q}` : `${base}_${q}`;
      if (_jeeQuotasSet.has(code)) {
        codes.push(code);
      }
    }
    return codes.length > 0 ? codes : [base];
  }

  if (examEnum === 'JEE_ADVANCE_2024') {
    const code = isFemale ? `${base}_GIRLS_AI` : `${base}_AI`;
    return [code];
  }

  return [base];
}

/** Upstream nw-predictors enum; CollegeDost marketing may show WBJEE_JEE_MAINS_2024. */
export const WBJEE_API_EXAM_ENUM = 'WBJEE_2024';

/** Whitelist: earlywave WBJEE_2024 reservation_category_code values (verified on beta). */
export const WBJEE_RESERVATION_WHITELIST = [
  'TUITION_FEE_WAIVER_HS',
  'OPEN_AI',
  'OBC_B_HS',
  'OBC_A_HS',
  'OPEN_HS',
  'SC_HS',
  'ST_HS',
  'OPEN_PWD_HS',
  'SC_PWD_HS',
  'OBC_B_PWD_HS',
  'OBC_A_PWD_HS',
  'ST_AI',
];

const _wbjeeReservationSet = new Set(WBJEE_RESERVATION_WHITELIST);

/** Categories only valid with Home State (West Bengal) quota — no _AI code on upstream. */
export const WBJEE_HOME_STATE_ONLY_CATEGORY_BASES = new Set([
  'TUITION_FEE_WAIVER',
  'OPEN_PWD',
  'OBC_A_PWD',
  'OBC_B_PWD',
  'SC_PWD',
]);

export const WBJEE_QUOTA_ALL_INDIA = 'all_india';
export const WBJEE_QUOTA_HOME_WB = 'home_state_wb';

export const WBJEE_QUOTA_OPTIONS = [
  { value: WBJEE_QUOTA_ALL_INDIA, label: 'All India' },
  { value: WBJEE_QUOTA_HOME_WB, label: 'Home State (West Bengal)' },
];

/**
 * UI labels from WBJEE predictor; value = API base before _AI / _HS.
 */
export const WBJEE_CATEGORY_OPTIONS = [
  { value: 'OPEN', label: 'OPEN' },
  { value: 'OBC_A', label: 'OBC - A' },
  { value: 'SC', label: 'SC' },
  { value: 'ST', label: 'ST' },
  { value: 'TUITION_FEE_WAIVER', label: 'Tuition Fee Waiver' },
  { value: 'OBC_B', label: 'OBC - B' },
  { value: 'OPEN_PWD', label: 'Open (PwD)' },
  { value: 'OBC_A_PWD', label: 'OBC - A (PwD)' },
  { value: 'SC_PWD', label: 'SC (PwD)' },
  { value: 'OBC_B_PWD', label: 'OBC - B (PwD)' },
];

/**
 * Resolve WBJEE reservation code for earlywave from category base + quota.
 * @param {string} categoryBase
 * @param {'all_india'|'home_state_wb'} quotaKey
 * @returns {string|null}
 */
export function getWbjeeReservationCategoryCode(categoryBase, quotaKey) {
  const base = String(categoryBase ?? '').trim();
  if (!base) return null;
  if (WBJEE_HOME_STATE_ONLY_CATEGORY_BASES.has(base) && quotaKey === WBJEE_QUOTA_ALL_INDIA) {
    return null;
  }
  const suffix = quotaKey === WBJEE_QUOTA_ALL_INDIA ? 'AI' : 'HS';
  const code = `${base}_${suffix}`;
  if (!_wbjeeReservationSet.has(code)) return null;
  return code;
}

/**
 * Client-side district filter when upstream district field is unreliable (same idea as KEAM).
 */
export function wbjeeCollegeMatchesDistrictFilters(college, selectedDistrictLabels) {
  if (!Array.isArray(selectedDistrictLabels) || selectedDistrictLabels.length === 0) return true;
  const hay = `${college?.college_address || ''} ${college?.district_enum || ''} ${college?.college_name || ''}`
    .toLowerCase()
    .replace(/[.,/()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return selectedDistrictLabels.some((dist) => {
    const d = String(dist).toLowerCase().trim().replace(/[.,/()]/g, ' ').replace(/\s+/g, ' ');
    if (!d) return false;
    if (hay.includes(d)) return true;
    const token = d.split(/\s+/).find((w) => w.length >= 4);
    return Boolean(token && hay.includes(token));
  });
}

export function filterCollegesForWbjeeDistrictPredictor(colleges, selectedDistrictLabels) {
  if (!Array.isArray(colleges)) return [];
  if (!selectedDistrictLabels?.length) return colleges;
  return colleges.filter((c) => wbjeeCollegeMatchesDistrictFilters(c, selectedDistrictLabels));
}

export const TS_EAMCET_DISTRICT_OPTIONS = [
  { value: 'HNK', label: 'Hanamkonda / Warangal' },
  { value: 'HYD', label: 'Hyderabad' },
  { value: 'JTL', label: 'Jagtial' },
  { value: 'KGM', label: 'Kothagudem' },
  { value: 'KHM', label: 'Khammam' },
  { value: 'KMR', label: 'Kamareddy' },
  { value: 'KRM', label: 'Karimnagar' },
  { value: 'MBN', label: 'Mahabubnagar' },
  { value: 'MDL', label: 'Medchal Malkajgiri' },
  { value: 'MED', label: 'Medak' },
  { value: 'NLG', label: 'Nalgonda' },
  { value: 'NZB', label: 'Nizamabad' },
  { value: 'PDL', label: 'Peddapalli' },
  { value: 'RR', label: 'Rangareddy' },
  { value: 'SDP', label: 'Siddipet' },
  { value: 'SRC', label: 'Rajanna Sircilla' },
  { value: 'SRD', label: 'Suryapet (Sultanpur)' },
  { value: 'SRP', label: 'Suryapet' },
  { value: 'WGL', label: 'Warangal' },
  { value: 'WNP', label: 'Wanaparthy' },
  { value: 'YBG', label: 'Yadadri Bhuvanagiri' },
];

/** Upstream promoted slot (Hyderabad); not shown in AP EAMCET predictor results. */
const AP_EAMCET_HIDDEN_PROMOTED_COLLEGE_ID = '6f3cf78b-c152-4dad-b52a-0642baad860c';

export function shouldHideCollegeFromApEamcetPredictor(college) {
  if (!college) return false;
  if (String(college.college_id || '') === AP_EAMCET_HIDDEN_PROMOTED_COLLEGE_ID) return true;
  const name = (college.college_name || '').toLowerCase();
  return name.includes('malla reddy') && name.includes('deemed');
}

export function filterCollegesForApEamcetPredictor(colleges) {
  if (!Array.isArray(colleges)) return [];
  return colleges.filter((c) => !shouldHideCollegeFromApEamcetPredictor(c));
}

/** API total includes the hidden promoted row once; use for summary counts. */
export function apEamcetPredictorDisplayTotal(apiTotal) {
  const n = Number(apiTotal);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.max(0, n - 1);
}

/**
 * @typedef {{
 *   value: string,
 *   label: string,
 *   description: string,
 *   accent: string,
 *   apiValue: string,
 *   supported: boolean,
 *   defaultReservationCode?: string,
 *   upstreamDataNote?: string,
 *   admissionFieldLabel?: string,
 *   reservationFieldLabel?: string,
 *   rankFieldLabel?: string,
 *   reservationOptions?: { value: string, label: string }[],
 *   reservationSelectSingle?: boolean,
 *   districtOptions?: { value: string, label: string }[],
 *   districtOptionsByAdmission?: Record<string, { value: string, label: string }[]>,
 *   districtSelectionHint?: string,
 *   hideAdmissionField?: boolean,
 *   predictorPageTitle?: string,
 *   predictorPageSubtitle?: string,
 *   jeeMainApiExam?: string,
 *   jeeAdvancedApiExam?: string,
 *   wbjeeApiExam?: string,
 *   admissionCategories: { value: string, label: string }[],
 * }} EntranceExamOption
 * @type {EntranceExamOption[]}
 */
export const ENTRANCE_EXAMS = [
  {
    value: 'KCET',
    label: 'KCET',
    description: 'Predict engineering colleges in Karnataka based on your rank and preferences.',
    accent: 'blue',
    apiValue: 'KCET',
    supported: true,
    defaultReservationCode: '1G',
    admissionCategories: [
      { value: 'GENERAL', label: 'General' },
      { value: 'HK', label: 'Hyderabad-Karnataka (HK)' },
    ],
  },
  {
    value: 'MHT_CET',
    label: 'MHT CET',
    description: 'Explore Maharashtra institutes using your CET score and seat matrix.',
    accent: 'indigo',
    apiValue: 'MHTCET',
    supported: true,
    defaultReservationCode: 'GOPENS',
    predictorPageTitle: 'MHT CET College Predictor',
    predictorPageSubtitle:
      'Enter your expected percentile, admission type (State / Home / Other), category, and optional district filters.',
    reservationFieldLabel: 'Select a Category',
    admissionCategories: [{ value: 'GENERAL', label: 'MHT-CET' }],
  },
  {
    value: 'KEAM',
    label: 'KEAM',
    description: 'Find Kerala professional college options aligned with your entrance rank.',
    accent: 'teal',
    apiValue: 'KEAM',
    supported: true,
    defaultReservationCode: 'SM',
    hideAdmissionField: true,
    reservationFieldLabel: 'Select a Category',
    rankFieldLabel: 'Enter Your Expected KEAM Rank',
    reservationOptions: KEAM_RESERVATION_OPTIONS,
    reservationSelectSingle: true,
    districtOptions: KEAM_DISTRICT_OPTIONS,
    districtSelectionHint:
      'Choose “All districts” statewide, or pick specific Kerala districts — results are narrowed by matching college addresses (predictor API does not return reliable district codes for KEAM).',
    predictorPageTitle: 'KEAM College Predictor',
    predictorPageSubtitle:
      'Enter your expected rank, category, optional Kerala districts and branches, and your native state and district.',
    admissionCategories: [{ value: 'DEFAULT', label: 'Kerala professional college admissions' }],
  },
  {
    value: 'AP_EAMCET',
    label: 'AP EAMCET',
    description: 'Match Andhra Pradesh engineering colleges to your EAMCET performance.',
    accent: 'green',
    apiValue: 'AP_EAMCET',
    supported: true,
    defaultReservationCode: 'OC GIRLS',
    admissionFieldLabel: 'Region',
    reservationFieldLabel: 'Category',
    rankFieldLabel: 'Expected AP EAPCET rank',
    reservationOptions: AP_EAMCET_RESERVATION_OPTIONS,
    reservationSelectSingle: true,
    districtOptionsByAdmission: AP_EAMCET_DISTRICT_OPTIONS_BY_ADMISSION,
    districtSelectionHint:
      'Pick one or more districts for your selected region (AU vs SVU lists differ). Leave empty to include all districts in the results.',
    admissionCategories: [
      { value: 'AU', label: 'Andhra University (AU)' },
      { value: 'SVU', label: 'Sri Venkateswara University (SVU)' },
    ],
  },
  {
    value: 'TS_EAMCET',
    label: 'TS EAMCET',
    description: 'Discover Telangana colleges from your state EAMCET outcome.',
    accent: 'green',
    apiValue: 'TS_EAMCET',
    supported: true,
    defaultReservationCode: 'OC BOYS',
    hideAdmissionField: true,
    reservationFieldLabel: 'Category',
    rankFieldLabel: 'Expected TS EAMCET rank',
    reservationOptions: TS_EAMCET_RESERVATION_OPTIONS,
    reservationSelectSingle: true,
    districtOptions: TS_EAMCET_DISTRICT_OPTIONS,
    districtSelectionHint:
      'Select more districts for increased college options. Leave empty to include all districts.',
    admissionCategories: [
      { value: 'DEFAULT', label: 'All Telangana engineering colleges' },
    ],
  },
  {
    value: 'TNEA',
    label: 'TNEA',
    description: 'Tamil Nadu engineering admissions — cutoffs and branches in one place.',
    accent: 'orange',
    apiValue: 'TNEA',
    supported: true,
    defaultReservationCode: 'OC',
    hideAdmissionField: true,
    reservationFieldLabel: 'Select a Category',
    rankFieldLabel: 'Enter Your Expected TNEA 2026 Rank',
    reservationOptions: TNEA_RESERVATION_OPTIONS,
    reservationSelectSingle: true,
    districtOptions: TNEA_DISTRICT_OPTIONS,
    districtSelectionHint:
      'Choose “All districts” to search statewide, or pick specific Tamil Nadu districts. Native place is for your context; the API filters by college district.',
    predictorPageTitle: 'TNEA 2026 College Predictor',
    predictorPageSubtitle:
      'Enter your expected rank, community category, optional Tamil Nadu districts and branches, and your native state and district.',
    admissionCategories: [{ value: 'DEFAULT', label: 'Tamil Nadu engineering admissions' }],
  },
  {
    value: 'JEE',
    label: 'JEE Main & Advanced',
    description: 'JEE Main and JEE Advanced college prediction with national categories.',
    accent: 'purple',
    apiValue: 'JEE',
    supported: true,
    predictorPageTitle: 'JEE Main and JEE Advanced College Predictor',
    predictorPageSubtitle:
      'Enter at least one expected rank (Main and/or Advanced), category, and optional branch filters.',
    defaultReservationCode: 'OPEN',
    hideAdmissionField: true,
    reservationFieldLabel: 'Select a Category',
    reservationOptions: JEE_RESERVATION_OPTIONS,
    reservationSelectSingle: true,
    jeeMainApiExam: 'JEE_MAINS_2024',
    jeeAdvancedApiExam: 'JEE_ADVANCE_2024',
    admissionCategories: [{ value: 'DEFAULT', label: 'JEE counselling dataset (DEFAULT)' }],
  },
  {
    value: 'WBJEE',
    label: 'WBJEE',
    description:
      'West Bengal JEE — predict colleges using WBJEE and/or JEE Main rank, category, quota, and location.',
    accent: 'sky',
    apiValue: 'WBJEE',
    wbjeeApiExam: WBJEE_API_EXAM_ENUM,
    supported: true,
    defaultReservationCode: 'OPEN',
    hideAdmissionField: true,
    reservationFieldLabel: 'Select a Category',
    reservationOptions: WBJEE_CATEGORY_OPTIONS,
    reservationSelectSingle: true,
    predictorPageTitle: 'WBJEE College Predictor',
    predictorPageSubtitle:
      'Enter your expected WBJEE 2026 rank and/or JEE Main 2026 rank, category, quota (All India or Home State), optional state and district, and branches.',
    admissionCategories: [{ value: 'DEFAULT', label: 'WBJEE counselling dataset (DEFAULT)' }],
  },
];

export function getEntranceExamMeta(value) {
  return ENTRANCE_EXAMS.find((e) => e.value === value) ?? null;
}

export const RESERVATION_CATEGORIES = [
  { value: '1G', label: '1G (General)' },
  { value: '2AG', label: '2AG' },
  { value: '2BG', label: '2BG' },
  { value: '3AG', label: '3AG' },
  { value: '3BG', label: '3BG' },
  { value: 'SC', label: 'SC' },
  { value: 'ST', label: 'ST' },
  { value: 'GM', label: 'GM' },
  { value: 'EWS', label: 'EWS' },
  { value: 'GNT2S', label: 'GNT 2S' },
];

export const BRANCH_CODES = [
  { value: 'CSE', label: 'CSE' },
  { value: 'IT', label: 'IT' },
  { value: 'ECE', label: 'ECE' },
  { value: 'EEE', label: 'EEE' },
  { value: 'ME', label: 'Mechanical' },
  { value: 'CE', label: 'Civil' },
];

export const SORT_ORDER_OPTIONS = [
  { value: 'ASC', label: 'Lowest cutoff first' },
  { value: 'DESC', label: 'Highest cutoff first' },
];

export const DISTRICTS = [
  { value: 'Bangalore Urban', label: 'Bangalore Urban' },
  { value: 'Bangalore Rural', label: 'Bangalore Rural' },
  { value: 'Mysore', label: 'Mysore' },
  { value: 'Belgaum', label: 'Belgaum' },
  { value: 'Mangalore', label: 'Mangalore' },
  { value: 'Hubli', label: 'Hubli' },
  { value: 'Gulbarga', label: 'Gulbarga' },
  { value: 'Shimoga', label: 'Shimoga' },
  { value: 'Tumkur', label: 'Tumkur' },
  { value: 'Davangere', label: 'Davangere' },
];
