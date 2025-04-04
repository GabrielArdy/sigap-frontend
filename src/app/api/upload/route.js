import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

// Change from default export to a named export for the POST method
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const filepath = formData.get('filepath');
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'Only image files are allowed' },
        { status: 400 }
      );
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File size exceeds 2MB limit' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Make sure directory exists
    const publicDir = path.join(process.cwd(), 'public');
    const saveDir = path.join(publicDir, filepath.split('/').slice(0, -1).join('/'));
    
    try {
      await writeFile(path.join(publicDir, filepath), buffer);
      return NextResponse.json({
        success: true,
        filepath: filepath
      });
    } catch (error) {
      console.error('Error writing file:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to save file' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Upload failed' },
      { status: 500 }
    );
  }
}
