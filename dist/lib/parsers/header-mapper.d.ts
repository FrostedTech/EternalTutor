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
export declare const HeaderMappings: Record<SourceFormat, ColumnMapping>;
/**
 * Normalize a header string for lookup: lowercase + trim punctuation.
 */
export declare function normalizeHeader(raw: string): string;
/**
 * Build a lookup table from a CSV header row for the given format,
 * returning a map of canonical field → resolved column name.
 */
export declare function buildHeaderLookup(headers: string[], format: SourceFormat): Record<keyof ColumnMapping, number>;
//# sourceMappingURL=header-mapper.d.ts.map