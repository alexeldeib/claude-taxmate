import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const { priceId, planType } = await request.json();
    console.log('Checkout request received:', { priceId, planType });
    
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      console.error('No Stripe secret key');
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2025-04-30.basil',
      typescript: true,
    });
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    console.log('Using app URL:', appUrl);
    
    // Create a simple checkout session
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
    });
    
    console.log('Session created:', session.id);
    return NextResponse.json({ sessionId: session.id });
    
  } catch (error) {
    console.error('Checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = error instanceof Error && 'code' in error ? (error as Error & { code?: string }).code : undefined;
    
    return NextResponse.json({
      error: 'Failed to create checkout session',
      details: errorMessage,
      code: errorCode,
    }, { status: 500 });
  }
}