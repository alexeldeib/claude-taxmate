import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Get the raw body as text
    const rawBody = await request.text();
    
    // Get headers
    const headersList = await headers();
    const stripeSignature = headersList.get('stripe-signature');
    
    // Log request details
    const debugInfo = {
      hasSignature: !!stripeSignature,
      signatureLength: stripeSignature?.length,
      bodyLength: rawBody.length,
      bodyPreview: rawBody.substring(0, 100),
      contentType: headersList.get('content-type'),
      allHeaders: Array.from(headersList.entries()).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>),
    };
    
    return NextResponse.json({
      message: 'Webhook test received',
      debug: debugInfo,
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Test webhook error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}