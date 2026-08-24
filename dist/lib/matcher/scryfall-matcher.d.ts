import { MTGCollectionItem } from '../../types/collection';
/** Represents a Scryfall card object with the fields we need for matching. */
export interface ScryfallCard {
    id: string;
    name: string;
    set: string;
    collector_number: string;
    foil: boolean;
}
/**
 * Matches a collection item against a Scryfall card.
 * Returns true if all relevant fields match.
 */
export declare function matchCollectionItemToScryfall(collectionItem: MTGCollectionItem, scryfallCard: ScryfallCard): boolean;
/**
 * In-memory matcher that holds a cache of Scryfall cards and can match
 * collection items against them.
 */
export declare class ScryfallMatcher {
    private cards;
    constructor(cards: ScryfallCard[]);
    /**
     * Find all Scryfall cards that match the given collection item.
     * Returns an array of matching cards (could be multiple if there are
     * different printings with same name/set/number/foil? Actually, Scryfall
     * uniquely identifies by id, but we might have duplicates in our cache?).
     */
    match(collectionItem: MTGCollectionItem): ScryfallCard[];
    /**
     * Find the first matching Scryfall card, or null if none found.
     */
    findOne(collectionItem: MTGCollectionItem): ScryfallCard | null;
}
//# sourceMappingURL=scryfall-matcher.d.ts.map