import { z } from 'zod';
/**
 * Condition enum — matches standard TCG/MTG card grading scales.
 * Values follow the same conventions as major collection trackers
 * (ManaBox, Archidekt, Moxfield).
 */
export declare const CardConditionSchema: z.ZodEnum<["near_mint", "lightly_played", "moderately_played", "heavily_played", "damaged"]>;
export type CardCondition = z.infer<typeof CardConditionSchema>;
/**
 * Language codes — ISO 639-1 two-letter codes used by Scryfall.
 * Includes the special Scryfall value "part" forplanar/parts cards.
 */
export type LanguageCode = z.infer<typeof LanguageCodeSchema>;
export declare const LanguageCodeSchema: z.ZodEnum<["en", "es", "fr", "de", "it", "pt", "ja", "ko", "ru", "zh", "zh-Hans", "zh-Hant", "he", "hi", "fi", "cs", "el", "hu", "no", "pl", "ro", "da", "sl", "sv", "sk", "bg", "sr", "hr", "id", "ms", "th", "tr", "uk", "vi", "part", "non"]>;
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
export declare const MTGCollectionItemSchema: z.ZodObject<{
    card_name: z.ZodString;
    set_code: z.ZodString;
    collector_number: z.ZodString;
    foil: z.ZodBoolean;
    quantity: z.ZodNumber;
    condition: z.ZodEnum<["near_mint", "lightly_played", "moderately_played", "heavily_played", "damaged"]>;
    language: z.ZodEnum<["en", "es", "fr", "de", "it", "pt", "ja", "ko", "ru", "zh", "zh-Hans", "zh-Hant", "he", "hi", "fi", "cs", "el", "hu", "no", "pl", "ro", "da", "sl", "sv", "sk", "bg", "sr", "hr", "id", "ms", "th", "tr", "uk", "vi", "part", "non"]>;
}, "strip", z.ZodTypeAny, {
    card_name: string;
    set_code: string;
    collector_number: string;
    foil: boolean;
    quantity: number;
    condition: "near_mint" | "lightly_played" | "moderately_played" | "heavily_played" | "damaged";
    language: "en" | "es" | "fr" | "de" | "it" | "pt" | "ja" | "ko" | "ru" | "zh" | "zh-Hans" | "zh-Hant" | "he" | "hi" | "fi" | "cs" | "el" | "hu" | "no" | "pl" | "ro" | "da" | "sl" | "sv" | "sk" | "bg" | "sr" | "hr" | "id" | "ms" | "th" | "tr" | "uk" | "vi" | "part" | "non";
}, {
    card_name: string;
    set_code: string;
    collector_number: string;
    foil: boolean;
    quantity: number;
    condition: "near_mint" | "lightly_played" | "moderately_played" | "heavily_played" | "damaged";
    language: "en" | "es" | "fr" | "de" | "it" | "pt" | "ja" | "ko" | "ru" | "zh" | "zh-Hans" | "zh-Hant" | "he" | "hi" | "fi" | "cs" | "el" | "hu" | "no" | "pl" | "ro" | "da" | "sl" | "sv" | "sk" | "bg" | "sr" | "hr" | "id" | "ms" | "th" | "tr" | "uk" | "vi" | "part" | "non";
}>;
export type MTGCollectionItem = z.infer<typeof MTGCollectionItemSchema>;
/**
 * ParsedCollectionRow — intermediate type returned by parsers before
 * full schema validation. Allows partial data and error collection.
 */
export declare const ParsedCollectionRowSchema: z.ZodObject<{
    card_name: z.ZodString;
    set_code: z.ZodOptional<z.ZodString>;
    collector_number: z.ZodOptional<z.ZodString>;
    foil: z.ZodOptional<z.ZodBoolean>;
    quantity: z.ZodOptional<z.ZodNumber>;
    condition: z.ZodOptional<z.ZodEnum<["near_mint", "lightly_played", "moderately_played", "heavily_played", "damaged"]>>;
    language: z.ZodOptional<z.ZodEnum<["en", "es", "fr", "de", "it", "pt", "ja", "ko", "ru", "zh", "zh-Hans", "zh-Hant", "he", "hi", "fi", "cs", "el", "hu", "no", "pl", "ro", "da", "sl", "sv", "sk", "bg", "sr", "hr", "id", "ms", "th", "tr", "uk", "vi", "part", "non"]>>;
}, "strip", z.ZodTypeAny, {
    card_name: string;
    set_code?: string | undefined;
    collector_number?: string | undefined;
    foil?: boolean | undefined;
    quantity?: number | undefined;
    condition?: "near_mint" | "lightly_played" | "moderately_played" | "heavily_played" | "damaged" | undefined;
    language?: "en" | "es" | "fr" | "de" | "it" | "pt" | "ja" | "ko" | "ru" | "zh" | "zh-Hans" | "zh-Hant" | "he" | "hi" | "fi" | "cs" | "el" | "hu" | "no" | "pl" | "ro" | "da" | "sl" | "sv" | "sk" | "bg" | "sr" | "hr" | "id" | "ms" | "th" | "tr" | "uk" | "vi" | "part" | "non" | undefined;
}, {
    card_name: string;
    set_code?: string | undefined;
    collector_number?: string | undefined;
    foil?: boolean | undefined;
    quantity?: number | undefined;
    condition?: "near_mint" | "lightly_played" | "moderately_played" | "heavily_played" | "damaged" | undefined;
    language?: "en" | "es" | "fr" | "de" | "it" | "pt" | "ja" | "ko" | "ru" | "zh" | "zh-Hans" | "zh-Hant" | "he" | "hi" | "fi" | "cs" | "el" | "hu" | "no" | "pl" | "ro" | "da" | "sl" | "sv" | "sk" | "bg" | "sr" | "hr" | "id" | "ms" | "th" | "tr" | "uk" | "vi" | "part" | "non" | undefined;
}>;
export type ParsedCollectionRow = z.infer<typeof ParsedCollectionRowSchema>;
/**
 * CollectionParseResult — wrapper for bulk parse operations.
 */
export declare const CollectionParseResultSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        card_name: z.ZodString;
        set_code: z.ZodString;
        collector_number: z.ZodString;
        foil: z.ZodBoolean;
        quantity: z.ZodNumber;
        condition: z.ZodEnum<["near_mint", "lightly_played", "moderately_played", "heavily_played", "damaged"]>;
        language: z.ZodEnum<["en", "es", "fr", "de", "it", "pt", "ja", "ko", "ru", "zh", "zh-Hans", "zh-Hant", "he", "hi", "fi", "cs", "el", "hu", "no", "pl", "ro", "da", "sl", "sv", "sk", "bg", "sr", "hr", "id", "ms", "th", "tr", "uk", "vi", "part", "non"]>;
    }, "strip", z.ZodTypeAny, {
        card_name: string;
        set_code: string;
        collector_number: string;
        foil: boolean;
        quantity: number;
        condition: "near_mint" | "lightly_played" | "moderately_played" | "heavily_played" | "damaged";
        language: "en" | "es" | "fr" | "de" | "it" | "pt" | "ja" | "ko" | "ru" | "zh" | "zh-Hans" | "zh-Hant" | "he" | "hi" | "fi" | "cs" | "el" | "hu" | "no" | "pl" | "ro" | "da" | "sl" | "sv" | "sk" | "bg" | "sr" | "hr" | "id" | "ms" | "th" | "tr" | "uk" | "vi" | "part" | "non";
    }, {
        card_name: string;
        set_code: string;
        collector_number: string;
        foil: boolean;
        quantity: number;
        condition: "near_mint" | "lightly_played" | "moderately_played" | "heavily_played" | "damaged";
        language: "en" | "es" | "fr" | "de" | "it" | "pt" | "ja" | "ko" | "ru" | "zh" | "zh-Hans" | "zh-Hant" | "he" | "hi" | "fi" | "cs" | "el" | "hu" | "no" | "pl" | "ro" | "da" | "sl" | "sv" | "sk" | "bg" | "sr" | "hr" | "id" | "ms" | "th" | "tr" | "uk" | "vi" | "part" | "non";
    }>, "many">;
    errors: z.ZodArray<z.ZodObject<{
        row: z.ZodNumber;
        raw: z.ZodString;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        row: number;
        raw: string;
        reason: string;
    }, {
        row: number;
        raw: string;
        reason: string;
    }>, "many">;
    source_format: z.ZodEnum<["manabox", "archidekt", "moxfield", "delver_lens", "custom"]>;
}, "strip", z.ZodTypeAny, {
    items: {
        card_name: string;
        set_code: string;
        collector_number: string;
        foil: boolean;
        quantity: number;
        condition: "near_mint" | "lightly_played" | "moderately_played" | "heavily_played" | "damaged";
        language: "en" | "es" | "fr" | "de" | "it" | "pt" | "ja" | "ko" | "ru" | "zh" | "zh-Hans" | "zh-Hant" | "he" | "hi" | "fi" | "cs" | "el" | "hu" | "no" | "pl" | "ro" | "da" | "sl" | "sv" | "sk" | "bg" | "sr" | "hr" | "id" | "ms" | "th" | "tr" | "uk" | "vi" | "part" | "non";
    }[];
    errors: {
        row: number;
        raw: string;
        reason: string;
    }[];
    source_format: "custom" | "manabox" | "archidekt" | "moxfield" | "delver_lens";
}, {
    items: {
        card_name: string;
        set_code: string;
        collector_number: string;
        foil: boolean;
        quantity: number;
        condition: "near_mint" | "lightly_played" | "moderately_played" | "heavily_played" | "damaged";
        language: "en" | "es" | "fr" | "de" | "it" | "pt" | "ja" | "ko" | "ru" | "zh" | "zh-Hans" | "zh-Hant" | "he" | "hi" | "fi" | "cs" | "el" | "hu" | "no" | "pl" | "ro" | "da" | "sl" | "sv" | "sk" | "bg" | "sr" | "hr" | "id" | "ms" | "th" | "tr" | "uk" | "vi" | "part" | "non";
    }[];
    errors: {
        row: number;
        raw: string;
        reason: string;
    }[];
    source_format: "custom" | "manabox" | "archidekt" | "moxfield" | "delver_lens";
}>;
export type CollectionParseResult = z.infer<typeof CollectionParseResultSchema>;
//# sourceMappingURL=collection.d.ts.map