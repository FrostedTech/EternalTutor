"use strict";
/**
 * Value normalization utilities.
 *
 * Converts raw CSV cell values from various exporters into the
 * canonical types defined by MTGCollectionItemSchema.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeFoil = normalizeFoil;
exports.normalizeQuantity = normalizeQuantity;
exports.normalizeCondition = normalizeCondition;
exports.normalizeCardName = normalizeCardName;
exports.normalizeLanguage = normalizeLanguage;
exports.normalizeSetCode = normalizeSetCode;
exports.normalizeCollectorNumber = normalizeCollectorNumber;
const collection_1 = require("../../types/collection");
/**
 * Normalize the Foil column. Different exporters use different conventions:
 *  - ManaBox:   "normal" / "foil"
 *  - Archidekt: "false" / "true" (string)
 *  - Moxfield:  "False" / "True"
 *  - Delver Lens: "No" / "Yes"
 *  - Custom:    "0" / "1"
 */
function normalizeFoil(value) {
    if (value === undefined)
        return false;
    const lower = value.trim().toLowerCase();
    switch (lower) {
        case 'foil':
        case 'true':
        case 'yes':
        case '1':
        case 'foil yes':
            return true;
        case 'normal':
        case 'false':
        case 'no':
        case '0':
        case '':
            return false;
        default:
            return false;
    }
}
/**
 * Parse quantity from various column formats. Defaults to 1 if
 * the value is missing or unparseable.
 */
function normalizeQuantity(value) {
    if (value === undefined)
        return 1;
    const parsed = parseInt(value.trim(), 10);
    return Number.isNaN(parsed) || parsed < 0 ? 1 : parsed;
}
/**
 * Condition value mapping table.
 * Maps the various string representations used by exporters
 * to the canonical CardCondition enum.
 */
const ConditionAliases = {
    // ManaBox / Archidekt style
    near_mint: 'near_mint',
    'near mint': 'near_mint',
    nm: 'near_mint',
    'nm-m': 'near_mint',
    // Lightly Played
    lightly_played: 'lightly_played',
    'lightly played': 'lightly_played',
    lp: 'lightly_played',
    // Moderately Played
    moderately_played: 'moderately_played',
    'moderately played': 'moderately_played',
    mp: 'moderately_played',
    // Heavily Played
    heavily_played: 'heavily_played',
    'heavily played': 'heavily_played',
    hp: 'heavily_played',
    // Damaged
    damaged: 'damaged',
    dmg: 'damaged',
};
function normalizeCondition(value) {
    if (value === undefined || value.trim() === '') {
        return 'near_mint';
    }
    const lower = value.trim().toLowerCase().replace(/[.\s_]+/g, ' ');
    return ConditionAliases[lower] ?? 'near_mint';
}
/**
 * Normalize the card name. Extracts split card double-slashes if
 * the name contains the pattern `Name1 // Name2` or `Name1/Name2`.
 * Returns the canonical Scryfall name format: `Name1 // Name2`.
 */
function normalizeCardName(value) {
    const trimmed = value.trim();
    // Standard split card format: "Fire // Ice" — already canonical
    if (trimmed.includes('//')) {
        const parts = trimmed.split('//').map((p) => p.trim());
        if (parts.length === 2 && parts[0] && parts[1]) {
            return `${parts[0]} // ${parts[1]}`;
        }
    }
    // Handle single-slash split card names (some exporters use /)
    // Only treat as split if there are exactly two non-empty parts
    // and the total looks like two card names
    const singleSlash = trimmed.split('/');
    if (singleSlash.length === 2) {
        const left = singleSlash[0].trim();
        const right = singleSlash[1].trim();
        // Heuristic: if right side is a single word and doesn't look like a
        // collector number suffix, treat as split card
        if (left && right && right.length > 1 && !right.match(/^[0-9]+$/)) {
            return `${left} // ${right}`;
        }
    }
    return trimmed;
}
/**
 * Normalize the language field. Validates against the Scryfall
 * language code set. Falls back to "en" if unrecognized.
 */
function normalizeLanguage(value) {
    if (value === undefined || value.trim() === '') {
        return 'en';
    }
    const lower = value.trim().toLowerCase();
    const parsed = collection_1.LanguageCodeSchema.safeParse(lower);
    return parsed.success ? parsed.data : 'en';
}
/**
 * Normalize set code — strip whitespace, uppercase.
 */
function normalizeSetCode(value) {
    if (value === undefined || value.trim() === '') {
        return undefined;
    }
    return value.trim().toUpperCase();
}
/**
 * Normalize collector number — strip whitespace, preserve format
 * (may include letters, suffixes like "a", "b" for split cards).
 */
function normalizeCollectorNumber(value) {
    if (value === undefined || value.trim() === '') {
        return undefined;
    }
    return value.trim();
}
//# sourceMappingURL=value-normalizer.js.map