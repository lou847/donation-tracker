'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface Toast {
  id: string
  message: string
  type: 'info' | 'success' | 'error'
}

interface ToastContextValue {
  showToast: (message: string, type?: 'info' | 'success' | 'error') => void
  hideToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => hideToast(id), 3000)
  }, [hideToast])

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              background: toast.type === 'error' ? '#dc2626' : toast.type === 'success' ? '#059669' : '#0C2340',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '10px',
              fontSize: '14px',
              marginBottom: '8px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              animation: 'slideIn 0.3s ease-out',
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}
