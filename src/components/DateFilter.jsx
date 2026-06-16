import { formatDateKey } from '../lib/api'
import { useRef, useEffect, useCallback } from 'react'

export default function DateFilter({ dates, selectedDate, onDateChange, todayMatches }) {
  const today = formatDateKey(new Date())
  const scrollRef = useRef(null)
  const selectedRef = useRef(null)

  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [selectedDate])

  const scroll = useCallback((direction) => {
    if (!scrollRef.current) return
    const amount = scrollRef.current.offsetWidth * 0.6
    scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }, [])

  return (
    <div className="relative z-10">
      <button
            onClick={() => onDateChange(today)}
            className={`px-1 py-2 rounded-sm text-xs font-semibold whitespace-nowrap transition-all duration-200  ${
              selectedDate === today
                ? 'text-gray-500 cursor-default  '
                : ' text-white  hover:text-emerald-600 cursor-pointer underline  '
            }`}
          >
            <span className="flex items-center gap-2">
              Ir a hoy
              {todayMatches > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedDate === today ? 'bg-white text-emerald-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {todayMatches}
                </span>
              )}
            </span>
          </button>
      <div className="relative group">
        <button
          onClick={() => scroll('left')}
          className="flex absolute cursor-pointer left-0 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-8 h-8 rounded-full bg-white/90 border border-gray-200 shadow-md text-gray-500 hover:text-emerald-600 hover:border-emerald-300 hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100"
          aria-label="Anterior"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>

        <div
          ref={scrollRef}
          className="flex items-center gap-1.5 overflow-x-auto pb-2 px-0 sm:px-10"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          

          {dates.map(date => {
            const isToday = date === today
            return (
              <button
                key={date}
                ref={selectedDate === date ? selectedRef : null}
                onClick={() => onDateChange(date)}
                className={`px-4 py-2.5 cursor-pointer rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
                  selectedDate === date
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200 scale-105'
                    : isToday
                      ? 'bg-white cursor-pointer text-gray-800 border-gray-300 hover:border-emerald-400'
                      : 'bg-white cursor-pointer text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600'
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

        <button
          onClick={() => scroll('right')}
          className="flex absolute cursor-pointer right-0 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-8 h-8 rounded-full bg-white/90 border border-gray-200 shadow-md text-gray-500 hover:text-emerald-600 hover:border-emerald-300 hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100"
          aria-label="Siguiente"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
  )
}
