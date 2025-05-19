import Link from 'next/link'

export default function PrivacyPage() {
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

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg text-gray-700">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2>Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account,
            upload transaction data, or contact us for support.
          </p>

          <h2>How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services,
            process transactions, and communicate with you.
          </p>

          <h2>Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your personal information
            and financial data. All data is encrypted both in transit and at rest.
          </p>

          <h2>Data Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal information to third parties.
            We may share data with trusted service providers who assist us in operating our platform.
          </p>

          <h2>Your Rights</h2>
          <p>
            You have the right to access, update, or delete your personal information at any time.
            You can do this through your account settings or by contacting our support team.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at
            privacy@taxmate.app
          </p>
        </div>
      </div>
    </div>
  )
}