import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function GET() {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY
    
    if (!stripeKey) {
      return NextResponse.json({ error: 'Stripe secret key not configured' })
    }
    
    // Try to initialize Stripe
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2025-04-30.basil',
      typescript: true,
    })
    
    // Try to list products to test the connection
    const products = await stripe.products.list({ limit: 1 })
    
    return NextResponse.json({
      stripeInitialized: true,
      hasProducts: products.data.length > 0,
      stripeKeyLength: stripeKey.length,
      keyPrefix: stripeKey.substring(0, 10),
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 })
  }
}