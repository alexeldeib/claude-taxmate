import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { config } from '@/lib/config'

// Initialize OpenAI only if API key is available
const openai = config.external.openaiApiKey ? new OpenAI({
  apiKey: config.external.openaiApiKey,
}) : null

const CATEGORIES = [
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

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI is configured
    if (!openai) {
      return NextResponse.json({ error: 'OpenAI not configured' }, { status: 503 })
    }

    const { transactions } = await request.json()

    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user owns these transactions
    const transactionIds = transactions.map((t: { id: string }) => t.id)
    const { data: verifiedTransactions } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', user.id)
      .in('id', transactionIds)

    if (verifiedTransactions?.length !== transactions.length) {
      return NextResponse.json({ error: 'Invalid transactions' }, { status: 403 })
    }

    // Prepare prompt for OpenAI
    const transactionText = transactions.map((t: { merchant: string; amount: number; notes?: string }) => 
      `Merchant: ${t.merchant}, Amount: $${t.amount}, Notes: ${t.notes || 'none'}`
    ).join('\n')

    const prompt = `Categorize these business transactions into the following categories: ${CATEGORIES.join(', ')}.

Transactions:
${transactionText}

Return a JSON array with objects containing 'id' and 'category' for each transaction. Use the same IDs from the input.`

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const response = completion.choices[0].message.content
    if (!response) throw new Error('No response from OpenAI')

    const parsedResponse = JSON.parse(response)
    const categorized = Array.isArray(parsedResponse) ? parsedResponse : parsedResponse.transactions

    // Validate categories
    const validCategorized = categorized.map((item: { id: string; category: string }) => {
      return {
        id: item.id,
        category: CATEGORIES.includes(item.category) ? item.category : 'misc',
      }
    })

    return NextResponse.json({ categorized: validCategorized })
  } catch (error) {
    console.error('Categorization error:', error)
    return NextResponse.json(
      { error: 'Failed to categorize transactions' },
      { status: 500 }
    )
  }
}