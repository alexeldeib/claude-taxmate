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
    .single()
    
  // Log subscription data for debugging
  console.log('User subscription:', {
    userId: user.id,
    subscription,
    status: subscription?.status,
    plan: subscription?.plan,
  })
  
  const hasActiveSubscription = subscription && 
    subscription.status === 'active' &&
    (subscription.plan === 'solo' || subscription.plan === 'seasonal')

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
      hasActiveSubscription={hasActiveSubscription}
      transactionCount={transactions?.length || 0}
    />
  )
}