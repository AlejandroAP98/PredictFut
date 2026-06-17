import VarShieldIcon from '../assets/icons/VarShieldIcon'
import TrendInsuranceIcon from '../assets/icons/TrendInsuranceIcon'
import SniperTargetIcon from '../assets/icons/SniperTargetIcon'
import DoubleImpactIcon from '../assets/icons/DoubleImpactIcon'
import HandOfGodIcon from '../assets/icons/HandOfGodIcon'

export const SKILL_CATALOG = [
  {
    id: 'var_shield',
    name: 'Escudo VAR',
    rarity: 'common',
    dropRate: 0.40,
    description: 'Perdona 1 gol de diferencia en un equipo para otorgar el punto de gol exacto.',
    requiresTeamChoice: true,
    icon: VarShieldIcon,
  },
  {
    id: 'trend_insurance',
    name: 'Pacto de lima',
    rarity: 'common',
    dropRate: 0.25,
    description: 'Si fallas la predicción y el partido termina en empate, +2 pts de consolación.',
    requiresTeamChoice: false,
    icon: TrendInsuranceIcon,
  },
  {
    id: 'local_visitor_bonus',
    name: 'Francotirador',
    rarity: 'rare',
    dropRate: 0.20,
    description: '+2 pts extra si aciertas exactamente los goles del equipo elegido.',
    requiresTeamChoice: true,
    icon: SniperTargetIcon,
  },
  {
    id: 'double_impact',
    name: 'Doblete',
    rarity: 'epic',
    dropRate: 0.10,
    description: 'Multiplica x2 el puntaje final obtenido en ese partido.',
    requiresTeamChoice: false,
    icon: DoubleImpactIcon,
  },
  {
    id: 'hurricane_eye',
    name: 'La mano de Dios',
    rarity: 'legendary',
    dropRate: 0.05,
    description: 'Asegura los 5 puntos de Tendencia automáticamente.',
    requiresTeamChoice: false,
    icon: HandOfGodIcon,
  },
]

export const SPIN_COSTS = { 1: 0, 2: 2, 3: 4 }
export const MAX_DAILY_SPINS = 3
export const MAX_INVENTORY_SIZE = 3
export const AI_PREDICTION_BONUS = 3

export const RARITY_COLORS = {
  common: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700', glow: '' },
  rare: { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-700', glow: 'shadow-blue-200' },
  epic: { bg: 'bg-purple-50', border: 'border-purple-400', text: 'text-purple-700', glow: 'shadow-purple-200' },
  legendary: { bg: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-700', glow: 'shadow-amber-300' },
}

export const RARITY_LABELS = {
  common: 'Común',
  rare: 'Rara',
  epic: 'Épica',
  legendary: 'Legendaria',
}

export const RARITY_BG_DARK = {
  common: 'bg-gray-700',
  rare: 'bg-blue-600',
  epic: 'bg-purple-600',
  legendary: 'bg-amber-500',
}

export const RARITY_BORDER_DARK = {
  common: 'border-gray-600',
  rare: 'border-blue-500',
  epic: 'border-purple-500',
  legendary: 'border-amber-400',
}

export const RARITY_GLOW = {
  common: '',
  rare: 'shadow-[0_0_12px_rgba(59,130,246,0.4)]',
  epic: 'shadow-[0_0_16px_rgba(147,51,234,0.5)]',
  legendary: 'shadow-[0_0_20px_rgba(245,158,11,0.6)]',
}

export function getSkillById(skillId) {
  return SKILL_CATALOG.find(s => s.id === skillId) || null
}

export function calculateSkillBonus(skillId, skillConfig, baseScore, prediction, actualHome, actualAway) {
  const predHome = parseInt(prediction.home_score)
  const predAway = parseInt(prediction.away_score)

  if (isNaN(predHome) || isNaN(predAway)) return 0

  const predDiff = predHome - predAway
  const actualDiff = actualHome - actualAway
  const sameTrend = (predDiff > 0 && actualDiff > 0) || (predDiff < 0 && actualDiff < 0) || (predDiff === 0 && actualDiff === 0)
  const exactHome = predHome === actualHome
  const exactAway = predAway === actualAway

  switch (skillId) {
    case 'var_shield': {
      const team = skillConfig?.team
      if (team === 'home' && !exactHome && Math.abs(predHome - actualHome) === 1) return 1
      if (team === 'away' && !exactAway && Math.abs(predAway - actualAway) === 1) return 1
      return 0
    }
    case 'trend_insurance': {
      if (!sameTrend && actualDiff === 0) return 2
      return 0
    }
    case 'local_visitor_bonus': {
      const team = skillConfig?.team
      if (team === 'home' && exactHome) return 2
      if (team === 'away' && exactAway) return 2
      return 0
    }
    case 'double_impact': {
      return baseScore
    }
    case 'hurricane_eye': {
      if (!sameTrend) return 5
      return 0
    }
    default:
      return 0
  }
}