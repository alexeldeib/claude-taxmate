import Stripe from 'stripe'
import { config } from './config'

export const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2025-04-30.basil',
  typescript: true,
})

export const STRIPE_PRICES = {
  solo: process.env.STRIPE_SOLO_PRICE_ID || 'price_solo',
  seasonal: process.env.STRIPE_SEASONAL_PRICE_ID || 'price_seasonal',
}