import Link from 'next/link'
import { Mail, MessageCircle, FileText } from 'lucide-react'

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
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
              <Link href="/pricing" className="text-gray-700 hover:text-indigo-600">
                Pricing
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-indigo-600">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">How can we help?</h1>
          <p className="mt-4 text-xl text-gray-600">
            Get the support you need to make the most of TaxMate
          </p>
        </div>

        {/* Support Options */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mb-16">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
              <FileText className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Documentation</h3>
            <p className="mt-2 text-gray-600">
              Browse our comprehensive guides and tutorials to learn how to use TaxMate effectively.
            </p>
            <a href="#" className="mt-4 inline-block text-indigo-600 hover:text-indigo-700">
              View docs →
            </a>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
              <MessageCircle className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Community</h3>
            <p className="mt-2 text-gray-600">
              Join our community forum to connect with other users and share tips.
            </p>
            <a href="#" className="mt-4 inline-block text-indigo-600 hover:text-indigo-700">
              Join community →
            </a>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
              <Mail className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Email Support</h3>
            <p className="mt-2 text-gray-600">
              Contact our support team directly for personalized assistance.
            </p>
            <a href="mailto:support@taxmate.app" className="mt-4 inline-block text-indigo-600 hover:text-indigo-700">
              Email us →
            </a>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How do I upload my transactions?
              </h3>
              <p className="text-gray-600">
                You can upload transactions via CSV file or connect your bank account through Plaid.
                Go to your dashboard and click &quot;Upload Transactions&quot; to get started.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What file formats are supported?
              </h3>
              <p className="text-gray-600">
                We support CSV files with standard transaction formats. The file should include
                columns for date, amount, and merchant at minimum.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How long does form generation take?
              </h3>
              <p className="text-gray-600">
                Most forms are generated within 2-5 minutes. Complex returns with many transactions
                may take up to 10 minutes. You&apos;ll receive an email when your form is ready.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is my data secure?
              </h3>
              <p className="text-gray-600">
                Yes, we use bank-level encryption for all data transmission and storage.
                Your financial information is protected and never shared with third parties.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still need help?</h2>
          <p className="text-gray-600 mb-8">
            Our support team is here to assist you
          </p>
          <a
            href="mailto:support@taxmate.app"
            className="inline-block rounded-md bg-indigo-600 px-6 py-3 text-white font-medium hover:bg-indigo-700"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}