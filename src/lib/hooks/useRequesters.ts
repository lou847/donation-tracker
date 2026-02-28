'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Requester, RequesterInsert } from '@/lib/types/database'

export function useRequesters() {
  const [requesters, setRequesters] = useState<Requester[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  const fetchRequesters = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('requesters')
        .select('*')
        .order('org_name', { ascending: true })

      if (error) throw error
      setRequesters(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requesters')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchRequesters()
  }, [fetchRequesters])

  const createRequester = useCallback(async (requester: RequesterInsert) => {
    try {
      const { data, error } = await supabase
        .from('requesters')
        .insert(requester)
        .select()
        .single()

      if (error) throw error
      await fetchRequesters()
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create requester', data: null }
    }
  }, [supabase, fetchRequesters])

  const updateRequester = useCallback(async (id: string, updates: Partial<RequesterInsert>) => {
    try {
      const { error } = await supabase
        .from('requesters')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      await fetchRequesters()
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update requester' }
    }
  }, [supabase, fetchRequesters])

  const deleteRequester = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('requesters')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchRequesters()
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete requester' }
    }
  }, [supabase, fetchRequesters])

  return { requesters, loading, error, createRequester, updateRequester, deleteRequester, refetch: fetchRequesters }
}
