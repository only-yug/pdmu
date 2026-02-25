import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * Cloudflare R2 / S3 Client Configuration
 * Only initialized if credentials are provided in .env
 */
const r2Client = process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_ACCOUNT_ID
    ? new S3Client({
        region: "auto",
        endpoint: `${process.env.R2_ACCOUNT_ID}`,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
    })
    : null;

/**
 * Allowed file types for upload validation
 */
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (Increased from 5MB per user preference)

/**
 * Validate a file before uploading
 */
export function validateFile(file: File, allowedTypes?: string[]): { valid: boolean; error?: string } {
    const types = allowedTypes || ALLOWED_TYPES;

    if (!types.includes(file.type)) {
        return { valid: false, error: `File type "${file.type}" is not allowed. Accepted: ${types.join(', ')}` };
    }

    if (file.size > MAX_FILE_SIZE) {
        return { valid: false, error: `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: ${MAX_FILE_SIZE / 1024 / 1024}MB` };
    }

    return { valid: true };
}

/**
 * Upload a file to R2 if configured, otherwise return a placeholder
 */
export async function uploadToR2(
    file: File,
    prefix: string = 'uploads'
): Promise<string> {
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueId = Math.random().toString(36).substring(7);
    const key = `${prefix}/${uniqueId}-${safeName}`;

    // If R2 is configured, perform actual upload
    if (r2Client && process.env.R2_BUCKET_NAME && process.env.R2_PUBLIC_DOMAIN) {
        try {
            console.log(`[R2 Upload] Uploading ${file.name} to bucket ${process.env.R2_BUCKET_NAME}...`);

            const buffer = Buffer.from(await file.arrayBuffer());

            await r2Client.send(new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: key,
                Body: buffer,
                ContentType: file.type,
            }));

            // Construct the public URL
            const publicDomain = process.env.R2_PUBLIC_DOMAIN.replace(/\/$/, '');
            return `${publicDomain}/${key}`;
        } catch (error: any) {
            console.error("[R2 Upload Error]", error);
            console.error("[R2 Upload Error - Full Object]");
            console.dir(error, { depth: null });

            if (error?.$response) {
                console.error("Raw Response:");
                console.dir(error.$response, { depth: null });

                if (error.$response?.body) {
                    console.error("Raw Body:");
                    console.log(error.$response.body);
                }
            }
            // Fallback to placeholder on error so the app stays functional
        }
    }

    // Local/Fallback Mode: Return placeholder URLs
    console.log(`[Mock Upload] Fallback for ${file.name} (R2 not configured)`);

    if (file.type.startsWith('image/')) {
        return `https://placehold.co/600x400/2563eb/ffffff?text=${encodeURIComponent(safeName)}`;
    } else if (file.type.startsWith('video/')) {
        return `https://placehold.co/600x400/ef4444/ffffff?text=Video+Placeholder%5Cn${encodeURIComponent(safeName)}`;
    }

    return `/dummy-fallback-${uniqueId}-${safeName}`;
}

export { ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES, ALLOWED_TYPES, MAX_FILE_SIZE };
