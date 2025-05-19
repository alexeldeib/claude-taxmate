import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  
  const analysis = {
    keyExists: !!stripeKey,
    keyLength: stripeKey?.length,
    firstChars: stripeKey?.substring(0, 10),
    lastChars: stripeKey?.substring(stripeKey.length - 10),
    hasNewline: stripeKey?.includes('\n'),
    hasCarriageReturn: stripeKey?.includes('\r'),
    hasSpaceStart: stripeKey?.startsWith(' '),
    hasSpaceEnd: stripeKey?.endsWith(' '),
    specialChars: [] as { position: number; char: string; code: number }[],
  };
  
  if (stripeKey) {
    for (let i = 0; i < stripeKey.length; i++) {
      const char = stripeKey[i];
      const code = char.charCodeAt(0);
      if (code < 32 || code > 126) {
        analysis.specialChars.push({ position: i, char, code });
      }
    }
  }
  
  // Test Stripe initialization
  let stripeTestResult = 'NOT_TESTED';
  try {
    if (stripeKey) {
      // Test instantiation without storing the instance
      new Stripe(stripeKey, {
        apiVersion: '2025-04-30.basil',
        typescript: true,
      });
      stripeTestResult = 'SUCCESS';
    } else {
      stripeTestResult = 'NO_KEY';
    }
  } catch (error) {
    stripeTestResult = `FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
  
  return NextResponse.json({
    ...analysis,
    stripeTestResult,
    nodeVersion: process.version,
    envVarsCount: Object.keys(process.env).length,
  });
}