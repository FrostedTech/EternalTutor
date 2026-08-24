import { MTGCollectionItem } from '../../types/collection';
/**
 * Interface for a Scryfall card (simplified for matching)
 */
export interface ScryfallCard {
    id: string;
    name: string;
    set: string;
    collector_number: string;
    foil: boolean;
}
/**
 * Configuration for the deck generation prompt
 */
export interface DeckGenerationConfig {
    format: 'standard' | 'modern' | 'commander' | 'pauper' | 'legacy' | 'vintage';
    maxCards: number;
    allowDuplicates: boolean;
    commander: string | null;
    bannedCards: string[];
    requiredCards: string[];
}
/**
 * Result from the prompt orchestrator
 */
export interface DeckGenerationResult {
    deck: MTGCollectionItem[];
    format: DeckGenerationConfig['format'];
    totalCards: number;
    uniqueCards: number;
    success: boolean;
    error?: string;
}
/**
 * Prompt orchestrator for AI-assisted deck generation
 * This class prepares prompts for LLMs and processes their responses
 */
export declare class PromptOrchestrator {
    private collection;
    private scryfallCache;
    constructor(collection: MTGCollectionItem[]);
    /**
     * Load Scryfall data into the cache for matching
     * In a real implementation, this would fetch from Scryfall API or load from local DB
     */
    loadScryfallData(cards: ScryfallCard[]): void;
    /**
     * Match a collection item to Scryfall data
     */
    matchToScryfall(item: MTGCollectionItem): ScryfallCard | null;
    /**
     * Validate that a deck only uses cards from the collection
     */
    validateDeckUsesOwnedCards(deck: MTGCollectionItem[]): boolean;
    /**
     * Generate a prompt for the LLM based on the collection and constraints
     */
    generatePrompt(config: DeckGenerationConfig): string;
    /**
     * Parse the LLM's response into a structured deck
     * This is a simplified parser - in practice, you'd want more robust parsing
     */
    parseDecklistResponse(response: string): MTGCollectionItem[];
    /**
     * Generate a deck using the LLM via OpenRouter API
     * OpenRouter provides free tier access to multiple models (Google Gemini, Anthropic, etc.)
     */
    private callOpenRouterLLM;
    /**
     * Generate a deck using the LLM via OpenRouter API
     * In a real implementation, this would call an API like OpenAI, Anthropic, etc.
     */
    generateDeck(config: DeckGenerationConfig): Promise<DeckGenerationResult>;
    /**
     * Generate a simulated LLM response for demonstration purposes
     * In a real implementation, this would be replaced with actual LLM API calls
     */
    private generateSimulatedLLMResponse;
}
//# sourceMappingURL=prompt-orchestrator.d.ts.map