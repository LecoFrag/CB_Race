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

function SkillIcon({ count, icon: Icon, label, color, description }) {
    const active = count > 0;
    return (
        <div
            className={`w-12 h-12 border flex items-center justify-center transition-all relative ${active
                ? 'border-red-600 bg-red-950/40 ' + color
                : 'border-red-950 bg-black/40 text-red-950 opacity-40'
                }`}
            title={`${label}${active ? ' (Disponível)' : ' (Esgotado)'}\n${description}`}
        >
            <Icon size={24} />
            <div className={`absolute -bottom-2 -right-2 text-[10px] font-mono px-1 rounded-sm border ${active ? 'bg-black text-white border-gray-600' : 'bg-black/50 text-gray-600 border-gray-800'
                }`}>
                {count}x
            </div>
        </div >
    )
}

export default function PlayerStatus() {
    const { player, phase, activateNitro, nitroThisTurn } = useRaceStore()
    const canUseNitro = player.nitro > 0 && (phase === 'choosing' || phase === 'inputRoll')

    const damageColor = player.vehicleDamage < 30
        ? '#16a34a' : player.vehicleDamage < 60
            ? '#ca8a04' : player.vehicleDamage < 85
                ? '#dc2626' : '#7f1d1d'

    const stabilityPct = Math.max(0, player.stability)

    const modifier = (player.nextTurnModifier || 0) + (nitroThisTurn ? 3 : 0);
    const modColor = modifier > 0 ? 'text-green-400 border-green-500 bg-green-950/30' :
        modifier < 0 ? 'text-red-400 border-red-500 bg-red-950/30' :
            'text-gray-500 border-gray-700 bg-black/40';
    const modPlus = modifier > 0 ? '+' : '';

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

            {/* Modifier */}
            <div className="flex flex-col items-center justify-center gap-2 ml-4 relative">
                <div className="text-[10px] sm:text-xs text-red-700 uppercase tracking-widest text-center leading-tight font-mono">Modificador<br />Ativo</div>
                <div className={`w-14 h-14 border flex flex-col items-center justify-center font-display font-bold text-2xl transition-colors ${modColor}`} title="Modificador aplicado à próxima rolagem">
                    {modPlus}{modifier}
                </div>
            </div>

            {/* Sistemas Ofensivos */}
            <div className="flex flex-col justify-center gap-2 ml-4 border-l border-red-900 pl-4">
                <div className="text-sm text-red-700 uppercase tracking-widest text-center">SISTEMAS OFENSIVOS</div>
                <div className="flex gap-2">
                    <SkillIcon count={player.skills?.harpoon || 0} icon={Magnet} label="Arpão Magnético" description="Fisga o rival e rouba sua posição instantaneamente. Ganha +10 de instabilidade." color="text-blue-400" />
                    <SkillIcon count={player.skills?.override || 0} icon={Cpu} label="Override" description="Aplica um vírus no rival. Ele terá -3 no próximo rolamento de segmento." color="text-purple-400" />
                    <SkillIcon count={player.skills?.plasma || 0} icon={Flame} label="Plasma Lateral" description="Dispara uma onda de calor pura. Causa 40% de dano extremo." color="text-orange-500" />
                    <SkillIcon count={player.skills?.smoke || 0} icon={CloudFog} label="Cortina de Fumaça" description="Impede que rivais o sigam de perto com eficácia neste confronto." color="text-gray-400" />
                </div>
            </div>

            {/* Status effect */}
            <div className="flex items-center">
                <StatusBadge effect={player.statusEffect} />
            </div>
        </div>
    )
}
