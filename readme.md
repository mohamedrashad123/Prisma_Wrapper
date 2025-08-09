# Prisma Advanced Wrapper

An advanced TypeScript wrapper around Prisma Client that makes working with complex queries easier, cleaner, and safer.
It provides:
- **Short-hand query syntax** for `select` / `include`.
- **Dynamic query builder** from field names.
- **Full compile-time type safety** with Prisma model types.
- **Nested select/include support** with simple array/object syntax.
- **Filter building** in a cleaner, Prisma-like syntax.
- **Optional caching layer** support.
- **Pagination, ordering, and search helpers**.
- **Soft delete** support.

---

## ✨ Features
- **Shorthand `select` and `include`:**
  ```ts
  selectFields: ["id", "name", { profile: ["id", "bio"] }]
  includeFields: ["posts", { comments: ["id", "content"] }]
  ```
- **Clean filters:**
  ```ts
  filters: { age: { gte: 18 }, country: "US" }
  ```
- **Pagination:**
  ```ts
  pagination: { page: 1, limit: 10 }
  ```
- **Ordering:**
  ```ts
  order: { createdAt: "desc" }
  ```
- **Search:**
  ```ts
  search: { query: "hello", fields: ["name", "email"] }
  ```
- **Soft delete:**
  ```ts
  softDelete: true
  ```
- **Caching:**
  ```ts
  cache: true
  ```

## 📦 Installation
```
npm install prisma-advanced-wrapper
```

## 🔧 Usage
- **1. Import and Setup:**

    ```ts
    import { PrismaClient } from "@prisma/client";
    import { TypedBaseService } from "prisma-advanced-wrapper";

    const prisma = new PrismaClient();

    const userService = new TypedBaseService<
        Prisma.UserDelegate<false>,
        Prisma.UserWhereInput,
        Prisma.UserSelect,
        Prisma.UserInclude
    >(prisma.user);

    await userService.findUnique({
        filters: { id: 1 },
        selectFields: ["id", "name", { profile: ["bio"] }],
    });
    ```
- **2. Using shorthand queries:**

    **Find a single user:**
    ```ts
    await userService.findUnique({
        filters: { id: 1 },
        selectFields: ["id", "name", { profile: ["bio"] }],
    });
    ```
    **Find many with pagination, search, and ordering:**
    ```ts
    await userService.findMany({
        pagination: { page: 2, limit: 5 },
        search: { term: "john", fields: ["name", "email"] },
        orderBy: { createdAt: "desc" },
    });
    ```