"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const collection_store_1 = require("../lib/state/collection-store");
const deck_store_1 = require("../lib/state/deck-store");
const DeckView = () => {
    const { collection, getUniqueCardsCount, getCollectionCount } = (0, collection_store_1.useCollectionStore)();
    const { deck, addToDeck, removeFromDeck, clearDeck, saveDeck } = (0, deck_store_1.useDeckStore)();
    const [selectedFormat, setSelectedFormat] = (0, react_1.useState)('standard');
    const [isGenerating, setIsGenerating] = (0, react_1.useState)(false);
    const [generationError, setGenerationError] = (0, react_1.useState)(null);
    const [generatedDeckName, setGeneratedDeckName] = (0, react_1.useState)('');
    const formats = ['standard', 'modern', 'commander', 'pauper', 'legacy', 'vintage'];
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
        }
        catch (error) {
            setGenerationError(error instanceof Error
                ? error.message
                : 'Failed to generate deck');
        }
        finally {
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
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "border rounded-lg p-5", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-start mb-4", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-gray-800", children: "Your Deck" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex space-x-3", children: [(0, jsx_runtime_1.jsx)("select", { value: selectedFormat, onChange: (e) => setSelectedFormat(e.target.value), className: "border rounded px-3 py-2 bg-white", children: formats.map(format => ((0, jsx_runtime_1.jsx)("option", { value: format, children: format.toUpperCase() }, format))) }), (0, jsx_runtime_1.jsx)("button", { onClick: handleGenerateDeck, disabled: isGenerating, className: isGenerating ? `${btnPrimary} opacity-50` : btnPrimary, children: isGenerating ? 'Generating...' : 'Generate Deck' }), (0, jsx_runtime_1.jsx)("button", { onClick: handleSaveDeck, className: btnSecondary, children: "Save Deck" }), (0, jsx_runtime_1.jsx)("button", { onClick: clearDeck, className: btnSecondary, children: "Clear Deck" })] })] }), generationError && ((0, jsx_runtime_1.jsx)("div", { className: "p-4 bg-red-50 border border-red-200 rounded", children: (0, jsx_runtime_1.jsx)("p", { className: "text-red-700", children: generationError }) })), generatedDeckName && ((0, jsx_runtime_1.jsx)("div", { className: "mb-2 p-3 bg-blue-50 border border-blue-200 rounded", children: (0, jsx_runtime_1.jsx)("p", { className: "text-blue-700 font-medium", children: generatedDeckName }) })), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center text-sm text-gray-600", children: [(0, jsx_runtime_1.jsxs)("span", { children: ["Unique Cards: ", deck.length] }), (0, jsx_runtime_1.jsxs)("span", { children: ["Total Cards: ", deck.reduce((sum, card) => sum + card.quantity, 0)] })] }), deck.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { className: "text-center text-gray-500 py-8", children: "No cards in deck. Generate a deck or add cards manually." })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: deck.map((card, index) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs", children: card.quantity }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "font-medium text-gray-800", children: card.card_name }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-500", children: [card.set_code, " ", card.collector_number, card.foil ? ' (F)' : ''] })] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => removeFromDeck(card.card_name, card.set_code, card.collector_number, card.foil), className: "btn-secondary text-xs px-2 py-1", children: "Remove" })] }, card.card_name + '-' + card.set_code + '-' + index))) }))] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "border rounded-lg p-5", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-bold text-gray-800 mb-4", children: "Collection Stats" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2 text-sm", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: "Unique Cards:" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: getUniqueCardsCount() })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: "Total Cards:" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: getCollectionCount() })] })] })] })] }));
};
// Helper function to generate a deck from the collection (simplified for now)
function generateDeckFromCollection(collection, format) {
    // This is a placeholder implementation
    // In reality, this would use an LLM or a more sophisticated algorithm
    const deck = [];
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
function isBasicLand(card) {
    const basicLands = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest'];
    return basicLands.includes(card.card_name);
}
// Helper component styles
const btnPrimary = 'bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors';
const btnSecondary = 'bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors';
exports.default = DeckView;
//# sourceMappingURL=DeckView.js.map