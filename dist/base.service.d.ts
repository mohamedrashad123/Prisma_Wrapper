import type { PrismaClient } from "@prisma/client";
import type { CacheAdapter } from "./types";
/**
 * BaseService (untyped) - provides core runtime behavior:
 * - accepts shorthand QueryOptions and native Prisma args
 * - caching hooks
 * - soft delete
 * - common utility wrappers
 *
 * This class is used internally by TypedBaseService to reuse logic.
 */
export declare class BaseService {
    protected prisma: PrismaClient;
    protected delegate: any;
    protected cache?: CacheAdapter;
    protected softDeleteField: string | null;
    constructor(prisma: PrismaClient, delegate: any, opts?: {
        cache?: CacheAdapter;
        softDeleteField?: string | null;
    });
    protected execWithCache<T>(key: string | null, fn: () => Promise<T>, ttlSec?: number): Promise<T>;
    protected normalizeArgs(maybeOptionsOrArgs?: any, baseWhere?: any): any;
    create(argsOrOptions: any): Promise<any>;
    findUnique(whereOrArgs: any, optionsOrArgs?: any, cacheKey?: string, cacheTtlSec?: number): Promise<unknown>;
    findFirst(whereOrArgs?: any, optionsOrArgs?: any): Promise<any>;
    findMany(whereOrOptions?: any, optionsOrArgs?: any, cacheKey?: string, cacheTtlSec?: number): Promise<unknown>;
    update(whereOrArgs: any, dataOrOptions?: any): Promise<any>;
    delete(whereOrArgs: any, optionsOrArgs?: any, softDelete?: boolean): Promise<any>;
    upsert(args: any): Promise<any>;
    createMany(args: any): Promise<any>;
    updateMany(args: any): Promise<any>;
    deleteMany(args: any): Promise<any>;
    aggregate(args: any): Promise<any>;
    groupBy(args: any): Promise<any>;
    transaction<T>(fn: (tx: PrismaClient) => Promise<T>): Promise<any>;
    raw<T = any>(query: string): Promise<T>;
}
