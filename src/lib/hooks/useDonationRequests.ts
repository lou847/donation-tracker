'use client'

import { useState, useEffect, useCallback } from 'react'
import type { DonationRequestWithRequester, DonationRequestInsert, DonationRequestStatus } from '@/lib/types/database'

interface UseRequestsOptions {
  status?: DonationRequestStatus | null
  category?: string | null
  search?: string | null
}

export function useDonationRequests(options: UseRequestsOptions = {}) {
  const [requests, setRequests] = useState<DonationRequestWithRequester[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/dashboard')
      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to fetch')
      }

      let filtered = (data.requests || []) as DonationRequestWithRequester[]

      if (options.status) {
        filtered = filtered.filter(r => r.status === options.status)
      }

      setRequests(filtered)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests')
    } finally {
      setLoading(false)
    }
  }, [options.status])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const createRequest = useCallback(async (request: DonationRequestInsert) => {
    try {
      const res = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', request }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      await fetchRequests()
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create request' }
    }
  }, [fetchRequests])

  const updateRequest = useCallback(async (id: string, updates: Partial<DonationRequestInsert>) => {
    try {
      const res = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', id, updates }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      await fetchRequests()
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update request' }
    }
  }, [fetchRequests])

  const deleteRequest = useCallback(async (id: string) => {
    try {
      const res = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      await fetchRequests()
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete request' }
    }
  }, [fetchRequests])

  return { requests, loading, error, createRequest, updateRequest, deleteRequest, refetch: fetchRequests }
}
