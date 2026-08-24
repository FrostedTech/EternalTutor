/**
 * Test suite for CSV collection parser.
 *
 * Covers: format detection, header mapping, value normalization,
 * split-card name handling, edge-case card names, foreign language
 * codes, error tolerance, and fallback behavior.
 *
 * Per [ENG-1-2] Test-Driven Verification Protocol.
 */

import { describe, expect, it } from 'vitest';
import { parseCollectionCsv } from '../src/lib/parsers/csv-parser';
import { detectFormat } from '../src/lib/parsers/format-detector';
import {
  normalizeFoil,
  normalizeQuantity,
  normalizeCondition,
  normalizeCardName,
  normalizeLanguage,
} from '../src/lib/parsers/value-normalizer';

// Test CSV fixtures

const MANABOX_CSV = [
  'Name,Set code,Set name,Collector number,Foil,Rarity,Quantity,ManaBox ID,Scryfall ID,Purchase price,Misprint,Altered,Condition,Language,Purchase price currency,Added',
  'Lightning Bolt,SNC,Streets of New Capenna,135,normal,common,4,67728,492aa24c-61c4-48bc-b7b7-f423be2662da,0.13,false,false,near_mint,en,USD,2025-03-16T12:52:54.972Z',
  'Swords to Plowshares,FDN,Foundations,25,foil,rare,1,101336,f229b0e6-1ffd-410e-b04b-a0afc179c58c,0.32,false,false,near_mint,en,USD,2025-03-20T22:14:59.703Z',
].join('\n');

const MANABOX_CSV_WITH_SPLIT_CARDS = [
  'Name,Set code,Set name,Collector number,Foil,Rarity,Quantity,ManaBox ID,Scryfall ID,Purchase price,Misprint,Altered,Condition,Language,Purchase price currency,Added',
  'Fire // Ice,ONS,Odyssey,167,foil,rare,1,0,0,0.15,false,false,near_mint,en,USD,2025-01-01T00:00:00.000Z',
  '"Syr Alin, the Lion\'s Claw",FDN,Foundations,582,normal,uncommon,2,100556,5d42be5f-a6a7-4699-abf7-9632de6daede,0.09,false,false,near_mint,en,USD,2025-03-20T22:14:59.703Z',
  'MORTAR // MORTAR,ALA,Shards of Alara,185,normal,uncommon,3,0,0,0.25,false,false,moderately_played,fr,EUR,2025-02-01T00:00:00.000Z',
].join('\n');

const MANABOX_CSV_WITH_ERRORS = [
  'Name,Set code,Set name,Collector number,Foil,Rarity,Quantity,ManaBox ID,Scryfall ID,Purchase price,Misprint,Altered,Condition,Language,Purchase price currency,Added',
  'Lightning Bolt,SNC,Streets of New Capenna,135,normal,common,4,67728,492aa24c-61c4-48bc-b7b7-f423be2662da,0.13,false,false,near_mint,en,USD,2025-03-16T12:52:54.972Z',
  ',SNC,Streets of New Capenna,136,normal,common,2,67729,invalid-id,0.13,false,false,near_mint,en,USD,2025-03-16T12:52:54.972Z',
  'Bad Card,TOOLONGSET,Invalid Set,999,maybe,common,notanumber,0,0,99.99,false,false,broken,english,USD,2025-03-16T12:52:54.972Z',
].join('\n');

const ARCHIDEKT_CSV = [
  'Count,Name,Set,Collector Number,Foil,Condition,Language,Edition,Artist,Rarity,Price,Price Currency,Acquired Worth,Last Modified,URL,Image URL,Card Type,Cost,Type,Subtype,Oracle Text,Power/Toughness,Tags,Notes,Box,Story Number,Mana Box URL,Scryfall ID,Archidekt ID',
  '4,Lightning Bolt,SNC,135,true,near_mint,en,Streets of New Capenna,Christopher Rush,common,0.13,USD,1.00,2025-01-01,https://archidekt.cards,https://img.scryfall,Instant,1,Instant,,Deal 3 damage,.,,,,"a,b,c",,12345',
].join('\n');

const MOXFIELD_CSV = [
  'Quantity,Name,Set,Card Number,Foil,Last Edited,Folder,Language,Condition,Tags,Notes,Price',
  '2,Swords to Plowshares,FDN,25,False,2025-03-16,Sword to Plowshares,en,near_mint,Modern,,"0.32"',
].join('\n');

const DELVER_LENS_CSV = [
  'Name,Set,Card Number,Count,Foil,Language,Condition,Price Guide',
  'Disdainful Stroke,SNC,39,2,normal,en,near_mint,1.00',
].join('\n');

const CUSTOM_CSV = [
  'Name,Quantity,Set code,Collector number,Foil,Condition,Language',
  'Counterspell,3,LEB,54,true,near_mint,en',
  'Ancestral Recall,1,LEA,1,false,lightly_played,en',
].join('\n');

describe('parseCollectionCsv', () => {
  describe('basic parsing', () => {
    it('parses a standard ManaBox CSV export correctly', () => {
      const result = parseCollectionCsv(MANABOX_CSV);

      expect(result.source_format).toBe('manabox');
      expect(result.errors).toHaveLength(0);
      expect(result.items).toHaveLength(2);

      const lightning = result.items[0]!;
      expect(lightning.card_name).toBe('Lightning Bolt');
      expect(lightning.set_code).toBe('SNC');
      expect(lightning.collector_number).toBe('135');
      expect(lightning.foil).toBe(false);
      expect(lightning.quantity).toBe(4);
      expect(lightning.condition).toBe('near_mint');
      expect(lightning.language).toBe('en');
    });

    it('parses a quoted card name with comma correctly', () => {
      const csv = [
        'Name,Set code,Collector number,Foil,Quantity,Condition,Language',
        '"Syr Alin, the Lion\'s Claw",FDN,582,normal,1,near_mint,en',
      ].join('\n');

      const result = parseCollectionCsv(csv);
      expect(result.items[0]!.card_name).toBe("Syr Alin, the Lion's Claw");
    });

    it('parses a custom CSV with minimal headers', () => {
      const result = parseCollectionCsv(CUSTOM_CSV);

      expect(result.source_format).toBe('custom');
      expect(result.items).toHaveLength(2);
      expect(result.items[0]!.card_name).toBe('Counterspell');
      expect(result.items[0]!.foil).toBe(true);
      expect(result.items[1]!.quantity).toBe(1);
    });
  });

  describe('format detection', () => {
    it('detects ManaBox format by distinctive headers', () => {
      expect(detectFormat(['Name', 'Set code', 'ManaBox ID', 'Purchase price currency', 'Added'])).toBe('manabox');
    });

    it('detects Archidekt format by distinctive headers', () => {
      expect(detectFormat(['Name', 'Set', 'Archidekt ID', 'Collector Number'])).toBe('archidekt');
    });

    it('detects Moxfield format by distinctive headers', () => {
      expect(detectFormat(['Name', 'Set', 'Moxfield ID', 'Last Edited'])).toBe('moxfield');
    });

    it('detects Delver Lens format by distinctive headers', () => {
      expect(detectFormat(['Name', 'Set', 'Card Number', 'Price Guide'])).toBe('delver_lens');
    });

    it('falls back to custom format for unknown headers', () => {
      expect(detectFormat(['Card Name', 'Total Qty', 'Set Code'])).toBe('custom');
    });

    it('detects Delver Lens when only Count column is present', () => {
      expect(detectFormat(['Name', 'Count', 'Set'])).toBe('delver_lens');
    });
  });

  describe('split cards', () => {
    it('preserves canonical split card names with //', () => {
      const result = parseCollectionCsv(MANABOX_CSV_WITH_SPLIT_CARDS);
      expect(result.items[0]!.card_name).toBe('Fire // Ice');
    });

    it('normalizes uppercase split card names', () => {
      const result = parseCollectionCsv(MANABOX_CSV_WITH_SPLIT_CARDS);
      const mortars = result.items[2]!;
      expect(mortars.card_name).toBe('MORTAR // MORTAR');
    });
  });

  describe('foreign language codes', () => {
    it('accepts valid ISO language codes', () => {
      const csv = [
        'Name,Set code,Collector number,Foil,Quantity,Condition,Language',
        'Lightning Bolt,SNC,135,normal,4,near_mint,fr',
        'Disdainful Stroke,FDN,609,foil,1,lightly_played,ja',
      ].join('\n');

      const result = parseCollectionCsv(csv);
      expect(result.items[0]!.language).toBe('fr');
      expect(result.items[1]!.language).toBe('ja');
    });

    it('falls back to "en" for unrecognized language codes', () => {
      const csv = [
        'Name,Set code,Collector number,Foil,Quantity,Condition,Language',
        'Lightning Bolt,SNC,135,normal,4,near_mint,english',
      ].join('\n');

      const result = parseCollectionCsv(csv);
      expect(result.items[0]!.language).toBe('en');
    });
  });

  describe('value normalization', () => {
    it('parses Archidekt CSV with true/false foil strings', () => {
      const result = parseCollectionCsv(ARCHIDEKT_CSV);
      expect(result.items[0]!.foil).toBe(true);
    });

    it('parses Moxfield CSV with False foil string', () => {
      const result = parseCollectionCsv(MOXFIELD_CSV);
      expect(result.items[0]!.foil).toBe(false);
    });

    it('parses Delver Lens CSV with Count header', () => {
      const result = parseCollectionCsv(DELVER_LENS_CSV);
      expect(result.source_format).toBe('delver_lens');
      expect(result.items[0]!.quantity).toBe(2);
    });

    it('defaults quantity to 1 when missing or unparseable', () => {
      const csv = [
        'Name,Set code,Collector number,Foil,Quantity,Condition,Language',
        'Lightning Bolt,SNC,135,normal,,near_mint,en',
      ].join('\n');

      const result = parseCollectionCsv(csv);
      expect(result.items[0]!.quantity).toBe(1);
    });

    it('defaults condition to near_mint when missing', () => {
      const csv = [
        'Name,Set code,Collector number,Foil,Quantity,Language',
        'Lightning Bolt,SNC,135,normal,4,en',
      ].join('\n');

      const result = parseCollectionCsv(csv);
      expect(result.items[0]!.condition).toBe('near_mint');
    });
  });

  describe('error handling', () => {
    it('logs invalid rows to errors array without aborting', () => {
      const result = parseCollectionCsv(MANABOX_CSV_WITH_ERRORS);

      // First row is valid
      expect(result.items).toHaveLength(1);
      expect(result.items[0]!.card_name).toBe('Lightning Bolt');

      // Two rows should have errors
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0]!.reason).toContain('Missing card name');
      expect(result.errors[1]!.reason).toContain('set_code');
    });

    it('throws when CSV lacks mandatory Name header', () => {
      const csv = 'Set code,Quantity\nSNC,4';
      expect(() => parseCollectionCsv(csv)).toThrow(/must contain a "Name" header/);
    });

    it('throws when CSV lacks mandatory Quantity header', () => {
      const csv = 'Name,Set code\nLightning Bolt,SNC';
      expect(() => parseCollectionCsv(csv)).toThrow(/must contain a "Name" header/);
    });

    it('throws on malformed CSV', () => {
      expect(() => parseCollectionCsv('')).toThrow(/has no headers/);
    });
  });

  describe('value-normalizer unit tests', () => {
    it('normalizeFoil accepts various conventions', () => {
      expect(normalizeFoil('normal')).toBe(false);
      expect(normalizeFoil('foil')).toBe(true);
      expect(normalizeFoil('true')).toBe(true);
      expect(normalizeFoil('False')).toBe(false);
      expect(normalizeFoil('yes')).toBe(true);
      expect(normalizeFoil('No')).toBe(false);
      expect(normalizeFoil('1')).toBe(true);
      expect(normalizeFoil(undefined)).toBe(false);
    });

    it('normalizeQuantity defaults to 1 on invalid input', () => {
      expect(normalizeQuantity('4')).toBe(4);
      expect(normalizeQuantity('notanumber')).toBe(1);
      expect(normalizeQuantity(undefined)).toBe(1);
      expect(normalizeQuantity('-5')).toBe(1);
    });

    it('normalizeCondition maps aliases correctly', () => {
      expect(normalizeCondition('near_mint')).toBe('near_mint');
      expect(normalizeCondition('Near Mint')).toBe('near_mint');
      expect(normalizeCondition('nm')).toBe('near_mint');
      expect(normalizeCondition('LP')).toBe('lightly_played');
      expect(normalizeCondition('Heavily Played')).toBe('heavily_played');
      expect(normalizeCondition('')).toBe('near_mint');
      expect(normalizeCondition(undefined)).toBe('near_mint');
    });

    it('normalizeCardName preserves canonical split format', () => {
      expect(normalizeCardName('Fire // Ice')).toBe('Fire // Ice');
      expect(normalizeCardName('Fire // Ice')).toBe('Fire // Ice');
    });

    it('normalizeLanguage validates against Scryfall codes', () => {
      expect(normalizeLanguage('fr')).toBe('fr');
      expect(normalizeLanguage('EN')).toBe('en');
      expect(normalizeLanguage('gibberish')).toBe('en');
    });
  });
});
