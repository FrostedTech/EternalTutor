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
export declare const useCollectionStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<CollectionState>, "setState" | "persist"> & {
    setState(partial: CollectionState | Partial<CollectionState> | ((state: CollectionState) => CollectionState | Partial<CollectionState>), replace?: false | undefined): unknown;
    setState(state: CollectionState | ((state: CollectionState) => CollectionState), replace: true): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<CollectionState, CollectionState, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: CollectionState) => void) => () => void;
        onFinishHydration: (fn: (state: CollectionState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<CollectionState, CollectionState, unknown>>;
    };
}>;
export {};
//# sourceMappingURL=collection-store.d.ts.map