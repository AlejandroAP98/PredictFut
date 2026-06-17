import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import FlickerSpinner from '../assets/icons/LoaderIcon'

export default function Leaderboard({ currentUserId }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const { data, error } = await supabase
          .from('scores')
          .select('user_id, total_points, updated_at')
          .order('total_points', { ascending: false })

        if (error) throw error
        if (!data?.length) { setUsers([]); setLoading(false); return }

        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name')

        const nameMap = {}
        profiles?.forEach(p => { nameMap[p.id] = p.name })

        const maxPoints = data[0]?.total_points || 1

        const leaderboard = data.map((d, i) => ({
          rank: i + 1,
          userId: d.user_id,
          name: nameMap[d.user_id] || 'Anonymous',
          points: d.total_points || 0,
          updated: d.updated_at,
          isCurrentUser: d.user_id === currentUserId,
          barWidth: ((d.total_points || 0) / maxPoints) * 100,
        }))

        setUsers(leaderboard)
      } catch (err) {
        console.error('Error fetching leaderboard:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [currentUserId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <FlickerSpinner />
      </div>
    )
  }

  return (
    <div className="animate-fadeIn relative z-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Ranking Global</h2>
        <p className="text-gray-500 text-sm">
          {users.length} jugador{users.length !== 1 ? 'es' : ''} compitiendo
        </p>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-20 bg-white/70 backdrop-blur-sm rounded-3xl border border-gray-200">
          <span className="text-6xl block mb-4 text-gray-300">-</span>
          <p className="text-gray-500 text-lg font-medium">Sin puntuaciones aun</p>
          <p className="text-gray-400 text-sm mt-2">Haz predicciones para aparecer aqui</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="hidden sm:grid grid-cols-12 px-4 py-2 text-xs text-gray-400 uppercase tracking-wider">
            <span className="col-span-1 text-gray-600">#</span>
            <span className="col-span-5 text-gray-600">Jugador</span>
            <span className="col-span-3 text-gray-600">Barra</span>
            <span className="col-span-3 text-right text-gray-600">Puntos</span>
          </div>

          {users.map(user => (
            <div
              key={user.userId}
              className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                user.isCurrentUser
                  ? 'bg-emerald-50 border-2 border-emerald-300 shadow-md'
                  : 'bg-white border border-gray-200 hover:border-gray-300 shadow-sm'
              }`}
            >
              <div className="grid grid-cols-12 items-center px-4 py-4 gap-2">
                <div className="col-span-1 text-center font-bold text-gray-400">
                  {user.rank}
                </div>

                <div className="col-span-7 sm:col-span-5 flex items-center gap-2 min-w-0">
                  <div className={`w-9 h-9 flex rounded-full items-center justify-center text-sm font-bold shrink-0 ${
                    user.rank === 1 ? 'bg-emerald-500 text-white' :
                    user.rank === 2 ? 'bg-blue-500 text-white' :
                    user.rank === 3 ? 'bg-amber-600 text-white' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-gray-800 truncate flex items-center gap-2">
                      {user.name}
                      {user.isCurrentUser && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-medium shrink-0">
                          Tu
                        </span>
                      )}
                    </div>
                    {user.updated && (
                      <div className="text-[10px] text-gray-400">
                        {new Date(user.updated).toLocaleDateString('es-CO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-span-3 hidden sm:flex items-center">
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        user.rank === 1 ? 'bg-emerald-500' :
                        user.rank === 2 ? 'bg-gray-400' :
                        user.rank === 3 ? 'bg-amber-600' :
                        'bg-gray-300'
                      }`}
                      style={{ width: `${Math.max(user.barWidth, 2)}%` }}
                    />
                  </div>
                </div>

                <div className="col-span-4 sm:col-span-3 text-right">
                  <div className={`text-2xl font-score font-bold ${user.rank === 1 ? 'text-emerald-600' : 'text-gray-800'}`}>
                    {user.points}
                  </div>
                  <div className="text-[12px] text-gray-400">pts</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
