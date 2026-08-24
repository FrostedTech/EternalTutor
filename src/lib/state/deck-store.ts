import { create } from 'zustand';
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

export const useDeckStore = create<DeckState>((set, get) => ({
  deck: [],
  
  setDeck: (items) => set({ deck: items }),
  
  addToDeck: (item) => {
    set((state) => {
      // Check if item already exists (same card, set, number, foil)
      const existingIndex = state.deck.findIndex(
        (i) => 
          i.card_name.toLowerCase() === item.card_name.toLowerCase() &&
          i.set_code.toLowerCase() === item.set_code.toLowerCase() &&
          i.collector_number === item.collector_number &&
          i.foil === item.foil
      );
      
      if (existingIndex >= 0) {
        // Update quantity if exists
        const newDeck = [...state.deck];
        newDeck[existingIndex] = {
          ...newDeck[existingIndex],
          quantity: newDeck[existingIndex].quantity + item.quantity,
        };
        return { deck: newDeck };
      } else {
        // Add new item
        return { deck: [...state.deck, item] };
      }
    });
  },
  
  removeFromDeck: (cardName, setCode, collectorNumber, foil) => {
    set((state) => ({
      deck: state.deck.filter(
        (item) => 
          !(item.card_name.toLowerCase() === cardName.toLowerCase() &&
            item.set_code.toLowerCase() === setCode.toLowerCase() &&
            item.collector_number === collectorNumber &&
            item.foil === foil)
      ),
    }));
  },
  
  clearDeck: () => set({ deck: [] }),
  
  saveDeck: (name, deck) => {
    // In a real app, this would save to localStorage or a database
    // For now, we'll just store in localStorage as JSON
    try {
      localStorage.setItem(`mtg_deck_${name}`, JSON.stringify(deck));
      console.log(`Deck "${name}" saved`);
    } catch (error) {
      console.error('Failed to save deck:', error);
    }
  },
  
  loadDeck: (name) => {
    try {
      const saved = localStorage.getItem(`mtg_deck_${name}`);
      return saved ? JSON.parse(saved) : undefined;
    } catch (error) {
      console.error('Failed to load deck:', error);
      return undefined;
    }
  },
  
  getDeckCount: () => {
    return get().deck.reduce((sum, item) => sum + item.quantity, 0);
  },
  
  getUniqueCardsInDeck: () => {
    return get().deck.length;
  },
}));