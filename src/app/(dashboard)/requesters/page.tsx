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
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0C2340' }}>Requesters</h1>
          <p style={{ color: '#5a8fc4', marginTop: '4px', fontWeight: 500 }}>
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
            border: '1px solid #000000',
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
        boxShadow: '0 2px 8px rgba(12,35,64,0.06)',
        border: '1px solid #000000',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#0C2340' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#0C2340' }}>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>No organizations found</p>
            <p style={{ fontSize: '14px', color: '#5a8fc4' }}>Organizations are created when you add a new donation request.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#5a8fc4' }}>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Organization</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const catConf = CATEGORY_CONFIG[r.category] || CATEGORY_CONFIG.other
                return (
                  <tr key={r.id} style={{ borderTop: '1px solid #ddd8cc' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <Link href={`/requesters/${r.id}`} style={{
                        color: '#0C2340',
                        fontWeight: 600,
                        fontSize: '14px',
                        textDecoration: 'none',
                      }}>
                        {r.org_name}
                      </Link>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: '#5a8fc4' }}>
                      {r.contact_name || '--'}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: '#5a8fc4' }}>
                      {r.contact_email || '--'}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: '#5a8fc4' }}>
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
