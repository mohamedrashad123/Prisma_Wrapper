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
    // where: allow either opts.filters shorthand OR pass-through if user supplied opts as full where
    if (opts.filters && Object.keys(opts.filters).length) {
        args.where = (0, filters_1.parseFilters)(opts.filters);
    }
    // select / include nested
    const select = (0, nested_1.buildNestedFields)(opts.selectFields, "select");
    const include = (0, nested_1.buildNestedFields)(opts.includeFields, "include");
    if (select)
        args.select = select;
    if (include)
        args.include = include;
    // search -> OR of contains
    if (opts.search?.term && Array.isArray(opts.search.fields) && opts.search.fields.length) {
        const or = opts.search.fields.map((f) => ({ [f]: { contains: opts.search.term, mode: "insensitive" } }));
        args.where = { ...(args.where || {}), OR: or };
    }
    // pagination (page/limit) or skip/take
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
    // return properly shaped args object for Prisma delegate methods
    return args;
}
;
