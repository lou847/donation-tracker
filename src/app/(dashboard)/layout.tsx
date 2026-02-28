import { Header } from '@/components/layout/Header'
import { ToastProvider } from '@/components/ui/Toast'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
