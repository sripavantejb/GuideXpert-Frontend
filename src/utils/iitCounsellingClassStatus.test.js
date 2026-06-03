import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isRelevantIitClassStatus,
  matchesIitLeadRelevance,
  RELEVANT_IIT_CLASS_STATUSES,
} from './iitCounsellingClassStatus.js';

describe('iitCounsellingClassStatus', () => {
  test('only 12th passed out enum is relevant', () => {
    for (const value of RELEVANT_IIT_CLASS_STATUSES) {
      assert.equal(isRelevantIitClassStatus(value), true, value);
    }
    assert.equal(isRelevantIitClassStatus('Studying 12th/Intermediate 2nd Year'), false);
    assert.equal(isRelevantIitClassStatus('Studying 11th/Intermediate 1st Year'), false);
  });

  test('degree, engineering, and diploma are irrelevant', () => {
    const irrelevant = [
      'Degree Completed',
      'Degree Studying',
      'Engineering Completed',
      'Engineering Studying',
      'Diploma',
    ];
    for (const value of irrelevant) {
      assert.equal(isRelevantIitClassStatus(value), false, value);
    }
  });

  test('empty and whitespace are irrelevant', () => {
    assert.equal(isRelevantIitClassStatus(''), false);
    assert.equal(isRelevantIitClassStatus('   '), false);
    assert.equal(isRelevantIitClassStatus(null), false);
    assert.equal(isRelevantIitClassStatus(undefined), false);
  });

  test('legacy 12th Passed is relevant; 12th Appearing is not', () => {
    assert.equal(isRelevantIitClassStatus('12th Passed'), true);
    assert.equal(isRelevantIitClassStatus('12th Appearing'), false);
  });

  test('matchesIitLeadRelevance respects filter', () => {
    const row = { classStatus: 'Engineering Studying' };
    assert.equal(matchesIitLeadRelevance(row, 'all'), true);
    assert.equal(matchesIitLeadRelevance(row, 'relevant'), false);
    assert.equal(matchesIitLeadRelevance(row, 'irrelevant'), true);

    const passedRow = { classStatus: 'Completed 12th/Intermediate 2nd Year' };
    assert.equal(matchesIitLeadRelevance(passedRow, 'relevant'), true);
    assert.equal(matchesIitLeadRelevance(passedRow, 'irrelevant'), false);

    const studyingRow = { classStatus: 'Studying 11th/Intermediate 1st Year' };
    assert.equal(matchesIitLeadRelevance(studyingRow, 'relevant'), false);
    assert.equal(matchesIitLeadRelevance(studyingRow, 'irrelevant'), true);
  });
});
