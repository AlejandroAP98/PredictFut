import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useAutoSavePredictions(userId, predictions, delay = 1500) {
  const timeoutRef = useRef(null)
  const prevPredictionsRef = useRef({})
  const predictionsRef = useRef(predictions)
  predictionsRef.current = predictions

  const savePredictions = useCallback(async () => {
    const current = predictionsRef.current
    const changed = Object.entries(current)
      .filter(([matchId, pred]) => {
        const prev = prevPredictionsRef.current[matchId]
        return !prev || prev.home_score !== pred.home_score || prev.away_score !== pred.away_score
      })

    const toUpsert = changed
      .filter(([, pred]) => pred.home_score !== '' && pred.away_score !== '')
      .map(([matchId, pred]) => ({
        user_id: userId,
        match_id: matchId,
        home_score: pred.home_score,
        away_score: pred.away_score,
      }))

    const removedKeys = Object.keys(prevPredictionsRef.current)
      .filter(matchId => !(matchId in current))

    const toDelete = changed
      .filter(([, pred]) => pred.home_score === '' && pred.away_score === '')
      .map(([matchId]) => matchId)
      .concat(removedKeys)

    if (toUpsert.length > 0 || toDelete.length > 0) {
      const nextPrev = JSON.parse(JSON.stringify(current))
      prevPredictionsRef.current = nextPrev
    }

    if (toUpsert.length > 0) {
      await supabase
        .from('predictions')
        .upsert(toUpsert, { onConflict: 'user_id,match_id' })
    }

    if (toDelete.length > 0) {
      await supabase
        .from('predictions')
        .delete()
        .eq('user_id', userId)
        .in('match_id', toDelete)
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
