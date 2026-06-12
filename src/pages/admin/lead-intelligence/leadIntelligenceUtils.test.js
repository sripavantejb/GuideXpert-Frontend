import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  flattenRecentEvents,
  formatConfidence,
  getStageTone,
  isValidPhone10,
} from './leadIntelligenceUtils.js';

describe('leadIntelligenceUtils', () => {
  test('getStageTone returns hot warm and cold classes', () => {
    assert.match(getStageTone('hot'), /red/);
    assert.match(getStageTone('warm'), /orange/);
    assert.match(getStageTone('cold'), /blue/);
  });

  test('formatConfidence renders percentage', () => {
    assert.equal(formatConfidence(0.92), '92%');
    assert.equal(formatConfidence(null), '—');
  });

  test('flattenRecentEvents expands nested events with parent createdAt', () => {
    const rows = flattenRecentEvents([
      {
        createdAt: '2026-06-05T10:00:00.000Z',
        events: [
          { type: 'demo_interest', value: 'yes', confidence: 0.9 },
          { type: 'exam_mentioned', value: 'JEE', confidence: 0.8 },
        ],
      },
    ]);
    assert.equal(rows.length, 2);
    assert.equal(rows[0].type, 'demo_interest');
    assert.equal(rows[0].createdAt, '2026-06-05T10:00:00.000Z');
  });

  test('isValidPhone10 validates 10 digit phones', () => {
    assert.equal(isValidPhone10('9876543210'), true);
    assert.equal(isValidPhone10('123'), false);
  });
});
