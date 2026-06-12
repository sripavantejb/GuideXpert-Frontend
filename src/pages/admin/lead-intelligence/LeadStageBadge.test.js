import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { getStageTone } from './leadIntelligenceUtils.js';

describe('LeadStageBadge tones', () => {
  test('unknown stage falls back to neutral tone', () => {
    assert.match(getStageTone('unknown'), /gray/);
  });

  test('stage tone keys are lowercase', () => {
    assert.match(getStageTone('HOT'), /red/);
  });
});
