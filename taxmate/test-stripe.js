import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testStripe() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  
  console.log('Stripe key exists:', !!stripeKey);
  console.log('Key prefix:', stripeKey?.substring(0, 10));
  
  try {
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2025-04-30.basil',
    });
    
    // Test the connection
    const products = await stripe.products.list({ limit: 1 });
    console.log('Products found:', products.data.length);
    
    // Test the price IDs
    const priceId = process.env.NEXT_PUBLIC_STRIPE_SOLO_PRICE_ID;
    console.log('Price ID:', priceId);
    
    if (priceId) {
      const price = await stripe.prices.retrieve(priceId);
      console.log('Price found:', price.id, 'Amount:', price.unit_amount);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

testStripe();