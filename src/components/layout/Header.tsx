'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function Header() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/requests', label: 'Requests' },
    { href: '/requesters', label: 'Requesters' },
  ]

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

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
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 100,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <Link href="/" style={{
          color: 'white',
          textDecoration: 'none',
          fontSize: '18px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>&#10084;&#65039;</span>
          Donation Tracker
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
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <button
        onClick={handleSignOut}
        style={{
          padding: '8px 16px',
          background: 'rgba(255,255,255,0.1)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          fontSize: '14px',
          cursor: 'pointer',
        }}
      >
        Sign out
      </button>
    </header>
  )
}
