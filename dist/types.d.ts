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
export type QueryOptions<TWhere, TSelect, TInclude> = {
    selectFields?: Array<string | Record<string, any>> & TSelect;
    includeFields?: Array<string | Record<string, any>> & TInclude;
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
