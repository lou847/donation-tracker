'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useDonationRequests } from '@/lib/hooks/useDonationRequests'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import { STATUS_CONFIG, CATEGORY_CONFIG, STATUS_OPTIONS } from '@/lib/utils/constants'
import type { DonationRequestStatus } from '@/lib/types/database'

export default function RequestsPage() {
  const [statusFilter, setStatusFilter] = useState<DonationRequestStatus | null>(null)
  const [search, setSearch] = useState('')

  const { requests, loading } = useDonationRequests({ status: statusFilter })

  const filteredRequests = requests.filter(req => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      req.requester?.org_name?.toLowerCase().includes(searchLower) ||
      req.description?.toLowerCase().includes(searchLower) ||
      req.event_name?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0C2340' }}>Donation Requests</h1>
          <p style={{ color: '#5a8fc4', marginTop: '4px', fontWeight: 500 }}>
            {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/requests/new" style={{
          padding: '10px 20px',
          background: '#0C2340',
          color: 'white',
          borderRadius: '8px',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 600,
        }}>
          + New Request
        </Link>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap',
      }}>
        <input
          type="text"
          placeholder="Search requests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '10px 14px',
            border: '1px solid #000000',
            borderRadius: '8px',
            fontSize: '14px',
            width: '280px',
            outline: 'none',
            background: 'white',
          }}
        />
        <select
          value={statusFilter || ''}
          onChange={(e) => setStatusFilter((e.target.value || null) as DonationRequestStatus | null)}
          style={{
            padding: '10px 14px',
            border: '1px solid #000000',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            background: 'white',
            cursor: 'pointer',
          }}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(12,35,64,0.06)',
        border: '1px solid #000000',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#0C2340' }}>Loading...</div>
        ) : filteredRequests.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#0C2340' }}>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>No requests found</p>
            <Link href="/requests/new" style={{ color: '#5a8fc4', fontWeight: 600, textDecoration: 'none' }}>
              Create your first request &rarr;
            </Link>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#5a8fc4' }}>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Organization</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Event</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</th>
                <th style={{ padding: '12px 20px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Requested</th>
                <th style={{ padding: '12px 20px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Approved</th>
                <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => {
                const statusConf = STATUS_CONFIG[req.status] || STATUS_CONFIG.new
                const categoryConf = CATEGORY_CONFIG[req.requester?.category] || CATEGORY_CONFIG.other
                return (
                  <tr key={req.id} style={{ borderTop: '1px solid #ddd8cc', cursor: 'pointer' }}>
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
                        {req.requester?.org_name || 'Unknown'}
                      </Link>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: '#5a8fc4' }}>
                      {req.event_name || '--'}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: categoryConf.color, fontWeight: 500 }}>
                      {categoryConf.label}
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
