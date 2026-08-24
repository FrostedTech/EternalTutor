import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MTGCollectionItem } from '../../types/collection';

interface CollectionState {
  collection: MTGCollectionItem[];
  setCollection: (items: MTGCollectionItem[]) => void;
  addToCollection: (item: MTGCollectionItem) => void;
  removeFromCollection: (cardName: string, setCode: string, collectorNumber: string, foil: boolean) => void;
  updateCollectionItem: (item: MTGCollectionItem) => void;
  resetCollection: () => void;
  getCollectionCount: () => number;
  getUniqueCardsCount: () => number;
}

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      collection: [],
      
      setCollection: (items) => set({ collection: items }),
      
      addToCollection: (item) => {
        set((state) => {
          // Check if item already exists (same card, set, number, foil)
          const existingIndex = state.collection.findIndex(
            (i) => 
              i.card_name.toLowerCase() === item.card_name.toLowerCase() &&
              i.set_code.toLowerCase() === item.set_code.toLowerCase() &&
              i.collector_number === item.collector_number &&
              i.foil === item.foil
          );
          
          if (existingIndex >= 0) {
            // Update quantity if exists
            const newCollection = [...state.collection];
            newCollection[existingIndex] = {
              ...newCollection[existingIndex],
              quantity: newCollection[existingIndex].quantity + item.quantity,
            };
            return { collection: newCollection };
          } else {
            // Add new item
            return { collection: [...state.collection, item] };
          }
        });
      },
      
      removeFromCollection: (cardName, setCode, collectorNumber, foil) => {
        set((state) => ({
          collection: state.collection.filter(
            (item) => 
              !(item.card_name.toLowerCase() === cardName.toLowerCase() &&
                item.set_code.toLowerCase() === setCode.toLowerCase() &&
                item.collector_number === collectorNumber &&
                item.foil === foil)
          ),
        }));
      },
      
      updateCollectionItem: (item) => {
        set((state) => ({
          collection: state.collection.map((i) =>
            i.card_name.toLowerCase() === item.card_name.toLowerCase() &&
            i.set_code.toLowerCase() === item.set_code.toLowerCase() &&
            i.collector_number === item.collector_number &&
            i.foil === item.foil
              ? item
              : i
          ),
        }));
      },
      
      resetCollection: () => set({ collection: [] }),
      
      getCollectionCount: () => {
        return get().collection.reduce((sum, item) => sum + item.quantity, 0);
      },
      
      getUniqueCardsCount: () => {
        return get().collection.length;
      },
    }),
    {
      name: 'mtg-collection-storage'
      // storage: localStorage // This is the default, so we can omit it.
    }
  )
);