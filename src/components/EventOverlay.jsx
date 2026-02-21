import { motion, AnimatePresence } from 'framer-motion'
import { useRaceStore } from '../store/useRaceStore'
import { X, AlertTriangle, Shield, Zap, Skull } from 'lucide-react'

const EVENT_CONFIG = {
    sabotage: {
        title: 'SABOTAGEM!',
        subtitle: 'Um rival adjacente está interferindo',
        icon: AlertTriangle,
        color: 'border-red-600 bg-red-950/90',
        headerColor: 'text-red-400',
        image: 'event_sabotage.png',
        options: [
            { id: 'dodge', label: 'DESVIAR', desc: '+1 modificador', modifier: 1, icon: '↗' },
            { id: 'confront', label: 'CONFRONTAR', desc: 'risco/recompensa', modifier: 0, icon: '⚔' },
            { id: 'ignore', label: 'IGNORAR', desc: '-1 modificador', modifier: -1, icon: '→' },
        ]
    },
    ncpd: {
        title: 'NCPD NA PISTA!',
        subtitle: 'Viatura bloqueia o caminho — novo teste necessário',
        icon: Shield,
        color: 'border-blue-600 bg-blue-950/90',
        headerColor: 'text-blue-400',
        image: 'event_ncpd.png',
    },
    nitro: {
        title: 'NITRO ATIVADO!',
        subtitle: 'Boost extremo — +3 no próximo dado',
        icon: Zap,
        color: 'border-orange-500 bg-orange-950/90',
        headerColor: 'text-orange-400',
        image: 'event_nitro.png',
    },
    crash: {
        title: 'ACIDENTE!',
        subtitle: 'Um rival saiu da corrida',
        icon: Skull,
        color: 'border-gray-600 bg-gray-950/90',
        headerColor: 'text-gray-400',
        image: 'event_crash.png',
    },
}

export default function EventOverlay() {
    const { currentEvent, clearEvent } = useRaceStore()
    const config = currentEvent ? EVENT_CONFIG[currentEvent] : null

    return (
        <AnimatePresence>
            {currentEvent && config && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    onClick={(e) => e.target === e.currentTarget && clearEvent()}
                >
                    <motion.div
                        initial={{ scale: 0.7, y: 40, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.7, y: 40, opacity: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className={`relative border-2 ${config.color} p-0 w-[480px] max-w-[90vw] overflow-hidden`}
                        style={{ boxShadow: '0 0 60px rgba(220, 38, 38, 0.5)' }}
                    >
                        {/* Event image background */}
                        <div className="relative h-32 overflow-hidden">
                            <img
                                src={`./assets/scenes/${config.image}`}
                                alt={config.title}
                                className="w-full h-full object-cover opacity-60"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <div className="flex items-center gap-3">
                                    <config.icon size={24} className={config.headerColor} />
                                    <div>
                                        <div className={`text-xl font-display font-bold uppercase tracking-widest ${config.headerColor}`}>
                                            {config.title}
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-mono">{config.subtitle}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Options for sabotage */}
                        {currentEvent === 'sabotage' && config.options && (
                            <div className="p-4">
                                <div className="text-[9px] text-red-700 uppercase tracking-widest mb-3 font-mono">
                                    Escolha sua resposta:
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {config.options.map(opt => (
                                        <motion.button
                                            key={opt.id}
                                            onClick={clearEvent}
                                            whileHover={{ scale: 1.03, y: -2 }}
                                            whileTap={{ scale: 0.97 }}
                                            className="border border-red-800 hover:border-red-500 bg-black/60 hover:bg-red-950/40 p-3 text-center transition-all group"
                                        >
                                            <div className="text-2xl mb-1">{opt.icon}</div>
                                            <div className="text-[10px] font-display font-bold text-red-300 uppercase">{opt.label}</div>
                                            <div className="text-[8px] text-red-800 font-mono mt-1">{opt.desc}</div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Close button for non-choice events */}
                        {currentEvent !== 'sabotage' && (
                            <div className="p-4 flex justify-center">
                                <motion.button
                                    onClick={clearEvent}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`border px-6 py-2 font-display font-bold uppercase tracking-widest text-sm transition-all
                    ${config.headerColor} border-current hover:bg-white/10`}
                                >
                                    CONTINUAR
                                </motion.button>
                            </div>
                        )}

                        {/* Corner X */}
                        <button
                            onClick={clearEvent}
                            className="absolute top-2 right-2 text-gray-600 hover:text-gray-300 transition-colors"
                        >
                            <X size={14} />
                        </button>

                        {/* Scanlines */}
                        <div className="absolute inset-0 pointer-events-none bg-scanlines opacity-20" />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
