import React, { useState } from 'react';
import { useCollectionStore } from '../lib/state/collection-store';
import { useDeckStore } from '../lib/state/deck-store';

const DeckView: React.FC = () => {
  const { collection, getUniqueCardsCount, getCollectionCount } = useCollectionStore();
  const { deck, addToDeck, removeFromDeck, clearDeck, saveDeck } = useDeckStore();
  const [selectedFormat, setSelectedFormat] = useState<Format>('standard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedDeckName, setGeneratedDeckName] = useState('');

  const formats: Format[] = ['standard', 'modern', 'commander', 'pauper', 'legacy', 'vintage'];

  const handleGenerateDeck = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      // In a real implementation, this would call an LLM API or use a local model
      // For now, we'll simulate by creating a simple deck from the collection
      const newDeck = generateDeckFromCollection(collection, selectedFormat);
      clearDeck();
      newDeck.forEach(card => addToDeck(card));
      setGeneratedDeckName('Generated ' + selectedFormat.toUpperCase() + ' Deck');
    } catch (error) {
      setGenerationError(
        error instanceof Error 
          ? error.message 
          : 'Failed to generate deck'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDeck = () => {
    if (deck.length === 0) {
      setGenerationError('Cannot save an empty deck');
      return;
    }
    const name = generatedDeckName || 'My ' + selectedFormat + ' Deck';
    saveDeck(name, deck);
    setGeneratedDeckName(name);
  };

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-5">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Your Deck
          </h2>
          <div className="flex space-x-3">
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as Format)}
              className="border rounded px-3 py-2 bg-white"
            >
              {formats.map(format => (
                <option key={format} value={format}>
                  {format.toUpperCase()}
                </option>
              ))}
            </select>
            <button
              onClick={handleGenerateDeck}
              disabled={isGenerating}
              className={isGenerating ? `${btnPrimary} opacity-50` : btnPrimary}
            >
              {isGenerating ? 'Generating...' : 'Generate Deck'}
            </button>
            <button
              onClick={handleSaveDeck}
              className={btnSecondary}
            >
              Save Deck
            </button>
            <button
              onClick={clearDeck}
              className={btnSecondary}
            >
              Clear Deck
            </button>
          </div>
        </div>

        {generationError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-700">{generationError}</p>
          </div>
          )}

        {generatedDeckName && (
          <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-700 font-medium">{generatedDeckName}</p>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Unique Cards: {deck.length}</span>
            <span>Total Cards: {deck.reduce((sum, card) => sum + card.quantity, 0)}</span>
          </div>

          {deck.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No cards in deck. Generate a deck or add cards manually.
            </p>
          ) : (
            <div className="space-y-2">
              {deck.map((card, index) => (
                <div key={card.card_name + '-' + card.set_code + '-' + index} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs">
                      {card.quantity}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{card.card_name}</p>
                      <p className="text-sm text-gray-500">
                        {card.set_code} {card.collector_number}{card.foil ? ' (F)' : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromDeck(card.card_name, card.set_code, card.collector_number, card.foil)}
                    className="btn-secondary text-xs px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border rounded-lg p-5">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Collection Stats
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Unique Cards:</span>
            <span className="font-medium">{getUniqueCardsCount()}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Cards:</span>
            <span className="font-medium">{getCollectionCount()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate a deck from the collection (simplified for now)
function generateDeckFromCollection(collection: any[], format: Format): any[] {
  // This is a placeholder implementation
  // In reality, this would use an LLM or a more sophisticated algorithm
  const deck: any[] = [];
  const maxCards = format === 'commander' ? 100 : 60; // Simplified
  
  // Shuffle collection and take up to maxCards
  const shuffled = [...collection].sort(() => 0.5 - Math.random());
  for (let i = 0; i < Math.min(shuffled.length, maxCards); i++) {
    const card = shuffled[i];
    // For commander, we might want to limit to 1 copy of each card (except basic lands)
    const quantity = format === 'commander' && !isBasicLand(card) ? 1 : Math.min(card.quantity, 4);
    if (quantity > 0) {
      deck.push({ ...card, quantity });
    }
  }
  
  return deck;
}

function isBasicLand(card: any): boolean {
  const basicLands = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest'];
  return basicLands.includes(card.card_name);
}

type Format = 'standard' | 'modern' | 'commander' | 'pauper' | 'legacy' | 'vintage';

// Helper component styles
const btnPrimary = 'bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors';
const btnSecondary = 'bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors';

// Extend JSX to allow custom attributes
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }
}

export default DeckView;