import { NextResponse } from 'next/server'
import { config } from '@/lib/config'

export async function GET() {
  try {
    return NextResponse.json({
      stripeSecretKey: config.stripe.secretKey ? 'present' : 'missing',
      stripePublicKey: config.stripe.publishableKey ? 'present' : 'missing',
      appUrl: config.app.url,
      stripeWebhookSecret: config.stripe.webhookSecret ? 'present' : 'missing',
      supabaseUrl: config.supabase.url,
      envVariables: {
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'present' : 'missing',
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}