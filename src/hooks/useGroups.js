import { useState, useEffect } from 'react'
import { getGroups } from '../lib/api'

const CACHE_KEY = 'wc2026_groups_v1'
const CACHE_TTL = 12 * 60 * 60 * 1000

function getCached() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, timestamp } = JSON.parse(raw)
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    return data
  } catch { return null }
}

function setCache(data) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
}

export function useGroups(teams) {
  const [groups, setGroups] = useState(() => getCached() || [])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cached = getCached()
    if (cached) {
      setGroups(cached)
      setLoading(false)
    }

    getGroups()
      .then(data => {
        const groupList = data.groups || data || []
        const enriched = groupList.map(group => ({
          ...group,
          teams: (group.teams || []).map(t => ({
            ...t,
            team_id: String(t.team_id),
          })),
        }))
        setGroups(enriched)
        setCache(enriched)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  const getTeamInfo = (teamId) => {
    const id = String(teamId)
    return teams[id] || null
  }

  return { groups, loading, getTeamInfo }
}