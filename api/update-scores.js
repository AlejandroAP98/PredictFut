import { createClient } from '@supabase/supabase-js'

const API_BASE = 'https://worldcup26.ir'

function calcScore(pred, actualHome, actualAway) {
  const a = parseInt(pred.home_score)
  const b = parseInt(pred.away_score)
  if (isNaN(a) || isNaN(b)) return 0

  let score = 0

  const predDiff = a - b
  const actualDiff = actualHome - actualAway

  const sameTrend =
    (predDiff > 0 && actualDiff > 0) ||
    (predDiff < 0 && actualDiff < 0) ||
    (predDiff === 0 && actualDiff === 0)

  if (sameTrend) score += 5

  const exactHome = a === actualHome
  const exactAway = b === actualAway

  if (exactHome) score += 1
  if (exactAway) score += 1

  if (predDiff === actualDiff) score += 1

  if (exactHome && exactAway) score += 2

  return score
}

export default async function handler(req) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    return new Response(JSON.stringify({ error: 'Missing credentials' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const [matchesRes, predsRes] = await Promise.all([
      fetch(`${API_BASE}/get/games`).then(r => r.json()),
      supabase.from('predictions').select('*'),
    ])

    const matches = matchesRes.games || []
    const finished = matches.filter(m => m.finished === 'TRUE')
    const userScores = {}

    for (const pred of predsRes.data || []) {
      const match = finished.find(m => m.id === pred.match_id)
      if (!match) continue
      const aH = parseInt(match.home_score)
      const aA = parseInt(match.away_score)
      if (isNaN(aH) || isNaN(aA)) continue
      const pts = calcScore(pred, aH, aA)
      if (!userScores[pred.user_id]) userScores[pred.user_id] = { total: 0, match_scores: {} }
      userScores[pred.user_id].total += pts
      userScores[pred.user_id].match_scores[pred.match_id] = pts
    }

    for (const [userId, data] of Object.entries(userScores)) {
      await supabase.from('scores').upsert({
        user_id: userId,
        total_points: data.total,
        match_scores: data.match_scores,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
    }

    return new Response(JSON.stringify({ ok: true, users: Object.keys(userScores).length }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    })
  }
}
