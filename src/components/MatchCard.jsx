import { useState, useEffect } from 'react'

const TYPE_BADGES = {
  group: 'bg-emerald-50 text-black border-emerald-200',
  r32: 'bg-purple-50 text-purple-700 border-purple-200',
  r16: 'bg-purple-50 text-purple-700 border-purple-200',
  qf: 'bg-orange-50 text-orange-700 border-orange-200',
  sf: 'bg-red-50 text-red-700 border-red-200',
  third: 'bg-amber-50 text-amber-700 border-amber-200',
  final: 'bg-yellow-50 text-yellow-700 border-yellow-300',
}

const TYPE_LABELS = {
  group: 'Group Stage',
  r32: 'Round of 32',
  r16: 'Round of 16',
  qf: 'Quarter Final',
  sf: 'Semi Final',
  third: '3rd Place',
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

  if (days > 0) return <span className="text-gray-400 text-[10px] sm:text-xs">{days}d {hours}h</span>
  if (hours > 0) return <span className="text-emerald-600 text-[10px] sm:text-xs font-medium">{hours}h {mins}m</span>
  return <span className="text-emerald-600 text-[10px] sm:text-xs font-medium animate-pulse">{mins}m</span>
}

export default function MatchCard({ match, prediction, score, locked, onPredictionChange, getFlag, getName }) {
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
          <span className="text-gray-800 font-semibold text-[11px] sm:text-sm whitespace-nowrap">{timeStr}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {isLive && (
            <span className="flex items-center gap-1 bg-red-50 border border-red-200 text-red-600 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold animate-pulse shrink-0">
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-red-500 rounded-full"></span>
              LIVE
            </span>
          )}
          {!isFinished && !isLive && !isTBD && (
            <Countdown kickoff={kickoff} />
          )}
          {getScoreBadge()}
        </div>
      </div>

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
                <input
                  type="number"
                  min="0" max="20"
                  value={prediction.home_score}
                  onChange={(e) => onPredictionChange(match.id, e.target.value, prediction.away_score)}
                  disabled={locked}
                  className={`w-14 sm:w-16 h-12 sm:h-14 text-center text-xl sm:text-2xl font-score font-bold rounded-xl border-2 transition-all ${
                    !locked && !isTBD
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
                  disabled={locked}
                  className={`w-14 sm:w-16 h-12 sm:h-14 text-center text-xl sm:text-2xl font-score font-bold rounded-xl border-2 transition-all ${
                    !locked && !isTBD
                      ? 'bg-white border-gray-300 text-emerald-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none'
                      : 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
                  }`}
                  placeholder="-"
                />
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
        {locked && !isFinished && !isTBD && (
          <div className="text-center mt-3">
            <span className="text-[10px] sm:text-xs bg-red-50 text-red-500 px-3 py-1 rounded-full border border-red-100">
              Predictions locked - match in progress
            </span>
          </div>
        )}
        {isFinished && score !== undefined && score > 0 && (
          <div className="text-center mt-2">
            <span className="text-[10px] sm:text-xs text-emerald-600">+{score} points</span>
          </div>
        )}
      </div>
    </div>
  )
}
