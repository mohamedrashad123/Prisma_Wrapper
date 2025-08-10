// -------------------------
// FILE: src/typed-base.service.ts
// -------------------------
import type { PrismaClient } from "@prisma/client";
import type { CacheAdapter, QueryOptions } from "./types";
import { BaseService } from "./base.service";
import { buildPrismaArgsFromQueryOptions } from "./query_builder";

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
export class TypedBaseService<Delegate extends { [k: string]: any }, TWhere, TSelect, TInclude> {
  protected prisma: PrismaClient;
  protected delegate: Delegate;
  protected base: BaseService;
  protected options?: { cache?: CacheAdapter; ttlSec?: number; softDeleteField?: string | null };

  constructor(prisma: PrismaClient, delegate: Delegate, opts?: { cache?: CacheAdapter; ttlSec?: number, softDeleteField?: string | null }) {
    this.prisma = prisma;
    this.delegate = delegate;
    this.base = new BaseService(prisma, delegate, { cache: opts?.cache, softDeleteField: opts?.softDeleteField ?? "deletedAt" });
    this.options = opts;
  }

  // Helper: if user passed QueryOptions, return Prisma args typed as A
  private buildFromQueryOptions<A>(opts?: QueryOptions<TWhere, TSelect, TInclude>): A | undefined {
    if (!opts) return undefined;
    const built = buildPrismaArgsFromQueryOptions(opts);

    if ((opts as any).selectFields && (built as any).select) {
      (built as any).select = {
        ...(built as any).select,
        ...(buildPrismaArgsFromQueryOptions({
          selectFields: (opts as any).selectFields,
        }) as any).select,
      };
    }

    return built as unknown as A;
  }

  private getCacheKey(method: string, args: any): string {
    return `${method}:${JSON.stringify(args)}`;
  }

  private async withCache<R>(
    method: string,
    args: any,
    fn: () => Promise<R>,
    opts?: { ttlSec?: number; forceRefresh?: boolean }
  ): Promise<R> {
    if (!this.options?.cache) return fn();

    const key = this.getCacheKey(method, args);

    if (!opts?.forceRefresh) {
      const cached = await this.options.cache.get<R>(key);
      if (cached) return cached;
    }

    const result = await fn();
    await this.options.cache.set(key, result, opts?.ttlSec ?? this.options.ttlSec);
    return result;
  }

  async findUnique<A extends Parameters<Delegate["findUnique"]>[0]>(
    args?: A | (QueryOptions<TWhere, TSelect, TInclude> & { baseWhere?: any }),
    opts?: { ttlSec?: number; forceRefresh?: boolean }
  ) {
    const isShorthand =
      args &&
      ((args as any).filters ||
        (args as any).selectFields ||
        (args as any).includeFields);

    const finalArgs = isShorthand
      ? (() => {
        const qo = args as QueryOptions<TWhere, TSelect, TInclude> & { baseWhere?: any };
        const built = buildPrismaArgsFromQueryOptions(qo);

        if (qo.baseWhere) {
          built.where = { ...(built.where || {}), ...qo.baseWhere };
        }

        if (qo.selectFields && (built as any).select) {
          (built as any).select = {
            ...(built as any).select,
            ...(buildPrismaArgsFromQueryOptions({ selectFields: qo.selectFields }) as any).select,
          };
        }

        return built;
      })()
      : args;

    return this.withCache("findUnique", finalArgs, () =>
      (this.delegate.findUnique as any)(finalArgs),
      opts
    );
  }

  async findMany<A extends Parameters<Delegate["findMany"]>[0]>(
    args?: A | QueryOptions<TWhere, TSelect, TInclude>,
    opts?: { ttlSec?: number; forceRefresh?: boolean }
  ) {
    const isShorthand =
      args &&
      ((args as any).filters ||
        (args as any).selectFields ||
        (args as any).includeFields);

    const finalArgs = isShorthand
      ? this.buildFromQueryOptions<A>(args as QueryOptions<TWhere, TSelect, TInclude>)
      : args;

    return this.withCache("findMany", finalArgs, () =>
      (this.delegate.findMany as any)(finalArgs),
      opts
    );
  }

  async findFirst<A extends Parameters<Delegate["findFirst"]>[0]>(
    args?: A | QueryOptions<TWhere, TSelect, TInclude>,
    opts?: { ttlSec?: number; forceRefresh?: boolean }
  ) {
    const isShorthand =
      args &&
      ((args as any).filters ||
        (args as any).selectFields ||
        (args as any).includeFields);

    const finalArgs = isShorthand
      ? this.buildFromQueryOptions<A>(args as QueryOptions<TWhere, TSelect, TInclude>)
      : args;

    return this.withCache("findFirst", finalArgs, () =>
      (this.delegate.findFirst as any)(finalArgs),
      opts
    );
  }


  async create<A extends Parameters<Delegate["create"]>[0]>(args: A) {
    return (this.delegate.create as any)(args) as ReturnType<Delegate["create"]>;
  }

  async update<A extends Parameters<Delegate["update"]>[0]>(args: A) {
    return (this.delegate.update as any)(args) as ReturnType<Delegate["update"]>;
  }

  async delete<A extends Parameters<Delegate["delete"]>[0]>(args: A) {
    return (this.delegate.delete as any)(args) as ReturnType<Delegate["delete"]>;
  }

  async upsert<A extends Parameters<Delegate["upsert"]>[0]>(args: A) {
    return (this.delegate.upsert as any)(args) as ReturnType<Delegate["upsert"]>;
  }

  async aggregate<A extends Parameters<Delegate["aggregate"]>[0]>(args: A) {
    return (this.delegate.aggregate as any)(args) as ReturnType<Delegate["aggregate"]>;
  }

  async groupBy<A extends Parameters<Delegate["groupBy"]>[0]>(args: A) {
    return (this.delegate.groupBy as any)(args) as ReturnType<Delegate["groupBy"]>;
  }

  async raw<T = any>(query: string) {
    const result = await this.prisma.$queryRawUnsafe(query);
    return result as unknown as T;
  }

  // convenience: call BaseService.findMany with caching support
  async findManyWithCache(whereOrOptions?: any, optionsOrArgs?: any, cacheKey?: string, cacheTtl?: number) {
    return this.base.findMany(whereOrOptions, optionsOrArgs, cacheKey, cacheTtl);
  }
}

// factory
export const createTypedBaseService = <Delegate extends { [k: string]: any }, Twhere, Tselect, Tinclude>(prisma: PrismaClient, delegate: Delegate, opts?: { cache?: CacheAdapter; softDeleteField?: string | null }) => {
  return new TypedBaseService<Delegate, Twhere, Tselect, Tinclude>(prisma, delegate, opts);
};
