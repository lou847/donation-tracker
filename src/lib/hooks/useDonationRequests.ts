'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
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

  const supabase = useMemo(() => createClient(), [])

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('donation_requests')
        .select('*, requester:requesters(*)')
        .order('created_at', { ascending: false })

      if (options.status) {
        query = query.eq('status', options.status)
      }

      if (options.category) {
        query = query.eq('requester.category', options.category)
      }

      const { data, error } = await query

      if (error) throw error
      setRequests((data || []) as DonationRequestWithRequester[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests')
    } finally {
      setLoading(false)
    }
  }, [supabase, options.status, options.category])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const createRequest = useCallback(async (request: DonationRequestInsert) => {
    try {
      const { error } = await supabase
        .from('donation_requests')
        .insert(request)

      if (error) throw error
      await fetchRequests()
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create request' }
    }
  }, [supabase, fetchRequests])

  const updateRequest = useCallback(async (id: string, updates: Partial<DonationRequestInsert>) => {
    try {
      const { error } = await supabase
        .from('donation_requests')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      await fetchRequests()
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update request' }
    }
  }, [supabase, fetchRequests])

  const deleteRequest = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('donation_requests')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchRequests()
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete request' }
    }
  }, [supabase, fetchRequests])

  return { requests, loading, error, createRequest, updateRequest, deleteRequest, refetch: fetchRequests }
}
