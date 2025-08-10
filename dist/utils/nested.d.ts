export type FieldInput<T> = keyof T | {
    [K in keyof T]?: FieldInput<T[K]>;
};
/**
 * buildNestedFields transforms:
 * ["id", "name", { profile: ["id", "bio"] }]
 * to:
 * { id: true, name: true, profile: { select: { id: true, bio: true } } }
 *
 * parameter key: "select" | "include"
 */
export declare const buildNestedFields: <T, K extends keyof T = keyof T>(fields?: FieldInput<T>[], key?: "select" | "include") => Record<string, any> | undefined;
