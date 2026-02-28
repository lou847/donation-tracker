'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Requester, RequesterInsert } from '@/lib/types/database'

export function useRequesters() {
  const [requesters, setRequesters] = useState<Requester[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRequesters = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/requesters')
      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to fetch')
      }

      setRequesters((data.requesters || []) as Requester[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requesters')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRequesters()
  }, [fetchRequesters])

  const createRequester = useCallback(async (requester: RequesterInsert) => {
    try {
      const res = await fetch('/api/requesters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requester),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      await fetchRequesters()
      return { success: true, data: data.requester as Requester }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create requester', data: null }
    }
  }, [fetchRequesters])

  return { requesters, loading, error, createRequester, refetch: fetchRequesters }
}
