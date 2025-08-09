// -------------------------
// FILE: src/utils/nested.ts
// -------------------------
export type FieldInput = string | Record<string, any>;

/**
 * buildNestedFields transforms:
 * ["id", "name", { profile: ["id", "bio"] }]
 * to:
 * { id: true, name: true, profile: { select: { id: true, bio: true } } }
 *
 * parameter key: "select" | "include"
 */
export const buildNestedFields = (fields?: FieldInput[], key: "select" | "include" = "select") => {
  if (!fields || !fields.length) return undefined;
  const res: Record<string, any> = {};

  for (const f of fields) {
    if (typeof f === "string") {
      res[f] = true;
    } else if (typeof f === "object") {
      for (const [rel, relFields] of Object.entries(f)) {
        const nested = buildNestedFields(relFields as FieldInput[], key);
        res[rel] = { [key]: nested ?? undefined };
      }
    }
  }

  return res;
};
