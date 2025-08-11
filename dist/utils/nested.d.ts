import { IncludeShorthand, SelectShorthand } from "../types";
/**
 * buildNestedFields transforms:
 * ["id", "name", { profile: ["id", "bio"] }]
 * to:
 * { id: true, name: true, profile: { select: { id: true, bio: true } } }
 *
 * parameter key: "select" | "include"
 */
export declare const buildNestedFields: <T>(fields?: SelectShorthand<T> | IncludeShorthand<T>, key?: "select" | "include") => Record<string, any> | undefined;
