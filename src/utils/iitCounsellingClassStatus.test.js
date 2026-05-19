import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isRelevantIitClassStatus,
  matchesIitLeadRelevance,
  RELEVANT_IIT_CLASS_STATUSES,
} from './iitCounsellingClassStatus.js';

describe('iitCounsellingClassStatus', () => {
  test('each relevant enum value is relevant', () => {
    for (const value of RELEVANT_IIT_CLASS_STATUSES) {
      assert.equal(isRelevantIitClassStatus(value), true, value);
    }
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

  test('legacy values map to relevant', () => {
    assert.equal(isRelevantIitClassStatus('12th Appearing'), true);
    assert.equal(isRelevantIitClassStatus('12th Passed'), true);
  });

  test('matchesIitLeadRelevance respects filter', () => {
    const row = { classStatus: 'Engineering Studying' };
    assert.equal(matchesIitLeadRelevance(row, 'all'), true);
    assert.equal(matchesIitLeadRelevance(row, 'relevant'), false);
    assert.equal(matchesIitLeadRelevance(row, 'irrelevant'), true);

    const relevantRow = { classStatus: 'Studying 11th/Intermediate 1st Year' };
    assert.equal(matchesIitLeadRelevance(relevantRow, 'relevant'), true);
    assert.equal(matchesIitLeadRelevance(relevantRow, 'irrelevant'), false);
  });
});
