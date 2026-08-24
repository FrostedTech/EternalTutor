import React, { useState } from 'react';
import { parseCollectionCsv } from '../lib/parsers';
import { useCollectionStore } from '../lib/state/collection-store';

const CollectionUploader: React.FC = () => {
  const { setCollection, collection, resetCollection } = useCollectionStore();
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const parseCollection = (csvText: string) => {
    setIsParsing(true);
    setParseError(null);
    setSuccessMessage(null);

    try {
      const result = parseCollectionCsv(csvText);
      
      if (result.errors.length > 0) {
        // Show warnings but still process valid items
        console.warn('Parse errors:', result.errors);
        setParseError('Parsed with ' + result.errors.length + ' warnings. Check console for details.');
      }
      
      setCollection(result.items);
      setSuccessMessage('Successfully imported ' + result.items.length + ' cards!');
    } catch (error) {
      setParseError(
        error instanceof Error 
          ? error.message 
          : 'An unknown error occurred while parsing the CSV'
      );
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
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
                Drag & drop your MTG collection CSV here, or
              </p>
              <button 
                type="button" 
                onClick={handleBrowseClick}
                className="btn-primary"
              >
                Browse Files
              </button>
              <input 
                type="file" 
                id="file-input"
                accept=".csv,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
              <p className="text-sm text-gray-400">
                or paste CSV/text below
              </p>
              <div 
                className="mt-2 p-3 border border-gray-200 rounded min-h-[80px] flex items-center justify-center text-gray-400"
                onPaste={handlePaste}
                contentEditable
                suppressContentEditableWarning
                style={{ outline: 'none' }}
              >
                Paste CSV data here...
              </div>
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
    </div>
  );
};

export default CollectionUploader;