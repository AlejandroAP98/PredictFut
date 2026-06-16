const API_BASE = 'https://worldcup26.ir'

const STADIUM_TIMEZONES = {
  '1': 'America/Mexico_City',
  '2': 'America/Mexico_City',
  '3': 'America/Monterrey',
  '4': 'America/Chicago',
  '5': 'America/Chicago',
  '6': 'America/Chicago',
  '7': 'America/New_York',
  '8': 'America/New_York',
  '9': 'America/New_York',
  '10': 'America/New_York',
  '11': 'America/New_York',
  '12': 'America/Toronto',
  '13': 'America/Vancouver',
  '14': 'America/Los_Angeles',
  '15': 'America/Los_Angeles',
  '16': 'America/Los_Angeles',
}

async function fetchAPI(endpoint, token = null) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${endpoint}`, { headers })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function getMatches(token) {
  const data = await fetchAPI('/get/games', token)
  return (data.games || []).map(match => ({
    ...match,
    kickoff_utc: parseMatchToUTC(match),
  }))
}

export async function getMatchById(matchId, token) {
  const data = await fetchAPI(`/get/game/${matchId}`, token)
  return data.game || null
}

export async function getTeams(token) {
  return await fetchAPI('/get/teams', token)
}

export async function getGroups(token) {
  return await fetchAPI('/get/groups', token)
}

export async function getStadiums(token) {
  return await fetchAPI('/get/stadiums', token)
}

function parseMatchToUTC(match) {
  const [datePart, timePart] = match.local_date.split(' ')
  const [month, day, year] = datePart.split('/')
  const [hour, minute] = timePart.split(':')

  const tz = STADIUM_TIMEZONES[match.stadium_id] || 'America/New_York'

  const isoLocal = `${year}-${month}-${day}T${hour}:${minute}:00`

  const naiveDate = new Date(isoLocal + 'Z')

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(naiveDate)

  const getPart = (type) => {
    const part = parts.find(p => p.type === type)
    return part ? part.value.padStart(2, '0') : '00'
  }

  const tzYear = getPart('year')
  const tzMonth = getPart('month')
  const tzDay = getPart('day')
  const tzHour = getPart('hour')
  const tzMinute = getPart('minute')
  const tzSecond = getPart('second')

  const tzIso = `${tzYear}-${tzMonth}-${tzDay}T${tzHour}:${tzMinute}:${tzSecond}Z`
  const tzAsDate = new Date(tzIso)

  const offsetMs = tzAsDate.getTime() - naiveDate.getTime()

  return new Date(naiveDate.getTime() - offsetMs)
}

export function formatDateKey(date) {
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

export function getMatchDateKeyInUserTimezone(match) {
  if (!match || !match.kickoff_utc) return ''
  return formatDateKey(match.kickoff_utc)
}

export function isMatchLocked(match) {
  if (match.finished === 'TRUE' || match.time_elapsed !== 'notstarted') {
    return true
  }
  const kickoff = match.kickoff_utc instanceof Date ? match.kickoff_utc : new Date(match.kickoff_utc)
  return new Date() >= kickoff
}

export function calculatePredictionScore(prediction, actualHome, actualAway) {
  const predHome = parseInt(prediction.home_score)
  const predAway = parseInt(prediction.away_score)

  // Validación de seguridad
  if (isNaN(predHome) || isNaN(predAway)) return 0

  let score = 0

  // Cálculos base
  const predDiff = predHome - predAway
  const actualDiff = actualHome - actualAway

  // 1. Acierto de Tendencia (Ganador o Empate) - 5 Puntos
  const sameTrend = 
    (predDiff > 0 && actualDiff > 0) || // Ganó Local
    (predDiff < 0 && actualDiff < 0) || // Ganó Visitante
    (predDiff === 0 && actualDiff === 0) // Empate
    
  if (sameTrend) {
    score += 5
  }

  // 2. Acierto de Goles Individuales - 1 Punto por equipo
  const exactHome = predHome === actualHome
  const exactAway = predAway === actualAway
  
  if (exactHome) score += 1
  if (exactAway) score += 1

  // 3. Acierto de Diferencia de Goles - 1 Punto
  // Solo aplicable si acertaron la diferencia (Ej: Predijo 2-0 y quedó 3-1)
  if (predDiff === actualDiff) {
    score += 1
  }

  // 4. Bono de Pleno Exacto - 2 Puntos extra
  if (exactHome && exactAway) {
    score += 2
  }

  return score
}