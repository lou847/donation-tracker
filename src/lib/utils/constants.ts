export const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  new: { label: 'New', color: '#2563eb', bgColor: '#dbeafe' },
  under_review: { label: 'Under Review', color: '#d97706', bgColor: '#fef3c7' },
  approved: { label: 'Approved', color: '#16a34a', bgColor: '#dcfce7' },
  denied: { label: 'Denied', color: '#dc2626', bgColor: '#fee2e2' },
  fulfilled: { label: 'Fulfilled', color: '#6b7280', bgColor: '#f3f4f6' },
}

export const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  school: { label: 'School', color: '#3b82f6' },
  nonprofit: { label: 'Nonprofit', color: '#8b5cf6' },
  sports_team: { label: 'Sports Team', color: '#f97316' },
  community_event: { label: 'Community Event', color: '#06b6d4' },
  religious: { label: 'Religious', color: '#ec4899' },
  other: { label: 'Other', color: '#6b7280' },
}

export const DONATION_TYPE_CONFIG: Record<string, { label: string }> = {
  monetary: { label: 'Monetary' },
  gift_card: { label: 'Gift Card' },
  product: { label: 'Product/Goods' },
  sponsorship: { label: 'Sponsorship' },
  in_kind: { label: 'In-Kind' },
  other: { label: 'Other' },
}

export const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
}))

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
}))

export const DONATION_TYPE_OPTIONS = Object.entries(DONATION_TYPE_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
}))
