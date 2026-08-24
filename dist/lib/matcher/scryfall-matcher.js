"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScryfallMatcher = void 0;
exports.matchCollectionItemToScryfall = matchCollectionItemToScryfall;
/**
 * Matches a collection item against a Scryfall card.
 * Returns true if all relevant fields match.
 */
function matchCollectionItemToScryfall(collectionItem, scryfallCard) {
    // Match card name (exact, case-insensitive after normalization)
    if (collectionItem.card_name.toLowerCase() !== scryfallCard.name.toLowerCase()) {
        return false;
    }
    // Match set code (exact, case-insensitive)
    if (collectionItem.set_code.toLowerCase() !== scryfallCard.set.toLowerCase()) {
        return false;
    }
    // Match collector number (exact string, but allow empty strings to match)
    if (collectionItem.collector_number !== '' &&
        scryfallCard.collector_number !== '' &&
        collectionItem.collector_number !== scryfallCard.collector_number) {
        return false;
    }
    // Match foil: if collection item says foil, the Scryfall card must be foil.
    // If collection item says non-foil, we accept either (since we don't know if
    // the user owns a foil or non-foil printing? Actually, we want to match the
    // exact printing they own. We'll require foil to match exactly.)
    if (collectionItem.foil !== scryfallCard.foil) {
        return false;
    }
    // All checks passed
    return true;
}
/**
 * In-memory matcher that holds a cache of Scryfall cards and can match
 * collection items against them.
 */
class ScryfallMatcher {
    cards;
    constructor(cards) {
        this.cards = cards;
    }
    /**
     * Find all Scryfall cards that match the given collection item.
     * Returns an array of matching cards (could be multiple if there are
     * different printings with same name/set/number/foil? Actually, Scryfall
     * uniquely identifies by id, but we might have duplicates in our cache?).
     */
    match(collectionItem) {
        return this.cards.filter(card => matchCollectionItemToScryfall(collectionItem, card));
    }
    /**
     * Find the first matching Scryfall card, or null if none found.
     */
    findOne(collectionItem) {
        const matches = this.match(collectionItem);
        return matches.length > 0 ? matches[0] : null;
    }
}
exports.ScryfallMatcher = ScryfallMatcher;
//# sourceMappingURL=scryfall-matcher.js.map