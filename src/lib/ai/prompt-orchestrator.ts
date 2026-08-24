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
  // Additional fields can be added as needed
}

/**
 * Configuration for the deck generation prompt
 */
export interface DeckGenerationConfig {
  format: 'standard' | 'modern' | 'commander' | 'pauper' | 'legacy' | 'vintage';
  maxCards: number;
  allowDuplicates: boolean;
  commander: string | null; // For commander format
  bannedCards: string[]; // List of banned card names
  requiredCards: string[]; // List of required card names
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
export class PromptOrchestrator {
  private collection: MTGCollectionItem[];
  private scryfallCache: Map<string, ScryfallCard> = new Map();

  constructor(collection: MTGCollectionItem[]) {
    this.collection = collection;
  }

  /**
   * Load Scryfall data into the cache for matching
   * In a real implementation, this would fetch from Scryfall API or load from local DB
   */
  public loadScryfallData(cards: ScryfallCard[]): void {
    for (const card of cards) {
      // Create a key for easy lookup
      const key = `${card.name.toLowerCase()}::${card.set.toLowerCase()}::${card.collector_number}`;
      this.scryfallCache.set(key, card);
    }
  }

  /**
   * Match a collection item to Scryfall data
   */
  public matchToScryfall(item: MTGCollectionItem): ScryfallCard | null {
    const key = `${item.card_name.toLowerCase()}::${item.set_code.toLowerCase()}::${item.collector_number}`;
    return this.scryfallCache.get(key) || null;
  }

  /**
   * Validate that a deck only uses cards from the collection
   */
  public validateDeckUsesOwnedCards(deck: MTGCollectionItem[]): boolean {
    for (const deckItem of deck) {
      const collectionItem = this.collection.find(
        (item) => 
          item.card_name.toLowerCase() === deckItem.card_name.toLowerCase() &&
          item.set_code.toLowerCase() === deckItem.set_code.toLowerCase() &&
          item.collector_number === deckItem.collector_number &&
          item.foil === deckItem.foil
      );

      if (!collectionItem) {
        return false; // Card not in collection
      }

      // Check if we have enough copies
      if (collectionItem.quantity < deckItem.quantity) {
        return false; // Not enough copies
      }
    }
    return true;
  }

  /**
   * Generate a prompt for the LLM based on the collection and constraints
   */
  public generatePrompt(config: DeckGenerationConfig): string {
    // Format the collection for the prompt
    const collectionText = this.collection
      .map(item => {
        const foilText = item.foil ? ' (foil)' : '';
        return `- ${item.card_name} (${item.set_code} ${item.collector_number})${foilText} x${item.quantity}`;
      })
      .join('\n');

    // Format banned and required cards
    const bannedText = config.bannedCards.length > 0 
      ? `- ${config.bannedCards.join('\n- ')}` 
      : 'None';
      
    const requiredText = config.requiredCards.length > 0
      ? `- ${config.requiredCards.join('\n- ')}`
      : 'None';

    // Format commander if applicable
    const commanderText = config.commander 
      ? config.commander 
      : 'None';

    return `You are an expert Magic: The Gathering deck builder. Your task is to create a legal ${config.format} deck using ONLY the cards from the user's collection provided below.

COLLECTION:
${collectionText}

DECK CONSTRAINTS:
- Format: ${config.format.toUpperCase()}
- Maximum cards: ${config.maxCards}
- Allow duplicates: ${config.allowDuplicates ? 'Yes' : 'No'}
- Commander: ${commanderText}
- Banned cards: 
${bannedText}
- Required cards:
${requiredText}

RULES:
1. You may ONLY use cards that appear in the user's collection above
2. You may not use more copies of any card than the user owns
3. The deck must be legal for the specified format
4. For Commander format: exactly 1 commander card (unless using partners), 100 total cards, singleton except basic lands
5. For other formats: follow standard format rules (4 copies max unless restricted/banned)

Please provide your decklist in the following format:
[Quantity] [Card Name] [Set] [Collector Number] *[foil if applicable]

Example:
4 Lightning Bolt M21 123
2 Lightning Bolt *-foil* M21 123foil
1 Island NEO 245

If you cannot create a legal deck with the given constraints, explain why and suggest what cards would be needed.

DECKLIST:`;
  }

  /**
   * Parse the LLM's response into a structured deck
   * This is a simplified parser - in practice, you'd want more robust parsing
   */
  public parseDecklistResponse(response: string): MTGCollectionItem[] {
    const deck: MTGCollectionItem[] = [];
    const lines = response.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    for (const line of lines) {
      // Skip lines that don't look like card entries
      if (!line.match(/^\d+\s+/)) continue;

      try {
        // Parse: [Quantity] [Card Name] [Set] [Collector Number] *[foil if applicable]
        const parts = line.split(' ');
        const quantity = parseInt(parts[0], 10);
        
        // Find the set and collector number (they might be separated by spaces in card names)
        // This is a simplified parser - real implementation would be more robust
        const setIndex = parts.length - 3;
        if (setIndex < 1) continue;

        const cardNameParts = parts.slice(1, setIndex);
        const cardName = cardNameParts.join(' ');
        const setCode = parts[setIndex];
        const collectorNumber = parts[setIndex + 1];
        const foil = parts.length > setIndex + 2 && parts[setIndex + 2] === '*foil*';

        // Find this card in our collection to get the full object
        const collectionItem = this.collection.find(
          (item) => 
            item.card_name.toLowerCase() === cardName.toLowerCase() &&
            item.set_code.toLowerCase() === setCode.toLowerCase() &&
            item.collector_number === collectorNumber &&
            item.foil === foil
        );

        if (collectionItem) {
          // Add the card with the requested quantity (up to what we own)
          const amountToAdd = Math.min(quantity, collectionItem.quantity);
          if (amountToAdd > 0) {
            deck.push({
              ...collectionItem,
              quantity: amountToAdd
            });
          }
        }
      } catch (e) {
        // Skip malformed lines
        console.warn(`Failed to parse decklist line: ${line}`, e);
        continue;
      }
    }

    return deck;
  }

  /**
   * Generate a deck using the LLM via OpenRouter API
   * OpenRouter provides free tier access to multiple models (Google Gemini, Anthropic, etc.)
   */
  private async callOpenRouterLLM(prompt: string, config: DeckGenerationConfig): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
  
    if (!apiKey) {
      // Fall back to simulated response if no API key is configured
      return this.generateSimulatedLLMResponse(prompt, config);
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-1.5', // Free tier model; change as needed
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenRouter API error:', response.status, errorData);
        // Fall back to simulated response
        return this.generateSimulatedLLMResponse(prompt, config);
      }

      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
      }

      // Fall back if unexpected response format
      return this.generateSimulatedLLMResponse(prompt, config);
    } catch (error) {
      console.error('OpenRouter request error:', error);
      // Fall back to simulated response
      return this.generateSimulatedLLMResponse(prompt, config);
    }
  }

  /**
   * Generate a deck using the LLM via OpenRouter API
   * In a real implementation, this would call an API like OpenAI, Anthropic, etc.
   */
  public async generateDeck(config: DeckGenerationConfig): Promise<DeckGenerationResult> {
    try {
      // Validate we have a collection
      if (this.collection.length === 0) {
        return {
          deck: [],
          format: config.format,
          totalCards: 0,
          uniqueCards: 0,
          success: false,
          error: 'Collection is empty. Please upload a collection first.'
        };
      }

      // Generate the prompt
      const prompt = this.generatePrompt(config);

      // Call the LLM API (OpenRouter with fallback to simulated)
      const llmResponse = await this.callOpenRouterLLM(prompt, config);

      // Parse the response
      const deck = this.parseDecklistResponse(llmResponse);

      // Validate the deck
      if (!this.validateDeckUsesOwnedCards(deck)) {
        return {
          deck: [],
          format: config.format,
          totalCards: 0,
          uniqueCards: 0,
          success: false,
          error: 'Generated deck uses cards not in the collection or exceeds available quantities.'
        };
      }

      // Calculate totals
      const totalCards = deck.reduce((sum, card) => sum + card.quantity, 0);
      const uniqueCards = deck.length;

      return {
        deck,
        format: config.format,
        totalCards,
        uniqueCards,
        success: true
      };
    } catch (error) {
      return {
        deck: [],
        format: config.format,
        totalCards: 0,
        uniqueCards: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during deck generation'
      };
    }
  }

  /**
   * Generate a simulated LLM response for demonstration purposes
   * In a real implementation, this would be replaced with actual LLM API calls
   */
  private generateSimulatedLLMResponse(_prompt: string, config: DeckGenerationConfig): string {
    // This is a simplified simulation that just takes cards from the collection
    // A real LLM would produce much more sophisticated results
    
    // Shuffle the collection for variety
    const shuffled = [...this.collection].sort(() => 0.5 - Math.random());
    
    // Determine how many cards we can include based on format
    let maxTotalCards = config.maxCards;
    let maxCopiesPerCard = config.allowDuplicates ? 4 : 1;
    
    // Adjust for Commander format
    if (config.format === 'commander') {
      maxTotalCards = 100;
      maxCopiesPerCard = 1; // Singleton except basic lands
    }
    
    // Build the deck
    const deck: MTGCollectionItem[] = [];
    const basicLands = new Set(['Plains', 'Island', 'Swamp', 'Mountain', 'Forest']);
    
    // First, add required cards if any
    for (const requiredName of config.requiredCards) {
      const card = shuffled.find(
        c => c.card_name.toLowerCase() === requiredName.toLowerCase()
      );
      if (card) {
        const amountToAdd = Math.min(1, card.quantity); // Start with 1 copy
        if (amountToAdd > 0) {
          deck.push({ ...card, quantity: amountToAdd });
        }
      }
    }
    
    // Then add other cards up to the limit
    let currentTotal = deck.reduce((sum, card) => sum + card.quantity, 0);
    
    for (const card of shuffled) {
      if (currentTotal >= maxTotalCards) break;
      
      // Skip if this is a required card we already added (to avoid duplicates in commander)
      const isRequired = config.requiredCards.some(
        req => req.toLowerCase() === card.card_name.toLowerCase()
      );
      if (isRequired && deck.some(c => c.card_name.toLowerCase() === card.card_name.toLowerCase())) {
        continue;
      }
      
      // Check if we've already added this card (for singleton formats)
      const existingIndex = deck.findIndex(
        c => 
          c.card_name.toLowerCase() === card.card_name.toLowerCase() &&
          c.set_code.toLowerCase() === c.set_code.toLowerCase() &&
          c.collector_number === card.collector_number &&
          c.foil === card.foil
      );
      
      if (existingIndex >= 0 && !config.allowDuplicates && !basicLands.has(card.card_name)) {
        continue; // Already have this card and we're not allowing duplicates
      }
      
      // Determine how many we can add
      let canAdd = maxCopiesPerCard;
      if (!config.allowDuplicates && basicLands.has(card.card_name)) {
        // Basic lands can exceed the limit in some formats
        canAdd = Math.min(card.quantity, 10); // Allow up to 10 basic lands
      }
      
      if (existingIndex >= 0) {
        // We already have this card, see if we can add more
        canAdd = Math.max(0, maxCopiesPerCard - deck[existingIndex].quantity);
      }
      
      // Don't exceed what we own or what we need to reach maxTotalCards
      const spaceLeft = maxTotalCards - currentTotal;
      const toAdd = Math.min(
        canAdd, 
        card.quantity,
        spaceLeft
      );
      
      if (toAdd > 0) {
        if (existingIndex >= 0) {
          // Increase existing card quantity
          deck[existingIndex].quantity += toAdd;
        } else {
          // Add new card
          deck.push({ ...card, quantity: toAdd });
        }
        currentTotal += toAdd;
      }
    }
    
    // Format the response as a decklist
    return deck
      .map(card => {
        const foilText = card.foil ? '*foil*' : '';
        return `${card.quantity} ${card.card_name} ${card.set_code} ${card.collector_number} ${foilText}`.trim();
      })
      .join('\n');
  }
}

// Export a singleton instance for easy access (optional)
// export const promptOrchestrator = new PromptOrchestrator([]);