import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'downloads', 'LinkEarn-Publisher-v1.0.0.apk');

    if (!fs.existsSync(filePath)) {
      return new NextResponse('APK file not found on server', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="LinkEarn-Publisher-v1.0.0.apk"',
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error serving APK download:', error);
    return new NextResponse('Internal server error downloading APK', { status: 500 });
  }
}
