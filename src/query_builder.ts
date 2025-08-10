// -------------------------
// FILE: src/query-builder.ts
// -------------------------
import type { QueryOptions } from "./types";
import { parseFilters } from "./utils/filters";
import { buildNestedFields } from "./utils/nested";

/**
 * buildPrismaArgsFromQueryOptions
 * - Turns QueryOptions (shorthand) into a Prisma args object.
 * - Works for select/include nested shorthand, filters, pagination, search, orderBy.
 */
export function buildPrismaArgsFromQueryOptions<TWhere, TSelect, TInclude>(
  opts: QueryOptions<TWhere, TSelect, TInclude> = {}
) {
  const args: Record<string, any> = {};

  if (opts.filters && Object.keys(opts.filters).length) {
    args.where = { ...(args.where || {}), ...parseFilters(opts.filters) };
  }

  if (opts.softDelete) {
    args.where = { ...(args.where || {}), deletedAt: null };
  }

  const selectFromFields = buildNestedFields(opts.selectFields, "select");
  if (selectFromFields || (opts as any).select) {
    args.select = {
      ...(args.select || {}),
      ...(selectFromFields || {}),
      ...(opts as any).select || {}
    };
  }

  const includeFromFields = buildNestedFields(opts.includeFields, "include");
  if (includeFromFields || (opts as any).include) {
    args.include = {
      ...(args.include || {}),
      ...(includeFromFields || {}),
      ...(opts as any).include || {}
    };
  }

  if (opts.search?.term && Array.isArray(opts.search.fields) && opts.search.fields.length) {
    const or = opts.search.fields.map((f) => ({
      [f]: { contains: opts.search!.term }
    }));
    args.where = { ...(args.where || {}), OR: or };
  }

  // pagination
  if (opts.pagination) {
    if ("page" in opts.pagination && "limit" in opts.pagination) {
      const { page, limit } = opts.pagination;
      args.skip = (page - 1) * limit;
      args.take = limit;
    } else {
      if (typeof (opts.pagination as any).skip === "number")
        args.skip = (opts.pagination as any).skip;
      if (typeof (opts.pagination as any).take === "number")
        args.take = (opts.pagination as any).take;
    }
  }

  if (opts.orderBy) args.orderBy = opts.orderBy;
  if (opts.aggregate) args._aggregate = opts.aggregate;

  return args;
}