import { z } from 'zod';

/**
 * Condition enum — matches standard TCG/MTG card grading scales.
 * Values follow the same conventions as major collection trackers
 * (ManaBox, Archidekt, Moxfield).
 */
export const CardConditionSchema = z.enum([
  'near_mint',
  'lightly_played',
  'moderately_played',
  'heavily_played',
  'damaged',
]);

export type CardCondition = z.infer<typeof CardConditionSchema>;

/**
 * Language codes — ISO 639-1 two-letter codes used by Scryfall.
 * Includes the special Scryfall value "part" forplanar/parts cards.
 */
export type LanguageCode = z.infer<typeof LanguageCodeSchema>;

export const LanguageCodeSchema = z.enum([
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
export const MTGCollectionItemSchema = z.object({
  card_name: z.string().min(1, 'card_name must not be empty'),
  set_code: z.string().max(8),
  collector_number: z.string(),
  foil: z.boolean(),
  quantity: z.number().int().nonnegative(),
  condition: CardConditionSchema,
  language: LanguageCodeSchema,
});

export type MTGCollectionItem = z.infer<typeof MTGCollectionItemSchema>;

/**
 * ParsedCollectionRow — intermediate type returned by parsers before
 * full schema validation. Allows partial data and error collection.
 */
export const ParsedCollectionRowSchema = z.object({
  card_name: z.string(),
  set_code: z.string().optional(),
  collector_number: z.string().optional(),
  foil: z.boolean().optional(),
  quantity: z.number().int().nonnegative().optional(),
  condition: CardConditionSchema.optional(),
  language: LanguageCodeSchema.optional(),
});

export type ParsedCollectionRow = z.infer<typeof ParsedCollectionRowSchema>;

/**
 * CollectionParseResult — wrapper for bulk parse operations.
 */
export const CollectionParseResultSchema = z.object({
  items: z.array(MTGCollectionItemSchema),
  errors: z.array(
    z.object({
      row: z.number(),
      raw: z.string(),
      reason: z.string(),
    })
  ),
  source_format: z.enum(['manabox', 'archidekt', 'moxfield', 'delver_lens', 'custom']),
});

export type CollectionParseResult = z.infer<typeof CollectionParseResultSchema>;
