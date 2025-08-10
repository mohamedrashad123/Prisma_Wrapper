import type { QueryOptions } from "./types";
/**
 * buildPrismaArgsFromQueryOptions
 * - Turns QueryOptions (shorthand) into a Prisma args object.
 * - Works for select/include nested shorthand, filters, pagination, search, orderBy.
 */
export declare function buildPrismaArgsFromQueryOptions<TWhere, TSelect, TInclude>(opts?: QueryOptions<TWhere, TSelect, TInclude>): Record<string, any>;
