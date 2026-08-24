"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionParseResultSchema = exports.ParsedCollectionRowSchema = exports.MTGCollectionItemSchema = exports.LanguageCodeSchema = exports.CardConditionSchema = void 0;
const zod_1 = require("zod");
/**
 * Condition enum — matches standard TCG/MTG card grading scales.
 * Values follow the same conventions as major collection trackers
 * (ManaBox, Archidekt, Moxfield).
 */
exports.CardConditionSchema = zod_1.z.enum([
    'near_mint',
    'lightly_played',
    'moderately_played',
    'heavily_played',
    'damaged',
]);
exports.LanguageCodeSchema = zod_1.z.enum([
    'en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'ru', 'zh', 'zh-Hans',
    'zh-Hant', 'he', 'hi', 'fi', 'cs', 'el', 'hu', 'no', 'pl', 'ro', 'da',
    'sl', 'sv', 'sk', 'bg', 'sr', 'hr', 'id', 'ms', 'th', 'tr', 'uk', 'vi',
    'part', 'non',
]);
/**
 * MTGCollectionItem — the unified normalized schema for a single line
 * in the user's collection. Every CSV/text parser output must conform
 * to this shape before entering the matcher or deck engine.
 *
 * Field semantics:
 *  - card_name:       canonical Scryfall name (e.g. "Lightning Bolt", "Fire // Ice")
 *  - set_code:        3-4 character set abbreviation (e.g. "SNC", "FDN", "MOC")
 *  - collector_number: Scryfall-style collector number (may include letters/suffixes)
 *  - foil:            true if the user owns a foil-printed copy
 *  - quantity:        non-negative integer, total copies owned
 *  - condition:       physical card condition; defaults to 'near_mint' when unknown
 *  - language:        ISO language code of the physical print
 */
exports.MTGCollectionItemSchema = zod_1.z.object({
    card_name: zod_1.z.string().min(1, 'card_name must not be empty'),
    set_code: zod_1.z.string().max(8),
    collector_number: zod_1.z.string(),
    foil: zod_1.z.boolean(),
    quantity: zod_1.z.number().int().nonnegative(),
    condition: exports.CardConditionSchema,
    language: exports.LanguageCodeSchema,
});
/**
 * ParsedCollectionRow — intermediate type returned by parsers before
 * full schema validation. Allows partial data and error collection.
 */
exports.ParsedCollectionRowSchema = zod_1.z.object({
    card_name: zod_1.z.string(),
    set_code: zod_1.z.string().optional(),
    collector_number: zod_1.z.string().optional(),
    foil: zod_1.z.boolean().optional(),
    quantity: zod_1.z.number().int().nonnegative().optional(),
    condition: exports.CardConditionSchema.optional(),
    language: exports.LanguageCodeSchema.optional(),
});
/**
 * CollectionParseResult — wrapper for bulk parse operations.
 */
exports.CollectionParseResultSchema = zod_1.z.object({
    items: zod_1.z.array(exports.MTGCollectionItemSchema),
    errors: zod_1.z.array(zod_1.z.object({
        row: zod_1.z.number(),
        raw: zod_1.z.string(),
        reason: zod_1.z.string(),
    })),
    source_format: zod_1.z.enum(['manabox', 'archidekt', 'moxfield', 'delver_lens', 'custom']),
});
//# sourceMappingURL=collection.js.map