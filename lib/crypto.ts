// Helper to convert Uint8Array to Base64 (works in Edge and Node)
function bytesToBase64(bytes: Uint8Array): string {
    if (typeof Buffer !== 'undefined') {
        return Buffer.from(bytes).toString('base64');
    }
    const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
    return btoa(binString);
}

// Helper to convert Base64 to Uint8Array (works in Edge and Node)
function base64ToBytes(base64: string): Uint8Array {
    if (typeof Buffer !== 'undefined') {
        const buf = Buffer.from(base64, 'base64');
        return Uint8Array.from(buf);
    }
    const binString = atob(base64);
    return Uint8Array.from(binString, (m) => m.charCodeAt(0));
}

export async function hashPassword(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.importKey(
        'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
    );
    const hash = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256
    );

    const saltB64 = bytesToBase64(salt);
    const hashB64 = bytesToBase64(new Uint8Array(hash));

    return `${saltB64}:${hashB64}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    try {
        const [saltB64, hashB64] = storedHash.split(':');

        if (!saltB64 || !hashB64) {
            return false;
        }

        const salt = base64ToBytes(saltB64);
        const key = await crypto.subtle.importKey(
            'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
        );
        const computedHashBuffer = await crypto.subtle.deriveBits(
            { name: 'PBKDF2', salt: salt as any, iterations: 100000, hash: 'SHA-256' },
            key,
            256
        );

        const computedHashB64 = bytesToBase64(new Uint8Array(computedHashBuffer));
        return computedHashB64 === hashB64;
    } catch (error) {
        console.error("Password verification error:", error);
        return false;
    }
}

