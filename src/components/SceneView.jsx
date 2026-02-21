import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRaceStore } from '../store/useRaceStore'
import { MapPin, ChevronRight } from 'lucide-react'

const PATH_ICONS = {
    default: MapPin,
}

const DIFFICULTY_STYLES = {
    low: { label: 'BAIXA', color: 'text-green-400 border-green-800 bg-green-950/40' },
    medium: { label: 'MÉDIA', color: 'text-yellow-400 border-yellow-800 bg-yellow-950/40' },
    high: { label: 'ALTA', color: 'text-red-400 border-red-800 bg-red-950/40' },
}

function DiceAnimation({ value, onDone }) {
    const [displayNum, setDisplayNum] = useState(1)
    const [done, setDone] = useState(false)

    useEffect(() => {
        let count = 0
        const maxCount = 20
        const interval = setInterval(() => {
            setDisplayNum(Math.ceil(Math.random() * 10))
            count++
            if (count >= maxCount) {
                clearInterval(interval)
                setDisplayNum(value)
                setDone(true)
                setTimeout(onDone, 800)
            }
        }, 50)
        return () => clearInterval(interval)
    }, [value])

    return (
        <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
        >
            <div className="text-[10px] text-red-600 uppercase tracking-widest font-mono">rolando dado...</div>
            <motion.div
                className={`text-7xl font-display font-bold border-2 w-28 h-28 flex items-center justify-center
          ${done ? 'text-orange-400 border-orange-500' : 'text-red-400 border-red-700 animate-dice'}
        `}
                animate={done ? {
                    boxShadow: ['0 0 20px #f97316', '0 0 40px #f97316', '0 0 20px #f97316']
                } : {}}
                transition={{ duration: 1, repeat: done ? Infinity : 0 }}
            >
                {displayNum}
            </motion.div>
            <div className="text-[10px] text-red-800 font-mono">1d10</div>
        </motion.div>
    )
}

export default function SceneView() {
    const {
        phase, player, raceData, pendingPath, currentNarrative,
        currentOutcomeNarrative, lastOutcome, choosePath, advanceSegment, submitManualRoll,
    } = useRaceStore()

    const [showDice, setShowDice] = useState(false)
    const [bgLoaded, setBgLoaded] = useState(false)
    const [currentBg, setCurrentBg] = useState(null)

    const segment = raceData?.segments?.[player.currentSegment]

    // Update background when path selected
    useEffect(() => {
        if (pendingPath?.image) {
            setCurrentBg(`./assets/scenes/${pendingPath.image}`)
            setBgLoaded(false)
        } else if (segment) {
            setCurrentBg(`./assets/scenes/seg${player.currentSegment + 1}_pathA.png`)
            setBgLoaded(false)
        }
    }, [pendingPath, player.currentSegment])

    const handlePathClick = (pathId) => {
        if (phase !== 'choosing') return
        choosePath(pathId)
    }

    if (!segment) return null

    return (
        <div className="relative flex flex-col h-full overflow-hidden scanlines">
            {/* Background image */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentBg || player.currentSegment}
                    className="absolute inset-0 z-0"
                    initial={{ opacity: 0, filter: 'brightness(0.3) saturate(0)' }}
                    animate={{ opacity: 1, filter: 'brightness(0.85) saturate(1.1)' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {currentBg && (
                        <img
                            src={currentBg}
                            alt="scene"
                            className="w-full h-full object-cover"
                            onLoad={() => setBgLoaded(true)}
                            onError={() => setBgLoaded(false)}
                        />
                    )}
                    {/* Fallback gradient / semi-transparent overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-red-950/80 via-black to-orange-950/60 ${bgLoaded ? 'opacity-30' : 'opacity-100'} transition-opacity duration-1000`} />
                </motion.div>
            </AnimatePresence>

            {/* Top header */}
            <div className="relative z-10 flex items-center justify-between p-6 border-b border-red-900/60 bg-black/40">
                <div>
                    <div className="text-sm text-red-600 uppercase tracking-widest font-mono mb-1">
                        Seg {player.currentSegment + 1}/6 — {segment.location}
                    </div>
                    <div className="text-3xl font-display font-bold text-orange-400 uppercase tracking-wider">
                        {segment.name}
                    </div>
                </div>
                <div className="text-sm text-red-800 font-display uppercase tracking-widest">
                    {phase === 'choosing' && '▸ ESCOLHA O CAMINHO'}
                    {phase === 'inputRoll' && '⏸ AGUARDANDO DADO'}
                    {phase === 'revealing' && '▸ RESULTADO'}
                    {phase === 'finished' && '🏁 CORRIDA ENCERRADA'}
                </div>
            </div>

            {/* Central narrative area */}
            <div className="relative z-10 flex-1 flex flex-col justify-between p-4 overflow-hidden">

                {/* Narrative text */}
                <div className="max-w-4xl mx-auto w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentNarrative}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4 }}
                            className="bg-black/80 border-2 border-red-950 p-8 backdrop-blur-md"
                        >
                            <p className="text-lg text-orange-200 font-mono leading-relaxed animate-flicker">
                                {currentNarrative}
                            </p>

                            {/* Outcome narrative */}
                            {currentOutcomeNarrative && phase === 'revealing' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-6 pt-6 border-t-2 border-red-900"
                                >
                                    <div className={`text-sm uppercase tracking-widest mb-2 font-display font-bold
                    ${lastOutcome?.type === 'success' ? 'text-green-400' : lastOutcome?.type === 'partial' ? 'text-yellow-400' : 'text-red-400'}
                  `}>
                                        {lastOutcome?.type === 'success' ? '▸ SUCESSO' : lastOutcome?.type === 'partial' ? '▸ PARCIAL' : '▸ FALHA'}
                                        {lastOutcome?.finalRoll && ` — Dado: ${lastOutcome.finalRoll}`}
                                    </div>
                                    <p className="text-lg text-orange-100 font-mono leading-relaxed">
                                        {currentOutcomeNarrative}
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Direct Dice Input — shown during inputRoll waiting state */}
                {phase === 'inputRoll' && (
                    <motion.div
                        className="flex justify-center my-4"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="bg-black/90 border-2 border-orange-500 p-8 flex flex-col items-center gap-4 w-[400px] max-w-full shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                            <div className="text-sm text-orange-400 font-display font-bold uppercase tracking-widest text-center">
                                Insira o Resultado do Dado
                            </div>
                            <div className="text-xs text-orange-200/60 font-mono text-center mb-2">
                                Role 1d10 e digite o valor final
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    const val = e.target.elements.diceValue.value
                                    if (val && parseInt(val) >= 1 && parseInt(val) <= 10) {
                                        submitManualRoll(val)
                                    }
                                }}
                                className="flex flex-col gap-4 w-full"
                            >
                                <input
                                    type="number"
                                    name="diceValue"
                                    min="1" max="10" required autoFocus
                                    className="w-full bg-black border-2 border-orange-600 text-6xl text-center text-orange-400 font-display font-bold p-4 focus:outline-none focus:border-red-500 transition-colors"
                                />
                                <button
                                    type="submit"
                                    className="w-full bg-orange-950/60 border border-orange-500 text-orange-300 font-display font-bold tracking-widest uppercase py-4 hover:bg-orange-800 hover:text-white transition-all text-lg"
                                >
                                    Confirmar Resultado
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}

                {/* Path buttons — choosing phase */}
                {(phase === 'choosing') && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-3 gap-6 mt-6 max-w-6xl mx-auto w-full"
                    >
                        {segment.paths.map((path) => {
                            const Icon = PATH_ICONS[path.icon] || ChevronRight
                            const diff = DIFFICULTY_STYLES[path.difficulty]
                            return (
                                <motion.button
                                    key={path.id}
                                    onClick={() => handlePathClick(path.id)}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="btn-path relative bg-black/80 border-2 border-red-800 hover:border-orange-500 text-left p-6 transition-all group shadow-lg"
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        <Icon size={24} className="text-orange-500 flex-shrink-0 mt-1" />
                                        <div>
                                            <div className="text-sm text-red-700 font-mono uppercase mb-1">Caminho {path.id}</div>
                                            <div className="text-xl font-display font-bold text-orange-300 uppercase leading-tight">
                                                {path.name}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`inline-flex items-center gap-1 border-2 px-3 py-1 text-xs font-mono uppercase font-bold mt-2 ${diff.color}`}>
                                        {diff.label}
                                    </div>
                                    <ChevronRight
                                        size={24}
                                        className="absolute bottom-4 right-4 text-red-800 group-hover:text-orange-400 transition-colors"
                                    />
                                </motion.button>
                            )
                        })}
                    </motion.div>
                )}

                {/* Advance button — after revealing outcome */}
                {phase === 'revealing' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-center mt-8 mb-4 relative z-20"
                    >
                        <motion.button
                            onClick={advanceSegment}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-path bg-red-900/40 border-2 border-red-600 text-red-200 px-12 py-5 font-display font-bold uppercase tracking-widest text-xl hover:bg-red-800/60 hover:border-red-400 hover:text-white transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                        >
                            {player.currentSegment >= raceData.segments.length - 1 ? '🏁 ENCERRAR CORRIDA' : '▸ PRÓXIMO SEGMENTO'}
                        </motion.button>
                    </motion.div>
                )}

                {/* Finished screen */}
                {phase === 'finished' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-8 my-8 bg-black/80 p-12 border-2 border-orange-500"
                    >
                        <div className="text-7xl font-display font-bold text-orange-400 uppercase tracking-widest animate-flicker">
                            🏁 CORRIDA ENCERRADA
                        </div>
                        <div className="text-3xl font-display text-red-300">
                            Posição Final: <span className="text-orange-400 text-7xl ml-4">{player.position}º</span>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
