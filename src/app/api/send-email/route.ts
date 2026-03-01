import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getSupabase() {
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, supabaseKey)
}

export async function POST(request: Request) {
  try {
    const resendKey = process.env.RESEND_API_KEY

    if (!resendKey) {
      return NextResponse.json({ error: 'Resend API key not configured. Add RESEND_API_KEY to environment variables.' }, { status: 500 })
    }

    const body = await request.json()
    const { to, subject, body: emailBody, requestId } = body

    if (!to || !subject || !emailBody) {
      return NextResponse.json({ error: 'Missing required fields: to, subject, body' }, { status: 400 })
    }

    const resend = new Resend(resendKey)

    // Send the email
    const { error } = await resend.emails.send({
      from: 'Hometown Coffee <onboarding@resend.dev>',
      to: [to],
      subject,
      text: emailBody,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 })
    }

    // Update the donation request with email_sent_at timestamp
    if (requestId) {
      const supabase = getSupabase()
      await supabase
        .from('donation_requests')
        .update({
          email_sent_at: new Date().toISOString(),
          email_subject: subject,
        })
        .eq('id', requestId)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Send email error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Failed to send email'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
