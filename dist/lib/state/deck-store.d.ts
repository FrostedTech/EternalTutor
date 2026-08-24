import { MTGCollectionItem } from '../../types/collection';
interface DeckState {
    deck: MTGCollectionItem[];
    setDeck: (items: MTGCollectionItem[]) => void;
    addToDeck: (item: MTGCollectionItem) => void;
    removeFromDeck: (cardName: string, setCode: string, collectorNumber: string, foil: boolean) => void;
    clearDeck: () => void;
    saveDeck: (name: string, deck: MTGCollectionItem[]) => void;
    loadDeck: (name: string) => MTGCollectionItem[] | undefined;
    getDeckCount: () => number;
    getUniqueCardsInDeck: () => number;
}
export declare const useDeckStore: import("zustand").UseBoundStore<import("zustand").StoreApi<DeckState>>;
export {};
//# sourceMappingURL=deck-store.d.ts.map