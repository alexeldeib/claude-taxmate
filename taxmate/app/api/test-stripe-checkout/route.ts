import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const { priceId } = await request.json();
    console.log('Test checkout request:', { priceId });
    
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: 'Stripe secret key not configured' }, { status: 500 });
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2025-04-30.basil',
      typescript: true,
    });
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tax.acebutt.xyz';
    console.log('Using app URL:', appUrl);
    
    // Create a test checkout session without user
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appUrl}/app?success=true`,
      cancel_url: `${appUrl}/pricing`,
      customer_email: 'test@example.com', // For testing
    });
    
    console.log('Session created:', session.id);
    return NextResponse.json({ sessionId: session.id, url: session.url });
    
  } catch (error) {
    console.error('Test checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = error instanceof Error && 'code' in error ? (error as Error & { code?: string }).code : undefined;
    
    return NextResponse.json({
      error: 'Failed to create checkout session',
      details: errorMessage,
      code: errorCode,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      stripeKeyExists: !!process.env.STRIPE_SECRET_KEY,
    }, { status: 500 });
  }
}