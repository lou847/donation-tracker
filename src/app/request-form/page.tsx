'use client'

import { useState } from 'react'

const CATEGORY_OPTIONS = [
  { value: 'school', label: 'School / Education' },
  { value: 'nonprofit', label: 'Nonprofit Organization' },
  { value: 'sports_team', label: 'Sports Team / League' },
  { value: 'community_event', label: 'Community Event' },
  { value: 'religious', label: 'Religious Organization' },
  { value: 'other', label: 'Other' },
]

const DONATION_TYPE_OPTIONS = [
  { value: 'gift_card', label: 'Gift Card(s)' },
  { value: 'product', label: 'Product Donation (coffee, juice, catering)' },
  { value: 'sponsorship', label: 'Event Sponsorship' },
  { value: 'monetary', label: 'Monetary Donation' },
  { value: 'in_kind', label: 'In-Kind Support' },
  { value: 'other', label: 'Other / Not Sure' },
]

export default function PublicRequestForm() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form fields
  const [orgName, setOrgName] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [category, setCategory] = useState('other')
  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [amountRequested, setAmountRequested] = useState('')
  const [donationType, setDonationType] = useState('gift_card')
  const [description, setDescription] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/public-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong.')
        setLoading(false)
        return
      }

      setSubmitted(true)
    } catch {
      setError('Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f6f3' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: '#dcfce7',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '36px',
          }}>
            &#9989;
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#0C2340', marginBottom: '12px' }}>
            Request Submitted!
          </h1>
          <p style={{ fontSize: '18px', color: '#4b5563', lineHeight: 1.7, maxWidth: '480px', margin: '0 auto' }}>
            Thank you for your donation request! Our team will review it and follow up with you at <strong>{contactEmail}</strong>.
          </p>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '24px' }}>
            We typically respond within 7 days.
          </p>
        </div>
      </div>
    )
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    fontSize: '15px',
    outline: 'none',
    background: 'white',
    transition: 'border-color 0.15s',
  }

  const labelStyle = {
    display: 'block' as const,
    fontSize: '14px',
    fontWeight: 600 as const,
    color: '#374151',
    marginBottom: '6px',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f6f3' }}>
      {/* Hero Section */}
      <div style={{
        background: '#0C2340',
        padding: '60px 24px 48px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 800,
            color: 'white',
            marginBottom: '16px',
            lineHeight: 1.2,
          }}>
            Hometown Coffee<br />Community Giving
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.7,
            maxWidth: '520px',
            margin: '0 auto',
          }}>
            We&apos;re proud to support the communities we serve. Use the form below to submit a donation request.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 24px 80px' }}>

        {/* How It Works */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginTop: '-24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          marginBottom: '32px',
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0C2340', marginBottom: '16px' }}>
            How Our Giving Program Works
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#dbeafe',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
                flexShrink: 0,
              }}>1</div>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>Submit your request</p>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.5 }}>Fill out the form below with details about your organization and how we can help.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#dbeafe',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
                flexShrink: 0,
              }}>2</div>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>We review requests within 7 days</p>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.5 }}>Our team reviews each donation request as it comes in. We operate on a quarterly giving budget, so our ability to give may be limited depending on where we are in the quarter.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#dbeafe',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
                flexShrink: 0,
              }}>3</div>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>We&apos;ll be in touch</p>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.5 }}>Our team will follow up to let you know the status of your request. Our primary form of giving is Hometown Coffee gift cards.</p>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '20px',
            padding: '14px 16px',
            background: '#fef3c7',
            borderRadius: '10px',
            fontSize: '14px',
            color: '#92400e',
            lineHeight: 1.5,
          }}>
            <strong>Please note:</strong> We love supporting our community, but our giving is limited by a quarterly budget. Due to the volume of requests we receive, we may not be able to fulfill every one. Submitting a request does not guarantee a donation. We appreciate your understanding!
          </div>
        </div>

        {/* Form */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0C2340', marginBottom: '24px' }}>
            Donation Request Form
          </h2>

          {error && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '14px',
              marginBottom: '20px',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Organization Info */}
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
              Your Organization
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
              <div>
                <label style={labelStyle}>Organization / Group Name *</label>
                <input
                  style={inputStyle}
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Lincoln Elementary PTA"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Your Name *</label>
                  <input
                    style={inputStyle}
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Jane Smith"
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Organization Type</label>
                  <select
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input
                    style={inputStyle}
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="jane@organization.org"
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input
                    style={inputStyle}
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Request Details */}
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
              Request Details
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
              <div>
                <label style={labelStyle}>Tell us about your request *</label>
                <textarea
                  style={{ ...inputStyle, resize: 'vertical' }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe your organization, the event or cause, and how a donation from Hometown Coffee would make an impact..."
                  rows={4}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Event / Program Name</label>
                  <input
                    style={inputStyle}
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="e.g. Spring Fundraiser Gala"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Event Date</label>
                  <input
                    style={inputStyle}
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>What type of donation?</label>
                  <select
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    value={donationType}
                    onChange={(e) => setDonationType(e.target.value)}
                  >
                    {DONATION_TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Estimated value requested ($)</label>
                  <input
                    style={inputStyle}
                    type="number"
                    step="0.01"
                    min="0"
                    value={amountRequested}
                    onChange={(e) => setAmountRequested(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: '#0C2340',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              {loading ? 'Submitting...' : 'Submit Donation Request'}
            </button>

            <p style={{
              textAlign: 'center',
              fontSize: '13px',
              color: '#9ca3af',
              marginTop: '16px',
              lineHeight: 1.5,
            }}>
              By submitting this form, you agree to be contacted by Hometown Coffee regarding your request.
            </p>
          </form>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '40px', color: '#9ca3af', fontSize: '13px' }}>
          <p>&copy; {new Date().getFullYear()} Hometown Coffee. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
