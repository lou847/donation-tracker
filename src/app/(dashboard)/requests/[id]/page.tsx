'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ui/Toast'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import { STATUS_CONFIG, CATEGORY_CONFIG, STATUS_OPTIONS, DONATION_TYPE_OPTIONS } from '@/lib/utils/constants'
import type { DonationRequestWithRequester, DonationRequestStatus, DonationType } from '@/lib/types/database'

export default function RequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()

  const [request, setRequest] = useState<DonationRequestWithRequester | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)

  // Edit fields
  const [status, setStatus] = useState<DonationRequestStatus>('new')
  const [amountApproved, setAmountApproved] = useState('')
  const [amountRequested, setAmountRequested] = useState('')
  const [donationType, setDonationType] = useState<DonationType>('monetary')
  const [description, setDescription] = useState('')
  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [notes, setNotes] = useState('')
  const [internalNotes, setInternalNotes] = useState('')

  const fetchRequest = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard')
      const data = await res.json()
      if (!res.ok || data.error) {
        showToast('Failed to load request', 'error')
        router.push('/requests')
        return
      }
      const allRequests = (data.requests || []) as DonationRequestWithRequester[]
      const found = allRequests.find(r => r.id === params.id)
      if (!found) {
        showToast('Request not found', 'error')
        router.push('/requests')
        return
      }
      setRequest(found)
      setStatus(found.status)
      setAmountApproved(found.amount_approved?.toString() || '')
      setAmountRequested(found.amount_requested?.toString() || '')
      setDonationType(found.donation_type)
      setDescription(found.description)
      setEventName(found.event_name || '')
      setEventDate(found.event_date || '')
      setNotes(found.notes || '')
      setInternalNotes(found.internal_notes || '')
      setLoading(false)
    } catch {
      showToast('Failed to load request', 'error')
      router.push('/requests')
    }
  }, [params.id, router, showToast])

  useEffect(() => {
    fetchRequest()
  }, [fetchRequest])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          id: params.id,
          updates: {
            status,
            amount_approved: amountApproved ? parseFloat(amountApproved) : null,
            amount_requested: amountRequested ? parseFloat(amountRequested) : null,
            donation_type: donationType,
            description,
            event_name: eventName || null,
            event_date: eventDate || null,
            notes: notes || null,
            internal_notes: internalNotes || null,
            reviewed_at: (status === 'approved' || status === 'denied') ? new Date().toISOString() : request?.reviewed_at,
            fulfilled_at: status === 'fulfilled' ? new Date().toISOString() : request?.fulfilled_at,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        showToast('Failed to save changes', 'error')
      } else {
        showToast('Changes saved!', 'success')
        setEditing(false)
        await fetchRequest()
      }
    } catch {
      showToast('Failed to save changes', 'error')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this request?')) return
    try {
      const res = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: params.id }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        showToast('Failed to delete request', 'error')
      } else {
        showToast('Request deleted', 'success')
        router.push('/requests')
      }
    } catch {
      showToast('Failed to delete request', 'error')
    }
  }

  if (loading || !request) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#0C2340' }}>Loading...</div>
    )
  }

  const statusConf = STATUS_CONFIG[request.status] || STATUS_CONFIG.new
  const categoryConf = CATEGORY_CONFIG[request.requester?.category] || CATEGORY_CONFIG.other

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
    display: 'block' as const,
    fontSize: '14px',
    fontWeight: 500 as const,
    color: '#5a8fc4',
    marginBottom: '4px',
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/requests" style={{ color: '#5a8fc4', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}>
          &larr; Back to requests
        </Link>
      </div>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0C2340' }}>
            {request.requester?.org_name}
          </h1>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px' }}>
            <span style={{
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600,
              background: statusConf.bgColor,
              color: statusConf.color,
            }}>
              {statusConf.label}
            </span>
            <span style={{ fontSize: '13px', color: categoryConf.color, fontWeight: 500 }}>
              {categoryConf.label}
            </span>
            <span style={{ fontSize: '13px', color: '#5a8fc4' }}>
              Submitted {formatDate(request.request_date)}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              style={{
                padding: '8px 16px',
                background: '#0C2340',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={() => setEditing(false)}
                style={{
                  padding: '8px 16px',
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
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '8px 16px',
                  background: '#5a8fc4',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Details Card */}
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Status</label>
            {editing ? (
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={status} onChange={(e) => setStatus(e.target.value as DonationRequestStatus)}>
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <p style={{ fontSize: '14px', color: '#0C2340', fontWeight: 500 }}>{statusConf.label}</p>
            )}
          </div>

          <div>
            <label style={labelStyle}>Donation Type</label>
            {editing ? (
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={donationType} onChange={(e) => setDonationType(e.target.value as DonationType)}>
                {DONATION_TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <p style={{ fontSize: '14px', color: '#0C2340' }}>
                {DONATION_TYPE_OPTIONS.find(o => o.value === request.donation_type)?.label || request.donation_type}
              </p>
            )}
          </div>

          <div>
            <label style={labelStyle}>Amount Requested</label>
            {editing ? (
              <input style={inputStyle} type="number" step="0.01" value={amountRequested} onChange={(e) => setAmountRequested(e.target.value)} />
            ) : (
              <p style={{ fontSize: '20px', color: '#0C2340', fontWeight: 700 }}>{formatCurrency(request.amount_requested)}</p>
            )}
          </div>

          <div>
            <label style={labelStyle}>Amount Approved</label>
            {editing ? (
              <input style={inputStyle} type="number" step="0.01" value={amountApproved} onChange={(e) => setAmountApproved(e.target.value)} />
            ) : (
              <p style={{ fontSize: '20px', color: '#059669', fontWeight: 700 }}>{formatCurrency(request.amount_approved)}</p>
            )}
          </div>

          <div>
            <label style={labelStyle}>Event</label>
            {editing ? (
              <input style={inputStyle} value={eventName} onChange={(e) => setEventName(e.target.value)} />
            ) : (
              <p style={{ fontSize: '14px', color: '#0C2340' }}>{request.event_name || '--'}</p>
            )}
          </div>

          <div>
            <label style={labelStyle}>Event Date</label>
            {editing ? (
              <input style={inputStyle} type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            ) : (
              <p style={{ fontSize: '14px', color: '#0C2340' }}>{request.event_date ? formatDate(request.event_date) : '--'}</p>
            )}
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <label style={labelStyle}>Description</label>
          {editing ? (
            <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          ) : (
            <p style={{ fontSize: '14px', color: '#0C2340', lineHeight: 1.6 }}>{request.description}</p>
          )}
        </div>

        <div style={{ marginTop: '16px' }}>
          <label style={labelStyle}>Notes</label>
          {editing ? (
            <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          ) : (
            <p style={{ fontSize: '14px', color: '#5a8fc4' }}>{request.notes || 'No notes'}</p>
          )}
        </div>

        <div style={{ marginTop: '16px' }}>
          <label style={labelStyle}>Internal Notes (staff only)</label>
          {editing ? (
            <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} />
          ) : (
            <p style={{ fontSize: '14px', color: '#5a8fc4' }}>{request.internal_notes || 'No internal notes'}</p>
          )}
        </div>
      </div>

      {/* Requester Info */}
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(12,35,64,0.06)',
        border: '1px solid #000000',
        marginBottom: '20px',
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0C2340', marginBottom: '16px' }}>
          Requester Info
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Organization</label>
            <p style={{ fontSize: '14px', color: '#0C2340', fontWeight: 500 }}>{request.requester?.org_name}</p>
          </div>
          <div>
            <label style={labelStyle}>Contact</label>
            <p style={{ fontSize: '14px', color: '#0C2340' }}>{request.requester?.contact_name || '--'}</p>
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <p style={{ fontSize: '14px', color: '#0C2340' }}>{request.requester?.contact_email || '--'}</p>
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <p style={{ fontSize: '14px', color: '#0C2340' }}>{request.requester?.contact_phone || '--'}</p>
          </div>
        </div>
        <Link href={`/requesters/${request.requester_id}`} style={{
          display: 'inline-block',
          marginTop: '12px',
          color: '#5a8fc4',
          fontSize: '14px',
          fontWeight: 600,
          textDecoration: 'none',
        }}>
          View all requests from this organization &rarr;
        </Link>
      </div>

      {/* Quick Actions */}
      {!editing && (
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(12,35,64,0.06)',
          border: '1px solid #000000',
          marginBottom: '20px',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0C2340', marginBottom: '16px' }}>
            Quick Actions
          </h2>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {request.status !== 'approved' && (
              <button
                onClick={async () => {
                  setSaving(true)
                  await fetch('/api/dashboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update', id: params.id, updates: { status: 'approved', reviewed_at: new Date().toISOString() } }) })
                  showToast('Request approved!', 'success')
                  await fetchRequest()
                  setSaving(false)
                }}
                style={{ padding: '8px 16px', background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}
              >
                Approve
              </button>
            )}
            {request.status !== 'denied' && (
              <button
                onClick={async () => {
                  setSaving(true)
                  await fetch('/api/dashboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update', id: params.id, updates: { status: 'denied', reviewed_at: new Date().toISOString() } }) })
                  showToast('Request denied', 'success')
                  await fetchRequest()
                  setSaving(false)
                }}
                style={{ padding: '8px 16px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}
              >
                Deny
              </button>
            )}
            {request.status === 'approved' && (
              <button
                onClick={async () => {
                  setSaving(true)
                  await fetch('/api/dashboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update', id: params.id, updates: { status: 'fulfilled', fulfilled_at: new Date().toISOString() } }) })
                  showToast('Marked as fulfilled!', 'success')
                  await fetchRequest()
                  setSaving(false)
                }}
                style={{ padding: '8px 16px', background: '#ddd8cc', color: '#0C2340', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}
              >
                Mark Fulfilled
              </button>
            )}
            <button
              onClick={handleDelete}
              style={{ padding: '8px 16px', background: 'white', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', fontWeight: 500, cursor: 'pointer', fontSize: '14px', marginLeft: 'auto' }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
