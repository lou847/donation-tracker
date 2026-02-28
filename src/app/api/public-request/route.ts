import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      orgName,
      contactName,
      contactEmail,
      contactPhone,
      category,
      eventName,
      eventDate,
      amountRequested,
      donationType,
      description,
    } = body

    // Validate required fields
    if (!orgName || !contactName || !contactEmail || !description) {
      return NextResponse.json(
        { error: 'Please fill in all required fields.' },
        { status: 400 }
      )
    }

    // Use service role key to bypass RLS (server-side only, never exposed to browser)
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey
    )

    // Check if requester already exists by email
    const { data: existingRequester } = await supabase
      .from('requesters')
      .select('id')
      .eq('contact_email', contactEmail)
      .single()

    let requesterId: string

    if (existingRequester) {
      requesterId = existingRequester.id
      // Update contact info
      await supabase
        .from('requesters')
        .update({
          org_name: orgName,
          contact_name: contactName,
          contact_phone: contactPhone || null,
          category: category || 'other',
        })
        .eq('id', requesterId)
    } else {
      // Create new requester
      const { data: newRequester, error: reqError } = await supabase
        .from('requesters')
        .insert({
          org_name: orgName,
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: contactPhone || null,
          category: category || 'other',
        })
        .select('id')
        .single()

      if (reqError || !newRequester) {
        console.error('Failed to create requester:', reqError)
        return NextResponse.json(
          { error: `Failed to create request: ${reqError?.message || 'Unknown error'}` },
          { status: 500 }
        )
      }
      requesterId = newRequester.id
    }

    // Create donation request
    const { error: donationError } = await supabase
      .from('donation_requests')
      .insert({
        requester_id: requesterId,
        description,
        event_name: eventName || null,
        event_date: eventDate || null,
        amount_requested: amountRequested ? parseFloat(amountRequested) : null,
        donation_type: donationType || 'gift_card',
        status: 'new',
        request_date: new Date().toISOString().split('T')[0],
      })

    if (donationError) {
      console.error('Failed to create donation request:', donationError)
      return NextResponse.json(
        { error: `Failed to submit request: ${donationError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Public request error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
