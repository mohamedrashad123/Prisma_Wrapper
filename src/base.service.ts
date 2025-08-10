// -------------------------
// FILE: src/base.service.ts
// -------------------------
import type { PrismaClient } from "@prisma/client";
import type { QueryOptions, CacheAdapter } from "./types";
import { buildPrismaArgsFromQueryOptions } from "./query_builder";

/**
 * BaseService (untyped) - provides core runtime behavior:
 * - accepts shorthand QueryOptions and native Prisma args
 * - caching hooks
 * - soft delete
 * - common utility wrappers
 *
 * This class is used internally by TypedBaseService to reuse logic.
 */
export class BaseService {
  protected prisma: PrismaClient;
  protected delegate: any;
  protected cache?: CacheAdapter;
  protected softDeleteField: string | null;

  constructor(prisma: PrismaClient, delegate: any, opts?: { cache?: CacheAdapter; softDeleteField?: string | null }) {
    this.prisma = prisma;
    this.delegate = delegate;
    this.cache = opts?.cache;
    this.softDeleteField = opts?.softDeleteField ?? "deletedAt";
  }

  protected async execWithCache<T>(key: string | null, fn: () => Promise<T>, ttlSec?: number) {
    if (!this.cache || !key) return fn();
    const cached = await this.cache.get<T>(key);
    if (cached !== null && cached !== undefined) return cached;
    const res = await fn();
    await this.cache.set(key, res, ttlSec);
    return res;
  }

  // normalizes either QueryOptions shorthand or native Prisma args into Prisma args object
  protected normalizeArgs(maybeOptionsOrArgs?: any, baseWhere?: any) {
    if (!maybeOptionsOrArgs && !baseWhere) return undefined;
    // if shorthand detected
    const isShorthand = maybeOptionsOrArgs && (maybeOptionsOrArgs.filters || maybeOptionsOrArgs.selectFields || maybeOptionsOrArgs.includeFields || maybeOptionsOrArgs.search || maybeOptionsOrArgs.pagination);
    if (isShorthand) {
      const built = buildPrismaArgsFromQueryOptions(maybeOptionsOrArgs);
      if (baseWhere) built.where = { ...(built.where || {}), ...baseWhere };
      return built;
    }
    // else assume native prisma args or direct where object
    if (baseWhere && (maybeOptionsOrArgs && (maybeOptionsOrArgs.select || maybeOptionsOrArgs.include || maybeOptionsOrArgs.where))) {
      return { where: baseWhere, ...maybeOptionsOrArgs };
    }
    if (baseWhere && !maybeOptionsOrArgs) {
      return { where: baseWhere };
    }
    return maybeOptionsOrArgs;
  }

  // CRUD & helpers
  async create(argsOrOptions: any) {
    const normalized = this.normalizeArgs(argsOrOptions);
    // if shorthand with no explicit data, try to find data
    if (normalized && normalized.data) return this.delegate.create(normalized);
    if (argsOrOptions && argsOrOptions.data) return this.delegate.create(argsOrOptions);
    // else assume argsOrOptions is the data
    return this.delegate.create({ data: argsOrOptions });
  }

  async findUnique(whereOrArgs: any, optionsOrArgs?: any, cacheKey?: string, cacheTtlSec?: number) {
    const normalized = optionsOrArgs && (optionsOrArgs.filters || optionsOrArgs.selectFields) ? this.normalizeArgs(optionsOrArgs, whereOrArgs) : (optionsOrArgs ? { where: whereOrArgs, ...optionsOrArgs } : { where: whereOrArgs });
    return this.execWithCache(cacheKey ?? null, () => this.delegate.findUnique(normalized), cacheTtlSec);
  }

  async findFirst(whereOrArgs?: any, optionsOrArgs?: any) {
    const normalized = optionsOrArgs && (optionsOrArgs.filters || optionsOrArgs.selectFields) ? this.normalizeArgs(optionsOrArgs, whereOrArgs) : whereOrArgs ? (whereOrArgs.where || whereOrArgs) : optionsOrArgs;
    return this.delegate.findFirst(normalized);
  }

  async findMany(whereOrOptions?: any, optionsOrArgs?: any, cacheKey?: string, cacheTtlSec?: number) {
    // multiple call shapes supported
    let normalized;
    if (!optionsOrArgs && whereOrOptions && (whereOrOptions.filters || whereOrOptions.selectFields)) {
      normalized = this.normalizeArgs(whereOrOptions);
    } else if (whereOrOptions && optionsOrArgs && (optionsOrArgs.filters || optionsOrArgs.selectFields)) {
      normalized = this.normalizeArgs(optionsOrArgs, whereOrOptions);
    } else if (whereOrOptions && !optionsOrArgs) {
      normalized = (whereOrOptions.where || Object.keys(whereOrOptions).some(k => ["select","include","where"].includes(k)) ) ? whereOrOptions : { where: whereOrOptions };
    } else {
      normalized = optionsOrArgs ?? {};
    }
    return this.execWithCache(cacheKey ?? null, () => this.delegate.findMany(normalized), cacheTtlSec);
  }

  async update(whereOrArgs: any, dataOrOptions?: any) {
    // shapes: update({ where:..., data: ... }) OR update(where, { data, selectFields })
    if (whereOrArgs && whereOrArgs.where && whereOrArgs.data) return this.delegate.update(whereOrArgs);
    if (dataOrOptions && (dataOrOptions.filters || dataOrOptions.selectFields)) {
      const built = this.normalizeArgs(dataOrOptions, whereOrArgs);
      return this.delegate.update({ where: whereOrArgs, data: dataOrOptions.data || dataOrOptions, ...built });
    }
    return this.delegate.update({ where: whereOrArgs, data: dataOrOptions });
  }

  async delete(whereOrArgs: any, optionsOrArgs?: any, softDelete = true) {
    if (softDelete && this.softDeleteField) {
      return this.delegate.update({ where: whereOrArgs.where ?? whereOrArgs, data: { [this.softDeleteField]: new Date() } });
    }
    return this.delegate.delete(whereOrArgs);
  }

  async upsert(args: any) {
    return this.delegate.upsert(args);
  }

  async createMany(args: any) {
    return this.delegate.createMany(args);
  }

  async updateMany(args: any) {
    return this.delegate.updateMany(args);
  }

  async deleteMany(args: any) {
    return this.delegate.deleteMany(args);
  }

  async aggregate(args: any) {
    return this.delegate.aggregate(args);
  }

  async groupBy(args: any) {
    return this.delegate.groupBy(args);
  }

  async transaction<T>(fn: (tx: PrismaClient) => Promise<T>) {
    return this.prisma.$transaction(async (tx: PrismaClient) => fn(tx));
  }

  async raw<T = any>(query: string) {
    return this.prisma.$queryRawUnsafe<T>(query);
  }
}
