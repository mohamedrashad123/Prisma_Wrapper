"use strict";
// -------------------------
// FILE: src/utils/nested.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildNestedFields = void 0;
// -------------------------
/**
 * buildNestedFields transforms:
 * ["id", "name", { profile: ["id", "bio"] }]
 * to:
 * { id: true, name: true, profile: { select: { id: true, bio: true } } }
 *
 * parameter key: "select" | "include"
 */
const buildNestedFields = (fields, key = "select") => {
    if (!fields)
        return undefined;
    // لو Array => ["id", "name"] أو [{ profile: {...} }]
    if (Array.isArray(fields)) {
        return fields.reduce((acc, f) => {
            if (typeof f === "string") {
                acc[f] = true;
            }
            else if (typeof f === "object" && f !== null) {
                for (const [rel, relArgs] of Object.entries(f)) {
                    if (relArgs === null || relArgs === undefined)
                        continue;
                    if (typeof relArgs === "boolean") {
                        acc[rel] = relArgs;
                    }
                    else if (typeof relArgs === "object") {
                        const nested = {};
                        if ("select" in relArgs && relArgs.select)
                            nested.select = (0, exports.buildNestedFields)(relArgs.select, "select");
                        if ("include" in relArgs && relArgs.include)
                            nested.include = (0, exports.buildNestedFields)(relArgs.include, "include");
                        if ("where" in relArgs && relArgs.where)
                            nested.where = relArgs.where;
                        if ("orderBy" in relArgs && relArgs.orderBy)
                            nested.orderBy = relArgs.orderBy;
                        if ("skip" in relArgs && relArgs.skip !== undefined)
                            nested.skip = relArgs.skip;
                        if ("take" in relArgs && relArgs.take !== undefined)
                            nested.take = relArgs.take;
                        acc[rel] = nested;
                    }
                }
            }
            return acc;
        }, {});
    }
    // لو Object عادي
    const res = {};
    for (const [rel, relArgs] of Object.entries(fields)) {
        if (relArgs === null || relArgs === undefined)
            continue;
        if (typeof relArgs === "boolean") {
            res[rel] = relArgs;
        }
        else if (typeof relArgs === "object") {
            const nested = {};
            if ("select" in relArgs && relArgs.select)
                nested.select = (0, exports.buildNestedFields)(relArgs.select, "select");
            if ("include" in relArgs && relArgs.include)
                nested.include = (0, exports.buildNestedFields)(relArgs.include, "include");
            if ("where" in relArgs && relArgs.where)
                nested.where = relArgs.where;
            if ("orderBy" in relArgs && relArgs.orderBy)
                nested.orderBy = relArgs.orderBy;
            if ("skip" in relArgs && relArgs.skip !== undefined)
                nested.skip = relArgs.skip;
            if ("take" in relArgs && relArgs.take !== undefined)
                nested.take = relArgs.take;
            res[rel] = nested;
        }
    }
    return res;
};
exports.buildNestedFields = buildNestedFields;
