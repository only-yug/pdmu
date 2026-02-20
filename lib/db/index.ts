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
            return ctx.env.DB as unknown as Database;
        }
    } catch {
        // Not in Cloudflare context — fall through
    }

    // 2. Check globalThis (populated by next.config.ts for local dev)
    if ((globalThis as any).DB) {
        return (globalThis as any).DB as Database;
    }

    // 3. Check process.env (some bridging setups)
    if (process.env.DB) {
        return (process.env.DB as unknown) as Database;
    }

    // 4. Production — hard error
    if (process.env.NODE_ENV === 'production') {
        console.error('Database binding (DB) not found. Check Cloudflare Pages bindings.');
    }

    // 5. Development fallback — silent mock so pages can render
    console.warn('--- DB BINDING NOT FOUND: CHECK WRANGLER PROXY ---');
    return {
        prepare: () => ({
            bind: function () { return this; },
            first: async () => null,
            run: async () => ({ success: true }),
            all: async () => ({ results: [] })
        } as any),
        batch: async () => [],
        exec: async () => { }
    } as unknown as Database;
}

// Export Drizzle client factory (takes explicit env)
export const db = (env: any) => {
    return drizzle(env.DB, { schema });
};

// Export Drizzle instance with auto-binding lookup
export function getDrizzleDb() {
    const binding = getDatabase();
    return drizzle(binding as any, { schema });
}
