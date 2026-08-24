/**
 * Format detection by header fingerprinting.
 *
 * Each exporter includes a distinctive set of columns. We match on
 * the strongest signal first, then fall back to custom.
 */
import { SourceFormat } from './header-mapper';
export type { SourceFormat };
/**
 * Detect the source format from a CSV header row.
 */
export declare function detectFormat(headers: string[]): SourceFormat;
//# sourceMappingURL=format-detector.d.ts.map