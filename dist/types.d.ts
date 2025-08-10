export type OrderBy = Record<string, "asc" | "desc">;
export type Pagination = {
    page: number;
    limit: number;
} | {
    skip?: number;
    take?: number;
};
export type SearchOptions = {
    term: string;
    fields: string[];
};
type PrimitiveFieldKeys<T> = {
    [K in keyof T]: T[K] extends object ? never : K;
}[keyof T];
type NestedFieldKeys<T> = {
    [K in keyof T]: T[K] extends object ? K : never;
}[keyof T];
export type SelectShorthand<T> = Array<PrimitiveFieldKeys<T> | {
    [K in NestedFieldKeys<T>]: SelectShorthand<T[K]>;
}>;
export type IncludeShorthand<T> = Array<keyof T | {
    [K in keyof T]: IncludeShorthand<any>;
}>;
export type QueryOptions<TWhere, TSelect, TInclude> = {
    selectFields?: SelectShorthand<TSelect>;
    includeFields?: IncludeShorthand<TInclude>;
    filters?: TWhere;
    pagination?: Pagination;
    orderBy?: OrderBy;
    search?: SearchOptions;
    aggregate?: Record<string, any>;
    softDelete?: boolean;
    raw?: boolean;
};
export interface CacheAdapter {
    get<T = any>(key: string): Promise<T | null> | T | null;
    set<T = any>(key: string, value: T, ttlSec?: number): Promise<void> | void;
    del(key: string): Promise<void> | void;
}
export {};
