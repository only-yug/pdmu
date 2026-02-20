export async function hashPassword(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.importKey(
        'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
    );
    const hash = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256
    );

    // Format: base64(salt):base64(hash)
    const saltB64 = btoa(String.fromCharCode(...salt));
    const hashB64 = btoa(String.fromCharCode(...new Uint8Array(hash)));

    return `${saltB64}:${hashB64}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    try {
        const [saltB64, hashB64] = storedHash.split(':');

        if (!saltB64 || !hashB64) {
            // Might be old bcrypt format if migrating, but this app is fresh
            return false;
        }

        const saltStr = atob(saltB64);
        const salt = new Uint8Array(saltStr.length);
        for (let i = 0; i < saltStr.length; i++) {
            salt[i] = saltStr.charCodeAt(i);
        }

        const key = await crypto.subtle.importKey(
            'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
        );
        const computedHashBuffer = await crypto.subtle.deriveBits(
            { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256
        );

        const computedHashB64 = btoa(String.fromCharCode(...new Uint8Array(computedHashBuffer)));

        return computedHashB64 === hashB64;
    } catch (error) {
        console.error("Password verification error:", error);
        return false;
    }
}
