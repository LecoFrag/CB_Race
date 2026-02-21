import { useRaceStore } from './store/useRaceStore'
import { motion, AnimatePresence } from 'framer-motion'
import MiniMap from './components/MiniMap'
import SceneView from './components/SceneView'
import RivalPanel from './components/RivalPanel'
import PlayerStatus from './components/PlayerStatus'
import EventOverlay from './components/EventOverlay'

function NitroFlash() {
    const { currentEvent } = useRaceStore()
    return (
        <AnimatePresence>
            {currentEvent === 'nitro' && (
                <motion.div
                    className="fixed inset-0 z-30 pointer-events-none bg-orange-400"
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                />
            )}
        </AnimatePresence>
    )
}

export default function App() {
    const { phase } = useRaceStore()

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
                    <div className="w-3 h-3 bg-red-600 rounded-full dot-blink" />
                </div>
            </div>

            {/* Main layout: 3 columns */}
            <div className="flex-1 grid overflow-hidden" style={{ gridTemplateColumns: '22% 1fr 25%' }}>

                {/* Left: MiniMap */}
                <div className="border-r border-red-950 overflow-hidden">
                    <MiniMap />
                </div>

                {/* Center: SceneView */}
                <div className="overflow-hidden relative">
                    <SceneView />
                </div>

                {/* Right: RivalPanel */}
                <div className="border-l border-red-950 overflow-hidden">
                    <RivalPanel />
                </div>
            </div>

            {/* Bottom: Player Status */}
            <div className="flex-shrink-0 h-24 border-t-2 border-red-900">
                <PlayerStatus />
            </div>

            {/* Overlays */}
            <EventOverlay />
            <NitroFlash />

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
        </div>
    )
}
