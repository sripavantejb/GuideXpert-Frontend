import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { isScrollPinnedToBottom, mergeTranscriptMessages } from './copilotUtils.js';

describe('useCopilotTranscript helpers', () => {
  test('mergeTranscriptMessages appends without duplicates', () => {
    const prev = [
      { id: '1', at: '2026-06-01T10:00:00.000Z', text: 'a' },
      { id: '2', at: '2026-06-01T10:01:00.000Z', text: 'b' },
    ];
    const incoming = [{ id: '3', at: '2026-06-01T10:02:00.000Z', text: 'c' }];
    const merged = mergeTranscriptMessages(prev, incoming);
    assert.equal(merged.length, 3);
    assert.equal(merged.at(-1).text, 'c');
  });

  test('mergeTranscriptMessages prepends older batch in order', () => {
    const older = [{ id: '0', at: '2026-06-01T09:59:00.000Z', text: 'old' }];
    const prev = [{ id: '1', at: '2026-06-01T10:00:00.000Z', text: 'new' }];
    const merged = mergeTranscriptMessages(older, prev);
    assert.equal(merged[0].text, 'old');
    assert.equal(merged[1].text, 'new');
  });

  test('isScrollPinnedToBottom mirrors hook pinned detection', () => {
    const el = { scrollHeight: 800, clientHeight: 400, scrollTop: 360 };
    assert.equal(isScrollPinnedToBottom(el), true);
    el.scrollTop = 120;
    assert.equal(isScrollPinnedToBottom(el), false);
  });
});
