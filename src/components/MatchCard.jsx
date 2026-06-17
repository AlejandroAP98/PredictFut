import { useState, useEffect, useRef } from 'react'
import { SKILL_CATALOG, RARITY_COLORS, RARITY_LABELS, AI_PREDICTION_BONUS } from '../lib/skills'
import SkillEquipPopup from './SkillEquipPopup'
import SkillIcon from './SkillIcon'

const TYPE_BADGES = {
  group: 'bg-orange-300 text-white border-orange-300',
  r32: 'bg-purple-50 text-purple-700 border-purple-200',
  r16: 'bg-purple-50 text-purple-700 border-purple-200',
  qf: 'bg-orange-50 text-orange-700 border-orange-200',
  sf: 'bg-red-50 text-red-700 border-red-200',
  third: 'bg-amber-50 text-amber-700 border-amber-200',
  final: 'bg-yellow-50 text-yellow-700 border-yellow-300',
}

const TYPE_LABELS = {
  group: 'Grupos',
  r32: 'Octavos de Final',
  r16: 'Cuartos de Final',
  qf: 'Semifinales',
  sf: 'Final',
  third: 'Tercer lugar',
  final: 'FINAL',
}

function Countdown({ kickoff }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(id)
  }, [])

  const diff = kickoff - now
  if (diff <= 0) return <span className="text-red-500 text-[10px] sm:text-xs">En Juego</span>

  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)

  if (days > 0) return <span className="text-gray-400 text-[10px] sm:text-xs font-score font-semibold">{days}d {hours}h</span>
  if (hours > 0) return <span className="text-emerald-600 text-[10px] sm:text-xs font-semibold font-score ">{hours}h {mins}m</span>
  return <span className="text-emerald-600 text-[10px] sm:text-xs font-semibold font-score animate-pulse">{mins}m</span>
}

export default function MatchCard({ match, prediction, score, skillBonus, aiBonus, aiPrediction, locked, onPredictionChange, getFlag, getName, equippedSkill, inventory, onEquipSkill, onUnequipSkill, onGenerateAIPrediction, onCancelAIPrediction }) {
  const [showEquipPopup, setShowEquipPopup] = useState(false)
  const popupRef = useRef(null)

  useEffect(() => {
    if (!showEquipPopup) return
    function handleClickOutside(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) setShowEquipPopup(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showEquipPopup])
  const kickoff = match.kickoff_utc instanceof Date ? match.kickoff_utc : new Date(match.kickoff_utc)
  const timeStr = kickoff.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })
  const dateStr = kickoff.toLocaleDateString('es-CO', { weekday: 'short', month: 'short', day: 'numeric' })

  const homeId = match.home_team_id
  const awayId = match.away_team_id
  const homeFlag = getFlag ? getFlag(homeId) : null
  const awayFlag = getFlag ? getFlag(awayId) : null
  const homeName = getName ? getName(homeId) : (match.home_team_name_en || match.home_team_label || 'TBD')
  const awayName = getName ? getName(awayId) : (match.away_team_name_en || match.away_team_label || 'TBD')
  const group = match.group || ''
  const matchType = match.type || 'group'

  const isFinished = match.finished === 'TRUE'
  const isLive = !isFinished && match.time_elapsed !== 'notstarted'
  const actualHome = isFinished ? parseInt(match.home_score) : null
  const actualAway = isFinished ? parseInt(match.away_score) : null
  const predictionLocked = locked || !!aiPrediction

  const badgeColors = TYPE_BADGES[matchType] || TYPE_BADGES.group
  const typeLabel = TYPE_LABELS[matchType] || group

  const getScoreBadge = () => {
    if (score === undefined || score === null) return null
    if (score === 10) return (
      <div className="bg-emerald-500 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0">+10</div>
    )
    if (score === 5) return (
      <div className="bg-emerald-400 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0">+5</div>
    )
    if (score >= 3) return (
      <div className="bg-blue-500 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0">+{score}</div>
    )
    return (
      <div className="bg-gray-300 text-gray-600 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0">+{score}</div>
    )
  }

  const isTBD = !homeId || homeId === '0' || !awayId || awayId === '0'

  return (
    <div className={`bg-white rounded-xl border overflow-hidden transition-all duration-300 shadow-sm ${
      isLive ? 'border-red-300 shadow-lg shadow-red-100' :
      isFinished ? 'border-gray-200 opacity-90' :
      'border-gray-200 hover:shadow-md'
    }`}>
      <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 flex items-center justify-between border-b border-gray-100 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap min-w-0">
          <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold border shrink-0 ${badgeColors}`}>
            Grupo {matchType === 'group' ? group : typeLabel}
          </span>
          <span className="text-gray-500 text-[11px] sm:text-sm whitespace-nowrap">{dateStr}</span>
          <span className="text-gray-800 font-semibold font-score text-[11px] sm:text-sm whitespace-nowrap">{timeStr}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {isLive && (
            <span className="flex items-center gap-1 bg-red-50 border border-red-200 text-red-600 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold animate-pulse shrink-0">
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-red-500 rounded-full"></span>
              LIVE
            </span>
          )}
          {!isFinished && !isLive && !isTBD && (
            <>
            <span className="text-gray-400 sm:text-sm"><svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-alarm" height={20} strokeWidth={1.25} width={20} viewBox="0 0 24 24"><path fill="none" stroke="none" d="M0 0h24v24H0z"/><path d="M5 13a7 7 0 1 0 14 0 7 7 0 1 0-14 0"/><path d="M12 10v3h2M7 4 4.25 6M17 4l2.75 2"/></svg></span>
            <Countdown kickoff={kickoff} />
            </>
          )}
          {getScoreBadge()}
        </div>
      </div>
      {/* AI Dependencia section */}
      {!isTBD && !aiPrediction && !locked && !isFinished && prediction.home_score === '' && prediction.away_score === '' && (
        <div className="mt-1 w-full sm:w-fit sm:mx-6 sm:px-0 px-28 ">
          <button
            onClick={() => onGenerateAIPrediction && onGenerateAIPrediction(match.id)}
            className="w-full flex cursor-pointer items-center justify-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border border-dashed border-emerald-300 text-emerald-600 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50/50 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-robot" height={20} strokeWidth={1.25} width={20} viewBox="0 0 24 24"><path fill="none" stroke="none" d="M0 0h24v24H0z"/><path d="M6 6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zm6-4v2m-3 8v9m6-9v9M5 16l4-2m6 0 4 2M9 18h6M10 8v.01M14 8v.01"/></svg>
          <span className='text-xs'>IA Dependencia</span>
          </button>
        </div>
      )}
      {!isTBD && aiPrediction && !locked && !isFinished && (
        <div className="mt-1">
          <button
            onClick={() => onCancelAIPrediction && onCancelAIPrediction(match.id)}
            className="w-full flex cursor-pointer items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all"
          >
            <span className="flex items-center gap-1.5 text-xs">
              IA Dependencia activa
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-robot-off" height={20} strokeWidth={1.25} width={20} viewBox="0 0 24 24"><path fill="none" stroke="none" d="M0 0h24v24H0z"/><path d="M8 4h8a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2m-4 0H8a2 2 0 0 1-2-2V6m6-4v2m-3 8v9m6-6v6M5 16l4-2m0 4h6M14 8v.01M3 3l18 18"/></svg>
           </button>
        </div>
      )}
      {!isTBD && aiPrediction && (locked || isFinished) && (
        <div className="mt-2">
          <div className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold border ${
            isFinished && aiBonus > 0
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
              : 'border-gray-200 bg-gray-50 text-gray-500'
          }`}>
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-robot" height={20} strokeWidth={1.25} width={20} viewBox="0 0 24 24"><path fill="none" stroke="none" d="M0 0h24v24H0z"/><path d="M6 6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zm6-4v2m-3 8v9m6-9v9M5 16l4-2m6 0 4 2M9 18h6M10 8v.01M14 8v.01"/></svg>
              <span className='text-xs'>IA: {aiPrediction.home_score} - {aiPrediction.away_score}</span>
            </span>
            {isFinished && aiBonus > 0 ? (
              <span className="font-bold">+{AI_PREDICTION_BONUS} pts!</span>
            ) : isFinished ? (
              <span className="text-gray-400">Sin bono</span>
            ) : (
              <span className="text-gray-400">En espera</span>
            )}
          </div>
        </div>
      )}
      <div className="p-3 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex sm:flex-1 items-center justify-between sm:justify-end sm:gap-3 min-w-0">
            <div className="flex items-center gap-2 sm:flex-row-reverse min-w-0">
              <span className="font-bold text-md sm:text-lg text-gray-800 leading-tight truncate max-w-[120px] sm:max-w-none">{homeName}</span>
              {homeFlag && (
                <img
                  src={homeFlag}
                  alt={homeName}
                  className="w-10 h-8 sm:w-12 sm:h-8 rounded shadow-sm border border-gray-200 shrink-0"
                  loading="lazy"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-3 shrink-0">
            {isFinished ? (
              <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 rounded-xl px-4 sm:px-5 py-2 sm:py-3 border border-gray-100">
                <span className={`text-2xl sm:text-3xl font-score font-bold ${actualHome > actualAway ? 'text-gray-800' : 'text-gray-400'}`}>{actualHome}</span>
                <span className="text-base sm:text-lg text-gray-300 font-light">-</span>
                <span className={`text-2xl sm:text-3xl font-score font-bold ${actualAway > actualHome ? 'text-gray-800' : 'text-gray-400'}`}>{actualAway}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {aiPrediction && !isFinished ? (
                  <>
                    <div className="w-14 sm:w-16 h-12 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-score font-bold rounded-xl border-2 bg-purple-50 border-purple-300 text-purple-500">IA</div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-gray-300 text-[10px] sm:text-xs font-bold">VS</span>
                    </div>
                    <div className="w-14 sm:w-16 h-12 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-score font-bold rounded-xl border-2 bg-purple-50 border-purple-300 text-purple-500">IA</div>
                  </>
                ) : (
                  <>
                    <input
                      type="number"
                      min="0" max="20"
                      value={prediction.home_score}
                      onChange={(e) => onPredictionChange(match.id, e.target.value, prediction.away_score)}
                      disabled={predictionLocked}
                      className={`w-14 sm:w-16 h-12 sm:h-14 text-center text-xl sm:text-2xl font-score font-bold rounded-xl border-2 transition-all ${
                        !predictionLocked && !isTBD
                          ? 'bg-white border-gray-300 text-emerald-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none'
                          : 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
                      }`}
                      placeholder="-"
                    />
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-gray-300 text-[10px] sm:text-xs font-bold">VS</span>
                      {isTBD && <span className="text-gray-300 text-[8px] sm:text-[10px]">TBD</span>}
                    </div>
                    <input
                      type="number"
                      min="0" max="20"
                      value={prediction.away_score}
                      onChange={(e) => onPredictionChange(match.id, prediction.home_score, e.target.value)}
                      disabled={predictionLocked}
                      className={`w-14 sm:w-16 h-12 sm:h-14 text-center text-xl sm:text-2xl font-score font-bold rounded-xl border-2 transition-all ${
                        !predictionLocked && !isTBD
                          ? 'bg-white border-gray-300 text-emerald-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none'
                          : 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
                      }`}
                      placeholder="-"
                    />
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex sm:flex-1 items-center justify-between sm:justify-start sm:gap-3 min-w-0">
            <div className="flex items-center gap-2 min-w-0 ml-auto sm:ml-0">
              {awayFlag && (
                <img
                  src={awayFlag}
                  alt={awayName}
                  className="w-10 h-8 sm:w-12 sm:h-8 rounded shadow-sm border border-gray-200 shrink-0"
                  loading="lazy"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              )}
              <span className="font-bold text-md sm:text-lg text-gray-800 text-right sm:text-left leading-tight truncate max-w-[120px] sm:max-w-none">{awayName}</span>
            </div>
          </div>
        </div>

        {isTBD && (
          <div className="text-center mt-3">
            <span className="text-[10px] sm:text-xs bg-gray-100 text-gray-400 px-3 py-1 rounded-full">Teams to be determined</span>
          </div>
        )}
        {predictionLocked && !isFinished && !isTBD && (
          <div className="text-center mt-3">
            <span className="text-[10px] sm:text-xs bg-red-50 text-red-500 px-3 py-1 rounded-full border border-red-100">
              {locked ? 'Predictions locked - match in progress' : 'IA Dependencia'}
            </span>
          </div>
        )}
        {isFinished && score !== undefined && score > 0 && (
          <div className="text-center mt-2">
            <span className="text-[10px] sm:text-xs text-emerald-600">+{score + (skillBonus || 0) + (aiBonus || 0)} points{skillBonus > 0 ? ` (+${skillBonus} habilidad)` : ''}{aiBonus > 0 ? ` (+${aiBonus} IA)` : ''}</span>
          </div>
        )}
        {!predictionLocked && !isFinished && !isTBD && (
          <div className="mt-2 relative" ref={popupRef}>
            {equippedSkill ? (() => {
              const skillInfo = SKILL_CATALOG.find(s => s.id === equippedSkill.skill_id)
              const colors = skillInfo ? RARITY_COLORS[skillInfo.rarity] : RARITY_COLORS.common
              const skillConfig = equippedSkill.skill_config || {}
              const teamLabel = skillConfig.team === 'home' ? 'Local' : skillConfig.team === 'away' ? 'Visita' : ''
              return (
                <button
                  onClick={() => onUnequipSkill && onUnequipSkill(equippedSkill.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${colors.border} ${colors.bg} ${colors.text} hover:opacity-80`}
                >
                  <span className="flex items-center gap-1.5">
                    <SkillIcon icon={skillInfo?.icon} size={14} />
                    <span>{skillInfo?.name}{teamLabel ? ` → ${teamLabel}` : ''}</span>
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 hover:opacity-100"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )
            })() : inventory && inventory.length > 0 ? (
              <div className="relative">
                <button
                  onClick={() => setShowEquipPopup(!showEquipPopup)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed border-gray-300 text-gray-400 hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50/50 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14m-7-7h14"/></svg>
                  Equipar habilidad
                </button>
                {showEquipPopup && (
                  <SkillEquipPopup
                    inventory={inventory}
                    matchId={match.id}
                    homeName={homeName}
                    awayName={awayName}
                    onEquip={onEquipSkill}
                    onClose={() => setShowEquipPopup(false)}
                  />
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
