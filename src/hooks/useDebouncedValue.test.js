import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

function createDebouncedValue(initialValue, delayMs, nowFn = () => Date.now()) {
  let value = initialValue;
  let debouncedValue = initialValue;
  let timer = null;
  let currentTime = nowFn();

  return {
    getValue: () => value,
    getDebounced: () => debouncedValue,
    setValue: (nextValue) => {
      value = nextValue;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        debouncedValue = value;
      }, delayMs);
    },
    tick: (ms) => {
      currentTime += ms;
    },
    flush: () => {
      debouncedValue = value;
    },
  };
}

describe('useDebouncedValue behavior', () => {
  test('debounced value updates after delay window', () => {
    const model = createDebouncedValue('', 300);
    model.setValue('98');
    assert.equal(model.getDebounced(), '');
    model.flush();
    assert.equal(model.getDebounced(), '98');
  });

  test('rapid updates keep only latest value after flush', () => {
    const model = createDebouncedValue('', 300);
    model.setValue('9');
    model.setValue('98');
    model.setValue('9876543210');
    model.flush();
    assert.equal(model.getDebounced(), '9876543210');
  });
});
