/**
 * MHT-CET (CAP) UI options: admission routes, reservation codes, Maharashtra districts, Indian states.
 * Codes are value===label for API; cross-check with official CAP brochure for completeness.
 *
 * Native-state district lists: `./data/indian-states-districts.json` (sab99r/Indian-States-And-Districts),
 * plus supplemental entries for Ladakh and Andaman & Nicobar (not in that snapshot).
 */

import indianStatesDistricts from './data/indian-states-districts.json';

/** @type {{ value: string, label: string }[]} */
export const MHT_CET_ADMISSION_TYPE_OPTIONS = [
  { value: 'STATE_LEVEL', label: 'State Level' },
  { value: 'HOME_UNIVERSITY', label: 'Home University' },
  { value: 'OTHER_THAN_HOME_UNIVERSITY', label: 'Other than Home University' },
];

/**
 * State-level quota (S suffix and state-level codes from CAP reference screens).
 */
export const MHT_CET_STATE_LEVEL_RESERVATION_OPTIONS = [
  { value: 'DEFOBCS', label: 'DEFOBCS' },
  { value: 'DEFOPENS', label: 'DEFOPENS' },
  { value: 'DEFRNT1S', label: 'DEFRNT1S' },
  { value: 'DEFRNT2S', label: 'DEFRNT2S' },
  { value: 'DEFRNT3S', label: 'DEFRNT3S' },
  { value: 'DEFROBCS', label: 'DEFROBCS' },
  { value: 'DEFRSCS', label: 'DEFRSCS' },
  { value: 'DEFRSEBCS', label: 'DEFRSEBCS' },
  { value: 'DEFSCS', label: 'DEFSCS' },
  { value: 'DEFSEBCS', label: 'DEFSEBCS' },
  { value: 'EWS', label: 'EWS' },
  { value: 'GOBCS', label: 'GOBCS' },
  { value: 'GOPENS', label: 'GOPENS' },
  { value: 'GSCS', label: 'GSCS' },
  { value: 'GSEBCS', label: 'GSEBCS' },
  { value: 'GSTS', label: 'GSTS' },
  { value: 'GNT1S', label: 'GNT1S' },
  { value: 'GNT2S', label: 'GNT2S' },
  { value: 'GNT3S', label: 'GNT3S' },
  { value: 'GVJS', label: 'GVJS' },
  { value: 'LOBCS', label: 'LOBCS' },
  { value: 'LOPENS', label: 'LOPENS' },
  { value: 'LSCS', label: 'LSCS' },
  { value: 'LSEBCS', label: 'LSEBCS' },
  { value: 'LSTS', label: 'LSTS' },
  { value: 'LNT1S', label: 'LNT1S' },
  { value: 'LNT2S', label: 'LNT2S' },
  { value: 'LNT3S', label: 'LNT3S' },
  { value: 'LVJS', label: 'LVJS' },
  { value: 'MI', label: 'MI' },
  { value: 'ORPHAN', label: 'ORPHAN' },
  { value: 'PWDOBCS', label: 'PWDOBCS' },
  { value: 'PWDOPENS', label: 'PWDOPENS' },
  { value: 'PWDROBCS', label: 'PWDROBCS' },
  { value: 'PWDRSCS', label: 'PWDRSCS' },
  { value: 'PWDRSTS', label: 'PWDRSTS' },
  { value: 'PWDSCS', label: 'PWDSCS' },
  { value: 'PWDSEBCS', label: 'PWDSEBCS' },
  { value: 'PWDSTS', label: 'PWDSTS' },
  { value: 'PWDRNT2S', label: 'PWDRNT2S' },
  { value: 'PWDRNT3S', label: 'PWDRNT3S' },
  { value: 'TFWS', label: 'TFWS' },
].sort((a, b) => a.value.localeCompare(b.value));

/**
 * Home-university quota (H suffix).
 */
export const MHT_CET_HOME_RESERVATION_OPTIONS = [
  { value: 'GNT1H', label: 'GNT1H' },
  { value: 'GNT2H', label: 'GNT2H' },
  { value: 'GNT3H', label: 'GNT3H' },
  { value: 'GOBCH', label: 'GOBCH' },
  { value: 'GOPENH', label: 'GOPENH' },
  { value: 'GSCH', label: 'GSCH' },
  { value: 'GSEBCH', label: 'GSEBCH' },
  { value: 'GSTH', label: 'GSTH' },
  { value: 'GVJH', label: 'GVJH' },
  { value: 'LOBCH', label: 'LOBCH' },
  { value: 'LOPENH', label: 'LOPENH' },
  { value: 'LSCH', label: 'LSCH' },
  { value: 'LSEBCH', label: 'LSEBCH' },
  { value: 'LSTH', label: 'LSTH' },
  { value: 'LNT1H', label: 'LNT1H' },
  { value: 'LVJH', label: 'LVJH' },
  { value: 'PWDOBCH', label: 'PWDOBCH' },
  { value: 'PWDOPENH', label: 'PWDOPENH' },
].sort((a, b) => a.value.localeCompare(b.value));

/**
 * Other-than-home-university quota (O suffix).
 * Codes must match earlywave / CAP OHU enums — do not use H/CH suffixes from Home University here.
 */
export const MHT_CET_OTHER_RESERVATION_OPTIONS = [
  { value: 'GOBCO', label: 'GOBCO' },
  { value: 'GOPENO', label: 'GOPENO' },
  { value: 'GNT2O', label: 'GNT2O' },
  { value: 'GNT3O', label: 'GNT3O' },
  { value: 'GSCO', label: 'GSCO' },
  { value: 'LOPENO', label: 'LOPENO' },
  { value: 'LSEBCO', label: 'LSEBCO' },
  { value: 'LSTO', label: 'LSTO' },
  { value: 'LNT2O', label: 'LNT2O' },
  { value: 'LVJO', label: 'LVJO' },
  /** PWD OHU: parallel to {@link MHT_CET_HOME_RESERVATION_OPTIONS} PWDOBCH / PWDOPENH */
  { value: 'PWDOBCO', label: 'PWDOBCO' },
  { value: 'PWDOPENO', label: 'PWDOPENO' },
  /** PWD OHU: RBC / SEBC (O suffix, not CH — CH is Home-quota style and fails INVALID_RESERVATION_CATEGORY_CODE with OHU) */
  { value: 'PWDROBCO', label: 'PWDROBCO' },
  { value: 'PWDSEBCO', label: 'PWDSEBCO' },
].sort((a, b) => a.value.localeCompare(b.value));

/** Maharashtra revenue districts (names as value/label for API filters). */
export const MHT_CET_DISTRICT_OPTIONS = [
  { value: 'Ahmednagar', label: 'Ahmednagar' },
  { value: 'Akola', label: 'Akola' },
  { value: 'Amravati', label: 'Amravati' },
  { value: 'Aurangabad', label: 'Aurangabad' },
  { value: 'Beed', label: 'Beed' },
  { value: 'Bhandara', label: 'Bhandara' },
  { value: 'Buldhana', label: 'Buldhana' },
  { value: 'Chandrapur', label: 'Chandrapur' },
  { value: 'Dhule', label: 'Dhule' },
  { value: 'Gadchiroli', label: 'Gadchiroli' },
  { value: 'Gondia', label: 'Gondia' },
  { value: 'Hingoli', label: 'Hingoli' },
  { value: 'Jalgaon', label: 'Jalgaon' },
  { value: 'Jalna', label: 'Jalna' },
  { value: 'Kolhapur', label: 'Kolhapur' },
  { value: 'Latur', label: 'Latur' },
  { value: 'Mumbai City', label: 'Mumbai City' },
  { value: 'Mumbai Suburban', label: 'Mumbai Suburban' },
  { value: 'Nagpur', label: 'Nagpur' },
  { value: 'Nanded', label: 'Nanded' },
  { value: 'Nandurbar', label: 'Nandurbar' },
  { value: 'Nashik', label: 'Nashik' },
  { value: 'Osmanabad', label: 'Osmanabad' },
  { value: 'Palghar', label: 'Palghar' },
  { value: 'Parbhani', label: 'Parbhani' },
  { value: 'Pune', label: 'Pune' },
  { value: 'Raigad', label: 'Raigad' },
  { value: 'Ratnagiri', label: 'Ratnagiri' },
  { value: 'Sangli', label: 'Sangli' },
  { value: 'Satara', label: 'Satara' },
  { value: 'Sindhudurg', label: 'Sindhudurg' },
  { value: 'Solapur', label: 'Solapur' },
  { value: 'Thane', label: 'Thane' },
  { value: 'Wardha', label: 'Wardha' },
  { value: 'Washim', label: 'Washim' },
  { value: 'Yavatmal', label: 'Yavatmal' },
];

/** Indian states / UTs for Native State (State Level final step). */
export const INDIAN_STATES_OPTIONS = [
  { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
  { value: 'Arunachal Pradesh', label: 'Arunachal Pradesh' },
  { value: 'Assam', label: 'Assam' },
  { value: 'Bihar', label: 'Bihar' },
  { value: 'Chhattisgarh', label: 'Chhattisgarh' },
  { value: 'Goa', label: 'Goa' },
  { value: 'Gujarat', label: 'Gujarat' },
  { value: 'Haryana', label: 'Haryana' },
  { value: 'Himachal Pradesh', label: 'Himachal Pradesh' },
  { value: 'Jharkhand', label: 'Jharkhand' },
  { value: 'Karnataka', label: 'Karnataka' },
  { value: 'Kerala', label: 'Kerala' },
  { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
  { value: 'Maharashtra', label: 'Maharashtra' },
  { value: 'Manipur', label: 'Manipur' },
  { value: 'Meghalaya', label: 'Meghalaya' },
  { value: 'Mizoram', label: 'Mizoram' },
  { value: 'Nagaland', label: 'Nagaland' },
  { value: 'Odisha', label: 'Odisha' },
  { value: 'Punjab', label: 'Punjab' },
  { value: 'Rajasthan', label: 'Rajasthan' },
  { value: 'Sikkim', label: 'Sikkim' },
  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
  { value: 'Telangana', label: 'Telangana' },
  { value: 'Tripura', label: 'Tripura' },
  { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
  { value: 'Uttarakhand', label: 'Uttarakhand' },
  { value: 'West Bengal', label: 'West Bengal' },
  { value: 'Andaman and Nicobar Islands', label: 'Andaman and Nicobar Islands' },
  { value: 'Chandigarh', label: 'Chandigarh' },
  { value: 'Dadra and Nagar Haveli and Daman and Diu', label: 'Dadra and Nagar Haveli and Daman and Diu' },
  { value: 'Delhi', label: 'Delhi' },
  { value: 'Jammu and Kashmir', label: 'Jammu and Kashmir' },
  { value: 'Ladakh', label: 'Ladakh' },
  { value: 'Lakshadweep', label: 'Lakshadweep' },
  { value: 'Puducherry', label: 'Puducherry' },
];

/**
 * Maps `INDIAN_STATES_OPTIONS.value` to dataset `state` key(s) in indian-states-districts.json.
 * `null` = use {@link SUPPLEMENTAL_NATIVE_DISTRICTS} only.
 * @type {Record<string, string | string[] | null>}
 */
const NATIVE_STATE_DATASET_KEYS = {
  Chandigarh: 'Chandigarh (UT)',
  Delhi: 'Delhi (NCT)',
  Lakshadweep: 'Lakshadweep (UT)',
  Puducherry: 'Puducherry (UT)',
  'Dadra and Nagar Haveli and Daman and Diu': ['Dadra and Nagar Haveli (UT)', 'Daman and Diu (UT)'],
  'Andaman and Nicobar Islands': null,
  Ladakh: null,
};

/** District names when not present (or not split out) in the vendored JSON. */
const SUPPLEMENTAL_NATIVE_DISTRICTS = {
  'Andaman and Nicobar Islands': ['Nicobar', 'North and Middle Andaman', 'South Andaman'],
  Ladakh: ['Kargil', 'Leh'],
};

/** @type {Map<string, string[]> | null} */
let stateToDistrictsMapCache = null;

function getStateToDistrictsMap() {
  if (!stateToDistrictsMapCache) {
    const m = new Map();
    for (const row of indianStatesDistricts.states) {
      m.set(row.state, row.districts);
    }
    stateToDistrictsMapCache = m;
  }
  return stateToDistrictsMapCache;
}

function decodeHtmlEntities(str) {
  return String(str)
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'");
}

function normalizeDistrictName(name) {
  return decodeHtmlEntities(String(name).trim()).replace(/\s+/g, ' ');
}

function districtStringsToOptions(names) {
  const unique = [...new Set(names.map(normalizeDistrictName))].filter(Boolean);
  unique.sort((a, b) => a.localeCompare(b));
  return unique.map((d) => ({ value: d, label: d }));
}

/**
 * District dropdown options for MHT-CET State Level “native place” step, keyed by native state.
 * Maharashtra uses {@link MHT_CET_DISTRICT_OPTIONS} for CAP-aligned spelling.
 * @param {string} [nativeState]
 * @returns {{ value: string, label: string }[]}
 */
export function getDistrictOptionsForNativeState(nativeState) {
  if (!nativeState) return [];
  if (nativeState === 'Maharashtra') return MHT_CET_DISTRICT_OPTIONS;

  if (Object.prototype.hasOwnProperty.call(NATIVE_STATE_DATASET_KEYS, nativeState)) {
    const mapped = NATIVE_STATE_DATASET_KEYS[nativeState];
    if (mapped === null) {
      const extra = SUPPLEMENTAL_NATIVE_DISTRICTS[nativeState];
      return extra ? districtStringsToOptions(extra) : [];
    }
    const keys = Array.isArray(mapped) ? mapped : [mapped];
    const map = getStateToDistrictsMap();
    const names = [];
    for (const key of keys) {
      const arr = map.get(key);
      if (arr) names.push(...arr);
    }
    return districtStringsToOptions(names);
  }

  const map = getStateToDistrictsMap();
  if (map.has(nativeState)) {
    const arr = map.get(nativeState);
    return arr ? districtStringsToOptions(arr) : [];
  }

  const fallback = SUPPLEMENTAL_NATIVE_DISTRICTS[nativeState];
  if (fallback) return districtStringsToOptions(fallback);

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn('[getDistrictOptionsForNativeState] Unknown native state:', nativeState);
  }
  return [];
}

/**
 * @param {string} admissionType - STATE_LEVEL | HOME_UNIVERSITY | OTHER_THAN_HOME_UNIVERSITY
 */
export function getMhtCetReservationOptionsForAdmissionType(admissionType) {
  if (admissionType === 'HOME_UNIVERSITY') return MHT_CET_HOME_RESERVATION_OPTIONS;
  if (admissionType === 'OTHER_THAN_HOME_UNIVERSITY') return MHT_CET_OTHER_RESERVATION_OPTIONS;
  return MHT_CET_STATE_LEVEL_RESERVATION_OPTIONS;
}

/**
 * Earlywave MHTCET expects short admission_category_name_enum codes (verified on beta).
 * @param {'STATE_LEVEL'|'HOME_UNIVERSITY'|'OTHER_THAN_HOME_UNIVERSITY'} uiRoute
 * @returns {'SL'|'HU'|'OHU'}
 */
export function mhtCetApiAdmissionCategory(uiRoute) {
  if (uiRoute === 'HOME_UNIVERSITY') return 'HU';
  if (uiRoute === 'OTHER_THAN_HOME_UNIVERSITY') return 'OHU';
  return 'SL';
}

/** Legacy OHU dropdown values that used Home-style CH suffix; earlywave expects O-suffix codes. */
const OHU_RESERVATION_CODE_ALIASES = {
  PWDSEBCH: 'PWDSEBCO',
  PWDROBCH: 'PWDROBCO',
};

/**
 * State-level (…S) codes accidentally sent with Home University — map to common H-suffix HU codes.
 * Prevents 0-result calls when stale GOPENS etc. are still in form state.
 */
const HU_FROM_STATE_LEVEL_ALIASES = {
  GOPENS: 'GOPENH',
  GOBCS: 'GOBCH',
  LOPENS: 'LOPENH',
  LOBCS: 'LOBCH',
  GSCS: 'GSCH',
  LSCS: 'LSCH',
  GSEBCS: 'GSEBCH',
  LSEBCS: 'LSEBCH',
  GSTS: 'GSTH',
  LSTS: 'LSTH',
  GNT1S: 'GNT1H',
  GNT2S: 'GNT2H',
  GNT3S: 'GNT3H',
  LNT1S: 'LNT1H',
  GVJS: 'GVJH',
  LVJS: 'LVJH',
  PWDOBCS: 'PWDOBCH',
  PWDOPENS: 'PWDOPENH',
};

/**
 * Map UI reservation code to the code the predictor API accepts (OHU quota fixes).
 * @param {'STATE_LEVEL'|'HOME_UNIVERSITY'|'OTHER_THAN_HOME_UNIVERSITY'} admissionType
 * @param {string} code
 */
export function normalizeMhtReservationCodeForApi(admissionType, code) {
  const c = String(code ?? '').trim();
  if (!c) return c;
  if (admissionType === 'OTHER_THAN_HOME_UNIVERSITY') {
    const mapped = OHU_RESERVATION_CODE_ALIASES[c];
    if (mapped) return mapped;
  }
  if (admissionType === 'HOME_UNIVERSITY') {
    const mapped = HU_FROM_STATE_LEVEL_ALIASES[c];
    if (mapped) return mapped;
  }
  return c;
}
