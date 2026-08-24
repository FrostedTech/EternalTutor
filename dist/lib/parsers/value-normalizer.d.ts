/**
 * Value normalization utilities.
 *
 * Converts raw CSV cell values from various exporters into the
 * canonical types defined by MTGCollectionItemSchema.
 */
import { CardCondition, type LanguageCode } from '../../types/collection';
/**
 * Normalize the Foil column. Different exporters use different conventions:
 *  - ManaBox:   "normal" / "foil"
 *  - Archidekt: "false" / "true" (string)
 *  - Moxfield:  "False" / "True"
 *  - Delver Lens: "No" / "Yes"
 *  - Custom:    "0" / "1"
 */
export declare function normalizeFoil(value: string | undefined): boolean;
/**
 * Parse quantity from various column formats. Defaults to 1 if
 * the value is missing or unparseable.
 */
export declare function normalizeQuantity(value: string | undefined): number;
export declare function normalizeCondition(value: string | undefined): CardCondition;
/**
 * Normalize the card name. Extracts split card double-slashes if
 * the name contains the pattern `Name1 // Name2` or `Name1/Name2`.
 * Returns the canonical Scryfall name format: `Name1 // Name2`.
 */
export declare function normalizeCardName(value: string): string;
/**
 * Normalize the language field. Validates against the Scryfall
 * language code set. Falls back to "en" if unrecognized.
 */
export declare function normalizeLanguage(value: string | undefined): LanguageCode;
/**
 * Normalize set code — strip whitespace, uppercase.
 */
export declare function normalizeSetCode(value: string | undefined): string | undefined;
/**
 * Normalize collector number — strip whitespace, preserve format
 * (may include letters, suffixes like "a", "b" for split cards).
 */
export declare function normalizeCollectorNumber(value: string | undefined): string | undefined;
//# sourceMappingURL=value-normalizer.d.ts.map