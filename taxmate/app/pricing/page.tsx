'use client'

import Link from 'next/link'
import { CheckIcon } from 'lucide-react'
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { config } from '@/lib/config'

const stripePromise = loadStripe(config.stripe.publishableKey)

const plans = [
  {
    name: 'Free Trial',
    id: 'free_trial',
    price: '$0',
    duration: '7 days',
    description: 'Perfect for trying out TaxMate',
    features: [
      'Upload up to 50 transactions',
      'Basic expense categorization',
      'Generate 1 form',
      'Email support',
    ],
    cta: 'Start free trial',
    featured: false,
    stripePrice: null,
  },
  {
    name: 'Solo',
    id: 'solo',
    price: '$20',
    duration: 'per month',
    description: 'Great for freelancers and solopreneurs',
    features: [
      'Unlimited transactions',
      'AI-powered categorization',
      'All IRS forms',
      'Priority support',
      'Export to PDF/CSV',
      'Audit trail documentation',
    ],
    cta: 'Get started',
    featured: true,
    stripePrice: process.env.NEXT_PUBLIC_STRIPE_SOLO_PRICE_ID,
  },
  {
    name: 'Seasonal',
    id: 'seasonal',
    price: '$149',
    duration: 'per year',
    description: 'Best value for year-round tax management',
    features: [
      'Everything in Solo',
      'Advanced analytics',
      'Multi-year comparisons',
      'White-glove onboarding',
      'Quarterly tax estimates',
      'Custom categories',
    ],
    cta: 'Save 38%',
    featured: false,
    stripePrice: process.env.NEXT_PUBLIC_STRIPE_SEASONAL_PRICE_ID,
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleCheckout = async (plan: typeof plans[0]) => {
    if (plan.id === 'free_trial') {
      router.push('/signup')
      return
    }

    if (!plan.stripePrice) {
      toast.error('This plan is not available yet')
      return
    }

    setLoading(plan.id)

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePrice,
          planType: plan.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()
      
      const stripe = await stripePromise
      if (!stripe) throw new Error('Failed to load Stripe')

      const { error } = await stripe.redirectToCheckout({ sessionId })
      
      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to start checkout')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                TaxMate
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-indigo-600">
                Home
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-indigo-600">
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
              Simple, transparent pricing
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base text-gray-500 sm:mt-5 sm:text-lg md:mt-5 md:text-xl">
              Choose the perfect plan for your business. Start with a free trial, upgrade anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl bg-white shadow-lg ring-1 ring-gray-200 ${
                plan.featured ? 'ring-2 ring-indigo-600' : ''
              }`}
            >
              {plan.featured && (
                <div className="rounded-t-2xl bg-indigo-600 px-6 py-3 text-center text-sm font-semibold text-white">
                  Most Popular
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900">{plan.name}</h3>
                <p className="mt-4 text-sm text-gray-500">{plan.description}</p>
                <p className="mt-6">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-base font-medium text-gray-500">/{plan.duration}</span>
                </p>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex">
                      <CheckIcon className="h-5 w-5 flex-shrink-0 text-indigo-600" />
                      <span className="ml-3 text-base text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(plan)}
                  disabled={loading === plan.id}
                  className={`mt-8 block w-full rounded-lg px-4 py-3 text-center text-base font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.featured
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {loading === plan.id ? 'Loading...' : plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Frequently asked questions</h2>
          </div>
          <dl className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-base font-semibold text-gray-900">
                Can I cancel my subscription anytime?
              </dt>
              <dd className="mt-2 text-base text-gray-500">
                Yes, you can cancel your subscription at any time. You&apos;ll continue to have access until the end of your billing period.
              </dd>
            </div>
            <div>
              <dt className="text-base font-semibold text-gray-900">
                Is my data secure?
              </dt>
              <dd className="mt-2 text-base text-gray-500">
                We use bank-level encryption to protect your data. Your information is never shared with third parties.
              </dd>
            </div>
            <div>
              <dt className="text-base font-semibold text-gray-900">
                What forms can I generate?
              </dt>
              <dd className="mt-2 text-base text-gray-500">
                TaxMate can generate Schedule C (Form 1040) and 1099 forms, with more forms coming soon.
              </dd>
            </div>
            <div>
              <dt className="text-base font-semibold text-gray-900">
                Do you offer refunds?
              </dt>
              <dd className="mt-2 text-base text-gray-500">
                We offer a 30-day money-back guarantee. If you&apos;re not satisfied, we&apos;ll refund your payment.
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">
              Ready to simplify your taxes?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-indigo-100">
              Start your free trial today. No credit card required.
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-block rounded-lg bg-white px-6 py-3 text-base font-semibold text-indigo-600 shadow-md hover:bg-indigo-50"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}