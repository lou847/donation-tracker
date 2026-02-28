import { Header } from '@/components/layout/Header'
import { ToastProvider } from '@/components/ui/Toast'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <div style={{ minHeight: '100vh', background: '#ddd8cc' }}>
        <Header />
        <main style={{ paddingTop: '60px' }}>
          {children}
        </main>
      </div>
    </ToastProvider>
  )
}
