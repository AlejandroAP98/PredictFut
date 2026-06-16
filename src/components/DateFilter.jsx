import { formatDateKey } from '../lib/api'
import { useRef, useEffect } from 'react'

export default function DateFilter({ dates, selectedDate, onDateChange, todayMatches }) {
  const today = formatDateKey(new Date())
  const scrollRef = useRef(null)
  const selectedRef = useRef(null)

  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [selectedDate])

  return (
    <div className="relative z-10">
      <div className="flex items-center gap-1 mb-2">
        <span className="text-xs text-gray-900 uppercase tracking-wider">Filtrar por fecha</span>
        {todayMatches > 0 && selectedDate !== today && (
          <span className="text-xs text-emerald-600">({todayMatches} hoy)</span>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex items-center gap-1.5 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <button
          onClick={() => onDateChange(today)}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 border ${
            selectedDate === today
              ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200 scale-105'
              : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-300 hover:text-emerald-600'
          }`}
        >
          <span className="flex items-center gap-2">
            Hoy
            {todayMatches > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                selectedDate === today ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
              }`}>
                {todayMatches}
              </span>
            )}
          </span>
        </button>

        {dates.map(date => {
          const isToday = date === today
          return (
            <button
              key={date}
              ref={selectedDate === date ? selectedRef : null}
              onClick={() => onDateChange(date)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
                selectedDate === date
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200 scale-105'
                  : isToday
                    ? 'bg-white text-gray-800 border-gray-300 hover:border-emerald-400'
                    : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600'
              }`}
            >
              <div className="flex flex-col items-center leading-tight">
                <span className="text-[10px] uppercase opacity-60">
                  {new Date(date + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'short' })}
                </span>
                <span className="text-base">
                  {new Date(date + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
