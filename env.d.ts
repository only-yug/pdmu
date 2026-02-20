/// <reference types="@cloudflare/workers-types" />

interface CloudflareEnv {
    DB: D1Database;
    STORAGE: R2Bucket;
    NEXTAUTH_URL: string;
    NEXTAUTH_SECRET: string;
    [key: string]: unknown;
}
