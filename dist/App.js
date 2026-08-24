"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const CollectionUploader_1 = __importDefault(require("./components/CollectionUploader"));
const DeckView_1 = __importDefault(require("./components/DeckView"));
function App() {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen bg-gray-50 p-6", children: [(0, jsx_runtime_1.jsxs)("header", { className: "mb-8", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold text-center text-gray-800", children: "MTG Collection Deckbuilder" }), (0, jsx_runtime_1.jsx)("p", { className: "text-center text-gray-600 mt-2", children: "Build decks using only cards you own" })] }), (0, jsx_runtime_1.jsxs)("main", { className: "space-y-8", children: [(0, jsx_runtime_1.jsx)(CollectionUploader_1.default, {}), (0, jsx_runtime_1.jsx)(DeckView_1.default, {})] })] }));
}
exports.default = App;
//# sourceMappingURL=App.js.map