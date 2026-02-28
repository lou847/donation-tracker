'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRequesters } from '@/lib/hooks/useRequesters'
import { CATEGORY_CONFIG } from '@/lib/utils/constants'

export default function RequestersPage() {
  const { requesters, loading } = useRequesters()
  const [search, setSearch] = useState('')

  const filtered = requesters.filter(r => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      r.org_name?.toLowerCase().includes(s) ||
      r.contact_name?.toLowerCase().includes(s) ||
      r.contact_email?.toLowerCase().includes(s)
    )
  })

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>Requesters</h1>
          <p style={{ color: '#6b7280', marginTop: '4px' }}>
            {filtered.length} organization{filtered.length !== 1 ? 's' : ''}
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

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search organizations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '10px 14px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            width: '280px',
            outline: 'none',
            background: 'white',
          }}
        />
      </div>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>No organizations found</p>
            <p style={{ fontSize: '14px' }}>Organizations are created when you add a new donation request.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Organization</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Contact</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Email</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Phone</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Category</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const catConf = CATEGORY_CONFIG[r.category] || CATEGORY_CONFIG.other
                return (
                  <tr key={r.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <Link href={`/requesters/${r.id}`} style={{
                        color: '#111827',
                        fontWeight: 500,
                        fontSize: '14px',
                        textDecoration: 'none',
                      }}>
                        {r.org_name}
                      </Link>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: '#6b7280' }}>
                      {r.contact_name || '--'}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: '#6b7280' }}>
                      {r.contact_email || '--'}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: '#6b7280' }}>
                      {r.contact_phone || '--'}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: catConf.color, fontWeight: 500 }}>
                      {catConf.label}
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
