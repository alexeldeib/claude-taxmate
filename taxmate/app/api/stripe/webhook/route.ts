import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { config } from '@/lib/config'
import { supabaseAdmin } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      config.stripe.webhookSecret
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const metadata = session.metadata as { plan_type: string } | null
        
        // Update subscription in database
        await supabaseAdmin
          .from('subscriptions')
          .update({
            stripe_subscription_id: session.subscription as string,
            plan: metadata?.plan_type || 'solo',
            status: 'active',
            started_at: new Date().toISOString(),
            ends_at: metadata?.plan_type === 'seasonal' 
              ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
              : null,
          })
          .eq('stripe_customer_id', session.customer as string)
        
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