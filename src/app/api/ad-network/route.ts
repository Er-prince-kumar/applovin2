import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ACTIVE',
    provider: 'Adsterra Smartlinks',
    smartlinksConfigured: 3,
  });
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Adsterra Smartlinks active and verified.',
  });
}
