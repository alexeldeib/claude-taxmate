import { NextResponse } from 'next/server';

export async function GET() {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  const analysis = {
    secretExists: !!webhookSecret,
    secretLength: webhookSecret?.length,
    firstChars: webhookSecret?.substring(0, 10),
    lastChars: webhookSecret?.substring((webhookSecret?.length || 10) - 10),
    hasNewline: webhookSecret?.includes('\n'),
    hasCarriageReturn: webhookSecret?.includes('\r'),
    hasSpaceStart: webhookSecret?.startsWith(' '),
    hasSpaceEnd: webhookSecret?.endsWith(' '),
    startsWithWhsec: webhookSecret?.startsWith('whsec_'),
  };
  
  return NextResponse.json(analysis);
}