import { useState, useRef, useEffect } from 'react'
import HandOfGodIcon from '../assets/icons/HandOfGodIcon.tsx'
import DoubleImpactIcon from '../assets/icons/DoubleImpactIcon.tsx'
import SniperTargetIcon from '../assets/icons/SniperTargetIcon.tsx'
import TrendInsuranceIcon from '../assets/icons/TrendInsuranceIcon.tsx'
import VarShieldIcon from '../assets/icons/VarShieldIcon.tsx'
import HaramballIcon from '../assets/icons/HaramballIcon.tsx'
import FutbolChampagneIcon from '../assets/icons/FutbolChampagneIcon.tsx'

export default function ScoreRulesTooltip() {
  const [isOpen, setIsOpen] = useState(false)
  const [showSkills, setShowSkills] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-600 transition-colors cursor-pointer bg-transparent border-none"
      >
        <span className="inline underline underline-offset-2">Información</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-soccer-field" height={24} strokeWidth={1} width={24} viewBox="0 0 24 24"><path fill="none" stroke="none" d="M0 0h24v24H0z"/><path d="M9 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0M3 9h3v6H3zm15 0h3v6h-3z"/><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm9-2v14"/></svg>
      </button>

      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50"
        >
          <div className="arrow absolute -top-1 right-4 w-2 h-2 bg-white border-t border-l border-gray-200 rotate-45" />

          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setShowSkills(false)}
              className={`text-sm font-semibold transition-colors pb-1 ${!showSkills ? 'text-gray-800 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Habilidades
            </button>
            <button
              onClick={() => setShowSkills(true)}
              className={`text-sm font-semibold transition-colors pb-1 ${showSkills ? 'text-gray-800 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Puntajes
            </button>
          </div>

          {!showSkills ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <VarShieldIcon size={20} className="text-gray-400" />
                <div>
                  <span className="text-xs text-gray-600"><strong className="text-gray-800">Escudo VAR</strong> <span className="text-gray-400">20%</span></span>
                  <p className="text-[10px] text-gray-400">Perdona 1 gol de diferencia en un equipo.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendInsuranceIcon size={20} className="text-gray-400"/>
                <div>
                  <span className="text-xs text-gray-600"><strong className="text-gray-800">Pacto de Lima</strong> <span className="text-gray-400">20%</span></span>
                  <p className="text-[10px] text-gray-400">Si fallas y el partido es empate: +2 pts.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <SniperTargetIcon size={20} className="text-blue-500"/>
                <div>
                  <span className="text-xs text-gray-600"><strong className="text-gray-800">Francotirador</strong> <span className="text-blue-500">15%</span></span>
                  <p className="text-[10px] text-gray-400">+2 pts si aciertas goles del equipo elegido.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <HaramballIcon size={20} className="text-blue-500"/>
                <div>
                  <span className="text-xs text-gray-600"><strong className="text-gray-800">Haramball</strong> <span className="text-blue-500">15%</span></span>
                  <p className="text-[10px] text-gray-400">Si el partido queda 1-0 o 0-1: +3 pts.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FutbolChampagneIcon size={20} className="text-blue-500"/>
                <div>
                  <span className="text-xs text-gray-600"><strong className="text-gray-800">Fútbol champagne</strong> <span className="text-blue-500">15%</span></span>
                  <p className="text-[10px] text-gray-400">Si el partido tiene 5+ goles: +3 pts.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DoubleImpactIcon size={20} className="text-purple-500" />
                <div>
                  <span className="text-xs text-gray-600"><strong className="text-gray-800">Doblete</strong> <span className="text-purple-500">10%</span></span>
                  <p className="text-[10px] text-gray-400">Multiplica x2 el puntaje del partido.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <HandOfGodIcon size={20} className="text-amber-500"/>
                <div>
                  <span className="text-xs text-gray-600"><strong className="text-gray-800">La mano de Dios</strong> <span className="text-amber-500">5%</span></span>
                  <p className="text-[10px] text-gray-400">Asegura +5 pts de Tendencia.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-robot" height={20} strokeWidth={1.25} width={20} viewBox="0 0 24 24"><path fill="none" stroke="none" d="M0 0h24v24H0z"/><path d="M6 6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zm6-4v2m-3 8v9m6-9v9M5 16l4-2m6 0 4 2M9 18h6M10 8v.01M14 8v.01"/></svg>
                </div>
                <div>
                  <span className="text-xs text-gray-600"><strong className="text-gray-800">IA Dependencia</strong> <span className="text-emerald-500">Gratis</span></span>
                  <p className="text-[10px] text-gray-400">Genera un marcador aleatorio. Si coincide con el resultado final: +3 pts.</p>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-gray-100">
                <p className="text-[10px] text-gray-400"><strong className="text-gray-500">5 reclamos/día</strong> · 1° gratis · 2° -2 pts · 3° -4 pts · 4° -6 pts · 5° -8 pts · Máx 5 en inventario · 1 por partido</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="shrink-0 w-7 h-6 rounded-md bg-emerald-100 text-emerald-600 font-bold text-xs flex items-center justify-center mt-0.5">+5</span>
                <span className="text-xs text-gray-600"><strong className="text-gray-800">Tendencia:</strong> Acertar ganador o empate.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="shrink-0 w-7 h-6 rounded-md bg-emerald-100 text-emerald-600 font-bold text-xs flex items-center justify-center mt-0.5">+1</span>
                <span className="text-xs text-gray-600"><strong className="text-gray-800">Goles Local:</strong> Acertar goles del local.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="shrink-0 w-7 h-6 rounded-md bg-emerald-100 text-emerald-600 font-bold text-xs flex items-center justify-center mt-0.5">+1</span>
                <span className="text-xs text-gray-600"><strong className="text-gray-800">Goles Visita:</strong> Acertar goles del visitante.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="shrink-0 w-7 h-6 rounded-md bg-emerald-100 text-emerald-600 font-bold text-xs flex items-center justify-center mt-0.5">+1</span>
                <span className="text-xs text-gray-600"><strong className="text-gray-800">Diferencia:</strong> Acertar diferencia de goles.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="shrink-0 w-7 h-6 rounded-md bg-yellow-100 text-yellow-600 font-bold text-xs flex items-center justify-center mt-0.5">+2</span>
                <span className="text-xs text-gray-600"><strong className="text-gray-800">Bono Pleno:</strong> Marcador exacto.</span>
              </div>
              <div className="mt-3 pt-2.5 border-t border-gray-100">
                <p className="text-xs text-gray-400"><strong className="text-gray-500">Máximo 10 pts</strong> por partido.</p>
              </div>
            </div>
            
          )}
        </div>
      )}
    </div>
  )
}
