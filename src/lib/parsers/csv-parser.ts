/**
 * CSV Collection Parser — entry point for parsing user CSV exports.
 *
 * Reads a raw CSV string (from file upload or past-paste), detects the
 * source format, maps columns to canonical fields, normalizes values,
 * and returns a validated CollectionParseResult.
 *
 * Follows the contract defined in:
 *   ../../../../skills/csv-collection-parser/SKILL.md
 */

import { parse } from 'csv-parse/sync';
import {
  MTGCollectionItemSchema,
  CollectionParseResultSchema,
  type MTGCollectionItem,
  type CollectionParseResult,
} from '../../types/collection';
import { detectFormat, SourceFormat } from './format-detector';
import { HeaderMappings, normalizeHeader } from './header-mapper';
import {
  normalizeFoil,
  normalizeQuantity,
  normalizeCondition,
  normalizeCardName,
  normalizeLanguage,
  normalizeSetCode,
  normalizeCollectorNumber,
} from './value-normalizer';

export { detectFormat, SourceFormat, HeaderMappings };

interface RawRow {
  [key: string]: string | undefined;
}

interface ParseOptions {
  /** If true, rows that fail validation are logged to errors array
   *  but do not abort the parse (default: true). */
  tolerateErrors?: boolean;
}

/**
 * Parse a CSV collection string into a validated CollectionParseResult.
 *
 * @param csvText - Raw CSV content as a string
 * @param options - Parsing options
 * @returns CollectionParseResult with items, errors, and detected format
 */
export function parseCollectionCsv(
  csvText: string,
  options: ParseOptions = {}
): CollectionParseResult {
  const { tolerateErrors = true } = options;
  const errors: CollectionParseResult['errors'] = [];
  const items: MTGCollectionItem[] = [];

  // --- Step 1: Parse raw CSV into array of objects ---
  let records: RawRow[];
  let headers: string[];

  try {
    records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: false,
      relax_column_count: true,
      // Preserve raw values — we normalize ourselves
      cast: (value: string) => value,
    });
    headers = records.length > 0 ? Object.keys(records[0]) : [];
  } catch (err) {
    throw new Error(`Failed to parse CSV: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (headers.length === 0) {
    throw new Error('CSV input has no headers');
  }

  // --- Step 2: Validate mandatory headers ---
  const normalizedHeaders = headers.map(normalizeHeader);
  const hasName = normalizedHeaders.some((h) => h === 'name' || h === 'card name');
  const hasQuantity =
    normalizedHeaders.some((h) => h === 'quantity' || h === 'count');

  if (!hasName || !hasQuantity) {
    throw new Error(
      `CSV must contain a "Name" header and a "Quantity" or "Count" header. ` +
        `Received: ${headers.join(', ')}`
    );
  }

  // --- Step 3: Detect source format ---
  const format = detectFormat(headers);
  const mapping = HeaderMappings[format];

  // Build a column-name → index lookup from the actual CSV headers
  const colIndex = new Map<string, number>();
  headers.forEach((h, idx) => colIndex.set(normalizeHeader(h), idx));

  // --- Step 4: Resolve mapping indices ---
  const idx = {
    card_name: colIndex.get(normalizeHeader(mapping.card_name)) ?? -1,
    set_code: mapping.set_code ? colIndex.get(normalizeHeader(mapping.set_code)) ?? -1 : -1,
    collector_number: mapping.collector_number
      ? colIndex.get(normalizeHeader(mapping.collector_number)) ?? -1
      : -1,
    foil: mapping.foil ? colIndex.get(normalizeHeader(mapping.foil)) ?? -1 : -1,
    quantity: mapping.quantity
      ? colIndex.get(normalizeHeader(mapping.quantity)) ?? -1
      : -1,
    condition: mapping.condition
      ? colIndex.get(normalizeHeader(mapping.condition)) ?? -1
      : -1,
    language: mapping.language
      ? colIndex.get(normalizeHeader(mapping.language)) ?? -1
      : -1,
  };

  // --- Step 5: Normalize each row ---
  records.forEach((row, rowNum) => {
    // Get raw values by index
    const rawName = getCellValue(row, idx.card_name, headers);
    const rawSet = getCellValue(row, idx.set_code, headers);
    const rawNumber = getCellValue(row, idx.collector_number, headers);
    const rawFoil = getCellValue(row, idx.foil, headers);
    const rawQty = getCellValue(row, idx.quantity, headers);
    const rawCond = getCellValue(row, idx.condition, headers);
    const rawLang = getCellValue(row, idx.language, headers);

    // Card name is mandatory
    if (!rawName || rawName.trim() === '') {
      if (tolerateErrors) {
        errors.push({ row: rowNum + 2, raw: JSON.stringify(row), reason: 'Missing card name' });
        return;
      }
      throw new Error(`Row ${rowNum + 2}: missing card name`);
    }

    const item: MTGCollectionItem = {
      card_name: normalizeCardName(rawName),
      set_code: normalizeSetCode(rawSet) ?? '',
      collector_number: normalizeCollectorNumber(rawNumber) ?? '',
      foil: normalizeFoil(rawFoil),
      quantity: normalizeQuantity(rawQty),
      condition: normalizeCondition(rawCond),
      language: normalizeLanguage(rawLang),
    };

    // Validate against schema
    const result = MTGCollectionItemSchema.safeParse(item);
    if (!result.success) {
      const reason = result.error.errors.map((e) => `${e.path}: ${e.message}`).join(', ');
      if (tolerateErrors) {
        errors.push({ row: rowNum + 2, raw: JSON.stringify(row), reason });
        return;
      }
      throw new Error(`Row ${rowNum + 2} failed validation: ${reason}`);
    }

    items.push(result.data);
  });

  return CollectionParseResultSchema.parse({
    items,
    errors,
    source_format: format,
  });
}

/**
 * Safely retrieve a cell value from a parsed CSV row object.
 */
function getCellValue(
  row: RawRow,
  colIndex: number,
  headers: string[]
): string | undefined {
  if (colIndex < 0) return undefined;
  const key = headers[colIndex];
  return key ? row[key] : undefined;
}
