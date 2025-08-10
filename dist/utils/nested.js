"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildNestedFields = void 0;
/**
 * buildNestedFields transforms:
 * ["id", "name", { profile: ["id", "bio"] }]
 * to:
 * { id: true, name: true, profile: { select: { id: true, bio: true } } }
 *
 * parameter key: "select" | "include"
 */
const buildNestedFields = (fields, key = "select") => {
    if (!fields || !fields.length)
        return undefined;
    const res = {};
    for (const f of fields) {
        if (typeof f === "string") {
            res[f] = true;
        }
        else if (typeof f === "object") {
            for (const [rel, relFields] of Object.entries(f)) {
                const nested = (0, exports.buildNestedFields)(relFields, key);
                res[rel] = { [key]: nested ?? undefined };
            }
        }
    }
    return res;
};
exports.buildNestedFields = buildNestedFields;
