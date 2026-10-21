import test from 'node:test';
import assert from 'node:assert/strict';
import { generateNextReportNumber } from '../server/services/reportNumber.ts';

test('generates RPT-2026-0001 when no existing reports exist', () => {
  const result = generateNextReportNumber([], 2026);
  assert.equal(result, 'RPT-2026-0001');
});

test('increments sequentially from existing report numbers', () => {
  const existing = ['RPT-2026-0001', 'RPT-2026-0002', 'RPT-2026-0005'];
  const result = generateNextReportNumber(existing, 2026);
  assert.equal(result, 'RPT-2026-0006');
});

test('ignores reports from other years when calculating next sequence', () => {
  const existing = ['RPT-2025-0099', 'RPT-2026-0003'];
  const result = generateNextReportNumber(existing, 2026);
  assert.equal(result, 'RPT-2026-0004');
});
