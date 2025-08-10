"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTypedBaseService = exports.TypedBaseService = void 0;
const base_service_1 = require("./base.service");
const query_builder_1 = require("./query_builder");
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
class TypedBaseService {
    constructor(prisma, delegate, opts) {
        this.prisma = prisma;
        this.delegate = delegate;
        this.base = new base_service_1.BaseService(prisma, delegate, { cache: opts?.cache, softDeleteField: opts?.softDeleteField ?? "deletedAt" });
        this.options = opts;
    }
    // Helper: if user passed QueryOptions, return Prisma args typed as A
    buildFromQueryOptions(opts) {
        if (!opts)
            return undefined;
        const built = (0, query_builder_1.buildPrismaArgsFromQueryOptions)(opts);
        if (opts.selectFields && built.select) {
            built.select = {
                ...built.select,
                ...(0, query_builder_1.buildPrismaArgsFromQueryOptions)({
                    selectFields: opts.selectFields,
                }).select,
            };
        }
        return built;
    }
    getCacheKey(method, args) {
        return `${method}:${JSON.stringify(args)}`;
    }
    async withCache(method, args, fn, opts) {
        if (!this.options?.cache)
            return fn();
        const key = this.getCacheKey(method, args);
        if (!opts?.forceRefresh) {
            const cached = await this.options.cache.get(key);
            if (cached)
                return cached;
        }
        const result = await fn();
        await this.options.cache.set(key, result, opts?.ttlSec ?? this.options.ttlSec);
        return result;
    }
    async findUnique(args, opts) {
        const isShorthand = args &&
            (args.filters ||
                args.selectFields ||
                args.includeFields);
        const finalArgs = isShorthand
            ? (() => {
                const qo = args;
                const built = (0, query_builder_1.buildPrismaArgsFromQueryOptions)(qo);
                if (qo.baseWhere) {
                    built.where = { ...(built.where || {}), ...qo.baseWhere };
                }
                if (qo.selectFields && built.select) {
                    built.select = {
                        ...built.select,
                        ...(0, query_builder_1.buildPrismaArgsFromQueryOptions)({ selectFields: qo.selectFields }).select,
                    };
                }
                return built;
            })()
            : args;
        return this.withCache("findUnique", finalArgs, () => this.delegate.findUnique(finalArgs), opts);
    }
    async findMany(args, opts) {
        const isShorthand = args &&
            (args.filters ||
                args.selectFields ||
                args.includeFields);
        const finalArgs = isShorthand
            ? this.buildFromQueryOptions(args)
            : args;
        return this.withCache("findMany", finalArgs, () => this.delegate.findMany(finalArgs), opts);
    }
    async findFirst(args, opts) {
        const isShorthand = args &&
            (args.filters ||
                args.selectFields ||
                args.includeFields);
        const finalArgs = isShorthand
            ? this.buildFromQueryOptions(args)
            : args;
        return this.withCache("findFirst", finalArgs, () => this.delegate.findFirst(finalArgs), opts);
    }
    async create(args) {
        return this.delegate.create(args);
    }
    async update(args) {
        return this.delegate.update(args);
    }
    async delete(args) {
        return this.delegate.delete(args);
    }
    async upsert(args) {
        return this.delegate.upsert(args);
    }
    async aggregate(args) {
        return this.delegate.aggregate(args);
    }
    async groupBy(args) {
        return this.delegate.groupBy(args);
    }
    async raw(query) {
        const result = await this.prisma.$queryRawUnsafe(query);
        return result;
    }
    // convenience: call BaseService.findMany with caching support
    async findManyWithCache(whereOrOptions, optionsOrArgs, cacheKey, cacheTtl) {
        return this.base.findMany(whereOrOptions, optionsOrArgs, cacheKey, cacheTtl);
    }
}
exports.TypedBaseService = TypedBaseService;
// factory
const createTypedBaseService = (prisma, delegate, opts) => {
    return new TypedBaseService(prisma, delegate, opts);
};
exports.createTypedBaseService = createTypedBaseService;
