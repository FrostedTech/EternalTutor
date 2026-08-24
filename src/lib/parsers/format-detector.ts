/**
 * Format detection by header fingerprinting.
 *
 * Each exporter includes a distinctive set of columns. We match on
 * the strongest signal first, then fall back to custom.
 */

import { SourceFormat } from './header-mapper';
export type { SourceFormat };

interface FormatSignature {
  format: SourceFormat;
  mustHave: string[];
}

// Ordered from most distinct to least distinct
const Signatures: FormatSignature[] = [
  {
    format: 'manabox',
    mustHave: ['ManaBox ID', 'Purchase price currency', 'Added'],
  },
  {
    format: 'archidekt',
    mustHave: ['Archidekt ID'],
  },
  {
    format: 'moxfield',
    mustHave: ['Last Edited'],
  },
  {
    format: 'delver_lens',
    mustHave: ['Price Guide', 'Card Number'],
  },
];

/**
 * Detect the source format from a CSV header row.
 */
export function detectFormat(headers: string[]): SourceFormat {
  const norm = new Set(
    headers.map((h) => normalizeForDetection(h))
  );

  for (const sig of Signatures) {
    const hasAll = sig.mustHave.every((h) => norm.has(normalizeForDetection(h)));
    if (hasAll) {
      return sig.format;
    }
  }

  // Fallback: if we see "Count" but no "Quantity", it's likely Delver Lens
  if (norm.has(normalizeForDetection('Count'))) {
    return 'delver_lens';
  }

  return 'custom';
}

function normalizeForDetection(header: string): string {
  return header.trim().toLowerCase().replace(/[.\s_]+/g, ' ');
}
