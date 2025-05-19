'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Upload, Download, Search, Brain } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

type Transaction = Database['public']['Tables']['transactions']['Row']

interface TransactionsContentProps {
  user: User
  transactions: Transaction[]
}

export default function TransactionsContent({ 
  user, 
  transactions: initialTransactions 
}: TransactionsContentProps) {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient()

  const categories = [
    'meals',
    'travel',
    'software',
    'home_office',
    'equipment',
    'supplies',
    'professional_services',
    'advertising',
    'misc'
  ]

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || t.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const text = await file.text()
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      
      const dateIndex = headers.findIndex(h => h.includes('date'))
      const amountIndex = headers.findIndex(h => h.includes('amount'))
      const merchantIndex = headers.findIndex(h => h.includes('merchant') || h.includes('description'))
      
      if (dateIndex === -1 || amountIndex === -1 || merchantIndex === -1) {
        throw new Error('Invalid CSV format. Must include date, amount, and merchant columns.')
      }

      const newTransactions = []
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i]
        if (!line.trim()) continue
        
        const values = line.split(',').map(v => v.trim())
        const date = new Date(values[dateIndex])
        const amount = parseFloat(values[amountIndex].replace(/[^0-9.-]/g, ''))
        const merchant = values[merchantIndex]
        
        if (isNaN(date.getTime()) || isNaN(amount) || !merchant) continue
        
        newTransactions.push({
          user_id: user.id,
          date: date.toISOString().split('T')[0],
          amount: Math.abs(amount),
          merchant,
          category: null,
          notes: null,
        })
      }

      if (newTransactions.length === 0) {
        throw new Error('No valid transactions found in CSV')
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert(newTransactions)
        .select()

      if (error) throw error

      setTransactions([...data, ...transactions])
      toast.success(`Imported ${data.length} transactions`)
      
      // Reset file input
      e.target.value = ''
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload transactions')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCategoryUpdate = async (transactionId: string, category: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ category })
        .eq('id', transactionId)

      if (error) throw error

      setTransactions(transactions.map(t => 
        t.id === transactionId ? { ...t, category } : t
      ))
      toast.success('Category updated')
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update category')
    }
  }

  const handleExport = () => {
    const csv = [
      ['Date', 'Merchant', 'Amount', 'Category', 'Notes'],
      ...transactions.map(t => [
        format(new Date(t.date), 'yyyy-MM-dd'),
        t.merchant,
        t.amount.toString(),
        t.category || '',
        t.notes || ''
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleAutoCategorize = async () => {
    const uncategorized = transactions.filter(t => !t.category)
    
    if (uncategorized.length === 0) {
      toast.error('No uncategorized transactions')
      return
    }

    try {
      toast.loading('Categorizing transactions...')
      
      const response = await fetch('/api/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: uncategorized })
      })

      if (!response.ok) throw new Error('Failed to categorize')

      const { categorized } = await response.json()
      
      // Update transactions in database
      const updates = categorized.map((cat: { id: string; category: string }) => ({
        id: cat.id,
        category: cat.category,
        categorization_source: 'ai'
      }))

      const { error } = await supabase
        .from('transactions')
        .upsert(updates)

      if (error) throw error

      // Update local state
      setTransactions(transactions.map(t => {
        const updated = categorized.find((c: { id: string; category: string }) => c.id === t.id)
        return updated ? { ...t, category: updated.category, categorization_source: 'ai' } : t
      }))

      toast.success(`Categorized ${categorized.length} transactions`)
    } catch (error) {
      console.error('Categorization error:', error)
      toast.error('Failed to categorize transactions')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Actions Bar */}
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4">
            <label className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
              <Upload className="h-4 w-4" />
              Upload CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
            
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>

            <button
              onClick={handleAutoCategorize}
              className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
            >
              <Brain className="h-4 w-4" />
              Auto-Categorize
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.replace('_', ' ').charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {transactions.length === 0 
                ? 'No transactions yet. Upload a CSV to get started.'
                : 'No transactions match your filters.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Merchant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(transaction.date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.merchant}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${transaction.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select
                          value={transaction.category || ''}
                          onChange={(e) => handleCategoryUpdate(transaction.id, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select category</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>
                              {cat.replace('_', ' ').charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                        {transaction.categorization_source === 'ai' && (
                          <span className="ml-2 text-xs text-purple-600">AI</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {transaction.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Total Transactions"
            value={transactions.length.toString()}
          />
          <SummaryCard
            title="Total Expenses"
            value={`$${transactions.reduce((sum, t) => sum + Number(t.amount), 0).toFixed(2)}`}
          />
          <SummaryCard
            title="Categorized"
            value={`${transactions.filter(t => t.category).length} / ${transactions.length}`}
          />
          <SummaryCard
            title="Average Transaction"
            value={`$${(transactions.reduce((sum, t) => sum + Number(t.amount), 0) / (transactions.length || 1)).toFixed(2)}`}
          />
        </div>
      </main>
    </div>
  )
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
        <dd className="mt-1 text-2xl font-semibold text-gray-900">{value}</dd>
      </div>
    </div>
  )
}