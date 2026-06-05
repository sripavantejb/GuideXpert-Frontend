import assert from 'node:assert/strict';
import {
  isRelevantOneOnOneCurrentClass,
  matchesOneOnOneLeadRelevance,
  RELEVANT_ONE_ON_ONE_CURRENT_CLASSES,
} from './oneOnOneCounselingClassRelevance.js';

for (const value of RELEVANT_ONE_ON_ONE_CURRENT_CLASSES) {
  assert.equal(isRelevantOneOnOneCurrentClass(value), true, value);
}

for (const value of ['10th', 'Diploma', 'Other', '', '   ']) {
  assert.equal(isRelevantOneOnOneCurrentClass(value), false, value);
}

assert.equal(matchesOneOnOneLeadRelevance({ currentClass: 'Inter 1st Year' }, 'relevant'), true);
assert.equal(matchesOneOnOneLeadRelevance({ currentClass: '10th' }, 'relevant'), false);
assert.equal(matchesOneOnOneLeadRelevance({ currentClass: '10th' }, 'irrelevant'), true);
assert.equal(matchesOneOnOneLeadRelevance({ currentClass: 'Inter 2nd Year' }, ''), true);

console.log('oneOnOneCounselingClassRelevance tests passed');
