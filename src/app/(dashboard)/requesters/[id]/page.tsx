'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import { STATUS_CONFIG, CATEGORY_CONFIG } from '@/lib/utils/constants'
import type { Requester, DonationRequestWithRequester } from '@/lib/types/database'

export default function RequesterDetailPage() {
  const params = useParams()

  const [requester, setRequester] = useState<Requester | null>(null)
  const [requests, setRequests] = useState<DonationRequestWithRequester[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [reqRes, dashRes] = await Promise.all([
        fetch('/api/requesters'),
        fetch('/api/dashboard'),
      ])
      const reqData = await reqRes.json()
      const dashData = await dashRes.json()

      const allRequesters = (reqData.requesters || []) as Requester[]
      const found = allRequesters.find(r => r.id === params.id)
      if (found) setRequester(found)

      const allRequests = (dashData.requests || []) as DonationRequestWithRequester[]
      const filtered = allRequests.filter(r => r.requester_id === params.id)
      setRequests(filtered)
    } catch (err) {
      console.error('Failed to fetch requester data:', err)
    }
    setLoading(false)
  }, [params.id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading || !requester) {
    return <div style={{ padding: '32px', textAlign: 'center', color: '#0C2340' }}>Loading...</div>
  }

  const categoryConf = CATEGORY_CONFIG[requester.category] || CATEGORY_CONFIG.other
  const totalRequested = requests.reduce((sum, r) => sum + (r.amount_requested || 0), 0)
  const totalApproved = requests.reduce((sum, r) => sum + (r.amount_approved || 0), 0)

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
      <Link href="/requesters" style={{ color: '#5a8fc4', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}>
        &larr; Back to requesters
      </Link>

      {/* Header */}
      <div style={{ marginTop: '12px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0C2340' }}>{requester.org_name}</h1>
        <span style={{ fontSize: '13px', color: categoryConf.color, fontWeight: 500 }}>{categoryConf.label}</span>
      </div>

      {/* Info + Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(12,35,64,0.06)',
          border: '1px solid #000000',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0C2340', marginBottom: '16px' }}>Contact Info</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#5a8fc4', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Contact</span>
              <p style={{ fontSize: '14px', color: '#0C2340' }}>{requester.contact_name || '--'}</p>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#5a8fc4', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Email</span>
              <p style={{ fontSize: '14px', color: '#0C2340' }}>{requester.contact_email || '--'}</p>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#5a8fc4', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Phone</span>
              <p style={{ fontSize: '14px', color: '#0C2340' }}>{requester.contact_phone || '--'}</p>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#5a8fc4', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Address</span>
              <p style={{ fontSize: '14px', color: '#0C2340' }}>{requester.address || '--'}</p>
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(12,35,64,0.06)',
          border: '1px solid #000000',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0C2340', marginBottom: '16px' }}>Summary</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#5a8fc4', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Total Requests</span>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#0C2340' }}>{requests.length}</p>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#5a8fc4', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Total Requested</span>
              <p style={{ fontSize: '20px', fontWeight: 700, color: '#0C2340' }}>{formatCurrency(totalRequested)}</p>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#5a8fc4', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Total Approved</span>
              <p style={{ fontSize: '20px', fontWeight: 700, color: '#059669' }}>{formatCurrency(totalApproved)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Request History */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(12,35,64,0.06)',
        border: '1px solid #000000',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #ddd8cc' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0C2340' }}>Request History</h2>
        </div>

        {requests.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#0C2340' }}>
            No requests from this organization yet.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#5a8fc4' }}>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</th>
                <th style={{ padding: '12px 20px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Requested</th>
                <th style={{ padding: '12px 20px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Approved</th>
                <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const statusConf = STATUS_CONFIG[req.status] || STATUS_CONFIG.new
                return (
                  <tr key={req.id} style={{ borderTop: '1px solid #ddd8cc' }}>
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: '#5a8fc4' }}>
                      {formatDate(req.request_date)}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <Link href={`/requests/${req.id}`} style={{
                        color: '#0C2340',
                        fontWeight: 600,
                        fontSize: '14px',
                        textDecoration: 'none',
                      }}>
                        {req.description?.substring(0, 60)}{req.description?.length > 60 ? '...' : ''}
                      </Link>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: '14px', fontWeight: 600, color: '#0C2340' }}>
                      {formatCurrency(req.amount_requested)}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: '14px', fontWeight: 600, color: '#059669' }}>
                      {formatCurrency(req.amount_approved)}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
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
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
