import CollectionUploader from './components/CollectionUploader';
import DeckView from './components/DeckView';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 md:text-3xl">
          MTG Collection Deckbuilder
        </h1>
        <p className="text-center text-gray-600 mt-2 md:mt-4">
          Build decks using only cards you own
        </p>
      </header>
      <main className="space-y-6 md:space-y-8">
        <CollectionUploader />
        <DeckView />
      </main>
    </div>
  );
}

export default App;