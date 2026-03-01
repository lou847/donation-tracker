import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getSupabase() {
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, supabaseKey)
}

export async function POST(request: Request) {
  try {
    const gmailUser = process.env.GMAIL_USER
    const gmailPass = process.env.GMAIL_APP_PASSWORD

    if (!gmailUser || !gmailPass) {
      return NextResponse.json({ error: 'Gmail credentials not configured. Add GMAIL_USER and GMAIL_APP_PASSWORD to environment variables.' }, { status: 500 })
    }

    const body = await request.json()
    const { to, subject, body: emailBody, requestId } = body

    if (!to || !subject || !emailBody) {
      return NextResponse.json({ error: 'Missing required fields: to, subject, body' }, { status: 400 })
    }

    // Create Gmail SMTP transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    })

    // Send the email
    await transporter.sendMail({
      from: `"Hometown Coffee" <${gmailUser}>`,
      to,
      subject,
      text: emailBody,
    })

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
