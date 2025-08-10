"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFilters = void 0;
// -------------------------
// FILE: src/utils/filters.ts
// -------------------------
/**
 * parseFilters converts friendly filter syntax like:
 * { "age:gte": 18, "name:contains": "mo", posts: { some: { published: true } } }
 * into Prisma where:
 * { age: { gte: 18 }, name: { contains: "mo", mode: "insensitive" }, posts: { some: { published: true } } }
 */
const parseFilters = (filters = {}) => {
    const where = {};
    for (const [key, val] of Object.entries(filters || {})) {
        if (typeof key !== "string")
            continue;
        const isObjectVal = val !== null && typeof val === "object" && !Array.isArray(val);
        if (key.includes(":") && !isObjectVal) {
            const [field, op] = key.split(":");
            switch (op) {
                case "eq":
                    where[field] = val;
                    break;
                case "ne":
                case "not":
                    where[field] = { not: val };
                    break;
                case "gt":
                    where[field] = { gt: val };
                    break;
                case "gte":
                    where[field] = { gte: val };
                    break;
                case "lt":
                    where[field] = { lt: val };
                    break;
                case "lte":
                    where[field] = { lte: val };
                    break;
                case "contains":
                    where[field] = { contains: val, mode: "insensitive" };
                    break;
                case "startsWith":
                case "starts":
                    where[field] = { startsWith: val, mode: "insensitive" };
                    break;
                case "endsWith":
                case "ends":
                    where[field] = { endsWith: val, mode: "insensitive" };
                    break;
                case "in":
                    where[field] = { in: Array.isArray(val) ? val : [val] };
                    break;
                case "notIn":
                    where[field] = { notIn: Array.isArray(val) ? val : [val] };
                    break;
                default:
                    where[field] = val;
            }
        }
        else {
            // nested relation or native prisma object
            where[key] = val;
        }
    }
    return where;
};
exports.parseFilters = parseFilters;
