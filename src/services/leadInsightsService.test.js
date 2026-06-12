import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  buildLeadInsightsQuery,
  normalizeLeadInsightsResponse,
} from './leadInsightsApiUtils.js';

describe('leadInsightsService', () => {
  test('buildLeadInsightsQuery omits empty values', () => {
    const query = buildLeadInsightsQuery({
      stage: 'hot',
      minScore: 50,
      page: 2,
      limit: 25,
      empty: '',
      nil: null,
    });
    assert.equal(query, '?stage=hot&minScore=50&page=2&limit=25');
  });

  test('buildLeadInsightsQuery returns empty string when no params', () => {
    assert.equal(buildLeadInsightsQuery({}), '');
  });

  test('normalizeLeadInsightsResponse maps success payload', () => {
    const normalized = normalizeLeadInsightsResponse({
      success: true,
      status: 200,
      data: { totalLeads: 10 },
    });
    assert.equal(normalized.ok, true);
    assert.equal(normalized.data.totalLeads, 10);
  });

  test('normalizeLeadInsightsResponse maps error payload', () => {
    const normalized = normalizeLeadInsightsResponse({
      success: false,
      status: 500,
      message: 'Server error',
    });
    assert.equal(normalized.ok, false);
    assert.equal(normalized.message, 'Server error');
    assert.equal(normalized.status, 500);
  });
});
