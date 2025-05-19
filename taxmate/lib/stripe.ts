import Stripe from 'stripe'
import { config } from './config'

// Validate Stripe key is present
if (!config.stripe.secretKey) {
  throw new Error('Stripe secret key is not configured')
}

export const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2025-04-30.basil',
  typescript: true,
})

export const STRIPE_PRICES = {
  solo: process.env.NEXT_PUBLIC_STRIPE_SOLO_PRICE_ID || 'price_solo',
  seasonal: process.env.NEXT_PUBLIC_STRIPE_SEASONAL_PRICE_ID || 'price_seasonal',
}