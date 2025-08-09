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

  constructor(prisma: PrismaClient, delegate: Delegate, opts?: { cache?: CacheAdapter; softDeleteField?: string | null }) {
    this.prisma = prisma;
    this.delegate = delegate;
    this.base = new BaseService(prisma, delegate, { cache: opts?.cache, softDeleteField: opts?.softDeleteField ?? "deletedAt" });
  }

  // Helper: if user passed QueryOptions, return Prisma args typed as A
  private buildFromQueryOptions<A>(opts?: QueryOptions<TWhere, TSelect, TInclude>): A | undefined {
    if (!opts) return undefined;
    const built = buildPrismaArgsFromQueryOptions(opts);
    return built as unknown as A;
  }

  // findUnique overloads: native Prisma args OR QueryOptions (with baseWhere)
  async findUnique<A extends Parameters<Delegate["findUnique"]>[0]>(args?: A | (QueryOptions<TWhere, TSelect, TInclude> & { baseWhere?: any })) {
    if (args && (args as any).filters || (args as any).selectFields || (args as any).includeFields) {
      // treat as shorthand
      const qo = args as any as QueryOptions<TWhere, TSelect, TInclude> & { baseWhere?: any };
      const built = buildPrismaArgsFromQueryOptions(qo);
      if (qo.baseWhere) built.where = { ...(built.where || {}), ...qo.baseWhere };
      return (this.delegate.findUnique as any)(built) as ReturnType<Delegate["findUnique"]>;
    }
    // native prisma args
    return (this.delegate.findUnique as any)(args) as ReturnType<Delegate["findUnique"]>;
  }

  async findMany<A extends Parameters<Delegate["findMany"]>[0]>(args?: A | QueryOptions<TWhere, TSelect, TInclude>) {
    if (args && (args as any).filters || (args as any).selectFields || (args as any).includeFields) {
      const built = this.buildFromQueryOptions<A>(args as QueryOptions<TWhere, TSelect, TInclude>);
      return (this.delegate.findMany as any)(built) as ReturnType<Delegate["findMany"]>;
    }
    return (this.delegate.findMany as any)(args) as ReturnType<Delegate["findMany"]>;
  }

  async findFirst<A extends Parameters<Delegate["findFirst"]>[0]>(args?: A | QueryOptions<TWhere, TSelect, TInclude>) {
    if (args && (args as any).filters || (args as any).selectFields || (args as any).includeFields) {
      const built = this.buildFromQueryOptions<A>(args as QueryOptions<TWhere, TSelect, TInclude>);
      return (this.delegate.findFirst as any)(built) as ReturnType<Delegate["findFirst"]>;
    }
    return (this.delegate.findFirst as any)(args) as ReturnType<Delegate["findFirst"]>;
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
    return this.prisma.$queryRawUnsafe<T>(query);
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
