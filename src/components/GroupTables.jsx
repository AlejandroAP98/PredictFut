import LoaderIcon from '../assets/icons/LoaderIcon'

export default function GroupTables({ groups, loading, getTeamInfo }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <LoaderIcon />
      </div>
    )
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-3xl border border-gray-200">
        <p className="text-gray-500 text-lg font-medium">No hay datos de grupos disponibles</p>
      </div>
    )
  }

  const sortedGroups = [...groups].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="animate-fadeIn relative z-10">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Fase de Grupos</h2>
        <p className="text-gray-500 text-xs">Posiciones y resultados de cada grupo</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sortedGroups.map(group => {
          const sortedTeams = [...group.teams].sort((a, b) => {
            const ptsDiff = parseInt(b.pts) - parseInt(a.pts)
            if (ptsDiff !== 0) return ptsDiff
            const gdDiff = parseInt(b.gd) - parseInt(a.gd)
            if (gdDiff !== 0) return gdDiff
            const gfDiff = parseInt(b.gf) - parseInt(a.gf)
            if (gfDiff !== 0) return gfDiff
            return 0
          })

          return (
            <div key={group.name} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 overflow-hidden">
              <div className="bg-emerald-600 text-white px-4 py-2.5">
                <h3 className="text-lg font-bold tracking-wide">Grupo {group.name}</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 text-xs uppercase tracking-wider">
                      <th className="px-3 py-2 text-left w-6">#</th>
                      <th className="px-2 py-2 text-left">Equipo</th>
                      <th className="px-2 py-2 text-center w-8">PJ</th>
                      <th className="px-2 py-2 text-center w-8 hidden sm:table-cell">V</th>
                      <th className="px-2 py-2 text-center w-8 hidden sm:table-cell">E</th>
                      <th className="px-2 py-2 text-center w-8 hidden sm:table-cell">D</th>
                      <th className="px-2 py-2 text-center w-8 hidden sm:table-cell">GF</th>
                      <th className="px-2 py-2 text-center w-8 hidden sm:table-cell">GC</th>
                      <th className="px-2 py-2 text-center w-8">DG</th>
                      <th className="px-2 py-2 text-center w-10 font-bold">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTeams.map((team, i) => {
                      const info = getTeamInfo ? getTeamInfo(team.team_id) : null
                      const pos = i + 1
                      const qualify = pos <= 2

                      return (
                        <tr
                          key={team.team_id}
                          className={`border-b border-gray-100 last:border-b-0 transition-colors ${
                            qualify ? 'bg-emerald-50/50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className={`px-3 py-2.5 font-bold text-xs ${qualify ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {pos}
                          </td>
                          <td className="px-2 py-2.5">
                            <div className="flex items-center gap-2">
                              {info?.flag ? (
                                <img src={info.flag} alt="" className="w-6 h-4 object-cover rounded-sm shadow-sm" />
                              ) : (
                                <div className="w-6 h-4 bg-gray-200 rounded-sm" />
                              )}
                              <span className="font-medium text-gray-800 text-sm truncate">{info?.name || team.team_id}</span>
                            </div>
                          </td>
                          <td className="px-2 py-2.5 text-center text-gray-600">{team.mp}</td>
                          <td className="px-2 py-2.5 text-center text-gray-600 hidden sm:table-cell">{team.w}</td>
                          <td className="px-2 py-2.5 text-center text-gray-600 hidden sm:table-cell">{team.d}</td>
                          <td className="px-2 py-2.5 text-center text-gray-600 hidden sm:table-cell">{team.l}</td>
                          <td className="px-2 py-2.5 text-center text-gray-600 hidden sm:table-cell">{team.gf}</td>
                          <td className="px-2 py-2.5 text-center text-gray-600 hidden sm:table-cell">{team.ga}</td>
                          <td className={`px-2 py-2.5 text-center font-medium ${
                            parseInt(team.gd) > 0 ? 'text-emerald-600' : parseInt(team.gd) < 0 ? 'text-red-500' : 'text-gray-500'
                          }`}>
                            {parseInt(team.gd) > 0 ? `+${team.gd}` : team.gd}
                          </td>
                          <td className="px-2 py-2.5 text-center font-bold font-score text-gray-800">{team.pts}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}