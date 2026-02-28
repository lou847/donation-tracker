'use client'

import { useState, useEffect, useCallback } from 'react'
import type { DonationRequestWithRequester } from '@/lib/types/database'

interface DashboardStats {
  totalDonatedYTD: number
  requestsThisMonth: number
  pendingReview: number
  approvalRate: number
  statusCounts: Record<string, number>
  recentRequests: DonationRequestWithRequester[]
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDonatedYTD: 0,
    requestsThisMonth: 0,
    pendingReview: 0,
    approvalRate: 0,
    statusCounts: {},
    recentRequests: [],
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    setLoading(true)

    try {
      const res = await fetch('/api/dashboard')
      const data = await res.json()

      if (!res.ok || data.error) {
        console.error('Dashboard API error:', data.error)
        setLoading(false)
        return
      }

      const requests = (data.requests || []) as DonationRequestWithRequester[]

      const now = new Date()
      const yearStart = new Date(now.getFullYear(), 0, 1).toISOString()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      // Total donated YTD (approved + fulfilled with amount_approved)
      const totalDonatedYTD = requests
        .filter(r => (r.status === 'approved' || r.status === 'fulfilled') && r.created_at >= yearStart)
        .reduce((sum, r) => sum + (r.amount_approved || 0), 0)

      // Requests this month
      const requestsThisMonth = requests
        .filter(r => r.created_at >= monthStart)
        .length

      // Pending review
      const pendingReview = requests
        .filter(r => r.status === 'new' || r.status === 'under_review')
        .length

      // Approval rate
      const decided = requests.filter(r => r.status === 'approved' || r.status === 'denied' || r.status === 'fulfilled')
      const approved = decided.filter(r => r.status === 'approved' || r.status === 'fulfilled')
      const approvalRate = decided.length > 0 ? Math.round((approved.length / decided.length) * 100) : 0

      // Status counts
      const statusCounts: Record<string, number> = {}
      requests.forEach(r => {
        statusCounts[r.status] = (statusCounts[r.status] || 0) + 1
      })

      // Recent requests (last 10)
      const recentRequests = requests.slice(0, 10)

      setStats({
        totalDonatedYTD,
        requestsThisMonth,
        pendingReview,
        approvalRate,
        statusCounts,
        recentRequests,
      })
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, refetch: fetchStats }
}
