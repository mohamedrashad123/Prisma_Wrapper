"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPrismaArgsFromQueryOptions = buildPrismaArgsFromQueryOptions;
const filters_1 = require("./utils/filters");
const nested_1 = require("./utils/nested");
/**
 * buildPrismaArgsFromQueryOptions
 * - Turns QueryOptions (shorthand) into a Prisma args object.
 * - Works for select/include nested shorthand, filters, pagination, search, orderBy.
 */
function buildPrismaArgsFromQueryOptions(opts = {}) {
    const args = {};
    if (opts.filters && Object.keys(opts.filters).length) {
        args.where = { ...(args.where || {}), ...(0, filters_1.parseFilters)(opts.filters) };
    }
    if (opts.softDelete) {
        args.where = { ...(args.where || {}), deletedAt: null };
    }
    const selectFromFields = (0, nested_1.buildNestedFields)(opts.selectFields, "select");
    if (selectFromFields || opts.select) {
        args.select = {
            ...(args.select || {}),
            ...(selectFromFields || {}),
            ...opts.select || {}
        };
    }
    const includeFromFields = (0, nested_1.buildNestedFields)(opts.includeFields, "include");
    if (includeFromFields || opts.include) {
        args.include = {
            ...(args.include || {}),
            ...(includeFromFields || {}),
            ...opts.include || {}
        };
    }
    if (opts.search?.term && Array.isArray(opts.search.fields) && opts.search.fields.length) {
        const or = opts.search.fields.map((f) => ({
            [f]: { contains: opts.search.term }
        }));
        args.where = { ...(args.where || {}), OR: or };
    }
    // pagination
    if (opts.pagination) {
        if ("page" in opts.pagination && "limit" in opts.pagination) {
            const { page, limit } = opts.pagination;
            args.skip = (page - 1) * limit;
            args.take = limit;
        }
        else {
            if (typeof opts.pagination.skip === "number")
                args.skip = opts.pagination.skip;
            if (typeof opts.pagination.take === "number")
                args.take = opts.pagination.take;
        }
    }
    if (opts.orderBy)
        args.orderBy = opts.orderBy;
    if (opts.aggregate)
        args._aggregate = opts.aggregate;
    return args;
}
