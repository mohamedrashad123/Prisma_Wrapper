import type { PrismaClient } from "@prisma/client";
import type { CacheAdapter, QueryOptions } from "./types";
import { BaseService } from "./base.service";
/**
 * TypedBaseService<Delegate>
 * - Delegate is the prisma model delegate (e.g. prisma.user)
 * - Methods accept either:
 *   * native Prisma args for that delegate (compile-time safe & IDE autocomplete), OR
 *   * shorthand QueryOptions (runtime-built).
 *
 * Implementation detail:
 *  - We define each method with a generic A = Parameters<Delegate['method']>[0]
 *    so when you call service.findMany(...) TypeScript knows the exact shape of args for that model.
 */
export declare class TypedBaseService<Delegate extends {
    [k: string]: any;
}, TWhere, TSelect, TInclude> {
    protected prisma: PrismaClient;
    protected delegate: Delegate;
    protected base: BaseService;
    protected options?: {
        cache?: CacheAdapter;
        ttlSec?: number;
        softDeleteField?: string | null;
    };
    constructor(prisma: PrismaClient, delegate: Delegate, opts?: {
        cache?: CacheAdapter;
        ttlSec?: number;
        softDeleteField?: string | null;
    });
    private buildFromQueryOptions;
    private getCacheKey;
    private withCache;
    findUnique<A extends Parameters<Delegate["findUnique"]>[0]>(args?: A | (QueryOptions<TWhere, TSelect, TInclude> & {
        baseWhere?: any;
    }), opts?: {
        ttlSec?: number;
        forceRefresh?: boolean;
    }): Promise<unknown>;
    findMany<A extends Parameters<Delegate["findMany"]>[0]>(args?: A | QueryOptions<TWhere, TSelect, TInclude>, opts?: {
        ttlSec?: number;
        forceRefresh?: boolean;
    }): Promise<unknown>;
    findFirst<A extends Parameters<Delegate["findFirst"]>[0]>(args?: A | QueryOptions<TWhere, TSelect, TInclude>, opts?: {
        ttlSec?: number;
        forceRefresh?: boolean;
    }): Promise<unknown>;
    create<A extends Parameters<Delegate["create"]>[0]>(args: A): Promise<ReturnType<Delegate["create"]>>;
    update<A extends Parameters<Delegate["update"]>[0]>(args: A): Promise<ReturnType<Delegate["update"]>>;
    delete<A extends Parameters<Delegate["delete"]>[0]>(args: A): Promise<ReturnType<Delegate["delete"]>>;
    upsert<A extends Parameters<Delegate["upsert"]>[0]>(args: A): Promise<ReturnType<Delegate["upsert"]>>;
    aggregate<A extends Parameters<Delegate["aggregate"]>[0]>(args: A): Promise<ReturnType<Delegate["aggregate"]>>;
    groupBy<A extends Parameters<Delegate["groupBy"]>[0]>(args: A): Promise<ReturnType<Delegate["groupBy"]>>;
    raw<T = any>(query: string): Promise<T>;
    findManyWithCache(whereOrOptions?: any, optionsOrArgs?: any, cacheKey?: string, cacheTtl?: number): Promise<unknown>;
}
export declare const createTypedBaseService: <Delegate extends {
    [k: string]: any;
}, Twhere, Tselect, Tinclude>(prisma: PrismaClient, delegate: Delegate, opts?: {
    cache?: CacheAdapter;
    softDeleteField?: string | null;
}) => TypedBaseService<Delegate, Twhere, Tselect, Tinclude>;
