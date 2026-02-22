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
    const { currentEvent, clearEvent, rivals } = useRaceStore()
    // currentEvent can now be an object { type: 'crash', targets: [...] } or a string
    const eventType = typeof currentEvent === 'string' ? currentEvent : currentEvent?.type
    const config = eventType ? EVENT_CONFIG[eventType] : null

    // Helper to get raw state for crash rendering
    const getRaceStoreState = useRaceStore.getState;

    return (
        <AnimatePresence>
            {currentEvent && config && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`fixed inset-0 z-40 flex ${eventType === 'nitro' ? 'items-end justify-end p-8 bg-transparent pointer-events-none' : 'items-center justify-center bg-black/70 backdrop-blur-sm'}`}
                    onClick={(e) => e.target === e.currentTarget && clearEvent()}
                >
                    <motion.div
                        initial={eventType === 'nitro' ? { x: 400, opacity: 0 } : { scale: 0.7, y: 40, opacity: 0 }}
                        animate={eventType === 'nitro' ? { x: 0, opacity: 1 } : { scale: 1, y: 0, opacity: 1 }}
                        exit={eventType === 'nitro' ? { x: 400, opacity: 0 } : { scale: 0.7, y: 40, opacity: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className={`relative border-2 ${config.color} p-0 overflow-hidden ${eventType === 'crash' ? 'w-[800px]' : 'w-[480px]'} max-w-[90vw] pointer-events-auto`}
                        style={{ boxShadow: '0 0 60px rgba(220, 38, 38, 0.5)' }}
                    >
                        {/* Event image background / dynamic crash image */}
                        {eventType !== 'nitro' && (
                            <div className={`relative overflow-hidden flex items-center justify-center bg-black ${eventType === 'crash' ? 'h-64' : 'h-32'}`}>
                                {eventType === 'crash' && typeof currentEvent === 'object' && currentEvent.targets ? (
                                    <div className="absolute inset-0 flex items-center justify-center gap-6 bg-red-950/30">
                                        {currentEvent.targets.map(t => (
                                            <div key={t.id} className="relative w-40 h-40 border-4 border-red-600 animate-pulse shadow-[0_0_30px_rgba(220,38,38,0.8)]">
                                                <img src={`./assets/portraits/${t.portrait}`} className="w-full h-full object-cover grayscale opacity-50 sepia-[.5] hue-rotate-[-50deg]" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                                                    <Skull className="text-red-500 hover:text-red-400 drop-shadow-[0_0_10px_rgba(220,38,38,1)]" size={80} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <img
                                        src={`./assets/scenes/${config.image}`}
                                        alt={config.title}
                                        className="w-full h-full object-cover opacity-80"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            </div>
                        )}

                        {/* Event Info Header */}
                        <div className="p-5 bg-black/90 flex items-center gap-4 border-b border-white/5 relative z-10">
                            <config.icon size={eventType === 'crash' ? 48 : 32} className={config.headerColor} />
                            <div>
                                <div className={`${eventType === 'crash' ? 'text-3xl font-black' : 'text-2xl font-bold'} font-display uppercase tracking-widest ${config.headerColor}`}>
                                    {config.title}
                                </div>
                                <div className={`${eventType === 'crash' ? 'text-sm' : 'text-xs'} text-gray-300 font-mono mt-1`}>
                                    {eventType === 'crash' && typeof currentEvent === 'object'
                                        ? `${currentEvent.targets.map(t => t.name).join(', ')} foi eliminado.`
                                        : config.subtitle}
                                </div>
                            </div>
                        </div>

                        {/* Options for sabotage */}
                        {eventType === 'sabotage' && config.options && (
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
                        {currentEvent !== 'sabotage' && currentEvent !== 'crash' && (
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

                        {/* Special info for crash event */}
                        {currentEvent === 'crash' && (() => {
                            const { currentEvent: evObj } = getRaceStoreState(); // we need the actual event object which has targets
                            return (
                                <div className="p-8 flex flex-col items-center">
                                    <div className="text-gray-300 font-mono text-center text-lg mb-8">
                                        Detectado encerramento definitivo de chassi. O competidor não pode mais continuar na corrida.
                                    </div>
                                    <motion.button
                                        onClick={clearEvent}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`border-4 px-12 py-5 font-display font-bold text-2xl uppercase tracking-widest transition-all
                                        ${config.headerColor} border-current hover:bg-white/10`}
                                    >
                                        RECALCULAR ROTAS
                                    </motion.button>
                                </div>
                            )
                        })()}

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
            )
            }
        </AnimatePresence >
    )
}
