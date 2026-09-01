import React, { useState } from 'react';
import { parseCollectionCsv, parseCollectionText, detectTextFormat, getFormatDescription } from '../lib/parsers';
import { useCollectionStore } from '../lib/state/collection-store';

const CollectionUploader: React.FC = () => {
  const { setCollection, collection, resetCollection } = useCollectionStore();
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showTextPaste, setShowTextPaste] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target?.result as string;
      parseCollection(csvText);
    };
    reader.onerror = () => {
      setParseError('Failed to read file');
      setIsParsing(false);
    };
    reader.readAsText(file);

    // Reset file input to allow re-selecting the same file
    e.target.value = '';
  };

  const handleBrowseClick = () => {
    const input = document.getElementById('file-input') as HTMLInputElement;
    input?.click();
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const clipboardData = await navigator.clipboard.readText();
    if (clipboardData.trim()) {
      parseCollection(clipboardData);
    }
  };

  const parseCollection = (text: string) => {
    setIsParsing(true);
    setParseError(null);
    setSuccessMessage(null);

    // Auto-detect format
    const lines = text.split('\n');
    const format = detectTextFormat(lines);

    let result: any;

    if (format === 'csv' || /,/.test(text.substring(0, 50) && text.split('\n').length > 1)) {
      // Try CSV parsing
      try {
        result = parseCollectionCsv(text);
      } catch (e) {
        // Fall back to text parsing
        result = parseCollectionText(text);
      }
    } else {
      // Use text/decklist parser
      try {
        result = parseCollectionText(text);
      } catch (e) {
        // Fall back to CSV if text parsing fails
        result = parseCollectionCsv(text);
      }
    }

    if (result.errors.length > 0) {
      // Show warnings but still process valid items
      console.warn('Parse errors:', result.errors);
      setParseError('Parsed with ' + result.errors.length + ' warnings. Check console for details.');
    }

    setCollection(result.items);
    setSuccessMessage('Successfully imported ' + result.items.length + ' cards!');
    setShowTextPaste(false);
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors md:p-8"
           onDragOver={(e) => e.preventDefault()}
           onDragLeave={(e) => e.preventDefault()}
           onDrop={(e) => {
             e.preventDefault();
             const file = e.dataTransfer.files[0];
             if (file) {
               const reader = new FileReader();
               reader.onload = (event) => {
                 const csvText = event.target?.result as string;
                 parseCollection(csvText);
               };
               reader.onerror = () => {
                 setParseError('Failed to read file');
                 setIsParsing(false);
               };
               reader.readAsText(file);
             }
           }}
        >
        <div className="space-y-3">
          {!isParsing ? (
            <>
              <p className="text-gray-500">
                {'{'}Drag & drop your MTG collection CSV here, or{'}'}{' '}
                <button
                  type="button"
                  onClick={handleBrowseClick}
                  className="btn-primary"
                >
                  Browse Files
                </button>{' '}
                {'{'}or{'}'}{' '}
                <button
                  type="button"
                  onClick={() => setShowTextPaste(true)}
                  className="text-primary hover:underline"
                >
                  Paste Text
                </button>
              </p>
              <input
                type="file"
                id="file-input"
                accept=".csv,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
              <p className="text-sm text-gray-400">
                Supported formats: CSV files or paste decklist text ({'}'}{' '}
                <code className="text-xs font-mono bg-gray-100 rounded px-1">
                  {getFormatDescription('decklist')}
                </code>{' '}{'{'}'}{' '}
                <code className="text-xs font-mono bg-gray-100 rounded px-1">
                  {getFormatDescription('csv')}
                </code>{' '}{'{'}'}{' '}
                'or'
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Processing...</span>
              </div>
            </>
          )}
        </div>
      </div>

      {showTextPaste && (
        <div className="mt-4 p-4 border rounded-lg" style={{ borderColor: '#3b82f6' }}>
          <p className="text-sm text-gray-600 mb-2">
            Paste your collection or decklist text below. Supported formats:
          </p>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary transition-colors h-40 resize-y"
            onPaste={(e) => {
              e.preventDefault();
              const text = e.clipboardData.getData('text');
              if (text.trim()) {
                parseCollection(text);
              }
            }}
          >
            Paste CSV data or decklist here (e.g., '4 Lightning Bolt M21 123')...\
          </textarea>
          <p className="text-xs text-gray-500 mt-2">
            {'{'}'}{' '}
            <code className="text-xs font-mono bg-gray-100 rounded px-1">
              {getFormatDescription('decklist')}
            </code>{' '}{'{'}'}{' '}
            and{' '}
            <code className="text-xs font-mono bg-gray-100 rounded px-1">
              {getFormatDescription('csv')}
            </code>{' '}{'{'}'}{' '}
            {'{'}'}{' '}
            (or upload a CSV file)
          </p>
        </div>
      )}

      {parseError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-700">{parseError}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      {collection.length > 0 && !isParsing && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {collection.length} cards loaded
          </p>
          <button
            type="button"
            onClick={() => {
              resetCollection();
              setSuccessMessage(null);
              setParseError(null);
            }}
            className="btn-secondary"
          >
            Clear Collection
          </button>
        </div>
      )}
    </div>
  );
};

export default CollectionUploader;