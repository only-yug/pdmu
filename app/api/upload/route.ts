import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadToR2, validateFile, ALLOWED_IMAGE_TYPES } from '@/lib/r2';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
    try {
        // Auth check
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
        }

        // Validate file type + size
        const validation = validateFile(file, ALLOWED_IMAGE_TYPES);
        if (!validation.valid) {
            return NextResponse.json({ success: false, message: validation.error }, { status: 400 });
        }

        // Upload to R2
        const url = await uploadToR2(file, 'uploads/profiles');

        return NextResponse.json({ success: true, url });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 });
    }
}
