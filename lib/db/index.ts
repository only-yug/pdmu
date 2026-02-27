import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import { getRequestContext } from '@cloudflare/next-on-pages';

/**
 * Database types for Cloudflare D1
 */
export interface Database {
    prepare(query: string): Statement;
    batch<T = unknown>(statements: Statement[]): Promise<T[]>;
    exec(query: string): Promise<void>;
}

export interface Statement {
    bind(...values: any[]): Statement;
    first<T = unknown>(colName?: string): Promise<T | null>;
    run(): Promise<{ success: boolean; meta?: any }>;
    all<T = unknown>(): Promise<{ results: T[]; meta?: any }>;
}

/**
 * Helper function to get the raw D1 database binding.
 * Resolution order:
 *   1. Cloudflare Pages request context (getRequestContext) — works in production & preview
 *   2. globalThis.DB — populated by next.config.ts in local dev
 *   3. process.env.DB — fallback for some bridging setups
 *   4. Dev-mode silent mock
 */
export function getDatabase(): Database {
    // 1. Always try Cloudflare request context first (works on Pages edge)
    try {
        const ctx = getRequestContext();
        if (ctx?.env?.DB) {
            console.log('✅ DB found in Cloudflare Request Context');
            return ctx.env.DB as unknown as Database;
        }
    } catch (_e: any) {
        // Not in Cloudflare context — fall through
    }

    // 2. Check globalThis (populated by next.config.mjs for local dev)
    if ((globalThis as any).DB) {
        console.log('✅ DB found in globalThis');
        return (globalThis as any).DB as Database;
    }

    // 3. Check process.env (some bridging setups)
    if (process.env.DB) {
        console.log('✅ DB found in process.env.DB');
        return (process.env.DB as unknown) as Database;
    }

    // 4. Production — hard error
    if (process.env.NODE_ENV === 'production') {
        console.error('❌ Database binding (DB) not found.');
    }

    // 5. Minimal quiet mock for UI testing
    const mockStmt = {
        bind: function () { return this; },
        first: async () => null,
        run: async () => ({ success: true, meta: {} }),
        all: async () => ({ results: [], meta: {} }),
        raw: async () => [],
        values: async () => []
    };

    return {
        prepare: () => mockStmt as any,
        batch: async () => [],
        exec: async () => { }
    } as unknown as Database;
}

// Export Drizzle client factory (takes explicit env)
export const db = (env: any) => {
    return drizzle(env.DB, { schema });
};

// Internal cache for the Drizzle instance
let cachedDb: any = null;

// Export Drizzle instance with auto-binding lookup
export function getDrizzleDb() {
    if (cachedDb) return cachedDb;

    const binding = getDatabase();
    cachedDb = drizzle(binding as any, { schema });
    return cachedDb;
}
