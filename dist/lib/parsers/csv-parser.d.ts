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
import { type CollectionParseResult } from '../../types/collection';
import { detectFormat, SourceFormat } from './format-detector';
import { HeaderMappings } from './header-mapper';
export { detectFormat, SourceFormat, HeaderMappings };
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
export declare function parseCollectionCsv(csvText: string, options?: ParseOptions): CollectionParseResult;
//# sourceMappingURL=csv-parser.d.ts.map