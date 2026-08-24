"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const parsers_1 = require("../lib/parsers");
const collection_store_1 = require("../lib/state/collection-store");
const CollectionUploader = () => {
    const { setCollection, collection, resetCollection } = (0, collection_store_1.useCollectionStore)();
    const [isParsing, setIsParsing] = (0, react_1.useState)(false);
    const [parseError, setParseError] = (0, react_1.useState)(null);
    const [successMessage, setSuccessMessage] = (0, react_1.useState)(null);
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const csvText = event.target?.result;
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
        const input = document.getElementById('file-input');
        input?.click();
    };
    const handlePaste = async (e) => {
        e.preventDefault();
        const clipboardData = await navigator.clipboard.readText();
        if (clipboardData.trim()) {
            parseCollection(clipboardData);
        }
    };
    const parseCollection = (csvText) => {
        setIsParsing(true);
        setParseError(null);
        setSuccessMessage(null);
        try {
            const result = (0, parsers_1.parseCollectionCsv)(csvText);
            if (result.errors.length > 0) {
                // Show warnings but still process valid items
                console.warn('Parse errors:', result.errors);
                setParseError('Parsed with ' + result.errors.length + ' warnings. Check console for details.');
            }
            setCollection(result.items);
            setSuccessMessage('Successfully imported ' + result.items.length + ' cards!');
        }
        catch (error) {
            setParseError(error instanceof Error
                ? error.message
                : 'An unknown error occurred while parsing the CSV');
        }
        finally {
            setIsParsing(false);
        }
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors", onDragOver: (e) => e.preventDefault(), onDragLeave: (e) => e.preventDefault(), onDrop: (e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const csvText = event.target?.result;
                        parseCollection(csvText);
                    };
                    reader.onerror = () => {
                        setParseError('Failed to read file');
                        setIsParsing(false);
                    };
                    reader.readAsText(file);
                }
            }, children: [(0, jsx_runtime_1.jsx)("div", { className: "space-y-3", children: !isParsing ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-gray-500", children: "Drag & drop your MTG collection CSV here, or" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: handleBrowseClick, className: "btn-primary", children: "Browse Files" }), (0, jsx_runtime_1.jsx)("input", { type: "file", id: "file-input", accept: ".csv,.txt", className: "hidden", onChange: handleFileChange }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-400", children: "or paste CSV/text below" }), (0, jsx_runtime_1.jsx)("div", { className: "mt-2 p-3 border border-gray-200 rounded min-h-[80px] flex items-center justify-center text-gray-400", onPaste: handlePaste, contentEditable: true, suppressContentEditableWarning: true, style: { outline: 'none' }, children: "Paste CSV data here..." })] })) : ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-center space-x-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-primary" }), (0, jsx_runtime_1.jsx)("span", { children: "Processing..." })] }) })) }), parseError && ((0, jsx_runtime_1.jsx)("div", { className: "p-4 bg-red-50 border border-red-200 rounded", children: (0, jsx_runtime_1.jsx)("p", { className: "text-red-700", children: parseError }) })), successMessage && ((0, jsx_runtime_1.jsx)("div", { className: "p-4 bg-green-50 border border-green-200 rounded", children: (0, jsx_runtime_1.jsx)("p", { className: "text-green-700", children: successMessage }) })), collection.length > 0 && !isParsing && ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center", children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-600", children: [collection.length, " cards loaded"] }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => {
                                resetCollection();
                                setSuccessMessage(null);
                                setParseError(null);
                            }, className: "btn-secondary", children: "Clear Collection" })] }))] }) }));
};
exports.default = CollectionUploader;
//# sourceMappingURL=CollectionUploader.js.map