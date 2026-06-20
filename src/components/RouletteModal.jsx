import { useState, useEffect, useCallback, useRef } from 'react'
import { SKILL_CATALOG, RARITY_COLORS, RARITY_LABELS, RARITY_GLOW, MAX_INVENTORY_SIZE } from '../lib/skills'
import SkillIcon from './SkillIcon'
import RewardIcon from '../assets/icons/RewardIcon'
import GiftIcon from '../assets/icons/GiftIcon'

const ANIMATION_MS = 3200

const STAGES = {
  IDLE: 'idle',
  LOADING: 'loading',
  RESULT: 'result',
}

export default function RouletteModal({ isOpen, onClose, onSpin, spinsRemaining, nextSpinCost, totalPoints, inventory, equipped, totalActive, onDiscard }) {
  const [stage, setStage] = useState(STAGES.IDLE)
  const [result, setResult] = useState(null)
  const [spinError, setSpinError] = useState(null)
  const [activeTab, setActiveTab] = useState('spin')
  const [lastCost, setLastCost] = useState(0)
  const claimRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      setStage(STAGES.IDLE)
      setResult(null)
      setSpinError(null)
      setActiveTab('spin')
      setLastCost(0)
      if (claimRef.current) clearTimeout(claimRef.current)
    }
  }, [isOpen])

  const handleClaim = useCallback(async () => {
    setSpinError(null)
    setResult(null)
    setStage(STAGES.LOADING)

    const startTime = Date.now()
    const spinResult = await onSpin()
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, ANIMATION_MS - elapsed)

    await new Promise(resolve => {
      claimRef.current = setTimeout(resolve, remaining)
    })
    claimRef.current = null

    if (!spinResult || !spinResult.ok) {
      setSpinError(spinResult?.error || 'Error al reclamar recompensa')
      setStage(STAGES.IDLE)
      return
    }

    const wonSkill = SKILL_CATALOG.find(s => s.id === spinResult.skill_id)
    if (!wonSkill) {
      setSpinError('Skill not found')
      setStage(STAGES.IDLE)
      return
    }

    setLastCost(spinResult.cost || 0)
    setResult({ skill: wonSkill })
    setStage(STAGES.RESULT)
  }, [onSpin])

  if (!isOpen) return null

  const canSpin = spinsRemaining > 0 && totalActive < MAX_INVENTORY_SIZE && (nextSpinCost === 0 || totalPoints >= (nextSpinCost || 0))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white flex flex-col rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm h-auto overflow-y-auto animate-slideUp"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="font-bold text-lg text-gray-800">Recompensa Diaria</h2>
            <button onClick={onClose} className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-x" height={24} strokeWidth={1.5} width={24} viewBox="0 0 24 24"><path fill="none" stroke="none" d="M0 0h24v24H0z"/><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
          </div>
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab('spin')}
              className={`flex-1 py-2.5 flex gap-1 cursor-pointer items-center justify-center text-sm font-semibold transition-colors ${activeTab === 'spin' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-bolt" height={24} strokeWidth={1.5} width={24} viewBox="0 0 24 24"><path fill="none" stroke="none" d="M0 0h24v24H0z"/><path d="M13 3v7h6l-8 11v-7H5z"/></svg>
              <span>Habilidades</span>
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 py-2.5 flex gap-1 cursor-pointer items-center justify-center text-sm font-semibold transition-colors ${activeTab === 'inventory' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-backpack" height={24} strokeWidth={1.5} width={24} viewBox="0 0 24 24"><path fill="none" stroke="none" d="M0 0h24v24H0z"/><path d="M5 18v-6a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3m5-12V5a2 2 0 1 1 4 0v1"/><path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4m-4-11h2"/></svg>
              <span>Inventario  ({totalActive}/{MAX_INVENTORY_SIZE})</span>
            </button>
          </div>
        </div>

        <div className="p-4 h-full flex flex-col justify-center ">
          {activeTab === 'spin' && (
            <div className="flex flex-col items-center gap-4">
              
              <div className="flex items-center gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg px-3 py-1.5 text-center">
                  <div className="font-bold text-lg font-score text-emerald-600">{spinsRemaining}</div>
                  <div className="text-gray-500 text-[10px] uppercase tracking-wide">Reclamos restantes</div>
                </div>
                <div className="bg-gray-50 rounded-lg px-3 py-1.5 text-center">
                  <div className="font-bold text-lg font-score text-amber-600">{totalPoints}</div>
                  <div className="text-gray-500 text-[10px] uppercase tracking-wide">Puntos</div>
                </div>
              </div>
              
              {stage === STAGES.IDLE && (
                <div className="w-full rounded-xl bg-linear-to-b from-gray-900 via-gray-800 to-gray-900 border border-gray-700 flex flex-col items-center justify-center py-12 gap-4">
                  <GiftIcon size={64} />
                </div>
              )}
              {stage === STAGES.LOADING && (
                <div className="w-full rounded-xl bg-linear-to-b from-gray-900 via-gray-800 to-gray-900 border border-gray-700 flex flex-col items-center justify-center py-12 gap-4">
                  <RewardIcon size={64} />
                </div>
              )}

              {stage === STAGES.RESULT && result?.skill && (
                <div className={`w-full rounded-xl p-4 border-2 animate-pudding ${RARITY_COLORS[result.skill.rarity]?.border || 'border-gray-300'} ${RARITY_COLORS[result.skill.rarity]?.bg || 'bg-gray-100'} ${RARITY_GLOW[result.skill.rarity] || ''}`}>
                  
                  <div className="flex items-center gap-3">
                    <SkillIcon icon={result.skill.icon} size={36} className={` ${RARITY_COLORS[result.skill.rarity]?.text || 'text-gray-800'}`}/>
                    <div className="min-w-0 flex-1">
                      <div className={`font-bold text-base ${RARITY_COLORS[result.skill.rarity]?.text || 'text-gray-800'}`}>
                        {result.skill.name}
                      </div>
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${RARITY_COLORS[result.skill.rarity]?.bg || 'bg-gray-200'} ${RARITY_COLORS[result.skill.rarity]?.text || 'text-gray-600'}`}>
                        {RARITY_LABELS[result.skill.rarity]}
                      </span>
                    </div>
                    {lastCost > 0 && (
                      <div className="text-right">
                        <div className="text-xs text-gray-400">Costo</div>
                        <div className="font-bold text-amber-600 font-score">-{lastCost}</div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{result.skill.description}</p>
                </div>
              )}

              {spinError && (
                <div className="w-full bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2 text-center">
                  {spinError === 'Daily spin limit reached' ? 'Límite diario alcanzado (5/5)' :
                  spinError === 'Inventory full' ? 'Límite de 5 habilidades activas. Gasta o descarta una primero.' :
                  spinError === 'Insufficient points' ? 'Puntos insuficientes :(' :
                  spinError}
                </div>
              )}

              {stage === STAGES.IDLE && (
                
                <button
                  onClick={handleClaim}
                  disabled={!canSpin}
                  className={`w-full py-3 cursor-pointer rounded-xl font-bold text-sm transition-all ${
                    canSpin
                      ? 'bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-200/50 active:scale-95'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {spinsRemaining <= 0 ? 'Sin reclamos hoy :(' : totalActive >= MAX_INVENTORY_SIZE ? 'Límite de 5 habilidades' : nextSpinCost > 0 ? `Reclamar ( -${nextSpinCost} puntos )` : '¡Reclama tu recompensa!'}
                </button>
              )}
              {stage === STAGES.LOADING && (
                <button disabled className="w-full py-3 rounded-xl font-bold text-sm bg-gray-300 text-gray-500 cursor-wait animate-pulse">
                  Procesando...
                </button>
              )}
              {stage === STAGES.RESULT && result && (
                <button
                  onClick={() => {
                    setResult(null)
                    setSpinError(null)
                    if (spinsRemaining > 0 && totalActive < MAX_INVENTORY_SIZE) {
                      setStage(STAGES.IDLE)
                    } else {
                      setActiveTab('inventory')
                      setStage(STAGES.IDLE)
                    }
                  }}
                  className="w-full py-3 rounded-xl cursor-pointer font-bold text-sm bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-200/50 active:scale-95 transition-all"
                >
                  {spinsRemaining > 0 ? '¡Reclama otro! :)' : 'Ver inventario'}
                </button>
              )}

              <div className="w-full">
                <p className="text-[11px] text-gray-400 text-center">
                  Reclamos: 1° gratis · 2° -2 pts · 3° -4 pts · 4° -6 pts · 5° -8 pts · Máximo 5 por día
                </p>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="flex flex-col gap-3">
              {equipped.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                    Equipadas
                  </h3>
                  <div className="flex flex-col gap-2">
                    {equipped.map(skill => {
                      const info = SKILL_CATALOG.find(s => s.id === skill.skill_id)
                      if (!info) return null
                      const colors = RARITY_COLORS[info.rarity]
                      return (
                         <div key={skill.id} className={`flex items-center p-3 rounded-xl border-2 ${colors.border} ${colors.bg} ${RARITY_GLOW[info.rarity] || ''}`}>
                           <div className="flex items-center gap-2.5 min-w-0">
                             <SkillIcon icon={info.icon} size={36} className={` ${colors.text} `} />
                             <div className="min-w-0">
                               <div className={`text-sm font-bold ${colors.text} truncate`}>{info.name}</div>
                               <div className="flex items-center gap-1.5 mt-0.5">
                                 <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                                   {RARITY_LABELS[info.rarity]}
                                 </span>
                                 <span className="text-[10px] text-gray-400">Partido: {skill.match_id?.slice(-6)}</span>
                               </div>
                             </div>
                           </div>
                         </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div>
                {inventory.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">Sin habilidades en inventario.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {inventory.map(skill => {
                      const info = SKILL_CATALOG.find(s => s.id === skill.skill_id)
                      if (!info) return null
                      const colors = RARITY_COLORS[info.rarity]
                      return (
                        <div key={skill.id} className={`flex items-center justify-between p-3 rounded-xl border ${colors.border} ${colors.bg}`}>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <SkillIcon icon={info.icon} size={32} className={` ${colors.text} `} />
                            <div className="min-w-0">
                              <div className={`text-sm font-bold ${colors.text} truncate`}>{info.name}</div>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full inline-block mt-0.5 ${colors.bg} ${colors.text} border ${colors.border}`}>
                                {RARITY_LABELS[info.rarity]}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => onDiscard(skill.id)}
                            className="text-xs text-gray-400 hover:text-red-500 transition-colors shrink-0 p-2 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-200"
                            title="Descartar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {totalActive >= MAX_INVENTORY_SIZE && (
                <p className="text-[11px] text-amber-700 text-center">Límite de 5 habilidades activas. Gasta o descarta para reclamar de nuevo.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}