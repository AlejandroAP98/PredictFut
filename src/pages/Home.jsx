import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { formatDateKey, isMatchLocked, calculatePredictionScore } from '../lib/api'
import { calculateSkillBonus } from '../lib/skills'
import { useMatches } from '../hooks/useMatches'
import { useTeams } from '../hooks/useTeams'
import { useAutoSavePredictions } from '../hooks/useAutoSavePredictions'
import { useSkills } from '../hooks/useSkills'
import MatchCard from '../components/MatchCard'
import DateFilter from '../components/DateFilter'
import Leaderboard from '../components/Leaderboard'
import RouletteModal from '../components/RouletteModal'
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
  const [skillBonuses, setSkillBonuses] = useState({})
  const [totalPoints, setTotalPoints] = useState(0)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showRoulette, setShowRoulette] = useState(false)
  const [loading, setLoading] = useState(true)
  const lastSavedRef = useRef({ points: -1, scores: '{}', bonuses: '{}' })

  const {
    inventory, equipped, totalActive, equippedByMatch, spinsRemaining, nextSpinCost,
    pointsSpent, spin, equipSkill, unequipSkill, discardSkill, refetch: refetchSkills,
  } = useSkills(user.id)

  useAutoSavePredictions(user.id, predictions)

  const fetchUserData = useCallback(async () => {
    try {
      const [predsRes, scoresRes] = await Promise.all([
        supabase
          .from('predictions')
          .select('*')
          .eq('user_id', user.id),
        supabase
          .from('scores')
          .select('match_scores, skill_bonuses')
          .eq('user_id', user.id)
          .maybeSingle(),
      ])

      const predMap = {}
      predsRes.data?.forEach(p => {
        predMap[p.match_id] = { home_score: p.home_score, away_score: p.away_score }
      })
      setPredictions(predMap)

      if (scoresRes.data?.skill_bonuses) {
        setSkillBonuses(scoresRes.data.skill_bonuses)
      }
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
    const newBonuses = { ...skillBonuses }
    let tp = 0

    for (const match of finishedMatches) {
      const aH = parseInt(match.home_score), aA = parseInt(match.away_score)
      const pred = predictions[match.id]
      if (pred && !isNaN(aH) && !isNaN(aA)) {
        const baseScore = calculatePredictionScore(pred, aH, aA)
        newScores[match.id] = baseScore
        tp += baseScore
      }
    }

    for (const skill of equipped) {
      if (skill.status === 'equipped' && skill.match_id && newScores[skill.match_id] !== undefined) {
        const pred = predictions[skill.match_id]
        const match = finishedMatches.find(m => m.id === skill.match_id)
        if (!pred || !match) continue
        const aH = parseInt(match.home_score), aA = parseInt(match.away_score)
        if (isNaN(aH) || isNaN(aA)) continue
        const config = typeof skill.skill_config === 'string' ? JSON.parse(skill.skill_config) : (skill.skill_config || {})
        const bonus = calculateSkillBonus(skill.skill_id, config, newScores[skill.match_id], pred, aH, aA)
        if (bonus > 0) {
          newBonuses[skill.match_id] = bonus
        }
      }
    }

    for (const [matchId, bonus] of Object.entries(newBonuses)) {
      if (newScores[matchId] !== undefined) {
        tp += bonus
      }
    }

    tp -= pointsSpent

    setScores(newScores)
    setTotalPoints(tp)

    const scoresStr = JSON.stringify(newScores)
    const bonusesStr = JSON.stringify(newBonuses)
    if (tp !== lastSavedRef.current.points || scoresStr !== lastSavedRef.current.scores || bonusesStr !== lastSavedRef.current.bonuses) {
      lastSavedRef.current = { points: tp, scores: scoresStr, bonuses: bonusesStr }
      ;(async () => {
        await supabase.from('scores').upsert({
          user_id: user.id, total_points: tp, match_scores: newScores,
          skill_bonuses: newBonuses, updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

        const finishedMatchIds = new Set(finishedMatches.map(m => m.id))
        const skillsToConsume = equipped.filter(s => s.status === 'equipped' && finishedMatchIds.has(s.match_id))
        if (skillsToConsume.length > 0) {
          const ids = skillsToConsume.map(s => s.id)
          await supabase.from('user_skills').update({ status: 'consumed' }).in('id', ids)
          refetchSkills()
        }
      })()
    }
  }, [allMatches, matchesLoading, predictions, equipped, skillBonuses, pointsSpent, refetchSkills])

  const handlePredictionChange = (matchId, homeScore, awayScore) => {
    setPredictions(prev => ({ ...prev, [matchId]: { home_score: homeScore, away_score: awayScore } }))
  }

  const handleEquipSkill = async (userSkillId, matchId, teamChoice) => {
    const result = await equipSkill(userSkillId, matchId, teamChoice)
    if (result.error) {
      alert(result.error === 'Already have a skill for this match' ? 'Ya tienes una habilidad equipada para este partido.' : result.error)
    }
  }

  const handleUnequipSkill = async (userSkillId) => {
    await unequipSkill(userSkillId)
  }

  const handleSpin = async () => {
    return await spin()
  }

  const handleDiscard = async (skillId) => {
    await discardSkill(skillId)
  }

  const filteredMatches = getMatchesByDate(selectedDate)
  const dates = getAllDates()
  const userDisplayName = user.user_metadata?.name || user.email
  const todayDateKey = formatDateKey(new Date())
  const todayMatches = getMatchesByDate(todayDateKey).length
  const predictionCount = Object.keys(predictions).filter(k => predictions[k].home_score !== '' && predictions[k].away_score !== '').length
  const scoredMatches = Object.values(scores).filter(s => s > 0).length
  const totalSkillBonuses = Object.entries(skillBonuses).reduce((sum, [mid, b]) => {
    return scores[mid] !== undefined ? sum + b : sum
  }, 0)

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

      <header className="sticky top-0 z-50 backdrop-blur-xl bg-linear-to-b from-white/90 via-white/70 to-white/0 border-b border-emerald-200/70">
        <div className="max-w-6xl mx-auto px-4 py-2 flex justify-between w-full">
          <div className="flex items-center gap-2 shrink-0">
            <img src={Logo} alt="WC2026 Logo" className="h-8 w-auto" />
            <div>
              <h1 className="text-lg font-bold text-emerald-700 leading-tight">PredictFut</h1>
            </div>
          </div>
          <div className="flex items-center sm:gap-2 gap-1 w-full justify-end">
            <button
              onClick={() => setShowRoulette(true)}
              className="bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 cursor-pointer px-2 py-2 sm:px-2 sm:py-2.5 rounded-xl text-sm font-bold transition-all duration-200 text-white shadow-md shadow-amber-200/50 flex items-center gap-1.5"
            >
              <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-star" height={20} strokeWidth={1.5} width={20} viewBox="0 0 24 24"><path fill="none" stroke="none" d="M0 0h24v24H0z"/><path d="m12 17.75-6.172 3.245 1.179-6.873-5-4.867 6.9-1 3.086-6.253 3.086 6.253 6.9 1-5 4.867 1.179 6.873z"/></svg>
              <span className="inline">Skills</span>
            </button>
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="bg-white cursor-pointer hover:bg-emerald-50 px-2 py-1.5 sm:px-2 sm:py-2 rounded-xl text-sm font-medium transition-all duration-200 text-gray-600 flex items-center gap-1.5"
            >
              {showLeaderboard ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-calendar" height={24} strokeWidth={1} width={24} viewBox="0 0 24 24"><path fill="none" stroke="none" d="M0 0h24v24H0z"/><path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm12-4v4M8 3v4m-4 4h16m-9 4h1m0 0v3"/></svg>
                  <span className="inline">Partidos</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-scoreboard" height={24} strokeWidth={1} width={24} viewBox="0 0 24 24"><path fill="none" stroke="none" d="M0 0h24v24H0z"/><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm9-2v2m0 3v1m0 3v1m0 3v1M7 3v2m10-2v2"/><path d="M15 10.5v3a1.5 1.5 0 0 0 3 0v-3a1.5 1.5 0 0 0-3 0M6 9h1.5a1.5 1.5 0 0 1 0 3H7h.5a1.5 1.5 0 0 1 0 3H6"/></svg>
                  <span className="inline">Ranking</span>
                </>
              )}
            </button>
            <button
              onClick={() => signOut()}
              className="bg-white cursor-pointer hover:bg-red-50 px-2 py-2.5 sm:px-2 sm:py-2.5 rounded-xl text-sm transition-all duration-200  text-gray-500 hover:text-red-500 flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-2 relative z-10">
        {showLeaderboard ? (
          <Leaderboard currentUserId={user.id} />
        ) : (
          <>
          <div className="flex flex-col items-center w-full justify-between gap-1">
            <div className="grid grid-cols-3 gap-2 sm:w-1/2">
              <div className="bg-white/60 backdrop-blur-sm rounded-lg px-3 py-1.5 text-center border border-gray-200">
                <div className="text-amber-600 font-bold text-lg font-score leading-tight">{totalPoints}{totalSkillBonuses > 0 ? <span className="text-amber-400 text-xs"> (+{totalSkillBonuses})</span> : null}</div>
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

            <div className="mb-4">
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
                  <span className="flex items-end justify-center gap-2">
                    <span className="text-gray-800 font-bold text-md">Hoy</span>
                    <span className="px-2 py-0.5 text-xs bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200">
                      {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </span>
                ) : (
                  new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                )}
              </h2>
              <div className="flex items-center gap-2">
                <ScoreRulesTooltip />
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
                      skillBonus={skillBonuses[match.id] || 0}
                      locked={isMatchLocked(match)}
                      onPredictionChange={handlePredictionChange}
                      getFlag={getFlag}
                      getName={getName}
                      equippedSkill={equippedByMatch[match.id]}
                      inventory={inventory}
                      onEquipSkill={handleEquipSkill}
                      onUnequipSkill={handleUnequipSkill}
                    />
                  </div>
                ))}
              </div>
            )}

          </>
        )}
      </main>

      <RouletteModal
        isOpen={showRoulette}
        onClose={() => setShowRoulette(false)}
        onSpin={handleSpin}
        spinsRemaining={spinsRemaining}
        nextSpinCost={nextSpinCost}
        totalPoints={totalPoints}
        inventory={inventory}
        equipped={equipped}
        totalActive={totalActive}
        onDiscard={handleDiscard}
        onUnequip={handleUnequipSkill}
      />
    </div>
  )
}