'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Header() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/requests', label: 'Requests' },
    { href: '/requesters', label: 'Requesters' },
  ]

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '60px',
      background: '#0C2340',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      zIndex: 100,
      borderBottom: '3px solid #5a8fc4',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <Link href="/" style={{
          color: 'white',
          textDecoration: 'none',
          fontSize: '20px',
          fontWeight: 700,
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span style={{ fontSize: '22px' }}>&#9749;</span>
          Hometown Donation Tracker
        </Link>

        <nav style={{ display: 'flex', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  background: isActive ? '#5a8fc4' : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
