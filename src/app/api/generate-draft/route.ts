import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { orgName, contactName, status, amountRequested, amountApproved, eventName, eventDate, donationType, description } = body

    if (!orgName || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const anthropic = new Anthropic({ apiKey })

    const statusContext = status === 'approved'
      ? `The donation request has been APPROVED.${amountApproved ? ` Hometown Coffee is donating $${amountApproved}.` : ''}`
      : status === 'denied'
      ? 'The donation request has been DENIED.'
      : status === 'fulfilled'
      ? `The donation request has been FULFILLED.${amountApproved ? ` Hometown Coffee donated $${amountApproved}.` : ''}`
      : `The donation request status is: ${status}.`

    const prompt = `You are writing an email on behalf of Hometown Coffee, a local coffee shop that supports their community through donations and sponsorships.

Write a warm, professional email to ${contactName || 'the requester'} at ${orgName} regarding their donation request.

Details:
- ${statusContext}
- They requested: ${amountRequested ? `$${amountRequested}` : 'an unspecified amount'}
- Donation type: ${donationType || 'monetary'}
${eventName ? `- Event: ${eventName}` : ''}
${eventDate ? `- Event date: ${eventDate}` : ''}
${description ? `- Their request: ${description}` : ''}

Guidelines:
- Keep it friendly and warm — Hometown Coffee is a community-focused business
- Be concise (3-5 short paragraphs max)
- If approved/fulfilled: express excitement to support their cause
- If denied: be kind, explain that they receive many requests and can't fulfill all of them, and encourage them to apply again in the future
- Sign off as "The Hometown Coffee Team"
- Do NOT include a subject line — just the email body
- Do NOT include [brackets] or placeholder text`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const draft = message.content[0].type === 'text' ? message.content[0].text : ''

    // Generate a subject line
    const subjectPrefix = status === 'approved' || status === 'fulfilled'
      ? 'Great News from Hometown Coffee'
      : status === 'denied'
      ? 'Update on Your Donation Request - Hometown Coffee'
      : 'Regarding Your Donation Request - Hometown Coffee'

    const subject = eventName
      ? `${subjectPrefix} - ${eventName}`
      : subjectPrefix

    return NextResponse.json({ draft, subject })
  } catch (err) {
    console.error('Generate draft error:', err)
    return NextResponse.json({ error: 'Failed to generate draft' }, { status: 500 })
  }
}
