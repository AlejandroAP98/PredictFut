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

function calcSkillBonus(skillId, skillConfig, baseScore, pred, actualHome, actualAway) {
  const a = parseInt(pred.home_score)
  const b = parseInt(pred.away_score)
  if (isNaN(a) || isNaN(b)) return 0

  const predDiff = a - b
  const actualDiff = actualHome - actualAway
  const sameTrend = (predDiff > 0 && actualDiff > 0) || (predDiff < 0 && actualDiff < 0) || (predDiff === 0 && actualDiff === 0)
  const exactHome = a === actualHome
  const exactAway = b === actualAway

  switch (skillId) {
    case 'var_shield': {
      const team = skillConfig?.team
      if (team === 'home' && !exactHome && Math.abs(a - actualHome) === 1) return 1
      if (team === 'away' && !exactAway && Math.abs(b - actualAway) === 1) return 1
      return 0
    }
    case 'trend_insurance': {
      if (!sameTrend && actualDiff === 0) return 2
      return 0
    }
    case 'local_visitor_bonus': {
      const team = skillConfig?.team
      if (team === 'home' && exactHome) return 2
      if (team === 'away' && exactAway) return 2
      return 0
    }
    case 'haramball': {
      if ((actualHome === 1 && actualAway === 0) || (actualHome === 0 && actualAway === 1)) return 3
      return 0
    }
    case 'futbol_champagne': {
      if (actualHome + actualAway >= 5) return 3
      return 0
    }
    case 'double_impact': {
      return baseScore
    }
    case 'hurricane_eye': {
      if (!sameTrend) return 5
      return 0
    }
    default: return 0
  }
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
    const [matchesRes, predsRes, skillsRes] = await Promise.all([
      fetch(`${API_BASE}/get/games`).then(r => r.json()),
      supabase.from('predictions').select('*'),
      supabase.from('user_skills').select('*').in('status', ['equipped', 'consumed']),
    ])

    const matches = matchesRes.games || []
    const finished = matches.filter(m => m.finished === 'TRUE')
    const finishedMap = new Map(finished.map(m => [m.id, m]))
    const userScores = {}
    const userSkillBonuses = {}

    const equippedByUserMatch = {}
    for (const skill of skillsRes.data || []) {
      if (!equippedByUserMatch[skill.user_id]) equippedByUserMatch[skill.user_id] = {}
      equippedByUserMatch[skill.user_id][skill.match_id] = skill
    }

    for (const pred of predsRes.data || []) {
      const match = finishedMap.get(pred.match_id)
      if (!match) continue
      const aH = parseInt(match.home_score)
      const aA = parseInt(match.away_score)
      if (isNaN(aH) || isNaN(aA)) continue

      const pts = calcScore(pred, aH, aA)
      if (!userScores[pred.user_id]) {
        userScores[pred.user_id] = { total: 0, match_scores: {}, skill_bonuses: {} }
      }

      let bonus = 0
      const equipped = equippedByUserMatch[pred.user_id]?.[pred.match_id]
      if (equipped) {
        const config = typeof equipped.skill_config === 'string' ? JSON.parse(equipped.skill_config) : (equipped.skill_config || {})
        bonus = calcSkillBonus(equipped.skill_id, config, pts, pred, aH, aA)
      }

      userScores[pred.user_id].total += pts + bonus
      userScores[pred.user_id].match_scores[pred.match_id] = pts + bonus
      if (bonus > 0) {
        userScores[pred.user_id].skill_bonuses[pred.match_id] = bonus
      }
    }

    const finishedMatchIds = new Set(finished.map(m => m.id))

    const spinsRes = await supabase
      .from('daily_spins')
      .select('user_id, points_spent')

    const spentByUser = {}
    for (const row of (spinsRes.data || [])) {
      spentByUser[row.user_id] = (spentByUser[row.user_id] || 0) + (row.points_spent || 0)
    }

    for (const [userId, data] of Object.entries(userScores)) {
      const pointsSpent = spentByUser[userId] || 0
      await supabase.from('scores').upsert({
        user_id: userId,
        total_points: data.total - pointsSpent,
        match_scores: data.match_scores,
        skill_bonuses: data.skill_bonuses,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
    }

    const skillIdsToConsume = (skillsRes.data || [])
      .filter(s => s.status === 'equipped' && finishedMatchIds.has(s.match_id))
      .map(s => s.id)

    if (skillIdsToConsume.length > 0) {
      await supabase
        .from('user_skills')
        .update({ status: 'consumed' })
        .in('id', skillIdsToConsume)
    }

    return new Response(JSON.stringify({ ok: true, users: Object.keys(userScores).length, skillsConsumed: skillIdsToConsume.length }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    })
  }
}