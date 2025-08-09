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
export function buildPrismaArgsFromQueryOptions<TWhere, TSelect, TInclude>(opts: QueryOptions<TWhere, TSelect, TInclude> = {}) {
  const args: Record<string, any> = {};

  // where: allow either opts.filters shorthand OR pass-through if user supplied opts as full where
  if (opts.filters && Object.keys(opts.filters).length) {
    args.where = parseFilters(opts.filters);
  }

  // select / include nested
  const select = buildNestedFields(opts.selectFields, "select");
  const include = buildNestedFields(opts.includeFields, "include");
  if (select) args.select = select;
  if (include) args.include = include;

  // search -> OR of contains
  if (opts.search?.term && Array.isArray(opts.search.fields) && opts.search.fields.length) {
    const or = opts.search.fields.map((f) => ({ [f]: { contains: opts.search!.term, mode: "insensitive" } }));
    args.where = { ...(args.where || {}), OR: or };
  }

  // pagination (page/limit) or skip/take
  if (opts.pagination) {
    if ("page" in (opts.pagination as any) && "limit" in (opts.pagination as any)) {
      const { page, limit } = opts.pagination as any;
      args.skip = (page - 1) * limit;
      args.take = limit;
    } else {
      if (typeof (opts.pagination as any).skip === "number") args.skip = (opts.pagination as any).skip;
      if (typeof (opts.pagination as any).take === "number") args.take = (opts.pagination as any).take;
    }
  }

  if (opts.orderBy) args.orderBy = opts.orderBy;
  if (opts.aggregate) args._aggregate = opts.aggregate;

  // return properly shaped args object for Prisma delegate methods
  return args;
};
