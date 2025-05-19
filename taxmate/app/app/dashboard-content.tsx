'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { FileText, Upload, DollarSign, Calendar } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type Transaction = Database['public']['Tables']['transactions']['Row']
type FormJob = Database['public']['Tables']['form_jobs']['Row']
type Subscription = Database['public']['Tables']['subscriptions']['Row']

interface DashboardContentProps {
  user: User
  subscription: Subscription | null
  transactions: Transaction[]
  formJobs: FormJob[]
}

export default function DashboardContent({ 
  user, 
  subscription,
  transactions,
  formJobs 
}: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const stats = {
    totalExpenses: transactions.reduce((sum, t) => sum + Number(t.amount), 0),
    transactionCount: transactions.length,
    pendingForms: formJobs.filter(j => j.status === 'queued' || j.status === 'processing').length,
    completedForms: formJobs.filter(j => j.status === 'done').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="text-sm text-gray-500">
              {user.email} | {subscription?.plan || 'No subscription'}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<DollarSign className="h-6 w-6" />}
            label="Total Expenses"
            value={`$${stats.totalExpenses.toFixed(2)}`}
          />
          <StatCard
            icon={<FileText className="h-6 w-6" />}
            label="Transactions"
            value={stats.transactionCount.toString()}
          />
          <StatCard
            icon={<Calendar className="h-6 w-6" />}
            label="Pending Forms"
            value={stats.pendingForms.toString()}
          />
          <StatCard
            icon={<FileText className="h-6 w-6" />}
            label="Completed Forms"
            value={stats.completedForms.toString()}
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'transactions', 'forms'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Recent Transactions</h3>
                {transactions.length === 0 ? (
                  <p className="text-gray-500">No transactions yet</p>
                ) : (
                  <ul className="space-y-2">
                    {transactions.slice(0, 5).map((t) => (
                      <li key={t.id} className="flex justify-between">
                        <div>
                          <p className="font-medium">{t.merchant}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(t.date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <p className="font-medium">${t.amount}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                    <Upload className="h-4 w-4" />
                    Upload Transactions
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                    <FileText className="h-4 w-4" />
                    Generate Form
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">All Transactions</h3>
                {transactions.length === 0 ? (
                  <p className="text-gray-500">No transactions yet. Upload your expenses to get started.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {transactions.map((t) => (
                          <tr key={t.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {format(new Date(t.date), 'MMM d, yyyy')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{t.merchant}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {t.category || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              ${t.amount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'forms' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">Form Generation Jobs</h3>
                {formJobs.length === 0 ? (
                  <p className="text-gray-500">No form generation jobs yet.</p>
                ) : (
                  <div className="space-y-4">
                    {formJobs.map((job) => (
                      <div key={job.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {job.type === 'schedule_c' ? 'Schedule C' : '1099 Forms'}
                            </p>
                            <p className="text-sm text-gray-500">
                              Created {format(new Date(job.created_at), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                          <StatusBadge status={job.status} />
                        </div>
                        {job.result_url && (
                          <a
                            href={job.result_url}
                            className="mt-2 inline-block text-indigo-600 hover:text-indigo-500 text-sm"
                          >
                            Download PDF
                          </a>
                        )}
                        {job.error_message && (
                          <p className="mt-2 text-sm text-red-600">{job.error_message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="p-3 bg-indigo-50 rounded-lg">
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{label}</dt>
              <dd className="text-lg font-semibold text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    queued: 'bg-gray-100 text-gray-800',
    processing: 'bg-yellow-100 text-yellow-800',
    done: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
  }

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors]}`}>
      {status}
    </span>
  )
}