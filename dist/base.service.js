"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
const query_builder_1 = require("./query_builder");
/**
 * BaseService (untyped) - provides core runtime behavior:
 * - accepts shorthand QueryOptions and native Prisma args
 * - caching hooks
 * - soft delete
 * - common utility wrappers
 *
 * This class is used internally by TypedBaseService to reuse logic.
 */
class BaseService {
    constructor(prisma, delegate, opts) {
        this.prisma = prisma;
        this.delegate = delegate;
        this.cache = opts?.cache;
        this.softDeleteField = opts?.softDeleteField ?? "deletedAt";
    }
    async execWithCache(key, fn, ttlSec) {
        if (!this.cache || !key)
            return fn();
        const cached = await this.cache.get(key);
        if (cached !== null && cached !== undefined)
            return cached;
        const res = await fn();
        await this.cache.set(key, res, ttlSec);
        return res;
    }
    // normalizes either QueryOptions shorthand or native Prisma args into Prisma args object
    normalizeArgs(maybeOptionsOrArgs, baseWhere) {
        if (!maybeOptionsOrArgs && !baseWhere)
            return undefined;
        // if shorthand detected
        const isShorthand = maybeOptionsOrArgs && (maybeOptionsOrArgs.filters || maybeOptionsOrArgs.selectFields || maybeOptionsOrArgs.includeFields || maybeOptionsOrArgs.search || maybeOptionsOrArgs.pagination);
        if (isShorthand) {
            const built = (0, query_builder_1.buildPrismaArgsFromQueryOptions)(maybeOptionsOrArgs);
            if (baseWhere)
                built.where = { ...(built.where || {}), ...baseWhere };
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
    async create(argsOrOptions) {
        const normalized = this.normalizeArgs(argsOrOptions);
        // if shorthand with no explicit data, try to find data
        if (normalized && normalized.data)
            return this.delegate.create(normalized);
        if (argsOrOptions && argsOrOptions.data)
            return this.delegate.create(argsOrOptions);
        // else assume argsOrOptions is the data
        return this.delegate.create({ data: argsOrOptions });
    }
    async findUnique(whereOrArgs, optionsOrArgs, cacheKey, cacheTtlSec) {
        const normalized = optionsOrArgs && (optionsOrArgs.filters || optionsOrArgs.selectFields) ? this.normalizeArgs(optionsOrArgs, whereOrArgs) : (optionsOrArgs ? { where: whereOrArgs, ...optionsOrArgs } : { where: whereOrArgs });
        return this.execWithCache(cacheKey ?? null, () => this.delegate.findUnique(normalized), cacheTtlSec);
    }
    async findFirst(whereOrArgs, optionsOrArgs) {
        const normalized = optionsOrArgs && (optionsOrArgs.filters || optionsOrArgs.selectFields) ? this.normalizeArgs(optionsOrArgs, whereOrArgs) : whereOrArgs ? (whereOrArgs.where || whereOrArgs) : optionsOrArgs;
        return this.delegate.findFirst(normalized);
    }
    async findMany(whereOrOptions, optionsOrArgs, cacheKey, cacheTtlSec) {
        // multiple call shapes supported
        let normalized;
        if (!optionsOrArgs && whereOrOptions && (whereOrOptions.filters || whereOrOptions.selectFields)) {
            normalized = this.normalizeArgs(whereOrOptions);
        }
        else if (whereOrOptions && optionsOrArgs && (optionsOrArgs.filters || optionsOrArgs.selectFields)) {
            normalized = this.normalizeArgs(optionsOrArgs, whereOrOptions);
        }
        else if (whereOrOptions && !optionsOrArgs) {
            normalized = (whereOrOptions.where || Object.keys(whereOrOptions).some(k => ["select", "include", "where"].includes(k))) ? whereOrOptions : { where: whereOrOptions };
        }
        else {
            normalized = optionsOrArgs ?? {};
        }
        return this.execWithCache(cacheKey ?? null, () => this.delegate.findMany(normalized), cacheTtlSec);
    }
    async update(whereOrArgs, dataOrOptions) {
        // shapes: update({ where:..., data: ... }) OR update(where, { data, selectFields })
        if (whereOrArgs && whereOrArgs.where && whereOrArgs.data)
            return this.delegate.update(whereOrArgs);
        if (dataOrOptions && (dataOrOptions.filters || dataOrOptions.selectFields)) {
            const built = this.normalizeArgs(dataOrOptions, whereOrArgs);
            return this.delegate.update({ where: whereOrArgs, data: dataOrOptions.data || dataOrOptions, ...built });
        }
        return this.delegate.update({ where: whereOrArgs, data: dataOrOptions });
    }
    async delete(whereOrArgs, optionsOrArgs, softDelete = true) {
        if (softDelete && this.softDeleteField) {
            return this.delegate.update({ where: whereOrArgs.where ?? whereOrArgs, data: { [this.softDeleteField]: new Date() } });
        }
        return this.delegate.delete(whereOrArgs);
    }
    async upsert(args) {
        return this.delegate.upsert(args);
    }
    async createMany(args) {
        return this.delegate.createMany(args);
    }
    async updateMany(args) {
        return this.delegate.updateMany(args);
    }
    async deleteMany(args) {
        return this.delegate.deleteMany(args);
    }
    async aggregate(args) {
        return this.delegate.aggregate(args);
    }
    async groupBy(args) {
        return this.delegate.groupBy(args);
    }
    async transaction(fn) {
        return this.prisma.$transaction(async (tx) => fn(tx));
    }
    async raw(query) {
        const result = await this.prisma.$queryRawUnsafe(query);
        return result;
    }
}
exports.BaseService = BaseService;
