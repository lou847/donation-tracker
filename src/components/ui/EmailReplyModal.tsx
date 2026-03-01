'use client'

import { useState } from 'react'
import type { DonationRequestWithRequester } from '@/lib/types/database'

interface EmailReplyModalProps {
  request: DonationRequestWithRequester
  onClose: () => void
  onSent: () => void
}

export default function EmailReplyModal({ request, onClose, onSent }: EmailReplyModalProps) {
  const recipientEmail = request.requester?.contact_email || ''
  const recipientName = request.requester?.contact_name || request.requester?.org_name || ''

  const [subject, setSubject] = useState(
    request.status === 'approved' || request.status === 'fulfilled'
      ? `Great News from Hometown Coffee${request.event_name ? ` - ${request.event_name}` : ''}`
      : request.status === 'denied'
      ? `Update on Your Donation Request - Hometown Coffee`
      : `Regarding Your Donation Request - Hometown Coffee`
  )
  const [body, setBody] = useState('')
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleGenerateDraft = async () => {
    setGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgName: request.requester?.org_name,
          contactName: request.requester?.contact_name,
          status: request.status,
          amountRequested: request.amount_requested,
          amountApproved: request.amount_approved,
          eventName: request.event_name,
          eventDate: request.event_date,
          donationType: request.donation_type,
          description: request.description,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate draft')
      }
      setBody(data.draft)
      if (data.subject) setSubject(data.subject)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate draft')
    } finally {
      setGenerating(false)
    }
  }

  const handleSend = async () => {
    if (!recipientEmail) {
      setError('No email address on file for this requester. Please add one first.')
      return
    }
    if (!body.trim()) {
      setError('Please write or generate an email body before sending.')
      return
    }

    setSending(true)
    setError(null)

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmail,
          subject,
          body: body,
          requestId: request.id,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to send email')
      }
      setSuccess(true)
      setTimeout(() => {
        onSent()
        onClose()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email')
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(12, 35, 64, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '640px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(12, 35, 64, 0.3)',
        border: '1px solid #000000',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '2px solid #5a8fc4',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0C2340', margin: 0 }}>
              Reply to Requester
            </h2>
            <p style={{ fontSize: '13px', color: '#5a8fc4', margin: '4px 0 0 0' }}>
              Send an email to {recipientName}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: '#0C2340',
              cursor: 'pointer',
              padding: '4px 8px',
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {/* Previously sent notice */}
          {request.email_sent_at && (
            <div style={{
              background: '#ddd8cc',
              padding: '10px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#0C2340',
            }}>
              Previously emailed on {new Date(request.email_sent_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              {request.email_subject && <span> &mdash; &ldquo;{request.email_subject}&rdquo;</span>}
            </div>
          )}

          {/* Recipient */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#5a8fc4', marginBottom: '4px' }}>
              To
            </label>
            <div style={{
              padding: '10px 14px',
              background: '#f8f8f6',
              border: '1px solid #000000',
              borderRadius: '8px',
              fontSize: '14px',
              color: recipientEmail ? '#0C2340' : '#dc2626',
            }}>
              {recipientEmail || 'No email address on file'}
            </div>
          </div>

          {/* Subject */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#5a8fc4', marginBottom: '4px' }}>
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #000000',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                background: 'white',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Email Body */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '14px', fontWeight: 500, color: '#5a8fc4' }}>
                Message
              </label>
              <button
                onClick={handleGenerateDraft}
                disabled={generating}
                style={{
                  padding: '6px 14px',
                  background: generating ? '#ddd8cc' : '#0C2340',
                  color: generating ? '#0C2340' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: generating ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {generating ? (
                  <>
                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>&#9696;</span>
                    Generating...
                  </>
                ) : (
                  <>&#10024; Generate with AI</>
                )}
              </button>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your email here, or click 'Generate with AI' for a draft..."
              rows={12}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #000000',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical',
                lineHeight: 1.6,
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '10px 16px',
              background: '#fee2e2',
              color: '#dc2626',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div style={{
              padding: '10px 16px',
              background: '#dcfce7',
              color: '#16a34a',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
              fontWeight: 600,
            }}>
              Email sent successfully!
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: 'white',
                color: '#0C2340',
                border: '1px solid #000000',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || success || !recipientEmail}
              style={{
                padding: '10px 20px',
                background: sending || success ? '#ddd8cc' : '#5a8fc4',
                color: sending || success ? '#0C2340' : 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: (sending || success || !recipientEmail) ? 'default' : 'pointer',
              }}
            >
              {sending ? 'Sending...' : success ? 'Sent!' : 'Send Email'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
