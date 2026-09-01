/**
 * Format constraints for MTG deck building.
 * Defines the rules for each supported format (Commander, Standard, Modern, etc.).
 * Used by the PromptOrchestrator to validate decks and generate correct prompts.
 */

/** Supported deck formats */
export type DeckFormat = 'commander' | 'standard' | 'modern' | 'pauper' | 'legacy' | 'vintage';

/** Constraint rules per format */
export interface FormatConstraints {
  /** Maximum total cards in the deck */
  maxCards: number;
  /** Maximum copies of any non-land card */
  maxCopiesPerCard: number;
  /** Whether the format allows a commander */
  allowsCommander: boolean;
  /** Maximum number of commanders (for partner commanders) */
  maxCommanders: number;
  /** Whether basic lands are unrestricted */
  basicLandsUnlimited: boolean;
  /** Format name for display */
  name: string;
}

/** Pre-defined format constraints */
export const FORMAT_CONSTRAINTS: Record<DeckFormat, FormatConstraints> = {
  commander: {
    maxCards: 100,
    maxCopiesPerCard: 1,
    allowsCommander: true,
    maxCommanders: 1,
    basicLandsUnlimited: true,
    name: 'Commander',
  },
  standard: {
    maxCards: 60,
    maxCopiesPerCard: 4,
    allowsCommander: false,
    maxCommanders: 0,
    basicLandsUnlimited: false,
    name: 'Standard',
  },
  modern: {
    maxCards: 60,
    maxCopiesPerCard: 4,
    allowsCommander: false,
    maxCommanders: 0,
    basicLandsUnlimited: false,
    name: 'Modern',
  },
  pauper: {
    maxCards: 60,
    maxCopiesPerCard: 1, // Commons only, so max 1 copy
    allowsCommander: false,
    maxCommanders: 0,
    basicLandsUnlimited: false,
    name: 'Pauper',
  },
  legacy: {
    maxCards: 60,
    maxCopiesPerCard: 4,
    allowsCommander: false,
    maxCommanders: 0,
    basicLandsUnlimited: false,
    name: 'Legacy',
  },
  vintage: {
    maxCards: 60,
    maxCopiesPerCard: 4,
    allowsCommander: false,
    maxCommanders: 0,
    basicLandsUnlimited: false,
    name: 'Vintage',
  },
};

/**
 * Get format constraints by format name
 */
export function getFormatConstraints(format: DeckFormat): FormatConstraints {
  return FORMAT_CONSTRAINTS[format] || FORMAT_CONSTRAINTS.standard;
}

/**
 * Validate a deck against format constraints
 * Returns an array of validation errors (empty if valid)
 */
export function validateDeckAgainstFormat(
  deck: MTGCollectionItem[],
  format: DeckFormat,
  collection: MTGCollectionItem[]
): string[] {
  const errors: string[] = [];
  const constraints = getFormatConstraints(format);

  if (deck.length === 0) {
    errors.push('Deck is empty');
    return errors;
  }

  // Check total card count
  const totalCards = deck.reduce((sum, card) => sum + card.quantity, 0);
  if (totalCards > constraints.maxCards) {
    errors.push(
      `Deck has ${totalCards} cards, but ${constraints.name} allows maximum ${constraints.maxCards} cards`
    );
  }

  // Check commander rules if applicable
  if (constraints.allowsCommander) {
    const commanders = deck.filter(
      (card) => card.isCommander || card.card_name.includes('Commander')
    );

    if (commanders.length === 0 && format === 'commander') {
      errors.push('Commander format requires exactly 1 commander');
    } else if (commanders.length > constraints.maxCommanders) {
      errors.push(
        `Commander format allows maximum ${constraints.maxCommanders} commander(s), found ${commanders.length}`
      );
    }
  }

  // Check card copies
  const copyCounts = new Map<string, number>();
  for (const card of deck) {
    const key = `${card.card_name}-${card.set_code}-${card.collector_number}-${card.foil}`;
    const current = copyCounts.get(key) || 0;
    copyCounts.set(key, current + card.quantity);

    if (card.quantity > constraints.maxCopiesPerCard && !isBasicLand(card)) {
      errors.push(
        `Card ${card.card_name} exceeds maximum ${constraints.maxCopiesPerCard} copies per card in ${constraints.name} format`
      );
    }
  }

  // Check basic lands limit (if not unrestricted)
  if (!constraints.basicLandsUnlimited) {
    const basicLands = deck.filter(isBasicLand);
    const landCounts = new Map<string, number>();
    for (const land of basicLands) {
      const key = land.card_name;
      const current = landCounts.get(key) || 0;
      landCounts.set(key, current + land.quantity);
    }

    for (const [landName, count] of landCounts) {
      if (count > 4) {
        errors.push(
          `Basic land ${landName} has ${count} copies, but ${constraints.name} allows max 4 of each`
        );
      }
    }
  }

  return errors;
}

/** Check if a card is a basic land */
function isBasicLand(card: MTGCollectionItem): boolean {
  const basicLands = new Set(['Plains', 'Island', 'Swamp', 'Mountain', 'Forest']);
  return basicLands.has(card.card_name);
}

/**
 * Generate format-specific constraints text for LLM prompts
 */
export function formatConstraintsText(config: {
  format: DeckFormat;
  maxCards: number;
  allowDuplicates: boolean;
  commander: string | null;
  bannedCards: string[];
  requiredCards: string[];
}): string {
  const constraints = getFormatConstraints(config.format);
  const parts: string[] = [];

  parts.push(`- Format: ${constraints.name.toUpperCase()}`);
  parts.push(`- Maximum cards: ${config.maxCards}`);

  const effectiveMaxDuplicates = config.allowDuplicates ? 4 : constraints.maxCopiesPerCard;
  parts.push(`- Allow duplicates: ${config.allowDuplicates ? 'Yes' : 'No (max ' + effectiveMaxDuplicates + ' copy)'}`);

  if (config.commander) {
    parts.push(`- Commander: ${config.commander}`);
  }

  if (config.bannedCards.length > 0) {
    parts.push(`- Banned cards: ${config.bannedCards.join(', ')}`);
  }

  if (config.requiredCards.length > 0) {
    parts.push(`- Required cards: ${config.requiredCards.join(', ')}`);
  }

  // Format-specific rules
  if (config.format === 'commander') {
    parts.push(
      '- Commander rules: exactly 1 commander, 100 total cards, singleton except basic lands'
    );
  } else {
    parts.push(
      `- ${constraints.name} rules: 4 copies max unless restricted/banned`
    );
  }

  return parts.join('\n');
}