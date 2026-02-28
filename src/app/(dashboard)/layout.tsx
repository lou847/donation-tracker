import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { ToastProvider } from '@/components/ui/Toast'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <ToastProvider>
      <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
        <Header />
        <main style={{ paddingTop: '60px' }}>
          {children}
        </main>
      </div>
    </ToastProvider>
  )
}
