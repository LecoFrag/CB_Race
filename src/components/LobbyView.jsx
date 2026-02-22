import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRaceStore } from '../store/useRaceStore'
import { Gamepad2, Skull, Sparkles, User } from 'lucide-react'

export default function LobbyView() {
    const { startGame } = useRaceStore()

    const [playerName, setPlayerName] = useState('JOGADOR')
    const [difficulty, setDifficulty] = useState(3)
    const [playerBonus, setPlayerBonus] = useState(0)

    const handleStart = () => {
        // Ensure name is not empty
        const finalName = playerName.trim() === '' ? 'JOGADOR' : playerName.trim()
        startGame(finalName, difficulty, playerBonus)
    }

    const difficultyInfo = {
        1: { label: 'TURISTA', desc: 'Rolar dados é um sofrimento para os inimigos (-2 nas rolagens inimigas). O passeio no parque cibernético.', color: 'text-green-400' },
        2: { label: 'MERCENÁRIO', desc: 'Inimigos cometem mais erros (-1 nas rolagens inimigas). Leve vantagem estratégica.', color: 'text-blue-400' },
        3: { label: 'CYBERPUNK', desc: 'Experiência padrão (Sem modificadores inimigos). Sobreviva às regras frias de Night City.', color: 'text-orange-400' },
        4: { label: 'HARDCORE', desc: 'Rivais implacáveis (+1 nas rolagens inimigas). Prepare-se para suar a jaqueta.', color: 'text-red-400' },
        5: { label: 'LENDA CORPORATIVA', desc: 'Praticamente suicídio (+2 nas rolagens inimigas). Eles nunca erram. Boa sorte.', color: 'text-purple-400' }
    }

    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-black/90 p-8 relative overflow-y-auto scanlines">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl w-full border border-red-900 bg-red-950/20 p-8 relative z-10 flex flex-col gap-10 shadow-[0_0_50px_rgba(150,0,0,0.3)]"
            >
                {/* Header */}
                <div className="text-center pb-6 border-b border-red-900/50">
                    <h1 className="text-5xl font-display font-bold text-orange-500 tracking-[0.2em] mb-2 uppercase animate-flicker">
                        Acesso ao Servidor
                    </h1>
                    <p className="text-red-400 font-mono text-sm tracking-widest">
                        CONFIGURE OS PARÂMETROS DA <span className="text-white">NOVA VITÓRIA RACE</span>
                    </p>
                </div>

                {/* Form Elements */}
                <div className="flex flex-col gap-8">

                    {/* Character Name */}
                    <div className="flex justify-between items-center bg-black/50 p-6 border-l-4 border-orange-500 group focus-within:border-orange-400 transition-colors">
                        <div className="flex flex-col gap-1">
                            <label className="text-orange-400 font-display uppercase tracking-widest font-bold flex items-center gap-2">
                                <User size={18} /> Nome do Corredor
                            </label>
                            <span className="text-xs text-orange-800 font-mono">Apelido nas transmissões da corrida.</span>
                        </div>
                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                            maxLength={16}
                            className="bg-red-950/30 border border-red-800 text-white font-display text-2xl p-3 text-center w-64 focus:outline-none focus:border-orange-500 focus:bg-red-900/40 transition-all uppercase tracking-widest"
                            placeholder="JOGADOR"
                        />
                    </div>

                    {/* Difficulty */}
                    <div className="flex flex-col gap-4 bg-black/50 p-6 border-l-4 border-red-600">
                        <div className="flex flex-col gap-1 mb-2">
                            <label className="text-red-500 font-display uppercase tracking-widest font-bold flex items-center gap-2">
                                <Skull size={18} /> Protocolo de Dificuldade
                            </label>
                            <span className="text-xs text-red-900 font-mono">Afeta o nível de precisão de IA dos adversários.</span>
                        </div>

                        <div className="grid grid-cols-5 gap-2">
                            {[1, 2, 3, 4, 5].map(lvl => (
                                <button
                                    key={lvl}
                                    onClick={() => setDifficulty(lvl)}
                                    className={`
                                        p-3 border font-display text-xl font-bold transition-all
                                        ${difficulty === lvl
                                            ? 'bg-red-800 border-red-500 text-white shadow-[0_0_15px_rgba(255,0,0,0.5)] scale-105'
                                            : 'bg-black border-red-950 text-red-800 hover:border-red-700 hover:text-red-500'}
                                    `}
                                >
                                    NVL. {lvl}
                                </button>
                            ))}
                        </div>

                        <div className={`mt-2 text-sm font-mono border border-dashed border-gray-800 p-3 bg-black/40 ${difficultyInfo[difficulty].color}`}>
                            <strong>{difficultyInfo[difficulty].label}:</strong> {difficultyInfo[difficulty].desc}
                        </div>
                    </div>

                    {/* Bonus Modifiers */}
                    <div className="flex justify-between items-center bg-black/50 p-6 border-l-4 border-blue-500">
                        <div className="flex flex-col gap-1 w-2/3">
                            <label className="text-blue-400 font-display uppercase tracking-widest font-bold flex items-center gap-2">
                                <Sparkles size={18} /> Ajuste Cibernético (Bônus)
                            </label>
                            <span className="text-xs text-blue-900 font-mono">Modificador fixo para todas as suas rolagens. Use com parcimônia se for trapacear o sistema.</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setPlayerBonus(Math.max(-3, playerBonus - 1))}
                                className="w-10 h-10 flex items-center justify-center bg-black border border-blue-900 text-blue-500 hover:bg-blue-950 transition-colors text-xl font-bold"
                            >-</button>
                            <span className={`font-display text-3xl font-bold w-12 text-center ${playerBonus > 0 ? 'text-green-400' : playerBonus < 0 ? 'text-red-400' : 'text-blue-200'}`}>
                                {playerBonus > 0 ? `+${playerBonus}` : playerBonus}
                            </span>
                            <button
                                onClick={() => setPlayerBonus(Math.min(3, playerBonus + 1))}
                                className="w-10 h-10 flex items-center justify-center bg-black border border-blue-900 text-blue-500 hover:bg-blue-950 transition-colors text-xl font-bold"
                            >+</button>
                        </div>
                    </div>

                </div>

                {/* Final Launch Button */}
                <div className="mt-4 flex justify-center pb-2">
                    <button
                        onClick={handleStart}
                        className="relative group bg-orange-600 px-16 py-6 border-2 border-orange-400 text-black font-display font-black text-3xl tracking-[0.2em] transition-all hover:bg-orange-500 hover:scale-105 shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:shadow-[0_0_50px_rgba(249,115,22,0.8)] overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                        <span className="relative z-10 flex items-center gap-4">
                            <Gamepad2 size={32} /> INICIAR CORRIDA
                        </span>
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
