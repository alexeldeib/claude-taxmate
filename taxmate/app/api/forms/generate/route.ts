import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { config } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    const { jobId, formType } = await request.json()

    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify job belongs to user
    const { data: job } = await supabase
      .from('form_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single()

    if (!job) {
      return NextResponse.json({ error: 'Invalid job' }, { status: 403 })
    }

    // Verify user has active subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!subscription) {
      return NextResponse.json({ error: 'Active subscription required' }, { status: 403 })
    }

    // Update job status to processing
    await supabase
      .from('form_jobs')
      .update({ status: 'processing' })
      .eq('id', jobId)

    // Send request to Fly.io worker
    const workerResponse = await fetch(`${config.external.flyWorkerUrl}/generate-form`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.supabase.serviceRoleKey}`,
      },
      body: JSON.stringify({
        jobId,
        userId: user.id,
        formType,
      }),
    })

    if (!workerResponse.ok) {
      throw new Error('Worker request failed')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Form generation error:', error)
    
    // Update job status to error
    const { jobId } = await request.json()
    const supabase = await createClient()
    await supabase
      .from('form_jobs')
      .update({ 
        status: 'error',
        error_message: 'Failed to start form generation'
      })
      .eq('id', jobId)

    return NextResponse.json(
      { error: 'Failed to generate form' },
      { status: 500 }
    )
  }
}