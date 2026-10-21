/**
 * Generates an incremented, unique, standardized report number:
 * Format: RPT-YYYY-XXXX (e.g. RPT-2026-0001)
 */
export function generateNextReportNumber(existingNumbers: string[], targetYear: number = new Date().getFullYear()): string {
  const prefix = `RPT-${targetYear}-`;
  let maxSeq = 0;

  for (const num of existingNumbers) {
    if (num && num.startsWith(prefix)) {
      const rest = num.substring(prefix.length);
      const parsed = parseInt(rest, 10);
      if (!isNaN(parsed) && parsed > maxSeq) {
        maxSeq = parsed;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  return `${prefix}${nextSeq.toString().padStart(4, '0')}`;
}
