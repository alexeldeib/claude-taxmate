import Stripe from 'stripe'
import { config } from './config'

// Initialize Stripe only if key is available
export const stripe = config.stripe.secretKey ? new Stripe(config.stripe.secretKey, {
  apiVersion: '2025-04-30.basil',
  typescript: true,
}) : null

export const STRIPE_PRICES = {
  solo: process.env.NEXT_PUBLIC_STRIPE_SOLO_PRICE_ID || 'price_solo',
  seasonal: process.env.NEXT_PUBLIC_STRIPE_SEASONAL_PRICE_ID || 'price_seasonal',
}