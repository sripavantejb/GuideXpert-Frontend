import cover01 from '../assets/blogs/cover-01.svg';
import cover02 from '../assets/blogs/cover-02.svg';
import cover03 from '../assets/blogs/cover-03.svg';
import cover04 from '../assets/blogs/cover-04.svg';
import cover05 from '../assets/blogs/cover-05.svg';
import cover06 from '../assets/blogs/cover-06.svg';
import cover07 from '../assets/blogs/cover-07.svg';
import cover08 from '../assets/blogs/cover-08.svg';
import cover09 from '../assets/blogs/cover-09.svg';
import cover10 from '../assets/blogs/cover-10.svg';
import cover11 from '../assets/blogs/cover-11.svg';
import cover12 from '../assets/blogs/cover-12.svg';
import cover13 from '../assets/blogs/cover-13.svg';
import cover14 from '../assets/blogs/cover-14.svg';
import cover15 from '../assets/blogs/cover-15.svg';
import cover16 from '../assets/blogs/cover-16.svg';
import cover17 from '../assets/blogs/cover-17.svg';
import cover18 from '../assets/blogs/cover-18.svg';
import cover19 from '../assets/blogs/cover-19.svg';
import cover20 from '../assets/blogs/cover-20.svg';

const pool = [
  cover01,
  cover02,
  cover03,
  cover04,
  cover05,
  cover06,
  cover07,
  cover08,
  cover09,
  cover10,
  cover11,
  cover12,
  cover13,
  cover14,
  cover15,
  cover16,
  cover17,
  cover18,
  cover19,
  cover20,
];

const LAST_INDEX_KEY = 'guidexpert_blog_cover_last_index';

function getLastIndex() {
  try {
    const raw = localStorage.getItem(LAST_INDEX_KEY);
    const n = raw == null ? -1 : parseInt(raw, 10);
    return Number.isFinite(n) ? n : -1;
  } catch {
    return -1;
  }
}

function setLastIndex(idx) {
  try {
    localStorage.setItem(LAST_INDEX_KEY, String(idx));
  } catch {
    // ignore
  }
}

export function getCoverPool() {
  return [...pool];
}

export function pickNextCoverImage() {
  const total = pool.length;
  if (total === 0) return '';
  const last = getLastIndex();
  const next = (last + 1) % total;
  setLastIndex(next);
  return pool[next];
}

