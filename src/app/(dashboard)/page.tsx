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
      <div style={{ padding: '32px', textAlign: 'center', color: '#0C2340' }}>
        Loading dashboard...
      </div>
    )
  }

  const statCards = [
    { label: 'Donated (YTD)', value: formatCurrency(stats.totalDonatedYTD), color: '#0C2340', accent: '#5a8fc4' },
    { label: 'Requests This Month', value: stats.requestsThisMonth.toString(), color: '#0C2340', accent: '#5a8fc4' },
    { label: 'Pending Review', value: stats.pendingReview.toString(), color: '#d97706', accent: '#d97706' },
    { label: 'Approval Rate', value: `${stats.approvalRate}%`, color: '#0C2340', accent: '#5a8fc4' },
  ]

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0C2340' }}>Dashboard</h1>
        <p style={{ color: '#5a8fc4', marginTop: '4px', fontWeight: 500 }}>Overview of donation requests</p>
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
            border: '1px solid #000000',
            boxShadow: '0 2px 8px rgba(12,35,64,0.06)',
          }}>
            <p style={{ fontSize: '13px', color: '#5a8fc4', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</p>
            <p style={{ fontSize: '32px', fontWeight: 700, color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Status Breakdown */}
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #000000',
        boxShadow: '0 2px 8px rgba(12,35,64,0.06)',
        marginBottom: '32px',
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0C2340', marginBottom: '16px' }}>
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
        border: '1px solid #000000',
        boxShadow: '0 2px 8px rgba(12,35,64,0.06)',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #ddd8cc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0C2340' }}>
            Recent Requests
          </h2>
          <Link href="/requests" style={{
            color: '#5a8fc4',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
          }}>
            View all &rarr;
          </Link>
        </div>

        {stats.recentRequests.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#0C2340' }}>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>No donation requests yet</p>
            <Link href="/requests/new" style={{
              color: '#5a8fc4',
              fontWeight: 600,
              textDecoration: 'none',
            }}>
              Create your first request &rarr;
            </Link>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#5a8fc4' }}>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Organization</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</th>
                <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Requested</th>
                <th style={{ padding: '12px 24px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentRequests.map((req) => {
                const statusConf = STATUS_CONFIG[req.status] || STATUS_CONFIG.new
                const categoryConf = CATEGORY_CONFIG[req.requester?.category] || CATEGORY_CONFIG.other
                return (
                  <tr key={req.id} style={{ borderTop: '1px solid #ddd8cc' }}>
                    <td style={{ padding: '14px 24px', fontSize: '14px', color: '#5a8fc4' }}>
                      {formatDate(req.request_date)}
                    </td>
                    <td style={{ padding: '14px 24px' }}>
                      <Link href={`/requests/${req.id}`} style={{
                        color: '#0C2340',
                        fontWeight: 600,
                        fontSize: '14px',
                        textDecoration: 'none',
                      }}>
                        {req.requester?.org_name || 'Unknown'}
                      </Link>
                    </td>
                    <td style={{ padding: '14px 24px', fontSize: '13px', color: categoryConf.color, fontWeight: 500 }}>
                      {categoryConf.label}
                    </td>
                    <td style={{ padding: '14px 24px', textAlign: 'right', fontSize: '14px', fontWeight: 600, color: '#0C2340' }}>
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
