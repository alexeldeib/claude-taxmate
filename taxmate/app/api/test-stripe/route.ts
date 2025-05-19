import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test if Stripe is configured
    const hasStripeKey = !!process.env.STRIPE_SECRET_KEY
    const hasPublicKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    const hasWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET
    const priceIds = {
      solo: process.env.NEXT_PUBLIC_STRIPE_SOLO_PRICE_ID,
      seasonal: process.env.NEXT_PUBLIC_STRIPE_SEASONAL_PRICE_ID,
    }
    
    return NextResponse.json({
      stripe: {
        secretKey: hasStripeKey,
        publicKey: hasPublicKey,
        webhookSecret: hasWebhookSecret,
        priceIds,
      },
      app: {
        url: process.env.NEXT_PUBLIC_APP_URL || 'not set',
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}