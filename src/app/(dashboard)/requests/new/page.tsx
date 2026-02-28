'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDonationRequests } from '@/lib/hooks/useDonationRequests'
import { useRequesters } from '@/lib/hooks/useRequesters'
import { useToast } from '@/components/ui/Toast'
import { CATEGORY_OPTIONS, DONATION_TYPE_OPTIONS } from '@/lib/utils/constants'
import type { RequesterCategory, DonationType } from '@/lib/types/database'

export default function NewRequestPage() {
  const router = useRouter()
  const { createRequest } = useDonationRequests()
  const { requesters, createRequester } = useRequesters()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(false)

  // Requester fields
  const [requesterId, setRequesterId] = useState('')
  const [showNewRequester, setShowNewRequester] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [newContactName, setNewContactName] = useState('')
  const [newContactEmail, setNewContactEmail] = useState('')
  const [newContactPhone, setNewContactPhone] = useState('')
  const [newCategory, setNewCategory] = useState<RequesterCategory>('other')

  // Request fields
  const [description, setDescription] = useState('')
  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [requestDate, setRequestDate] = useState(new Date().toISOString().split('T')[0])
  const [amountRequested, setAmountRequested] = useState('')
  const [donationType, setDonationType] = useState<DonationType>('monetary')
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let finalRequesterId = requesterId

      // Create new requester if needed
      if (showNewRequester) {
        if (!newOrgName.trim()) {
          showToast('Organization name is required', 'error')
          setLoading(false)
          return
        }
        const result = await createRequester({
          org_name: newOrgName.trim(),
          contact_name: newContactName.trim() || null,
          contact_email: newContactEmail.trim() || null,
          contact_phone: newContactPhone.trim() || null,
          category: newCategory,
        })
        if (!result.success || !result.data) {
          showToast(result.error || 'Failed to create requester', 'error')
          setLoading(false)
          return
        }
        finalRequesterId = result.data.id
      }

      if (!finalRequesterId) {
        showToast('Please select or create a requester', 'error')
        setLoading(false)
        return
      }

      const result = await createRequest({
        requester_id: finalRequesterId,
        description: description.trim(),
        event_name: eventName.trim() || null,
        event_date: eventDate || null,
        request_date: requestDate,
        amount_requested: amountRequested ? parseFloat(amountRequested) : null,
        donation_type: donationType,
        notes: notes.trim() || null,
        status: 'new',
      })

      if (result.success) {
        showToast('Request created successfully!', 'success')
        router.push('/requests')
      } else {
        showToast(result.error || 'Failed to create request', 'error')
      }
    } catch {
      showToast('An error occurred', 'error')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #000000',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    background: 'white',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600 as const,
    color: '#0C2340',
    marginBottom: '4px',
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/requests" style={{ color: '#5a8fc4', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}>
          &larr; Back to requests
        </Link>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0C2340', marginTop: '8px' }}>
          New Donation Request
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Requester Section */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(12,35,64,0.06)',
          border: '1px solid #000000',
          marginBottom: '20px',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0C2340', marginBottom: '16px' }}>
            Requester
          </h2>

          {!showNewRequester ? (
            <div>
              <label style={labelStyle}>Select organization</label>
              <select
                value={requesterId}
                onChange={(e) => setRequesterId(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="">Choose an organization...</option>
                {requesters.map(r => (
                  <option key={r.id} value={r.id}>{r.org_name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewRequester(true)}
                style={{
                  marginTop: '12px',
                  color: '#5a8fc4',
                  fontSize: '14px',
                  fontWeight: 600,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                + Add new organization
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Organization name *</label>
                <input style={inputStyle} value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} placeholder="e.g. Lincoln Elementary School" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Contact name</label>
                  <input style={inputStyle} value={newContactName} onChange={(e) => setNewContactName(e.target.value)} placeholder="Jane Smith" />
                </div>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={newCategory} onChange={(e) => setNewCategory(e.target.value as RequesterCategory)}>
                    {CATEGORY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input style={inputStyle} type="email" value={newContactEmail} onChange={(e) => setNewContactEmail(e.target.value)} placeholder="jane@school.org" />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input style={inputStyle} type="tel" value={newContactPhone} onChange={(e) => setNewContactPhone(e.target.value)} placeholder="(555) 123-4567" />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewRequester(false)}
                style={{
                  color: '#5a8fc4',
                  fontSize: '14px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  alignSelf: 'flex-start',
                  fontWeight: 500,
                }}
              >
                &larr; Select existing organization instead
              </button>
            </div>
          )}
        </div>

        {/* Request Details */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(12,35,64,0.06)',
          border: '1px solid #000000',
          marginBottom: '20px',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0C2340', marginBottom: '16px' }}>
            Request Details
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is the donation request for?"
                required
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Event name</label>
                <input style={inputStyle} value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="e.g. Spring Fundraiser" />
              </div>
              <div>
                <label style={labelStyle}>Event date</label>
                <input style={inputStyle} type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Amount requested ($)</label>
                <input style={inputStyle} type="number" step="0.01" min="0" value={amountRequested} onChange={(e) => setAmountRequested(e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <label style={labelStyle}>Donation type</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={donationType} onChange={(e) => setDonationType(e.target.value as DonationType)}>
                  {DONATION_TYPE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Request date</label>
              <input style={inputStyle} type="date" value={requestDate} onChange={(e) => setRequestDate(e.target.value)} />
            </div>

            <div>
              <label style={labelStyle}>Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes..."
                rows={2}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Link href="/requests" style={{
            padding: '10px 20px',
            border: '1px solid #000000',
            borderRadius: '8px',
            color: '#0C2340',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500,
            background: 'white',
          }}>
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 24px',
              background: '#0C2340',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Creating...' : 'Create Request'}
          </button>
        </div>
      </form>
    </div>
  )
}
