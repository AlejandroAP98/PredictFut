import { useState, useEffect, useCallback, useRef } from 'react'
import { getMatches, getMatchDateKeyInUserTimezone, formatDateKey } from '../lib/api'

const CACHE_KEY = 'wc2026_matches_v2'
const CACHE_TTL = 12 * 60 * 60 * 1000
const POLL_INTERVAL = 5 * 60 * 1000

function getCachedMatches() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, timestamp } = JSON.parse(raw)
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    return data.map(m => ({ ...m, kickoff_utc: new Date(m.kickoff_utc) }))
  } catch {
    return null
  }
}

function setCachedMatches(data) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
}

function hasScoresChanged(fresh, cached) {
  if (!cached) return true
  const cachedMap = {}
  cached.forEach(m => { cachedMap[m.id] = m })
  for (const freshMatch of fresh) {
    const cachedMatch = cachedMap[freshMatch.id]
    if (!cachedMatch) return true
    if (freshMatch.home_score !== cachedMatch.home_score ||
        freshMatch.away_score !== cachedMatch.away_score ||
        freshMatch.finished !== cachedMatch.finished ||
        freshMatch.time_elapsed !== cachedMatch.time_elapsed) {
      return true
    }
  }
  return false
}

export function useMatches() {
  const [allMatches, setAllMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const initialized = useRef(false)

  const fetchMatches = useCallback(async (forceUpdate = false) => {
    try {
      const freshMatches = await getMatches()
      const cached = getCachedMatches()

      if (!cached) {
        setCachedMatches(freshMatches)
        setAllMatches(freshMatches)
      } else if (forceUpdate || hasScoresChanged(freshMatches, cached)) {
        const merged = freshMatches.map(fresh => {
          const cachedMatch = cached.find(c => c.id === fresh.id)
          if (!cachedMatch) return fresh
          return {
            ...cachedMatch,
            home_score: fresh.home_score,
            away_score: fresh.away_score,
            finished: fresh.finished,
            time_elapsed: fresh.time_elapsed,
            kickoff_utc: fresh.kickoff_utc,
          }
        })
        setCachedMatches(merged)
        setAllMatches(merged)
      }

      setError(null)
    } catch (err) {
      console.error('Error fetching matches:', err)
      const cached = getCachedMatches()
      if (cached) setAllMatches(cached)
      else setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const cached = getCachedMatches()
    if (cached) {
      setAllMatches(cached)
      setLoading(false)
    }

    fetchMatches(true)
  }, [fetchMatches])

  useEffect(() => {
    let interval = null

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
    }

    const startPolling = () => {
      stopPolling()
      interval = setInterval(() => fetchMatches(false), POLL_INTERVAL)
    }

    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling()
      } else {
        fetchMatches(false)
        startPolling()
      }
    }

    startPolling()
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      stopPolling()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [fetchMatches])

  const getMatchesByDate = useCallback((dateKey) => {
    if (!dateKey) return []
    return allMatches.filter(m => getMatchDateKeyInUserTimezone(m) === dateKey)
  }, [allMatches])

  const getAllDates = useCallback(() => {
    const dates = new Set()
    allMatches.forEach(m => {
      const key = getMatchDateKeyInUserTimezone(m)
      if (key) dates.add(key)
    })
    return Array.from(dates).sort()
  }, [allMatches])

  return {
    allMatches,
    loading,
    error,
    fetchMatches,
    getMatchesByDate,
    getAllDates,
  }
}
