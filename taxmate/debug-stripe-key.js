const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.join(__dirname, '.env.local') });

const stripeKey = process.env.STRIPE_SECRET_KEY;

console.log('Stripe Secret Key details:');
console.log('- Length:', stripeKey?.length);
console.log('- First 10 chars:', stripeKey?.substring(0, 10));
console.log('- Last 10 chars:', stripeKey?.substring(stripeKey.length - 10));
console.log('- Has newline at end:', stripeKey?.endsWith('\n'));
console.log('- Has carriage return:', stripeKey?.includes('\r'));
console.log('- Has space at start:', stripeKey?.startsWith(' '));
console.log('- Has space at end:', stripeKey?.endsWith(' '));

// Show all characters with their codes
if (stripeKey) {
  console.log('\nCharacter codes:');
  for (let i = 0; i < stripeKey.length; i++) {
    const char = stripeKey[i];
    const code = char.charCodeAt(0);
    if (code < 32 || code > 126) {
      console.log(`Position ${i}: '${char}' (code: ${code}) - SPECIAL CHARACTER`);
    }
  }
}

// Try to use the key with Stripe
const Stripe = require('stripe');
try {
  const stripe = new Stripe(stripeKey);
  console.log('\nStripe initialization: SUCCESS');
} catch (error) {
  console.log('\nStripe initialization: FAILED');
  console.log('Error:', error.message);
}