import { useState, useEffect, useRef } from 'react'

const CACHE_KEY = 'wc2026_teams_v1'
const CACHE_TTL = 24 * 60 * 60 * 1000

const API_BASE = 'https://worldcup26.ir'

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

export function useTeams() {
  const [teams, setTeams] = useState(() => getCached() || {})
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const cached = getCached()
    if (cached) setTeams(cached)

    fetch(`${API_BASE}/get/teams`)
      .then(r => r.json())
      .then(data => {
        const teamList = data.teams || data
        const map = {}
        teamList.forEach(t => {
          map[t.id] = {
            name: t.name_en,
            flag: t.flag,
            fifa: t.fifa_code,
            group: t.groups,
          }
        })
        setTeams(map)
        setCache(map)
      })
      .catch(() => {})
  }, [])

  return {
    teams,
    getTeam: (id) => teams[id] || null,
    getFlag: (id) => teams[id]?.flag || null,
    getName: (id) => teams[id]?.name || null,
  }
}
