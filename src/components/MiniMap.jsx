import { useRaceStore } from '../store/useRaceStore'
import { motion } from 'framer-motion'

const SEGMENT_NAMES = ['LARGADA', 'VIADUTO', 'COMERCIAL', 'FAVELA', 'PORTO', 'RETA FINAL']

export default function MiniMap() {
    const { player, raceData } = useRaceStore()
    const currentSegment = player.currentSegment

    return (
        <div className="flex flex-col h-full cyber-panel relative overflow-hidden">
            <div className="cyber-panel-header">▸ MINI-MAPA</div>
            <div className="flex-1 p-3 flex flex-col justify-center items-center gap-1">
                {/* Map title */}
                <div className="text-center mb-4 mt-2">
                    <div className="text-base text-red-900 uppercase tracking-widest font-display">Nova Vitória</div>
                    <div className="text-xs text-red-950 uppercase">Traçado Oficial</div>
                </div>

                {/* Race track — vertical flow */}
                <div className="relative flex flex-col items-center gap-0 w-full">
                    {SEGMENT_NAMES.map((name, index) => {
                        const isCompleted = index < currentSegment
                        const isCurrent = index === currentSegment
                        const isFuture = index > currentSegment

                        return (
                            <div key={index} className="flex flex-col items-center w-full">
                                {/* Segment node */}
                                <div className="relative flex items-center w-full justify-center">
                                    {/* Side connectors for paths A/B/C */}
                                    {isCurrent && (
                                        <>
                                            <div className="absolute left-6 flex flex-col gap-[4px]">
                                                {['A', 'B', 'C'].map(p => (
                                                    <div key={p} className="text-[11px] text-orange-500 font-mono">
                                                        {p}{'—'}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="absolute right-6 flex flex-col gap-[4px]">
                                                {['A', 'B', 'C'].map(p => (
                                                    <div key={p} className="text-[11px] text-orange-500 font-mono">
                                                        {'—'}{p}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {/* Main checkpoint circle */}
                                    <motion.div
                                        animate={isCurrent ? {
                                            boxShadow: ['0 0 8px #f97316', '0 0 20px #f97316', '0 0 8px #f97316']
                                        } : {}}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className={`
                      w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold font-display
                      border-2 transition-all duration-500 relative z-10
                      ${isCompleted
                                                ? 'bg-red-900 border-red-600 text-red-200'
                                                : isCurrent
                                                    ? 'bg-orange-600 border-orange-400 text-white'
                                                    : 'bg-transparent border-red-950 text-red-900'
                                            }
                    `}
                                    >
                                        {isCompleted ? '✓' : index + 1}
                                        {isCurrent && (
                                            <motion.div
                                                className="absolute inset-0 rounded-full border-2 border-orange-400"
                                                animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            />
                                        )}
                                    </motion.div>
                                </div>

                                {/* Segment label */}
                                <div className={`text-xs text-center mt-2 mb-2 font-display tracking-wider uppercase transition-all
                  ${isCurrent ? 'text-orange-400 font-bold' : isCompleted ? 'text-red-700' : 'text-red-950'}
                `}>
                                    {name}
                                </div>

                                {/* Connector line (not after last) */}
                                {index < SEGMENT_NAMES.length - 1 && (
                                    <div className={`w-0.5 h-6 transition-all duration-500
                    ${isCompleted ? 'bg-red-700' : 'bg-red-950'}
                  `} />
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Player position indicator */}
                <div className="mt-4 w-full border border-red-900 p-3">
                    <div className="text-xs text-red-700 uppercase tracking-widest mb-1 text-center">Posição Atual</div>
                    <div className="text-5xl font-display font-bold text-orange-400 text-center">
                        {player.position}º
                    </div>
                    <div className="text-xs text-red-800 text-center mt-1">de 8 competidores</div>
                </div>

                {/* Segment info */}
                <div className="w-full border border-red-950 p-3 mt-2">
                    <div className="text-xs text-red-700 uppercase tracking-widest mb-1 text-center">Segmento Atual</div>
                    <div className="text-xl font-display font-bold text-red-400 text-center uppercase">
                        {SEGMENT_NAMES[currentSegment]}
                    </div>
                    <div className="text-xs text-red-900 text-center mt-1">{currentSegment + 1} / 6</div>
                </div>
            </div>
        </div>
    )
}
