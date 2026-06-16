import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { formatDateKey, isMatchLocked, calculatePredictionScore } from '../lib/api'
import { useMatches } from '../hooks/useMatches'
import { useTeams } from '../hooks/useTeams'
import { useAutoSavePredictions } from '../hooks/useAutoSavePredictions'
import MatchCard from '../components/MatchCard'
import DateFilter from '../components/DateFilter'
import Leaderboard from '../components/Leaderboard'
import LoaderIcon from '../assets/icons/LoaderIcon.tsx'
import ScoreRulesTooltip from '../components/ScoreRulesTooltip'
import Logo from '../assets/Logo.svg'

export default function Home() {
  const { user, signOut } = useAuth()
  const { allMatches, loading: matchesLoading, getMatchesByDate, getAllDates } = useMatches()
  const { getFlag, getName } = useTeams()
  const [predictions, setPredictions] = useState({})
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()))
  const [scores, setScores] = useState({})
  const [totalPoints, setTotalPoints] = useState(0)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [loading, setLoading] = useState(true)
  const lastSavedRef = useRef({ points: -1, scores: '{}' })

  useAutoSavePredictions(user.id, predictions)

  const fetchUserData = useCallback(async () => {
    try {
      const { data: preds } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', user.id)

      const predMap = {}
      preds?.forEach(p => {
        predMap[p.match_id] = { home_score: p.home_score, away_score: p.away_score }
      })
      setPredictions(predMap)
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => { fetchUserData() }, [fetchUserData])

  useEffect(() => {
    if (matchesLoading) return
    const finishedMatches = allMatches.filter(m => m.finished === 'TRUE')
    if (finishedMatches.length === 0) return

    const newScores = {}
    let tp = 0

    for (const match of finishedMatches) {
      const aH = parseInt(match.home_score), aA = parseInt(match.away_score)
      const pred = predictions[match.id]
      if (pred && !isNaN(aH) && !isNaN(aA)) {
        const pts = calculatePredictionScore(pred, aH, aA)
        newScores[match.id] = pts
        tp += pts
      }
    }

    setScores(newScores)
    setTotalPoints(tp)

    const scoresStr = JSON.stringify(newScores)
    if (tp !== lastSavedRef.current.points || scoresStr !== lastSavedRef.current.scores) {
      lastSavedRef.current = { points: tp, scores: scoresStr }
      ;(async () => {
        await supabase.from('scores').upsert({
          user_id: user.id, total_points: tp, match_scores: newScores,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
      })()
    }
  }, [allMatches, matchesLoading, predictions])

  const handlePredictionChange = (matchId, homeScore, awayScore) => {
    setPredictions(prev => ({ ...prev, [matchId]: { home_score: homeScore, away_score: awayScore } }))
  }

  const filteredMatches = getMatchesByDate(selectedDate)
  const dates = getAllDates()
  const userDisplayName = user.user_metadata?.name || user.email
  const todayDateKey = formatDateKey(new Date())
  const todayMatches = getMatchesByDate(todayDateKey).length
  const predictionCount = Object.keys(predictions).filter(k => predictions[k].home_score !== '' && predictions[k].away_score !== '').length
  const scoredMatches = Object.values(scores).filter(s => s > 0).length

  if (loading || matchesLoading) {
    return (
      <div className="min-h-screen w-full relative flex items-center justify-center bg-white">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'radial-gradient(125% 125% at 50% 90%, #f5f5f5 10%, #10b981 100%)',
            backgroundSize: '100% 100%',
          }}
        />
        <div className="flex flex-col items-center gap-4 z-10">
          <LoaderIcon size={56} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-white relative">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'radial-gradient(125% 125% at 50% 90%, #ffffff 20%, #10b981 100%)',
          backgroundSize: '100% 100%',
        }}
      />

      <header className="sticky top-0 z-50 backdrop-blur-xl bg-linear-to-b from-white/90 via-white/70 to-white/0 border-b border-emerald-200/70 ">
        <div className="max-w-6xl mx-auto px-4 py-3 flex  justify-between w-full">
          <div className="flex items-center gap-2 shrink-0">
            <img src={Logo} alt="WC2026 Logo" className="h-8 w-auto" />
            <div>
              <h1 className="text-lg font-bold text-emerald-700 leading-tight">PredictFut</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full justify-end">
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="bg-white cursor-pointer hover:bg-emerald-50 px-4 py-2 sm:px-2 sm:py-2 rounded-xl text-sm font-medium transition-all duration-200 border border-gray-200 hover:border-emerald-200 text-gray-600 flex items-center gap-1.5"
            >
              {showLeaderboard ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-calendar" height={22} strokeWidth={1} width={22} viewBox="0 0 24 24"><path fill="none" stroke="none" d="M0 0h24v24H0z"/><path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm12-4v4M8 3v4m-4 4h16m-9 4h1m0 0v3"/></svg>
                  <span className="hidden sm:inline">Partidos</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-scoreboard" height={22} strokeWidth={1} width={22} viewBox="0 0 24 24"><path fill="none" stroke="none" d="M0 0h24v24H0z"/><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm9-2v2m0 3v1m0 3v1m0 3v1M7 3v2m10-2v2"/><path d="M15 10.5v3a1.5 1.5 0 0 0 3 0v-3a1.5 1.5 0 0 0-3 0M6 9h1.5a1.5 1.5 0 0 1 0 3H7h.5a1.5 1.5 0 0 1 0 3H6"/></svg>
                  <span className="hidden sm:inline">Ranking</span>
                </>
              )}
            </button>
            <button
              onClick={() => signOut()}
              className="bg-white cursor-pointer hover:bg-red-50 px-4 py-2.5 sm:px-2 sm:py-2 rounded-xl text-sm transition-all duration-200 border border-gray-200 hover:border-red-300 text-gray-500 hover:text-red-500 flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 relative z-10">
        {showLeaderboard ? (
          <Leaderboard currentUserId={user.id} />
        ) : (
          <>
          <div className="flex flex-col items-center w-full justify-between gap-1">
            <div className="grid grid-cols-3 gap-1 sm:w-1/2">
              <div className="bg-white/60 backdrop-blur-sm rounded-lg px-3 py-1.5 text-center border border-gray-200">
                <div className="text-amber-600 font-bold text-lg font-score leading-tight">{totalPoints}</div>
                <div className="text-amber-500 font-bold text-[10px] font-score uppercase tracking-wide">Puntos</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg px-3 py-1.5 text-center border border-gray-200">
                <div className="text-gray-800 font-bold text-lg font-score leading-tight">{predictionCount}</div>
                <div className="text-gray-600 font-bold text-[10px] font-score uppercase tracking-wide">Predicciones</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg px-3 py-1.5 text-center border border-gray-200">
                <div className="text-emerald-600 font-bold text-lg font-score leading-tight">{scoredMatches}</div>
                <div className="text-emerald-500 font-bold text-[10px] font-score uppercase tracking-wide">Aciertos</div>
              </div>
            </div>
            <span className="text-sm text-gray-800 font-medium font-score">{userDisplayName}</span>
          </div>
          
            <div className="mb-6">
              <DateFilter
                dates={dates}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                todayMatches={todayMatches}
              />
            </div>

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                {selectedDate === todayDateKey ? (
                  <span className="flex items-center gap-2">
                    <span className="text-gray-800 font-bold text-md">Hoy</span>
                    <span className="px-2 py-0.5 text-xs bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200">
                      {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </span>
                ) : (
                  new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                )}
              </h2>
              <div className="flex items-center gap-3">
                <ScoreRulesTooltip />
                <span className="text-sm text-gray-700">
                  {filteredMatches.length} partido{filteredMatches.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {filteredMatches.length === 0 ? (
              <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-3xl border border-gray-200">
                <p className="text-gray-500 text-lg font-medium">No hay partidos este dia</p>
                <p className="text-gray-400 text-sm mt-2">Selecciona otra fecha para ver los partidos</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMatches.map((match, i) => (
                  <div
                    key={match.id}
                    className="animate-fadeIn"
                    style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
                  >
                    <MatchCard
                      match={match}
                      prediction={predictions[match.id] || { home_score: '', away_score: '' }}
                      score={scores[match.id]}
                      locked={isMatchLocked(match)}
                      onPredictionChange={handlePredictionChange}
                      getFlag={getFlag}
                      getName={getName}
                    />
                  </div>
                ))}
              </div>
            )}

          </>
        )}
      </main>
    </div>
  )
}
