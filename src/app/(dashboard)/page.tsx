'use client'

import { useDashboardStats } from '@/lib/hooks/useDashboardStats'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import { STATUS_CONFIG, CATEGORY_CONFIG } from '@/lib/utils/constants'
import Link from 'next/link'

export default function DashboardPage() {
  const { stats, loading } = useDashboardStats()

  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
        Loading dashboard...
      </div>
    )
  }

  const statCards = [
    { label: 'Donated (YTD)', value: formatCurrency(stats.totalDonatedYTD), color: '#059669' },
    { label: 'Requests This Month', value: stats.requestsThisMonth.toString(), color: '#2563eb' },
    { label: 'Pending Review', value: stats.pendingReview.toString(), color: '#d97706' },
    { label: 'Approval Rate', value: `${stats.approvalRate}%`, color: '#8b5cf6' },
  ]

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>Dashboard</h1>
        <p style={{ color: '#6b7280', marginTop: '4px' }}>Overview of donation requests</p>
      </div>

      {/* Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {statCards.map((card) => (
          <div key={card.label} style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb',
          }}>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>{card.label}</p>
            <p style={{ fontSize: '32px', fontWeight: 700, color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Status Breakdown */}
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
        marginBottom: '32px',
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
          Requests by Status
        </h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {Object.entries(STATUS_CONFIG).map(([status, config]) => (
            <div key={status} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '20px',
              background: config.bgColor,
              color: config.color,
              fontWeight: 600,
              fontSize: '14px',
            }}>
              <span>{config.label}</span>
              <span style={{
                background: config.color,
                color: 'white',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
              }}>
                {stats.statusCounts[status] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Requests */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
            Recent Requests
          </h2>
          <Link href="/requests" style={{
            color: '#0C2340',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
          }}>
            View all &rarr;
          </Link>
        </div>

        {stats.recentRequests.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#6b7280' }}>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>No donation requests yet</p>
            <Link href="/requests/new" style={{
              color: '#0C2340',
              fontWeight: 600,
              textDecoration: 'none',
            }}>
              Create your first request &rarr;
            </Link>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Organization</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Requested</th>
                <th style={{ padding: '12px 24px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentRequests.map((req) => {
                const statusConf = STATUS_CONFIG[req.status] || STATUS_CONFIG.new
                const categoryConf = CATEGORY_CONFIG[req.requester?.category] || CATEGORY_CONFIG.other
                return (
                  <tr key={req.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '14px 24px', fontSize: '14px', color: '#6b7280' }}>
                      {formatDate(req.request_date)}
                    </td>
                    <td style={{ padding: '14px 24px' }}>
                      <Link href={`/requests/${req.id}`} style={{
                        color: '#111827',
                        fontWeight: 500,
                        fontSize: '14px',
                        textDecoration: 'none',
                      }}>
                        {req.requester?.org_name || 'Unknown'}
                      </Link>
                    </td>
                    <td style={{ padding: '14px 24px', fontSize: '13px', color: categoryConf.color, fontWeight: 500 }}>
                      {categoryConf.label}
                    </td>
                    <td style={{ padding: '14px 24px', textAlign: 'right', fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                      {formatCurrency(req.amount_requested)}
                    </td>
                    <td style={{ padding: '14px 24px', textAlign: 'center' }}>
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
