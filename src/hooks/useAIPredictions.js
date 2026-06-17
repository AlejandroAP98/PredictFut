import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AI_BONUS_POINTS = 3

function generateRandomScore() {
  return {
    home_score: Math.floor(Math.random() * 4),
    away_score: Math.floor(Math.random() * 4),
  }
}

export function useAIPredictions(userId) {
  const [predictions, setPredictions] = useState({})
  const [loading, setLoading] = useState(true)

  const fetchPredictions = useCallback(async () => {
    if (!userId) return
    try {
      const { data, error } = await supabase
        .from('ai_predictions')
        .select('*')
        .eq('user_id', userId)

      if (error) throw error

      const map = {}
      data?.forEach(p => {
        map[p.match_id] = { home_score: p.home_score, away_score: p.away_score }
      })
      setPredictions(map)
    } catch (err) {
      console.error('Error fetching AI predictions:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetchPredictions() }, [fetchPredictions])

  const generate = useCallback(async (matchId) => {
    if (!userId || !matchId) return null

    const { home_score, away_score } = generateRandomScore()

    try {
      const { data, error } = await supabase
        .from('ai_predictions')
        .upsert(
          { user_id: userId, match_id: matchId, home_score, away_score },
          { onConflict: 'user_id,match_id' }
        )
        .select()
        .single()

      if (error) throw error

      setPredictions(prev => ({
        ...prev,
        [matchId]: { home_score, away_score },
      }))

      return { home_score, away_score }
    } catch (err) {
      console.error('Error generating AI prediction:', err)
      return null
    }
  }, [userId])

  const getPrediction = useCallback((matchId) => {
    return predictions[matchId] || null
  }, [predictions])

  const calculateBonuses = useCallback((finishedMatches, baseScores) => {
    const bonuses = {}
    let total = 0

    for (const match of finishedMatches) {
      const pred = predictions[match.id]
      if (!pred) continue
      const actualHome = parseInt(match.home_score)
      const actualAway = parseInt(match.away_score)
      if (isNaN(actualHome) || isNaN(actualAway)) continue

      if (pred.home_score === actualHome && pred.away_score === actualAway) {
        bonuses[match.id] = AI_BONUS_POINTS
        total += AI_BONUS_POINTS
      }
    }

    return { bonuses, total }
  }, [predictions])

  const cancel = useCallback(async (matchId) => {
    if (!userId || !matchId) return false

    try {
      const { error } = await supabase
        .from('ai_predictions')
        .delete()
        .eq('user_id', userId)
        .eq('match_id', matchId)

      if (error) throw error

      setPredictions(prev => {
        const next = { ...prev }
        delete next[matchId]
        return next
      })

      return true
    } catch (err) {
      console.error('Error cancelling AI prediction:', err)
      return false
    }
  }, [userId])

  return {
    predictions,
    loading,
    generate,
    cancel,
    getPrediction,
    calculateBonuses,
    AI_BONUS_POINTS,
  }
}