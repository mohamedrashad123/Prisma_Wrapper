export type FieldInput = string | Record<string, any>;
/**
 * buildNestedFields transforms:
 * ["id", "name", { profile: ["id", "bio"] }]
 * to:
 * { id: true, name: true, profile: { select: { id: true, bio: true } } }
 *
 * parameter key: "select" | "include"
 */
export declare const buildNestedFields: (fields?: FieldInput[], key?: "select" | "include") => Record<string, any> | undefined;
