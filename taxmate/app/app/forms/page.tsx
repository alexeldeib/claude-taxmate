import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FormsContent from './forms-content'

export default async function FormsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Check if user has active subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  const { data: formJobs } = await supabase
    .from('form_jobs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)

  return (
    <FormsContent 
      user={user}
      formJobs={formJobs || []}
      hasActiveSubscription={!!subscription}
      transactionCount={transactions?.length || 0}
    />
  )
}