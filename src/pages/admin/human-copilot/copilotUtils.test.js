import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  buildQueueFilterOptions,
  filterQueueBySr,
  formatSrSlot,
  getAlertLabel,
  getAlertTone,
  getMessageBubbleClasses,
  getMessageRole,
  getMessageRowAlignment,
  getMessageSenderLabel,
  isScrollPinnedToBottom,
  mergeTranscriptMessages,
  normalizeMessageKey,
  SR_FILTER_OPTIONS,
  buildSummaryFactRows,
  formatLeadQualityLine,
  formatDurationMs,
  formatPercentRate,
  formatFollowupDelay,
  getFollowupPriorityLabel,
  getEditClassificationLabel,
  getEditTopicLabel,
} from './copilotUtils.js';

describe('copilotUtils', () => {
  test('getAlertLabel maps known alert reasons', () => {
    assert.equal(getAlertLabel('human_requested'), 'Human requested');
    assert.equal(getAlertLabel('low_confidence'), 'Low confidence');
    assert.equal(getAlertLabel('hot_lead'), 'Hot lead');
    assert.equal(getAlertLabel('reopened'), 'Reopened');
  });

  test('getAlertTone returns tone classes for alerts', () => {
    assert.match(getAlertTone('hot_lead'), /red/);
    assert.match(getAlertTone('low_confidence'), /amber/);
  });

  test('formatSrSlot labels SR slots', () => {
    assert.equal(formatSrSlot('sr1'), 'SR Counsellor 1');
    assert.equal(formatSrSlot(null), 'Unassigned');
  });

  test('filterQueueBySr filters assignment slots', () => {
    const items = [
      { id: '1', assignedSrCounsellor: 'sr1' },
      { id: '2', assignedSrCounsellor: null, assignedAgentId: null },
      { id: '3', assignedSrCounsellor: 'sr2' },
    ];
    assert.equal(filterQueueBySr(items, 'all').length, 3);
    assert.deepEqual(
      filterQueueBySr(items, 'unassigned').map((i) => i.id),
      ['2']
    );
    assert.deepEqual(
      filterQueueBySr(items, 'sr1').map((i) => i.id),
      ['1']
    );
  });

  test('buildQueueFilterOptions includes agents and legacy sr slots', () => {
    const agents = [
      { id: 'a1', name: 'IIT Expert', username: 'iit1' },
      { id: 'a2', name: 'General', username: 'gen1' },
    ];
    const options = buildQueueFilterOptions(agents);
    assert.ok(options.some((o) => o.value === 'agent:a1'));
    assert.ok(options.some((o) => o.value === 'agent:a2'));
    assert.ok(!options.some((o) => o.value === 'sr1'));
  });

  test('filterQueueBySr filters by agent id', () => {
    const items = [
      { id: '1', assignedAgentId: 'a1' },
      { id: '2', assignedAgentId: null, assignedSrCounsellor: null },
    ];
    assert.deepEqual(
      filterQueueBySr(items, 'agent:a1').map((i) => i.id),
      ['1']
    );
  });

  test('SR_FILTER_OPTIONS includes all and unassigned', () => {
    const values = SR_FILTER_OPTIONS.map((o) => o.value);
    assert.ok(values.includes('all'));
    assert.ok(values.includes('unassigned'));
    assert.ok(values.includes('sr1'));
    assert.ok(values.includes('sr2'));
  });

  test('buildSummaryFactRows formats fact labels', () => {
    const rows = buildSummaryFactRows({
      state: 'Telangana',
      stream: 'MPC',
      rank: 'Not yet collected',
    });
    assert.equal(rows.find((r) => r.key === 'state')?.value, 'Telangana');
    assert.equal(rows.find((r) => r.key === 'rank')?.value, 'Not yet collected');
  });

  test('formatLeadQualityLine renders score stage and confidence', () => {
    assert.match(
      formatLeadQualityLine({ score: '84', stage: 'hot', confidence: '92%' }),
      /Score 84/
    );
    assert.equal(formatLeadQualityLine({}), 'Not yet collected');
  });

  test('formatDurationMs renders minutes hours and days', () => {
    assert.equal(formatDurationMs(0), '—');
    assert.equal(formatDurationMs(45 * 60 * 1000), '45m');
    assert.equal(formatDurationMs(90 * 60 * 1000), '1h 30m');
    assert.equal(formatDurationMs(26 * 60 * 60 * 1000), '1d 2h');
  });

  test('formatPercentRate renders percentage strings', () => {
    assert.equal(formatPercentRate(0), '0%');
    assert.equal(formatPercentRate(0.667), '66.7%');
  });

  test('getEditClassificationLabel maps learning classifications', () => {
    assert.equal(getEditClassificationLabel('moderate_edit'), 'Moderate edit');
    assert.equal(getEditClassificationLabel('manual'), 'Manual');
  });

  test('getEditTopicLabel maps learning topics', () => {
    assert.equal(getEditTopicLabel('college_selection'), 'College selection');
    assert.equal(getEditTopicLabel('unknown_topic'), 'unknown_topic');
  });

  test('follow-up helpers format priority and delay', () => {
    assert.equal(getFollowupPriorityLabel('high'), 'High priority');
    assert.equal(formatFollowupDelay(0), 'Send now');
    assert.equal(formatFollowupDelay(3), '3 days');
  });

  test('message helpers map roles labels and bubble classes', () => {
    assert.equal(getMessageRole({ direction: 'in' }), 'user');
    assert.equal(getMessageRole({ direction: 'out', senderType: 'bot' }), 'assistant');
    assert.equal(getMessageRole({ direction: 'out', senderType: 'agent' }), 'counsellor');
    assert.equal(getMessageRole({ direction: 'out', senderType: 'system' }), 'system');
    assert.equal(getMessageSenderLabel({ direction: 'out', senderType: 'system' }), 'System');
    assert.equal(
      getMessageSenderLabel({ direction: 'out', senderType: 'agent', senderName: 'Priya' }),
      'Priya'
    );
    assert.match(getMessageBubbleClasses({ direction: 'in' }), /bg-white/);
    assert.match(getMessageBubbleClasses({ direction: 'out', senderType: 'bot' }), /dcf8c6/);
    assert.match(getMessageBubbleClasses({ direction: 'out', senderType: 'agent' }), /emerald-600/);
    assert.equal(getMessageRowAlignment({ direction: 'in' }), 'justify-start');
    assert.equal(getMessageRowAlignment({ direction: 'out', senderType: 'bot' }), 'justify-end');
  });

  test('mergeTranscriptMessages dedupes and sorts chronologically', () => {
    const merged = mergeTranscriptMessages(
      [{ id: '2', at: '2026-06-01T10:01:00.000Z', text: 'b' }],
      [{ id: '1', at: '2026-06-01T10:00:00.000Z', text: 'a' }, { id: '2', at: '2026-06-01T10:01:00.000Z', text: 'b' }]
    );
    assert.equal(merged.length, 2);
    assert.equal(merged[0].text, 'a');
    assert.equal(normalizeMessageKey({ id: 'x' }), 'x');
  });

  test('isScrollPinnedToBottom detects bottom threshold', () => {
    const el = {
      scrollHeight: 1000,
      clientHeight: 400,
      scrollTop: 560,
    };
    assert.equal(isScrollPinnedToBottom(el, 80), true);
    el.scrollTop = 100;
    assert.equal(isScrollPinnedToBottom(el, 80), false);
  });
});
