// -------------------------
// FILE: src/utils/nested.ts

import { IncludeShorthand, SelectShorthand } from "../types";

// -------------------------

/**
 * buildNestedFields transforms:
 * ["id", "name", { profile: ["id", "bio"] }]
 * to:
 * { id: true, name: true, profile: { select: { id: true, bio: true } } }
 *
 * parameter key: "select" | "include"
 */
export const buildNestedFields = <T>(
  fields?: SelectShorthand<T> | IncludeShorthand<T>,
  key: "select" | "include" = "select"
): Record<string, any> | undefined => {
  if (!fields) return undefined;

  // لو Array => ["id", "name"] أو [{ profile: {...} }]
  if (Array.isArray(fields)) {
    return fields.reduce((acc, f) => {
      if (typeof f === "string") {
        acc[f] = true;
      } else if (typeof f === "object" && f !== null) {
        for (const [rel, relArgs] of Object.entries(f)) {
          if (relArgs === null || relArgs === undefined) continue;

          if (typeof relArgs === "boolean") {
            acc[rel] = relArgs;
          } else if (typeof relArgs === "object") {
            const nested: Record<string, any> = {};
            if ("select" in relArgs && relArgs.select)
              nested.select = buildNestedFields(relArgs.select, "select");
            if ("include" in relArgs && relArgs.include)
              nested.include = buildNestedFields(relArgs.include, "include");
            if ("where" in relArgs && relArgs.where)
              nested.where = relArgs.where;
            if ("orderBy" in relArgs && relArgs.orderBy)
              nested.orderBy = relArgs.orderBy;
            if ("skip" in relArgs && relArgs.skip !== undefined)
              nested.skip = relArgs.skip;
            if ("take" in relArgs && relArgs.take !== undefined)
              nested.take = relArgs.take;

            acc[rel] = nested;
          }
        }
      }
      return acc;
    }, {} as Record<string, any>);
  }

  // لو Object عادي
  const res: Record<string, any> = {};
  for (const [rel, relArgs] of Object.entries(fields)) {
    if (relArgs === null || relArgs === undefined) continue;

    if (typeof relArgs === "boolean") {
      res[rel] = relArgs;
    } else if (typeof relArgs === "object") {
      const nested: Record<string, any> = {};
      if ("select" in relArgs && relArgs.select)
        nested.select = buildNestedFields(relArgs.select, "select");
      if ("include" in relArgs && relArgs.include)
        nested.include = buildNestedFields(relArgs.include, "include");
      if ("where" in relArgs && relArgs.where)
        nested.where = relArgs.where;
      if ("orderBy" in relArgs && relArgs.orderBy)
        nested.orderBy = relArgs.orderBy;
      if ("skip" in relArgs && relArgs.skip !== undefined)
        nested.skip = relArgs.skip;
      if ("take" in relArgs && relArgs.take !== undefined)
        nested.take = relArgs.take;

      res[rel] = nested;
    }
  }

  return res;
};
