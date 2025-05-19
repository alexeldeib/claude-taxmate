'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { FileText, Download, RefreshCw, AlertCircle } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import Link from 'next/link'

type FormJob = Database['public']['Tables']['form_jobs']['Row']

interface FormsContentProps {
  user: User
  formJobs: FormJob[]
  hasActiveSubscription: boolean
  transactionCount: number
}

export default function FormsContent({ 
  user, 
  formJobs: initialJobs,
  hasActiveSubscription,
  transactionCount
}: FormsContentProps) {
  const [formJobs, setFormJobs] = useState(initialJobs)
  const [isGenerating, setIsGenerating] = useState(false)
  const [pollingJobs, setPollingJobs] = useState<Set<string>>(new Set())
  const supabase = createClient()

  // Poll for job updates
  useEffect(() => {
    const activeJobs = formJobs.filter(job => 
      job.status === 'queued' || job.status === 'processing'
    )

    if (activeJobs.length === 0) return

    const interval = setInterval(async () => {
      for (const job of activeJobs) {
        if (pollingJobs.has(job.id)) continue

        setPollingJobs(prev => new Set([...prev, job.id]))

        const { data: updatedJob } = await supabase
          .from('form_jobs')
          .select('*')
          .eq('id', job.id)
          .single()

        if (updatedJob && updatedJob.status !== job.status) {
          setFormJobs(prev => prev.map(j => 
            j.id === job.id ? updatedJob : j
          ))

          if (updatedJob.status === 'done') {
            toast.success('Form generated successfully!')
          } else if (updatedJob.status === 'error') {
            toast.error('Form generation failed')
          }
        }

        setPollingJobs(prev => {
          const next = new Set(prev)
          next.delete(job.id)
          return next
        })
      }
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(interval)
  }, [formJobs, pollingJobs, supabase])

  const handleGenerateForm = async (formType: 'schedule_c' | '1099') => {
    if (!hasActiveSubscription) {
      toast.error('Please upgrade to generate forms')
      return
    }

    if (transactionCount === 0) {
      toast.error('Please upload transactions first')
      return
    }

    setIsGenerating(true)

    try {
      // Create form job in database
      const { data: newJob, error: insertError } = await supabase
        .from('form_jobs')
        .insert({
          user_id: user.id,
          type: formType,
          status: 'queued'
        })
        .select()
        .single()

      if (insertError) throw insertError

      setFormJobs([newJob, ...formJobs])
      toast.success('Form generation started')

      // Trigger form generation via API
      const response = await fetch('/api/forms/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          jobId: newJob.id,
          formType 
        })
      })

      if (!response.ok) {
        throw new Error('Failed to start form generation')
      }
    } catch (error) {
      console.error('Form generation error:', error)
      toast.error('Failed to generate form')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRetry = async (job: FormJob) => {
    try {
      // Update job status to queued
      const { error: updateError } = await supabase
        .from('form_jobs')
        .update({ status: 'queued', error_message: null })
        .eq('id', job.id)

      if (updateError) throw updateError

      setFormJobs(prev => prev.map(j => 
        j.id === job.id ? { ...j, status: 'queued' as const, error_message: null } : j
      ))

      // Trigger retry
      const response = await fetch('/api/forms/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          jobId: job.id,
          formType: job.type 
        })
      })

      if (!response.ok) {
        throw new Error('Failed to retry form generation')
      }

      toast.success('Retrying form generation')
    } catch (error) {
      console.error('Retry error:', error)
      toast.error('Failed to retry')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Tax Forms</h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Subscription Warning */}
        {!hasActiveSubscription && (
          <div className="mb-6 rounded-lg bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Subscription Required</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Upgrade to a paid plan to generate tax forms.</p>
                  <Link href="/pricing" className="font-medium underline">
                    View pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generate Form Buttons */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormTypeCard
            title="Schedule C"
            description="Profit or Loss from Business (Sole Proprietorship)"
            icon={<FileText className="h-8 w-8 text-indigo-600" />}
            onGenerate={() => handleGenerateForm('schedule_c')}
            disabled={!hasActiveSubscription || isGenerating || transactionCount === 0}
          />
          <FormTypeCard
            title="1099 Forms"
            description="Miscellaneous Income reporting for contractors"
            icon={<FileText className="h-8 w-8 text-indigo-600" />}
            onGenerate={() => handleGenerateForm('1099')}
            disabled={!hasActiveSubscription || isGenerating || transactionCount === 0}
          />
        </div>

        {/* Form Jobs List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Generated Forms
            </h3>
            
            {formJobs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No forms generated yet. Generate your first form above.
              </p>
            ) : (
              <div className="space-y-4">
                {formJobs.map((job) => (
                  <div
                    key={job.id}
                    className="border rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">
                            {job.type === 'schedule_c' ? 'Schedule C' : '1099 Forms'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Created {format(new Date(job.created_at), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                      {job.error_message && (
                        <p className="mt-2 text-sm text-red-600">{job.error_message}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <StatusBadge status={job.status} />
                      
                      {job.status === 'done' && job.result_url && (
                        <a
                          href={job.result_url}
                          className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </a>
                      )}
                      
                      {job.status === 'error' && (
                        <button
                          onClick={() => handleRetry(job)}
                          className="inline-flex items-center gap-1 rounded-md bg-gray-600 px-3 py-1 text-sm font-medium text-white hover:bg-gray-700"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Retry
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              How Form Generation Works
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Upload your business transactions in the Transactions section</li>
              <li>Ensure transactions are properly categorized</li>
              <li>Click on the form type you want to generate</li>
              <li>Wait for the form to be processed (usually 2-5 minutes)</li>
              <li>Download your completed PDF form</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  )
}

function FormTypeCard({ 
  title, 
  description, 
  icon, 
  onGenerate, 
  disabled 
}: { 
  title: string
  description: string
  icon: React.ReactNode
  onGenerate: () => void
  disabled: boolean
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">{icon}</div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
          <button
            onClick={onGenerate}
            disabled={disabled}
            className="mt-4 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Form
          </button>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    queued: { bg: 'bg-gray-100', text: 'text-gray-800', icon: RefreshCw },
    processing: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: RefreshCw },
    done: { bg: 'bg-green-100', text: 'text-green-800', icon: FileText },
    error: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle },
  }

  const { bg, text, icon: Icon } = config[status as keyof typeof config]

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${bg} ${text}`}>
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}