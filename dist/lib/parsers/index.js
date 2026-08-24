"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeaderMappings = exports.detectFormat = exports.parseCollectionCsv = void 0;
var csv_parser_1 = require("./csv-parser");
Object.defineProperty(exports, "parseCollectionCsv", { enumerable: true, get: function () { return csv_parser_1.parseCollectionCsv; } });
var format_detector_1 = require("./format-detector");
Object.defineProperty(exports, "detectFormat", { enumerable: true, get: function () { return format_detector_1.detectFormat; } });
var header_mapper_1 = require("./header-mapper");
Object.defineProperty(exports, "HeaderMappings", { enumerable: true, get: function () { return header_mapper_1.HeaderMappings; } });
__exportStar(require("./value-normalizer"), exports);
//# sourceMappingURL=index.js.map