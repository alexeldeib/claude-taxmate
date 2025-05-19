import { NextResponse } from 'next/server';

export async function GET() {
  const priceIds = {
    solo: process.env.NEXT_PUBLIC_STRIPE_SOLO_PRICE_ID,
    seasonal: process.env.NEXT_PUBLIC_STRIPE_SEASONAL_PRICE_ID,
  };
  
  const analysis = {
    solo: {
      value: priceIds.solo,
      length: priceIds.solo?.length,
      hasNewline: priceIds.solo?.includes('\n'),
      hasCarriageReturn: priceIds.solo?.includes('\r'),
      lastChar: priceIds.solo ? priceIds.solo.charCodeAt(priceIds.solo.length - 1) : null,
      trimmedEquals: priceIds.solo?.trim() === priceIds.solo,
    },
    seasonal: {
      value: priceIds.seasonal,
      length: priceIds.seasonal?.length,
      hasNewline: priceIds.seasonal?.includes('\n'),
      hasCarriageReturn: priceIds.seasonal?.includes('\r'),
      lastChar: priceIds.seasonal ? priceIds.seasonal.charCodeAt(priceIds.seasonal.length - 1) : null,
      trimmedEquals: priceIds.seasonal?.trim() === priceIds.seasonal,
    },
  };
  
  return NextResponse.json(analysis);
}