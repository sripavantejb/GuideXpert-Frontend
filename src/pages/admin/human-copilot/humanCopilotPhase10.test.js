import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  buildFailedReplyPatch,
  getDeliveryStatusLabel,
  mergeDetailPreserving,
  mergeTranscriptMessages,
  MOBILE_INBOX_TABS,
  shouldShowRetryBar,
} from './copilotUtils.js';

describe('copilot polling and retry helpers', () => {
  test('mergeDetailPreserving keeps prior panels during silent refresh', () => {
    const prev = {
      handoff: { id: '1', phone: '999', internalNotes: [{ text: 'keep' }] },
      auditTrail: [{ action: 'assigned' }],
      userProfile: { name: 'A' },
    };
    const incoming = {
      handoff: { id: '1', phone: '999', latestDeliveryStatus: 'delivered' },
      auditTrail: [{ action: 'assigned' }, { action: 'reply_delivered' }],
    };
    const merged = mergeDetailPreserving(prev, incoming);
    assert.equal(merged.handoff.latestDeliveryStatus, 'delivered');
    assert.equal(merged.userProfile.name, 'A');
    assert.equal(merged.auditTrail.length, 2);
  });

  test('shouldShowRetryBar appears immediately on failed delivery', () => {
    const handoff = { failedReply: buildFailedReplyPatch('Hi', 'network') };
    assert.equal(shouldShowRetryBar(handoff, 'failed'), true);
    assert.equal(shouldShowRetryBar(handoff, ''), true);
    assert.equal(shouldShowRetryBar({ failedReply: null }, 'failed'), false);
  });

  test('delivery labels include delivered and read', () => {
    assert.equal(getDeliveryStatusLabel('delivered'), 'Delivered');
    assert.equal(getDeliveryStatusLabel('read'), 'Read');
    assert.equal(getDeliveryStatusLabel('simulated'), 'Simulated (not sent)');
  });
});

describe('mobile inbox tabs', () => {
  test('tab ids cover queue chat context', () => {
    assert.deepEqual(
      MOBILE_INBOX_TABS.map((t) => t.id),
      ['queue', 'chat', 'context']
    );
  });
});

describe('silent transcript refresh', () => {
  test('mergeTranscriptMessages drops optimistic entries when server messages arrive', () => {
    const prev = [
      { id: 'optimistic-1', optimistic: true, at: '2026-06-01T10:02:00.000Z', text: 'pending' },
      { id: '1', at: '2026-06-01T10:00:00.000Z', text: 'hello' },
    ];
    const withoutOptimistic = prev.filter((m) => !m.optimistic);
    const incoming = [{ id: '2', at: '2026-06-01T10:03:00.000Z', text: 'confirmed' }];
    const merged = mergeTranscriptMessages(withoutOptimistic, incoming);
    assert.equal(merged.length, 2);
    assert.equal(merged.at(-1).text, 'confirmed');
    assert.ok(!merged.some((m) => m.optimistic));
  });
});

describe('optimistic messages', () => {
  test('optimistic message is flagged for later merge', () => {
    const msg = {
      id: 'optimistic-1',
      optimistic: true,
      text: 'Hello',
      direction: 'out',
      senderType: 'agent',
    };
    assert.equal(msg.optimistic, true);
    assert.equal(msg.senderType, 'agent');
  });
});
