import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useAutoSavePredictions(userId, predictions, delay = 1500) {
  const timeoutRef = useRef(null)
  const prevPredictionsRef = useRef({})

  const savePredictions = useCallback(async () => {
    const predictionsToSave = Object.entries(predictions)
      .filter(([matchId, pred]) => {
        const prev = prevPredictionsRef.current[matchId]
        return !prev || prev.home_score !== pred.home_score || prev.away_score !== pred.away_score
      })
      .map(([matchId, pred]) => ({
        user_id: userId,
        match_id: matchId,
        home_score: pred.home_score,
        away_score: pred.away_score,
      }))

    if (predictionsToSave.length === 0) return

    const { error } = await supabase
      .from('predictions')
      .upsert(predictionsToSave, { onConflict: 'user_id,match_id' })

    if (!error) {
      prevPredictionsRef.current = JSON.parse(JSON.stringify(predictions))
    }
  }, [userId, predictions])

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(() => {
      savePredictions()
    }, delay)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [predictions, delay, savePredictions])
}
