/**
 * File placeholder utilities.
 * Files are not actually uploaded. Instead, we generate a placeholder URL
 * using a service like Placehold.co or Dicebear, or just a static assets path.
 * This is a temporary measure until actual storage is implemented.
 */

/**
 * Allowed file types for upload validation
 */
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
 * "Upload" a file by simply creating a placeholder URL
 */
export async function uploadToR2(
    file: File,
    prefix: string = 'uploads'
): Promise<string> {

    // Create a safe, unique filename identifier
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueId = Math.random().toString(36).substring(7);

    console.log(`[Placeholder Upload] Mock uploading ${file.name} (type: ${file.type}, size: ${file.size} bytes)`);

    // Return a dummy image or video URL based on the file type
    if (file.type.startsWith('image/')) {
        // Return a stable placeholder image with the filename
        return `https://placehold.co/600x400/2563eb/ffffff?text=${encodeURIComponent(safeName)}`;
    } else if (file.type.startsWith('video/')) {
        // Return a dummy placeholder video (or an image representing a video)
        return `https://placehold.co/600x400/ef4444/ffffff?text=Video+Placeholder%5Cn${encodeURIComponent(safeName)}`;
    }

    // fallback
    return `/dummy-${uniqueId}-${safeName}`;
}

export { ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES, ALLOWED_TYPES, MAX_FILE_SIZE };
