import { useRaceStore } from '../store/useRaceStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Cpu, Shuffle, Wrench, Zap } from 'lucide-react'

const STYLE_ICONS = {
    aggressive: Flame,
    technical: Cpu,
    unpredictable: Shuffle,
    saboteur: Wrench,
}

const STYLE_COLORS = {
    aggressive: 'text-red-500',
    technical: 'text-blue-400',
    unpredictable: 'text-purple-400',
    saboteur: 'text-gray-400',
}

const STYLE_LABELS = {
    aggressive: 'AGRESSIVO',
    technical: 'TÉCNICO',
    unpredictable: 'IMPREVISÍVEL',
    saboteur: 'SABOTADOR',
}

function DamageBar({ value, small }) {
    const pct = Math.min(100, Math.max(0, value))
    const color = pct < 30 ? '#16a34a' : pct < 60 ? '#ca8a04' : pct < 85 ? '#dc2626' : '#7f1d1d'
    return (
        <div className={`w-full bg-black border border-red-950 ${small ? 'h-2' : 'h-3'}`}>
            <motion.div
                className="h-full"
                style={{ backgroundColor: color }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5 }}
            />
        </div>
    )
}

export default function RivalPanel() {
    const { player, rivals, raceData } = useRaceStore()

    // Combine player + rivals, sort by position
    const allCompetitors = [
        {
            id: 'player',
            name: player.name,
            portrait: 'player.png',
            position: player.position,
            damage: player.vehicleDamage,
            style: 'aggressive',
            isActive: true,
            isPlayer: true,
        },
        ...rivals.filter(r => r.isActive),
    ].sort((a, b) => a.position - b.position)

    const isAdjacent = (rivalPos) => Math.abs(rivalPos - player.position) === 1
    const isThreat = (rival) => isAdjacent(rival.position) && (rival.style === 'saboteur' || rival.style === 'aggressive')

    return (
        <div className="flex flex-col h-full cyber-panel overflow-hidden">
            <div className="cyber-panel-header">▸ COMPETIDORES</div>
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
                {allCompetitors.map((competitor, idx) => {
                    const StyleIcon = STYLE_ICONS[competitor.style] || Zap
                    const threat = !competitor.isPlayer && isThreat(competitor)
                    const rivalData = raceData.rivals.find(r => r.id === competitor.id)

                    return (
                        <motion.div
                            key={competitor.id}
                            layout
                            transition={{ duration: 0.4 }}
                            className={`
                relative flex items-center gap-4 p-3 border transition-all duration-300
                ${competitor.isPlayer
                                    ? 'border-orange-600 bg-orange-950/20'
                                    : threat
                                        ? 'border-red-500 bg-red-950/20 animate-pulse-red'
                                        : 'border-red-950 bg-black/40'
                                }
              `}
                        >
                            {/* Position badge */}
                            <div className={`
                flex-shrink-0 w-8 h-8 flex items-center justify-center text-sm font-bold font-display
                ${competitor.isPlayer ? 'bg-orange-600 text-white' : 'bg-red-950 text-red-400'}
              `}>
                                {competitor.position}
                            </div>

                            {/* Portrait */}
                            <div className={`
                flex-shrink-0 w-16 h-16 border overflow-hidden bg-red-950/30
                ${competitor.isPlayer ? 'border-orange-500' : threat ? 'border-red-500' : 'border-red-900'}
              `}>
                                <img
                                    src={`./assets/portraits/${competitor.portrait}`}
                                    alt={competitor.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none'
                                        e.target.parentElement.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:24px;color:#7f1d1d">${competitor.name[0]}</div>`
                                    }}
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <div className={`text-base font-bold font-display truncate uppercase
                    ${competitor.isPlayer ? 'text-orange-300' : 'text-red-300'}
                  `}>
                                        {competitor.name}
                                    </div>
                                    {threat && (
                                        <div className="dot-blink text-red-500 text-xs">⚠</div>
                                    )}
                                </div>

                                {/* Style */}
                                <div className="flex items-center gap-2 mt-1">
                                    <StyleIcon size={14} className={STYLE_COLORS[competitor.style]} />
                                    <span className={`text-[10px] ${STYLE_COLORS[competitor.style]}`}>
                                        {STYLE_LABELS[competitor.style]}
                                    </span>
                                </div>

                                {/* Damage bar */}
                                <div className="mt-2">
                                    <DamageBar value={competitor.damage} small />
                                </div>
                            </div>

                            {/* Player indicator */}
                            {competitor.isPlayer && (
                                <div className="absolute top-0 right-0 text-[10px] bg-orange-600 text-white px-2 py-0.5 font-display shadow-md">
                                    YOU
                                </div>
                            )}
                        </motion.div>
                    )
                })}

                {/* Eliminated rivals */}
                {rivals.filter(r => !r.isActive).map(r => (
                    <div key={r.id} className="flex items-center gap-4 p-3 border border-red-950/30 opacity-30">
                        <div className="text-xs text-red-900 font-display uppercase truncate">💀 {r.name}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
