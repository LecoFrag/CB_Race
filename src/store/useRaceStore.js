import { create } from 'zustand'
import raceData from '../data/race.json'

const INITIAL_RIVALS = raceData.race.rivals.map((r, i) => ({
    ...r,
    position: i + 2, // positions 2-8, player starts at 1
    damage: 0,
    isActive: true,
}))

const INITIAL_PLAYER = {
    id: 'player',
    name: 'JOGADOR',
    portrait: 'player.png',
    position: 1,
    vehicleDamage: 0,
    nitro: 3,
    stability: 100,
    currentSegment: 0,
    chosenPath: null,
    statusEffect: null, // null | 'overheating' | 'locked'
}

const INITIAL_STATE = {
    phase: 'choosing', // choosing | rolling | masterReview | revealing | advancing | finished
    player: INITIAL_PLAYER,
    rivals: INITIAL_RIVALS,
    pendingRoll: null,
    masterOverrideValue: null,
    pendingPath: null,
    currentNarrative: raceData.race.segments[0].description,
    currentOutcomeNarrative: null,
    currentEvent: null,
    raceData: raceData.race,
}

export const useRaceStore = create((set, get) => ({
    ...INITIAL_STATE,

    // Player selects a path → triggers input phase
    choosePath: (pathId) => {
        const { player, raceData } = get()
        const segment = raceData.segments[player.currentSegment]
        const path = segment.paths.find(p => p.id === pathId)
        if (!path) return

        set({
            phase: 'inputRoll',
            pendingPath: path,
        })
    },

    // Jogador insere o valor do dado manual
    submitManualRoll: (value) => {
        const { pendingPath, player, rivals } = get()
        const finalRoll = parseInt(value, 10)

        // Apply nitro modifier if player used nitro this turn
        const nitroActive = get().nitroThisTurn || false
        const rollWithNitro = nitroActive ? Math.min(10, finalRoll + 3) : finalRoll

        const path = pendingPath
        const totalRoll = rollWithNitro + (path.pathModifier || 0)

        // Determine outcome
        let outcome
        if (totalRoll >= path.outcomes.success.minRoll) {
            outcome = { ...path.outcomes.success, type: 'success' }
        } else if (totalRoll >= path.outcomes.partial.minRoll) {
            outcome = { ...path.outcomes.partial, type: 'partial' }
        } else {
            outcome = { ...path.outcomes.failure, type: 'failure' }
        }

        // Update player state
        const newDamage = Math.min(100, player.vehicleDamage + (outcome.damageIncrease || 0))
        const newPosition = Math.max(1, Math.min(8, player.position + (outcome.positionChange || 0)))
        const newNitro = nitroActive ? player.nitro - 1 : player.nitro

        set({
            phase: 'revealing',
            player: {
                ...player,
                vehicleDamage: newDamage,
                position: newPosition,
                nitro: newNitro,
                chosenPath: path.id,
                statusEffect: outcome.statusEffect || null,
                stability: Math.max(0, player.stability - (outcome.damageIncrease ? outcome.damageIncrease * 0.5 : 0)),
            },
            currentNarrative: path.narrative,
            currentOutcomeNarrative: outcome.narrative,
            lastOutcome: { ...outcome, finalRoll: rollWithNitro, path },
            nitroThisTurn: false,
        })
    },

    // Advance to next segment
    advanceSegment: () => {
        const { player, raceData } = get()
        const nextSegment = player.currentSegment + 1

        if (nextSegment >= raceData.segments.length) {
            set({ phase: 'finished' })
            return
        }

        // Simulate rival position updates
        const rivals = get().rivals.map(r => {
            if (!r.isActive) return r
            const roll = Math.ceil(Math.random() * 10)
            const posChange = roll >= 7 ? 1 : roll >= 4 ? 0 : -1
            return {
                ...r,
                position: Math.max(1, Math.min(8, r.position + posChange)),
                damage: Math.min(100, r.damage + Math.floor(Math.random() * 15)),
            }
        })

        set({
            phase: 'choosing',
            player: {
                ...player,
                currentSegment: nextSegment,
                chosenPath: null,
                statusEffect: null,
            },
            rivals,
            currentNarrative: raceData.segments[nextSegment].description,
            currentOutcomeNarrative: null,
            currentOutcomeNarrative: null,
            pendingPath: null,
            currentEvent: null,
        })
    },

    // Activate nitro
    activateNitro: () => {
        const { player } = get()
        if (player.nitro <= 0) return
        set({ nitroThisTurn: true, currentEvent: 'nitro' })
        setTimeout(() => set({ currentEvent: null }), 2000)
    },

    // Ativar eventos especiais manualmente via UI futura se nescessário
    triggerEvent: (eventType) => {
        set({ currentEvent: eventType })
        if (eventType === 'crash') {
            // remove last rival
            const rivals = [...get().rivals]
            const activeRivals = rivals.filter(r => r.isActive)
            if (activeRivals.length > 0) {
                const last = activeRivals[activeRivals.length - 1]
                const updated = rivals.map(r => r.id === last.id ? { ...r, isActive: false } : r)
                set({ rivals: updated })
            }
        }
    },

    // Master: update any competitor stat
    masterUpdateCompetitor: (id, field, value) => {
        if (id === 'player') {
            set(state => ({ player: { ...state.player, [field]: value } }))
        } else {
            set(state => ({
                rivals: state.rivals.map(r => r.id === id ? { ...r, [field]: value } : r)
            }))
        }
    },

    // Master: go to specific segment
    masterSetSegment: (segmentIndex) => {
        const { raceData, player } = get()
        if (segmentIndex < 0 || segmentIndex >= raceData.segments.length) return
        set({
            phase: 'choosing',
            player: { ...player, currentSegment: segmentIndex, chosenPath: null },
            currentNarrative: raceData.segments[segmentIndex].description,
            currentOutcomeNarrative: null,
        })
    },

    // Reset race completely
    resetRace: () => {
        set({ ...INITIAL_STATE, raceData: raceData.race })
    },

    // Clear event overlay
    clearEvent: () => set({ currentEvent: null }),
}))
