"use strict";
/**
 * CSV Collection Parser — entry point for parsing user CSV exports.
 *
 * Reads a raw CSV string (from file upload or past-paste), detects the
 * source format, maps columns to canonical fields, normalizes values,
 * and returns a validated CollectionParseResult.
 *
 * Follows the contract defined in:
 *   ../../../../skills/csv-collection-parser/SKILL.md
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeaderMappings = exports.detectFormat = void 0;
exports.parseCollectionCsv = parseCollectionCsv;
const sync_1 = require("csv-parse/sync");
const collection_1 = require("../../types/collection");
const format_detector_1 = require("./format-detector");
Object.defineProperty(exports, "detectFormat", { enumerable: true, get: function () { return format_detector_1.detectFormat; } });
const header_mapper_1 = require("./header-mapper");
Object.defineProperty(exports, "HeaderMappings", { enumerable: true, get: function () { return header_mapper_1.HeaderMappings; } });
const value_normalizer_1 = require("./value-normalizer");
/**
 * Parse a CSV collection string into a validated CollectionParseResult.
 *
 * @param csvText - Raw CSV content as a string
 * @param options - Parsing options
 * @returns CollectionParseResult with items, errors, and detected format
 */
function parseCollectionCsv(csvText, options = {}) {
    const { tolerateErrors = true } = options;
    const errors = [];
    const items = [];
    // --- Step 1: Parse raw CSV into array of objects ---
    let records;
    let headers;
    try {
        records = (0, sync_1.parse)(csvText, {
            columns: true,
            skip_empty_lines: true,
            trim: false,
            relax_column_count: true,
            // Preserve raw values — we normalize ourselves
            cast: (value) => value,
        });
        headers = records.length > 0 ? Object.keys(records[0]) : [];
    }
    catch (err) {
        throw new Error(`Failed to parse CSV: ${err instanceof Error ? err.message : String(err)}`);
    }
    if (headers.length === 0) {
        throw new Error('CSV input has no headers');
    }
    // --- Step 2: Validate mandatory headers ---
    const normalizedHeaders = headers.map(header_mapper_1.normalizeHeader);
    const hasName = normalizedHeaders.some((h) => h === 'name' || h === 'card name');
    const hasQuantity = normalizedHeaders.some((h) => h === 'quantity' || h === 'count');
    if (!hasName || !hasQuantity) {
        throw new Error(`CSV must contain a "Name" header and a "Quantity" or "Count" header. ` +
            `Received: ${headers.join(', ')}`);
    }
    // --- Step 3: Detect source format ---
    const format = (0, format_detector_1.detectFormat)(headers);
    const mapping = header_mapper_1.HeaderMappings[format];
    // Build a column-name → index lookup from the actual CSV headers
    const colIndex = new Map();
    headers.forEach((h, idx) => colIndex.set((0, header_mapper_1.normalizeHeader)(h), idx));
    // --- Step 4: Resolve mapping indices ---
    const idx = {
        card_name: colIndex.get((0, header_mapper_1.normalizeHeader)(mapping.card_name)) ?? -1,
        set_code: mapping.set_code ? colIndex.get((0, header_mapper_1.normalizeHeader)(mapping.set_code)) ?? -1 : -1,
        collector_number: mapping.collector_number
            ? colIndex.get((0, header_mapper_1.normalizeHeader)(mapping.collector_number)) ?? -1
            : -1,
        foil: mapping.foil ? colIndex.get((0, header_mapper_1.normalizeHeader)(mapping.foil)) ?? -1 : -1,
        quantity: mapping.quantity
            ? colIndex.get((0, header_mapper_1.normalizeHeader)(mapping.quantity)) ?? -1
            : -1,
        condition: mapping.condition
            ? colIndex.get((0, header_mapper_1.normalizeHeader)(mapping.condition)) ?? -1
            : -1,
        language: mapping.language
            ? colIndex.get((0, header_mapper_1.normalizeHeader)(mapping.language)) ?? -1
            : -1,
    };
    // --- Step 5: Normalize each row ---
    records.forEach((row, rowNum) => {
        // Get raw values by index
        const rawName = getCellValue(row, idx.card_name, headers);
        const rawSet = getCellValue(row, idx.set_code, headers);
        const rawNumber = getCellValue(row, idx.collector_number, headers);
        const rawFoil = getCellValue(row, idx.foil, headers);
        const rawQty = getCellValue(row, idx.quantity, headers);
        const rawCond = getCellValue(row, idx.condition, headers);
        const rawLang = getCellValue(row, idx.language, headers);
        // Card name is mandatory
        if (!rawName || rawName.trim() === '') {
            if (tolerateErrors) {
                errors.push({ row: rowNum + 2, raw: JSON.stringify(row), reason: 'Missing card name' });
                return;
            }
            throw new Error(`Row ${rowNum + 2}: missing card name`);
        }
        const item = {
            card_name: (0, value_normalizer_1.normalizeCardName)(rawName),
            set_code: (0, value_normalizer_1.normalizeSetCode)(rawSet) ?? '',
            collector_number: (0, value_normalizer_1.normalizeCollectorNumber)(rawNumber) ?? '',
            foil: (0, value_normalizer_1.normalizeFoil)(rawFoil),
            quantity: (0, value_normalizer_1.normalizeQuantity)(rawQty),
            condition: (0, value_normalizer_1.normalizeCondition)(rawCond),
            language: (0, value_normalizer_1.normalizeLanguage)(rawLang),
        };
        // Validate against schema
        const result = collection_1.MTGCollectionItemSchema.safeParse(item);
        if (!result.success) {
            const reason = result.error.errors.map((e) => `${e.path}: ${e.message}`).join(', ');
            if (tolerateErrors) {
                errors.push({ row: rowNum + 2, raw: JSON.stringify(row), reason });
                return;
            }
            throw new Error(`Row ${rowNum + 2} failed validation: ${reason}`);
        }
        items.push(result.data);
    });
    return collection_1.CollectionParseResultSchema.parse({
        items,
        errors,
        source_format: format,
    });
}
/**
 * Safely retrieve a cell value from a parsed CSV row object.
 */
function getCellValue(row, colIndex, headers) {
    if (colIndex < 0)
        return undefined;
    const key = headers[colIndex];
    return key ? row[key] : undefined;
}
//# sourceMappingURL=csv-parser.js.map