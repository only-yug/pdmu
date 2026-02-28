export const ALLOWED_EMAIL_DOMAINS = [
    'gmail.com',
    'yahoo.com',
    'yahoo.co.in',
    'yahoo.co.uk',
    'outlook.com',
    'hotmail.com',
    'live.com',
    'icloud.com',
    'apple.com',
    'aol.com',
    'protonmail.com',
    'proton.me',
    'zoho.com',
];

export function validateEmailDomain(email: string): { isValid: boolean; error?: string } {
    if (!email || typeof email !== 'string') {
        return { isValid: false, error: 'Email is required.' };
    }

    const parts = email.split('@');
    if (parts.length !== 2) {
        return { isValid: false, error: 'Invalid email format.' };
    }

    const domain = parts[1].toLowerCase();

    if (!ALLOWED_EMAIL_DOMAINS.includes(domain)) {
        return {
            isValid: false,
            error: `Please use a recognized email provider (e.g., @gmail.com, @yahoo.com). "${domain}" is not allowed.`
        };
    }

    return { isValid: true };
}
