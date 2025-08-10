/**
 * parseFilters converts friendly filter syntax like:
 * { "age:gte": 18, "name:contains": "mo", posts: { some: { published: true } } }
 * into Prisma where:
 * { age: { gte: 18 }, name: { contains: "mo", mode: "insensitive" }, posts: { some: { published: true } } }
 */
export declare const parseFilters: (filters?: Record<string, any>) => Record<string, any>;
