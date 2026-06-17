import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { MAX_DAILY_SPINS, SPIN_COSTS } from '../lib/skills'

function getTodayDate() {
  return new Date().toISOString().split('T')[0]
}

export function useSkills(userId) {
  const [skills, setSkills] = useState([])
  const [spinsUsed, setSpinsUsed] = useState(0)
  const [pointsSpent, setPointsSpent] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchSkills = useCallback(async () => {
    if (!userId) return
    try {
      const [skillsRes, todaySpinsRes, allSpinsRes] = await Promise.all([
        supabase
          .from('user_skills')
          .select('*')
          .eq('user_id', userId)
          .order('acquired_at', { ascending: false }),
        supabase
          .from('daily_spins')
          .select('*')
          .eq('user_id', userId)
          .eq('spin_date', getTodayDate())
          .maybeSingle(),
        supabase
          .from('daily_spins')
          .select('points_spent')
          .eq('user_id', userId),
      ])
      setSkills(skillsRes.data || [])
      setSpinsUsed(todaySpinsRes.data?.spins_used ?? 0)
      const totalSpent = (allSpinsRes.data || []).reduce((sum, r) => sum + (r.points_spent || 0), 0)
      setPointsSpent(totalSpent)
    } catch {
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetchSkills() }, [fetchSkills])

  const spin = useCallback(async () => {
    const { data, error } = await supabase.rpc('execute_spin')
    if (error) return { ok: false, error: error.message }
    const result = typeof data === 'string' ? JSON.parse(data) : data
    if (result.ok) await fetchSkills()
    return result
  }, [fetchSkills])

  const equipSkill = useCallback(async (userSkillId, matchId, teamChoice) => {
    const { data, error } = await supabase.rpc('equip_skill', {
      p_user_skill_id: userSkillId,
      p_match_id: matchId,
      p_team_choice: teamChoice || null,
    })
    if (!error) await fetchSkills()
    const result = typeof data === 'string' ? JSON.parse(data) : data
    return { data: result, error: error?.message }
  }, [fetchSkills])

  const unequipSkill = useCallback(async (userSkillId) => {
    const { data, error } = await supabase.rpc('unequip_skill', {
      p_user_skill_id: userSkillId,
    })
    if (!error) await fetchSkills()
    const result = typeof data === 'string' ? JSON.parse(data) : data
    return { data: result, error: error?.message }
  }, [fetchSkills])

  const discardSkill = useCallback(async (userSkillId) => {
    const { error } = await supabase
      .from('user_skills')
      .delete()
      .eq('id', userSkillId)
      .eq('user_id', userId)
    if (!error) await fetchSkills()
    return { error: error?.message }
  }, [userId, fetchSkills])

  const inventory = useMemo(() => skills.filter(s => s.status === 'inventory'), [skills])
  const equipped = useMemo(() => skills.filter(s => s.status === 'equipped'), [skills])
  const totalActive = inventory.length + equipped.length
  const spinsRemaining = Math.max(0, MAX_DAILY_SPINS - spinsUsed)
  const nextSpinCost = spinsUsed < MAX_DAILY_SPINS ? SPIN_COSTS[spinsUsed + 1] : null

  const equippedByMatch = useMemo(() => {
    const map = {}
    for (const s of equipped) {
      if (s.match_id) map[s.match_id] = s
    }
    return map
  }, [equipped])

  return {
    skills,
    inventory,
    equipped,
    totalActive,
    equippedByMatch,
    spinsUsed,
    spinsRemaining,
    nextSpinCost,
    pointsSpent,
    loading,
    spin,
    equipSkill,
    unequipSkill,
    discardSkill,
    refetch: fetchSkills,
  }
}