"use strict";
/**
 * Header mapping table.
 *
 * Each supported export format maps its column headers to the canonical
 * field names used by MTGCollectionItem. Lookup is case-insensitive and
 * ignores leading/trailing whitespace.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeaderMappings = void 0;
exports.normalizeHeader = normalizeHeader;
exports.buildHeaderLookup = buildHeaderLookup;
exports.HeaderMappings = {
    manabox: {
        card_name: 'Name',
        set_code: 'Set code',
        collector_number: 'Collector number',
        foil: 'Foil',
        quantity: 'Quantity',
        condition: 'Condition',
        language: 'Language',
    },
    archidekt: {
        card_name: 'Name',
        set_code: 'Set',
        collector_number: 'Collector Number',
        foil: 'Foil',
        quantity: 'Count',
        condition: 'Condition',
        language: 'Language',
    },
    moxfield: {
        card_name: 'Name',
        set_code: 'Set',
        collector_number: 'Card Number',
        foil: 'Foil',
        quantity: 'Quantity',
        condition: 'Condition',
        language: 'Language',
    },
    delver_lens: {
        card_name: 'Name',
        set_code: 'Set',
        collector_number: 'Card Number',
        foil: 'Foil',
        quantity: 'Count',
        condition: 'Condition',
        language: 'Language',
    },
    custom: {
        card_name: 'Name',
        set_code: 'Set code',
        collector_number: 'Collector number',
        foil: 'Foil',
        quantity: 'Quantity',
        condition: 'Condition',
        language: 'Language',
    },
};
/**
 * Normalize a header string for lookup: lowercase + trim punctuation.
 */
function normalizeHeader(raw) {
    return raw.trim().toLowerCase().replace(/[.\s_]+/g, ' ');
}
/**
 * Build a lookup table from a CSV header row for the given format,
 * returning a map of canonical field → resolved column name.
 */
function buildHeaderLookup(headers, format) {
    const mapping = exports.HeaderMappings[format];
    const lookup = {
        card_name: -1,
        set_code: -1,
        collector_number: -1,
        foil: -1,
        quantity: -1,
        condition: -1,
        language: -1,
    };
    // Build a normalized header → index map
    const normHeaders = new Map();
    headers.forEach((h, idx) => normHeaders.set(normalizeHeader(h), idx));
    for (const [field, expectedName] of Object.entries(mapping)) {
        const idx = normHeaders.get(normalizeHeader(expectedName));
        if (idx !== undefined && idx >= 0) {
            lookup[field] = idx;
        }
    }
    return lookup;
}
//# sourceMappingURL=header-mapper.js.map