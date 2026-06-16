import { useState, useRef, useEffect } from 'react'

export default function ScoreRulesTooltip() {
  const [isOpen, setIsOpen] = useState(false)
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
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-600 transition-colors cursor-pointer bg-transparent border-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-shirt-sport" height={20} strokeWidth={2} width={20} viewBox="0 0 24 24"><path fill="none" stroke="none" d="M0 0h24v24H0z" /><path d="m15 4 6 2v5h-3v8a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-8H3V6l6-2a3 3 0 0 0 6 0" /><path d="M10.5 11H13l-1.5 5" /></svg>
        <span className="hidden sm:inline">Sistema de Puntaje</span>
      </button>

      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="arrow absolute -top-1 right-4 w-2 h-2 bg-white border-t border-l border-gray-200 rotate-45" />

          <h4 className="font-bold text-gray-800 text-sm mb-3">Sistema de Puntuación</h4>

          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5">
              <span className="shrink-0 w-7 h-6 rounded-md bg-emerald-100 text-emerald-600 font-bold text-xs flex items-center justify-center mt-0.5">+5</span>
              <span className="text-xs text-gray-600"><strong className="text-gray-800">Tendencia:</strong> Acertar ganador o empate.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="shrink-0 w-7 h-6 rounded-md bg-emerald-100 text-emerald-600 font-bold text-xs flex items-center justify-center mt-0.5">+1</span>
              <span className="text-xs text-gray-600"><strong className="text-gray-800">Goles Local:</strong> Acertar goles del local.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="shrink-0 w-7 h-6 rounded-md bg-emerald-100 text-emerald-600 font-bold text-xs flex items-center justify-center mt-0.5">+1</span>
              <span className="text-xs text-gray-600"><strong className="text-gray-800">Goles Visita:</strong> Acertar goles del visitante.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="shrink-0 w-7 h-6 rounded-md bg-emerald-100 text-emerald-600 font-bold text-xs flex items-center justify-center mt-0.5">+1</span>
              <span className="text-xs text-gray-600"><strong className="text-gray-800">Diferencia:</strong> Acertar diferencia de goles.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="shrink-0 w-7 h-6 rounded-md bg-yellow-100 text-yellow-600 font-bold text-xs flex items-center justify-center mt-0.5">+2</span>
              <span className="text-xs text-gray-600"><strong className="text-gray-800">Bono Pleno:</strong> Marcador exacto.</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-gray-100">
            <p className="text-xs text-gray-400"><strong className="text-gray-500">Máximo 10 pts</strong> por partido.</p>
          </div>
        </div>
      )}
    </div>
  )
}
