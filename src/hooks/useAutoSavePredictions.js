import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useAutoSavePredictions(userId, predictions, delay = 1500) {
  const timeoutRef = useRef(null)
  const prevPredictionsRef = useRef({})
  const predictionsRef = useRef(predictions)
  predictionsRef.current = predictions

  const savePredictions = useCallback(async () => {
    const current = predictionsRef.current
    const toUpsert = Object.entries(current)
      .filter(([, pred]) => pred.home_score !== '' || pred.away_score !== '')
      .filter(([matchId, pred]) => {
        const prev = prevPredictionsRef.current[matchId]
        if (!prev) return true
        return prev.home_score !== pred.home_score || prev.away_score !== pred.away_score
      })
      .map(([matchId, pred]) => ({
        user_id: userId,
        match_id: matchId,
        home_score: pred.home_score === '' ? 0 : pred.home_score,
        away_score: pred.away_score === '' ? 0 : pred.away_score,
      }))

    if (toUpsert.length > 0) {
      const { error } = await supabase
        .from('predictions')
        .upsert(toUpsert, { onConflict: 'user_id,match_id' })

      if (!error) {
        prevPredictionsRef.current = JSON.parse(JSON.stringify(current))
      }
    }
  }, [userId])

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

export async function deletePrediction(userId, matchId) {
  await supabase
    .from('predictions')
    .delete()
    .eq('user_id', userId)
    .eq('match_id', matchId)
}