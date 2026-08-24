import CollectionUploader from './components/CollectionUploader';
import DeckView from './components/DeckView';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          MTG Collection Deckbuilder
        </h1>
        <p className="text-center text-gray-600 mt-2">
          Build decks using only cards you own
        </p>
      </header>
      <main className="space-y-8">
        <CollectionUploader />
        <DeckView />
      </main>
    </div>
  );
}

export default App;