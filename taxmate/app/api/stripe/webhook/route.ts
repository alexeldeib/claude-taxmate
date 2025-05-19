import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { config } from '@/lib/config'
import { supabaseAdmin } from '@/lib/supabase/service'

// Disable body parsing, we need the raw body
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  // Get the raw body as a buffer to ensure it's the exact same as what Stripe sent
  const buffer = await request.arrayBuffer()
  const body = Buffer.from(buffer).toString('utf-8')
  
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    console.error('Webhook error: Missing stripe-signature header')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  if (!config.stripe.webhookSecret) {
    console.error('Webhook error: Missing webhook secret configuration')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      config.stripe.webhookSecret
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', {
      error: err instanceof Error ? err.message : err,
      signatureHeader: signature,
      webhookSecretLength: config.stripe.webhookSecret?.length,
      bodyLength: body.length,
    })
    return NextResponse.json({ 
      error: 'Invalid signature',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const metadata = session.metadata as { 
          user_id: string
          plan_type: string 
        } | null
        
        if (!metadata?.user_id) {
          console.error('Missing user_id in session metadata')
          break
        }
        
        // Update subscription in database
        const result = await supabaseAdmin
          .from('subscriptions')
          .update({
            stripe_subscription_id: session.subscription as string,
            plan: metadata.plan_type || 'solo',
            status: 'active',
            started_at: new Date().toISOString(),
            ends_at: metadata.plan_type === 'seasonal' 
              ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
              : null,
          })
          .eq('user_id', metadata.user_id)
          
        console.log('Subscription updated:', { user_id: metadata.user_id, result })
        break
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object
        
        // This event happens after checkout.session.completed
        // We use it to ensure the subscription is properly recorded
        console.log('Subscription created:', subscription.id)
        
        // Update the subscription status
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: subscription.status,
            stripe_subscription_id: subscription.id,
            ends_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
          })
          .eq('stripe_customer_id', subscription.customer as string)
        
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: subscription.status,
            ends_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
          })
          .eq('stripe_subscription_id', subscription.id)
        
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'cancelled',
            ends_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)
        
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
        // Log the event data for debugging new event types
        console.log('Event data:', JSON.stringify(event.data.object, null, 2))
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}