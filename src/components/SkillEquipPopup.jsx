import { useState } from 'react'
import { SKILL_CATALOG, RARITY_COLORS, RARITY_LABELS, RARITY_GLOW } from '../lib/skills'
import SkillIcon from './SkillIcon'

export default function SkillEquipPopup({ inventory, matchId, homeName, awayName, onEquip, onClose }) {
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [teamChoice, setTeamChoice] = useState(null)
  const [step, setStep] = useState('list')
  const [equipping, setEquipping] = useState(false)

  const handleSelect = (skill) => {
    const info = SKILL_CATALOG.find(s => s.id === skill.skill_id)
    if (info?.requiresTeamChoice) {
      setSelectedSkill(skill)
      setStep('team')
      setTeamChoice(null)
    } else {
      setSelectedSkill(skill)
      setStep('confirm')
    }
  }

  const doEquip = async (skill, team) => {
    setEquipping(true)
    await onEquip(skill.id, matchId, team)
    setEquipping(false)
    onClose()
  }

  const handleBack = () => {
    setSelectedSkill(null)
    setTeamChoice(null)
    setStep('list')
  }

  const info = selectedSkill ? SKILL_CATALOG.find(s => s.id === selectedSkill.skill_id) : null
  const colors = info ? RARITY_COLORS[info.rarity] : null

  return (
    <div className="fixed inset-0 z-50  flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-xl" />
      <div
        className="relative bg-white sm:-top-1 rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm animate-slideUp overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-4 py-1 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-800">
            {step === 'list' ? 'Equipar habilidad' : step === 'team' ? 'Elegir equipo' : 'Confirmar'}
          </h3>
          <button onClick={step === 'list' ? onClose : handleBack} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
            {step === 'list' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            )}
          </button>
        </div>

        <div className="p-2">
          {step === 'list' && (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {inventory.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Sin habilidades disponibles</p>
              ) : (
                inventory.map(skill => {
                  const sInfo = SKILL_CATALOG.find(s => s.id === skill.skill_id)
                  if (!sInfo) return null
                  const sColors = RARITY_COLORS[sInfo.rarity]
                  return (
                    <button
                      key={skill.id}
                      onClick={() => handleSelect(skill)}
                      className={`flex items-center gap-2 cursor-pointer py-1 px-2 rounded-xl text-left w-full transition-all border-2 ${sColors.border} ${sColors.bg}  active:scale-[0.98]`}
                    >
                      <SkillIcon icon={sInfo.icon} size={24} className={`shrink-0 ${sColors.text} `} />
                      <div className="min-w-0 flex-1">
                        <div className={`text-xs font-bold ${sColors.text} truncate`}>{sInfo.name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${sColors.bg} ${sColors.text} border ${sColors.border}`}>
                            {RARITY_LABELS[sInfo.rarity]}
                          </span>
                        </div>
                      </div>
                      {sInfo.requiresTeamChoice && (
                        <span className="text-[9px] text-gray-400 shrink-0">Elegir equipo</span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          )}

          {step === 'team' && info && (
            <div className="flex flex-col gap-3">
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${colors?.border} ${colors?.bg}`}>
                <SkillIcon icon={info.icon} size={24} className={`shrink-0 ${colors?.text}`} />
                <div>
                  <p className={`font-bold text-xs ${colors?.text}`}>{info.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Selecciona el equipo</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setTeamChoice('home'); setStep('confirm') }}
                  className="py-3 px-1 rounded-xl cursor-pointer text-xs  font-bold bg-emerald-50 text-emerald-700 border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100 transition-all"
                >
                 {homeName || 'Local'}
                </button>
                <button
                  onClick={() => { setTeamChoice('away'); setStep('confirm') }}
                  className="py-3 px-2 rounded-xl cursor-pointer text-xs font-bold bg-blue-50 text-blue-700 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-100 transition-all"
                >
                  {awayName || 'Visita'}
                </button>
              </div>
            </div>
          )}

          {step === 'confirm' && info && (
            <div className="flex flex-col gap-2">
              <div className={`flex items-center gap-3 p-2 rounded-xl border-2 ${colors?.border} ${colors?.bg} ${RARITY_GLOW[info.rarity] || ''}`}>
                <SkillIcon icon={info.icon} size={24} className={`${colors?.text} shrink-0`} />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold ${colors?.text}`}>{info.name}</p>
                  <div className="flex items-center justify-between gap-1.5 mt-0.5">
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${colors?.bg} ${colors?.text} border ${colors?.border}`}>
                      {RARITY_LABELS[info.rarity]}
                    </span>
                    {teamChoice && (
                    <p className="text-[10px] text-gray-500 mt-1">
                      Equipo: <strong>{teamChoice === 'home' ? homeName || 'Local' : awayName || 'Visita'}</strong>
                    </p>
                  )}
                  </div>
                </div>
              </div>
              <p className="text-xs px-2 text-gray-500">{info.description}</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => teamChoice ? doEquip(selectedSkill, teamChoice) : doEquip(selectedSkill, null)}
                  disabled={equipping}
                  className="py-2.5 rounded-xl cursor-pointer text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  {equipping ? 'Equipando...' : 'Confirmar'}
                </button>
                <button
                  onClick={handleBack}
                  className="py-2.5 rounded-xl cursor-pointer text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}