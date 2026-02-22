import { useState, useRef, useEffect } from 'react'
import { useRaceStore } from './store/useRaceStore'
import { motion, AnimatePresence } from 'framer-motion'
import MiniMap from './components/MiniMap'
import SceneView from './components/SceneView'
import RivalPanel from './components/RivalPanel'
import PlayerStatus from './components/PlayerStatus'
import EventOverlay from './components/EventOverlay'
import RaceLog from './components/RaceLog'
import LobbyView from './components/LobbyView'
import { Volume2, VolumeX } from 'lucide-react'

function NitroFlash() {
    const { currentEvent } = useRaceStore()
    return (
        <AnimatePresence>
            {currentEvent === 'nitro' && (
                <>
                    <motion.div
                        className="fixed inset-0 z-30 pointer-events-none bg-orange-400"
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    />
                    <motion.div
                        className="fixed inset-y-0 right-0 z-40 pointer-events-none flex items-center justify-end overflow-hidden"
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: '0%', opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 60, mass: 1.2 }}
                    >
                        <div className="flex items-center h-[40vh] gap-6 pr-0 drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                            <motion.img
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.4, type: 'spring' }}
                                src="./assets/portraits/quebrar.png"
                                alt="Eu vou botar pra quebrar"
                                className="h-[40rem] object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]"
                            />
                            <img
                                src="./assets/portraits/player_focus.png"
                                className="h-full object-cover max-w-none border-l-4 border-orange-500 shadow-[-20px_0_50px_rgba(249,115,22,0.5)]"
                            />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default function App() {
    const { phase } = useRaceStore()
    const [isMuted, setIsMuted] = useState(false)
    const audioRef = useRef(null)

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.3;
            // Attempt autoplay
            audioRef.current.play().catch(e => console.log("Autoplay prevented:", e));
        }
    }, [])

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    }

    return (
        <div className="w-screen h-screen bg-cyber-dark overflow-hidden flex flex-col relative">

            {/* Top title bar */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-1.5 border-b-2 border-red-900 bg-black"
                style={{ background: 'linear-gradient(90deg, #0a0a0a 0%, #1a0505 50%, #0a0a0a 100%)' }}
            >
                <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-red-600 rounded-full dot-blink" />
                    <span className="text-sm text-red-700 font-mono uppercase tracking-widest">CYBERPUNK RED RPG • CAMPANHA BRASILEIRA</span>
                </div>
                <div className="text-center">
                    <span className="text-2xl font-display font-bold text-orange-400 uppercase tracking-[0.3em] animate-flicker">
                        ▸ NOVA VITÓRIA RACE ◂
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-red-700 font-mono uppercase tracking-widest">SISTEMA INTERATIVO v1.1</span>
                    <button onClick={toggleMute} className="text-red-700 hover:text-red-400 transition-colors focus:outline-none" title="Mutar/Desmutar Música">
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <div className="w-3 h-3 bg-red-600 rounded-full dot-blink" />
                </div>
            </div >

            {/* Main layout: 3 columns */}
            < div className="flex-1 grid overflow-hidden" style={{ gridTemplateColumns: '22% 1fr 25%' }
            }>

                {/* Left: MiniMap */}
                < div className="border-r border-red-950 overflow-hidden" >
                    <MiniMap />
                </div >

                {/* Center: SceneView or LobbyView */}
                < div className="overflow-hidden relative" >
                    {phase === 'lobby' ? <LobbyView /> : <SceneView />}
                </div >

                {/* Right: RivalPanel */}
                < div className="border-l border-red-950 overflow-hidden" >
                    <RivalPanel />
                </div >
            </div >

            {/* Bottom: Player Status */}
            < div className="flex-shrink-0 h-24 border-t-2 border-red-900" >
                <PlayerStatus />
            </div >

            {/* Overlays */}
            < EventOverlay />
            <NitroFlash />
            <RaceLog />

            {/* Background Audio */}
            <audio ref={audioRef} src="./neon_race.mp3" loop />

            {/* Global scanlines overlay */}
            <div
                className="fixed inset-0 pointer-events-none z-20"
                style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)',
                }}
            />

            {/* Corner decorations */}
            <div className="fixed top-8 left-0 w-3 h-16 bg-gradient-to-r from-red-900/40 to-transparent pointer-events-none z-10" />
            <div className="fixed top-8 right-0 w-3 h-16 bg-gradient-to-l from-red-900/40 to-transparent pointer-events-none z-10" />
        </div >
    )
}
