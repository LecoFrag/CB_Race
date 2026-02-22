import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRaceStore } from '../store/useRaceStore'
import { List, X } from 'lucide-react'

export default function RaceLog() {
    const [isOpen, setIsOpen] = useState(false)
    const { raceLogs } = useRaceStore()

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-24 right-4 z-50 bg-black/80 border border-orange-500 text-orange-400 p-2 hover:bg-orange-900/60 transition-colors flex flex-col items-center gap-1 shadow-[0_0_15px_rgba(249,115,22,0.3)] group"
                title="Abrir Log da Corrida"
            >
                <List size={22} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] uppercase font-display font-bold tracking-widest">LOG</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 20 }}
                        className="fixed inset-y-0 right-0 w-80 bg-black/95 border-l-2 border-orange-600 z-50 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.8)]"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-orange-900/50 bg-orange-950/30">
                            <h3 className="font-display font-bold text-orange-400 tracking-widest text-lg">LOG DE EVENTOS</h3>
                            <button onClick={() => setIsOpen(false)} className="text-orange-600 hover:text-orange-300 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-hide">
                            {raceLogs?.map(log => (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={log.id}
                                    className="border-l-2 border-orange-600 pl-3 py-1 bg-gradient-to-r from-orange-950/20 to-transparent"
                                >
                                    <div className="text-[10px] text-orange-700 font-mono mb-1">Seg {log.segment} • {log.type.toUpperCase()}</div>
                                    <div className="text-sm text-orange-200 font-mono leading-snug">{log.text}</div>
                                </motion.div>
                            ))}
                            {(!raceLogs || raceLogs.length === 0) && (
                                <div className="text-center text-orange-800 font-mono mt-10">
                                    Nenhum evento registrado ainda.
                                </div>
                            )}
                        </div>
                        <div className="p-3 border-t border-orange-900/30 text-center">
                            <span className="text-[10px] text-orange-800 font-mono">▸ REGISTRO DO SISTEMA ATUALIZADO</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
