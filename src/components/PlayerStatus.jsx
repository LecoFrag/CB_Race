import { useRaceStore } from '../store/useRaceStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, AlertTriangle, Activity, Magnet, Cpu, Flame, CloudFog } from 'lucide-react'

function StatusBadge({ effect }) {
    if (!effect) return null
    const labels = { overheating: '🔥 SUPERAQUECENDO', locked: '🔒 TRAVADO' }
    return (
        <div className="text-sm bg-red-900 border border-red-600 text-red-200 px-4 py-2 font-mono animate-pulse">
            {labels[effect] || effect}
        </div>
    )
}

function SkillIcon({ active, icon: Icon, label, color, description }) {
    return (
        <div
            className={`w-12 h-12 border flex items-center justify-center transition-all ${active
                    ? 'border-red-600 bg-red-950/40 ' + color
                    : 'border-red-950 bg-black/40 text-red-950 opacity-40'
                }`}
            title={`${label}${active ? ' (Disponível)' : ' (Usado)'}\n${description}`}
        >
            <Icon size={24} />
        </div >
    )
}

export default function PlayerStatus() {
    const { player, phase, activateNitro } = useRaceStore()
    const canUseNitro = player.nitro > 0 && (phase === 'choosing' || phase === 'inputRoll')

    const damageColor = player.vehicleDamage < 30
        ? '#16a34a' : player.vehicleDamage < 60
            ? '#ca8a04' : player.vehicleDamage < 85
                ? '#dc2626' : '#7f1d1d'

    const stabilityPct = Math.max(0, player.stability)

    return (
        <div className="h-full flex items-stretch gap-6 px-6 py-4 cyber-panel border-t-2 border-red-900">

            {/* Position */}
            <div className="flex flex-col items-center justify-center border border-red-900 px-6 min-w-[100px]">
                <div className="text-sm text-red-700 uppercase tracking-widest">Posição</div>
                <div className="text-5xl font-display font-bold text-orange-400 leading-none mt-1">{player.position}º</div>
                <div className="text-xs text-red-900 mt-1">/ 8</div>
            </div>

            {/* Vehicle Damage */}
            <div className="flex-1 flex flex-col justify-center gap-2">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-red-700 uppercase tracking-widest flex items-center gap-2">
                        <Activity size={16} /> DANO DO VEÍCULO
                    </div>
                    <div className="text-base font-mono text-red-400">{player.vehicleDamage}%</div>
                </div>
                <div className="h-6 w-full bg-black border border-red-950 relative overflow-hidden">
                    <motion.div
                        className="h-full"
                        style={{ backgroundColor: damageColor }}
                        animate={{ width: `${player.vehicleDamage}%` }}
                        transition={{ duration: 0.5 }}
                    />
                    {/* Scanlines on bar */}
                    <div className="absolute inset-0 bg-scanlines opacity-30 pointer-events-none" />
                </div>
            </div>

            {/* Stability */}
            <div className="flex-1 flex flex-col justify-center gap-2">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-red-700 uppercase tracking-widest">ESTABILIDADE</div>
                    <div className="text-base font-mono text-orange-600">{Math.round(stabilityPct)}%</div>
                </div>
                <div className="h-6 w-full bg-black border border-red-950">
                    <motion.div
                        className="h-full bg-orange-700"
                        animate={{ width: `${stabilityPct}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* Nitro */}
            <div className="flex flex-col items-center justify-center gap-2 ml-4">
                <div className="text-sm text-red-700 uppercase tracking-widest">NITRO</div>
                <div className="flex gap-2">
                    {[0, 1].map(i => (
                        <motion.button
                            key={i}
                            onClick={i === 0 && canUseNitro ? activateNitro : undefined}
                            whileHover={canUseNitro && i === 0 ? { scale: 1.1 } : {}}
                            whileTap={canUseNitro && i === 0 ? { scale: 0.9 } : {}}
                            className={`
                w-14 h-14 border flex items-center justify-center transition-all
                ${i < player.nitro
                                    ? 'border-orange-500 bg-orange-900/40 text-orange-400 cursor-pointer hover:bg-orange-800/60'
                                    : 'border-red-950 bg-black/20 text-red-950 cursor-not-allowed'
                                }
              `}
                            title={i === 0 && canUseNitro ? 'Ativar Nitro (+3 no próximo dado)' : ''}
                        >
                            <Zap size={24} />
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Sistemas Ofensivos */}
            <div className="flex flex-col justify-center gap-2 ml-4 border-l border-red-900 pl-4">
                <div className="text-sm text-red-700 uppercase tracking-widest text-center">SISTEMAS OFENSIVOS</div>
                <div className="flex gap-2">
                    <SkillIcon active={player.skills?.harpoon} icon={Magnet} label="Arpão Magnético" description="Fisga o rival e rouba sua posição instantaneamente. Ganha +10 de instabilidade." color="text-blue-400" />
                    <SkillIcon active={player.skills?.override} icon={Cpu} label="Override" description="Aplica um vírus no rival. Ele terá -3 no próximo rolamento de segmento." color="text-purple-400" />
                    <SkillIcon active={player.skills?.plasma} icon={Flame} label="Plasma Lateral" description="Dispara uma onda de calor pura. Causa 40% de dano extremo." color="text-orange-500" />
                    <SkillIcon active={player.skills?.smoke} icon={CloudFog} label="Cortina de Fumaça" description="Impede que rivais o sigam de perto com eficácia neste confronto." color="text-gray-400" />
                </div>
            </div>

            {/* Status effect */}
            <div className="flex items-center">
                <StatusBadge effect={player.statusEffect} />
            </div>
        </div>
    )
}
