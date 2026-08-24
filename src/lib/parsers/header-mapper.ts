/**
 * Header mapping table.
 *
 * Each supported export format maps its column headers to the canonical
 * field names used by MTGCollectionItem. Lookup is case-insensitive and
 * ignores leading/trailing whitespace.
 */

export type SourceFormat = 'manabox' | 'archidekt' | 'moxfield' | 'delver_lens' | 'custom';

export interface ColumnMapping {
  card_name: string;
  set_code?: string;
  collector_number?: string;
  foil?: string;
  quantity?: string;
  condition?: string;
  language?: string;
}

export const HeaderMappings: Record<SourceFormat, ColumnMapping> = {
  manabox: {
    card_name: 'Name',
    set_code: 'Set code',
    collector_number: 'Collector number',
    foil: 'Foil',
    quantity: 'Quantity',
    condition: 'Condition',
    language: 'Language',
  },
  archidekt: {
    card_name: 'Name',
    set_code: 'Set',
    collector_number: 'Collector Number',
    foil: 'Foil',
    quantity: 'Count',
    condition: 'Condition',
    language: 'Language',
  },
  moxfield: {
    card_name: 'Name',
    set_code: 'Set',
    collector_number: 'Card Number',
    foil: 'Foil',
    quantity: 'Quantity',
    condition: 'Condition',
    language: 'Language',
  },
  delver_lens: {
    card_name: 'Name',
    set_code: 'Set',
    collector_number: 'Card Number',
    foil: 'Foil',
    quantity: 'Count',
    condition: 'Condition',
    language: 'Language',
  },
  custom: {
    card_name: 'Name',
    set_code: 'Set code',
    collector_number: 'Collector number',
    foil: 'Foil',
    quantity: 'Quantity',
    condition: 'Condition',
    language: 'Language',
  },
};

/**
 * Normalize a header string for lookup: lowercase + trim punctuation.
 */
export function normalizeHeader(raw: string): string {
  return raw.trim().toLowerCase().replace(/[.\s_]+/g, ' ');
}

/**
 * Build a lookup table from a CSV header row for the given format,
 * returning a map of canonical field → resolved column name.
 */
export function buildHeaderLookup(
  headers: string[],
  format: SourceFormat
): Record<keyof ColumnMapping, number> {
  const mapping = HeaderMappings[format];
  const lookup: Record<keyof ColumnMapping, number> = {
    card_name: -1,
    set_code: -1,
    collector_number: -1,
    foil: -1,
    quantity: -1,
    condition: -1,
    language: -1,
  };

  // Build a normalized header → index map
  const normHeaders = new Map<string, number>();
  headers.forEach((h, idx) => normHeaders.set(normalizeHeader(h), idx));

  for (const [field, expectedName] of Object.entries(mapping)) {
    const idx = normHeaders.get(normalizeHeader(expectedName));
    if (idx !== undefined && idx >= 0) {
      lookup[field as keyof ColumnMapping] = idx;
    }
  }

  return lookup;
}
