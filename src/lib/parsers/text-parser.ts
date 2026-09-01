/**
 * Text/Decklist Collection Parser — entry point for parsing raw text inputs.
 *
 * Supports formats like:
 *   [Quantity] [Card Name] [Set] [Collector Number] *[foil if applicable]
 *
 * Example inputs:
 *   4 Lightning Bolt M21 123
 *   2 Island NEO 245
 *   1 Black Lotus 3ED 283 *foil*
 *
 * Also supports comma-separated quick format:
 *   Lightning Bolt, M21, 123, 4
 *   Island, NEO, 245, 2
 */

import { MTGCollectionItem, MTGCollectionItemSchema } from '../../types/collection';
import { CollectionParseResult, CollectionParseResultSchema } from '../../types/collection';

/** Raw row from text parsing */
interface RawTextRow {
  card_name: string | undefined;
  set_code: string | undefined;
  collector_number: string | undefined;
  quantity: string | undefined;
  foil: boolean | undefined;
}

/**
 * Parse options for text parsing
 */
interface ParseTextOptions {
  /** If true, rows that fail validation are logged to errors array
   *  but do not abort the parse (default: true). */
  tolerateErrors?: boolean;
}

/**
 * Parse a text/decklist collection string into a validated CollectionParseResult.
 *
 * Supported formats:
 * 1. Space-delimited: [Quantity] [Card Name] [Set] [Collector Number] [*foil]
 * 2. Comma-separated: [Card Name], [Set], [Collector Number], [Quantity]
 *
 * @param text - Raw text content as a string
 * @param options - Parsing options
 * @returns CollectionParseResult with items, errors, and source format
 */
export function parseCollectionText(
  text: string,
  options: ParseTextOptions = {}
): CollectionParseResult {
  const { tolerateErrors = true } = options;
  const errors: CollectionParseResult['errors'] = [];
  const items: MTGCollectionItem[] = [];

  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  if (lines.length === 0) {
    throw new Error('Text input has no content');
  }

  lines.forEach((line, lineNum) => {
    let parsed: RawTextRow | null = null;

    // Try comma-separated format first: Card Name, Set, Collector Number, Quantity
    const commaMatch = line.match(
      /^(.+?),\s*([A-Z0-9]+),\s*([\d]+)(?:\s*,\s*(true|false))?$/i
    );

    if (commaMatch) {
      parsed = {
        card_name: commaMatch[1].trim(),
        set_code: commaMatch[2].trim().toUpperCase(),
        collector_number: commaMatch[3].trim(),
        quantity: '1', // default to 1 if not specified
        foil: commaMatch[4] ? commaMatch[4].trim().toLowerCase() === 'true' : false,
      };
    } else {
      // Try space-delimited format: [Quantity] [Card Name] [Set] [Collector Number] [*foil]
      const spaceMatch = line.match(
        /^(\d+)\s+(.+?)\s+([A-Z0-9]+)\s+([\d]+)(?:\s\*foil)?$/i
      );

      if (spaceMatch) {
        parsed = {
          card_name: spaceMatch[2].trim(),
          set_code: spaceMatch[3].trim().toUpperCase(),
          collector_number: spaceMatch[4].trim(),
          quantity: spaceMatch[1].trim(),
          foil: line.includes('*foil*') || line.includes('*-foil-*'),
        };
      }
    }

    // If neither format matched, try flexible parsing
    if (!parsed) {
      // Attempt flexible space-delimited with various layouts
      const flexibleMatch = line.match(
        /^(\d+)\s+(.+?)(?:\s+([A-Z0-9]+))?(?:\s+([\d]+))?$/i
      );

      if (flexibleMatch) {
        parsed = {
          card_name: flexibleMatch[2].trim(),
          set_code: flexibleMatch[3] ? flexibleMatch[3].trim().toUpperCase() : '',
          collector_number: flexibleMatch[4] ? flexibleMatch[4].trim() : '',
          quantity: flexibleMatch[1].trim(),
          foil: false,
        };
      }
    }

    // If still no match, skip this line (or error depending on tolerance)
    if (!parsed) {
      if (tolerateErrors) {
        errors.push({
          row: lineNum + 1,
          raw: line,
          reason: 'Could not parse line format',
        });
        return;
      }
      throw new Error(`Line ${lineNum + 1}: could not parse format`);
    }

    // Build the collection item
    const item: MTGCollectionItem = {
      card_name: parsed.card_name,
      set_code: parsed.set_code,
      collector_number: parsed.collector_number,
      foil: parsed.foil,
      quantity: parseInt(parsed.quantity, 10) || 1,
      condition: 'Near Mint', // default condition
      language: 'English', // default language
    };

    // Validate against schema
    const result = MTGCollectionItemSchema.safeParse(item);
    if (!result.success) {
      const reason = result.error.errors.map((e) => `${e.path}: ${e.message}`).join(', ');
      if (tolerateErrors) {
        errors.push({
          row: lineNum + 1,
          raw: line,
          reason,
        });
        return;
      }
      throw new Error(`Line ${lineNum + 1} failed validation: ${reason}`);
    }

    items.push(result.data);
  });

  // Detect format based on content analysis
  const sourceFormat = detectTextFormat(lines);

  return CollectionParseResultSchema.parse({
    items,
    errors,
    source_format: sourceFormat,
  });
}

/**
 * Detect the format of text input based on line patterns
 */
function detectTextFormat(lines: string[]): 'csv' | 'decklist' | 'unknown' {
  if (lines.length === 0) return 'unknown';

  let decklistLines = 0;
  let commaLines = 0;

  for (const line of lines.slice(0, 20)) { // Check first 20 lines
    // Check for decklist pattern: starts with number
    if (/^\d+\s/.test(line)) {
      decklistLines++;
    }
    // Check for comma-separated pattern
    if (line.includes(',') && /[A-Z]/.test(line)) {
      commaLines++;
    }
  }

  // If more than half the lines match decklist pattern, it's a decklist
  if (decklistLines > lines.length / 2) return 'decklist';
  // If more than half match comma format, it's CSV-like
  if (commaLines > lines.length / 2) return 'csv';
  return 'unknown';
}

/**
 * Get a human-readable description of the detected format
 */
export function getFormatDescription(format: 'csv' | 'decklist' | 'unknown'): string {
  switch (format) {
    case 'decklist':
      return 'Space-delimited decklist format: [Quantity] [Card Name] [Set] [Collector Number]';
    case 'csv':
      return 'Comma-separated format: Card Name, Set Code, Collector Number, Quantity';
    case 'unknown':
    default:
      return 'Unknown format - auto-detected';
  }
}

// Export utility functions for use in components
export { detectTextFormat, getFormatDescription, ParseTextOptions };