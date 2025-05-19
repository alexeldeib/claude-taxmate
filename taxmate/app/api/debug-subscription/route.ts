import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get all subscriptions for this user
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    const currentSubscription = subscriptions?.[0];
    
    return NextResponse.json({
      userId: user.id,
      email: user.email,
      subscriptions: subscriptions || [],
      currentSubscription,
      hasActiveSubscription: subscriptions?.some(s => 
        s.status === 'active' && 
        (s.plan === 'solo' || s.plan === 'seasonal')
      ),
      activeCount: subscriptions?.filter(s => s.status === 'active').length,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}