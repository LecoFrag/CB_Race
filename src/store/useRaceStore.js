import { create } from 'zustand'
import raceData from '../data/race.json'

// Function to ensure unique positions 1-8 without ties
function calculateNewRankings(player, rivals, playerPosChange, rivalPosChanges) {
    const allRacers = [
        { id: player.id, originalPos: player.position, change: playerPosChange, isPlayer: true, isActive: true },
        ...rivals.map(r => ({
            id: r.id,
            originalPos: r.position,
            change: rivalPosChanges[r.id] || 0,
            isPlayer: false,
            isActive: r.isActive
        }))
    ]

    // Calculate target positional score
    allRacers.forEach(r => {
        let target = r.originalPos - r.change; // Minus because lower pos = better rank

        // Boosts for overtaking and falling behind
        if (r.change > 0) target -= 0.5;
        else if (r.change < 0) target += 0.5;

        // Tie breaker based on original position (whoever was ahead, stays ahead in ties)
        target += (r.originalPos * 0.01);
        r.targetPos = target;
    });

    // Sort active racers first. Lower targetPos = better rank
    const activeRacers = allRacers.filter(r => r.isActive).sort((a, b) => a.targetPos - b.targetPos)

    // Assign new sequential 1-based ranks to active racers (closing gaps)
    const newRanks = {}
    activeRacers.forEach((r, index) => {
        newRanks[r.id] = index + 1
    })

    // Inactive racers just keep their last known position or get pushed to the bottom
    const bottomRank = activeRacers.length + 1
    allRacers.filter(r => !r.isActive).forEach(r => {
        newRanks[r.id] = bottomRank
    })

    return newRanks
}

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
    nitro: 2,
    stability: 100,
    currentSegment: 0,
    chosenPath: null,
    statusEffect: null, // null | 'overheating' | 'locked'
    skills: { harpoon: 1, override: 1, plasma: 2, smoke: 1 },
    nextTurnModifier: 0,
}

const INITIAL_STATE = {
    phase: 'choosing', // choosing | inputRoll | revealing | confrontation | finished
    player: INITIAL_PLAYER,
    rivals: INITIAL_RIVALS,
    pendingRoll: null,
    masterOverrideValue: null,
    pendingPath: null,
    currentNarrative: raceData.race.segments[0].description,
    currentOutcomeNarrative: null,
    currentEvent: null,
    raceData: raceData.race,
    pendingConfrontation: null, // { npcId, stage: 'defense'|'attack'|'result', npcPath, actionNarrative: string }
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
        const { pendingPath, player, rivals, raceData } = get()
        let finalRoll = parseInt(value, 10)

        // Apply any debuff from previous confrontation
        if (player.nextTurnModifier) {
            finalRoll += player.nextTurnModifier
        }

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

        // Simulate rival position updates for THIS segment
        const rivalChanges = {};
        const npcPaths = {};
        const currentSegmentObj = raceData.segments[player.currentSegment];
        const availablePaths = currentSegmentObj.paths ? currentSegmentObj.paths.map(p => p.id) : ['A', 'B', 'C'];

        const rivalsStatsUpdated = rivals.map(r => {
            if (!r.isActive) return r;
            const roll = Math.ceil(Math.random() * 10);

            // Check if player has overridden this NPC (desvantagem)
            const isOverridden = r.statusEffect === 'override';
            const npcFinalRoll = isOverridden ? Math.max(1, roll - 3) : roll;

            const posChangeNpc = npcFinalRoll >= 7 ? 1 : npcFinalRoll >= 4 ? 0 : -1;
            rivalChanges[r.id] = posChangeNpc;

            // Assign random path
            npcPaths[r.id] = availablePaths[Math.floor(Math.random() * availablePaths.length)];

            return {
                ...r,
                damage: Math.min(100, r.damage + Math.floor(Math.random() * 10)),
                statusEffect: isOverridden ? null : r.statusEffect, // clear override
            };
        });

        // Calculate unique new positions
        const posChange = outcome.positionChange || 0;
        const newRanks = calculateNewRankings(player, rivalsStatsUpdated, posChange, rivalChanges);

        let newDamage = Math.min(100, player.vehicleDamage + (outcome.damageIncrease || 0))
        const newNitro = nitroActive ? player.nitro - 1 : player.nitro

        // Check for player elimination
        let racePhase = 'revealing'
        if (newDamage >= 100) {
            racePhase = 'finished'
            newDamage = 100
        }

        const updatedRivals = rivalsStatsUpdated.map(r => {
            if (!r.isActive) return r;
            const isDestroyed = r.damage >= 100;
            return {
                ...r,
                position: newRanks[r.id],
                isActive: !isDestroyed,
                damage: isDestroyed ? 100 : r.damage
            }
        });

        // Did anyone explode just now? (Check for newly inactive rivals that were active before)
        const newlyDestroyed = updatedRivals.filter(r => !r.isActive && rivals.find(old => old.id === r.id)?.isActive)
        const crashEvent = newlyDestroyed.length > 0 ? { type: 'crash', targets: newlyDestroyed } : null

        // Check for confrontation (only if player is still alive)
        const playerNewPos = newRanks[player.id];
        let pendingConfrontation = null;

        if (racePhase !== 'finished') {
            const gluedNpcs = updatedRivals.filter(r =>
                r.isActive &&
                npcPaths[r.id] === path.id &&
                Math.abs(r.position - playerNewPos) === 1
            );

            if (gluedNpcs.length > 0) {
                const chosenNpc = gluedNpcs[Math.floor(Math.random() * gluedNpcs.length)];
                pendingConfrontation = {
                    npcId: chosenNpc.id,
                    stage: 'defense',
                    npcPath: path.id,
                    actionNarrative: null
                };
            }
        }

        set({
            phase: racePhase,
            player: {
                ...player,
                vehicleDamage: newDamage,
                position: playerNewPos,
                nitro: newNitro,
                chosenPath: path.id,
                statusEffect: outcome.statusEffect || null,
                stability: Math.max(0, player.stability - (outcome.damageIncrease ? outcome.damageIncrease * 0.5 : 0)),
                nextTurnModifier: 0, // clears after use
            },
            rivals: updatedRivals,
            currentNarrative: path.narrative,
            currentOutcomeNarrative: outcome.narrative,
            lastOutcome: { ...outcome, finalRoll: rollWithNitro, path },
            nitroThisTurn: false,
            pendingConfrontation,
            currentEvent: crashEvent
        })
    },

    // Enter Confrontation Phase or Advance
    triggerConfrontation: () => {
        set({ phase: 'confrontation' });
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
        const rivalChanges = {};
        const rivalsStatsUpdated = get().rivals.map(r => {
            if (!r.isActive) return r;
            const roll = Math.ceil(Math.random() * 10);

            const isOverridden = r.statusEffect === 'override';
            const npcFinalRoll = isOverridden ? Math.max(1, roll - 3) : roll;

            // 1 means gaining position (moves up in rank)
            const posChange = npcFinalRoll >= 7 ? 1 : npcFinalRoll >= 4 ? 0 : -1;
            rivalChanges[r.id] = posChange;

            return {
                ...r,
                damage: Math.min(100, r.damage + Math.floor(Math.random() * 10)), // Reduced random passive damage slightly to balance
                statusEffect: isOverridden ? null : r.statusEffect
            };
        });

        const newRanks = calculateNewRankings(player, rivalsStatsUpdated, 0, rivalChanges);

        const newlyDestroyed = []
        const updatedRivals = rivalsStatsUpdated.map(r => {
            if (!r.isActive) return r;
            const isDestroyed = r.damage >= 100;
            if (isDestroyed) newlyDestroyed.push(r)
            return {
                ...r,
                position: newRanks[r.id],
                isActive: !isDestroyed,
                damage: isDestroyed ? 100 : r.damage
            }
        });

        const crashEvent = newlyDestroyed.length > 0 ? { type: 'crash', targets: newlyDestroyed } : null

        set({
            phase: 'choosing',
            player: {
                ...player,
                position: newRanks[player.id], // ensure player pos is updated during advance without paths
                currentSegment: nextSegment,
                chosenPath: null,
                statusEffect: null, // clears status for new turn
            },
            rivals: updatedRivals,
            currentNarrative: raceData.segments[nextSegment].description,
            currentOutcomeNarrative: null,
            pendingPath: null,
            currentEvent: crashEvent,
            pendingConfrontation: null
        })
    },

    // --- CONFRONTATION ACTIONS ---
    resolveConfrontationDefense: (reactionId) => {
        const { player, rivals, pendingConfrontation } = get()
        const npc = rivals.find(r => r.id === pendingConfrontation.npcId)

        let damageToPlayer = 0
        let stabilityToPlayer = 0
        let nextTurnModifier = player.nextTurnModifier
        let narrative = ''
        let newPlayerPos = player.position
        let updatedRivals = [...rivals]

        // Arquétipos: aggressive, saboteur, technical, unpredictable
        if (npc.style === 'aggressive') { // Abalroamento Brutal
            let dmg = 20
            if (reactionId === 'evade') { dmg = Math.random() > 0.5 ? 0 : 20 }
            else if (reactionId === 'brace') { dmg = 10 }

            damageToPlayer = dmg
            if (dmg > 0) nextTurnModifier = -1
            narrative = `O Abalroamento Brutal de ${npc.name} lhe causou ${dmg}% de dano e ${dmg > 0 ? 'reduziu seu desempenho para o próximo turno' : 'mas você evitou o pior'}.`
        } else if (npc.style === 'saboteur') { // Vírus de HUD
            if (reactionId === 'firewall') {
                narrative = `Você evitou a tentativa de hack, mantendo o controle íntegro.`
            } else {
                damageToPlayer = 5
                stabilityToPlayer = 15
                narrative = `O Vírus de HUD de ${npc.name} embaralhou seus sistemas, custando estabilidade e pequeno dano no chassi.`
            }
        } else if (npc.style === 'technical') {
            // NPC Técnico: Traçado Perfeito - Rouba a posição do player se ele estiver na frente, ou passa ele se estiver atrás
            if (npc.position > player.position) { // NPC is behind (e.g. 4th vs Player 3rd)
                newPlayerPos = npc.position // Player goes to 4th
                updatedRivals = updatedRivals.map(r => r.id === npc.id ? { ...r, position: player.position } : r)
                narrative = `${npc.name} utilizou um Traçado Perfeito, encontrando a linha ideal e roubando sua posição!`
            } else {
                narrative = `${npc.name} utilizou um Traçado Perfeito e disparou na sua frente, consolidando a posição.`
            }
        } else { // unpredictable
            let dmg = 30
            if (reactionId === 'evade') { dmg = Math.random() > 0.6 ? 0 : 30 }
            else if (reactionId === 'brace') { dmg = 15 }

            damageToPlayer = dmg
            narrative = `${npc.name} sacou uma arma pesada! Você sofreu ${dmg}% de dano no chassi.`
        }

        const finalDamage = Math.min(100, player.vehicleDamage + damageToPlayer);
        let phase = get().phase;
        if (finalDamage >= 100) phase = 'finished';

        set({
            phase,
            player: {
                ...player,
                vehicleDamage: finalDamage,
                stability: Math.max(0, player.stability - stabilityToPlayer),
                position: newPlayerPos,
                nextTurnModifier
            },
            rivals: updatedRivals,
            pendingConfrontation: {
                ...pendingConfrontation,
                stage: 'attack',
                actionNarrative: narrative
            }
        })
    },

    resolveConfrontationAttack: (skillId) => {
        const { player, rivals, pendingConfrontation } = get()
        if (skillId === 'skip') {
            get().advanceSegment()
            return
        }

        const npc = rivals.find(r => r.id === pendingConfrontation.npcId)
        let newRivals = [...rivals]

        let newPlayer = {
            ...player,
            skills: {
                ...player.skills,
                [skillId]: Math.max(0, player.skills[skillId] - 1)
            }
        }

        let narrative = ''

        if (skillId === 'harpoon') {
            // Swap positions
            const pPos = newPlayer.position
            newPlayer.position = npc.position
            newPlayer.stability = Math.max(0, newPlayer.stability - 10)
            newRivals = newRivals.map(r => r.id === npc.id ? { ...r, position: pPos } : r)
            narrative = `Você fisgou ${npc.name} com o Arpão Magnético e roubou a posição instantaneamente!`
        } else if (skillId === 'override') {
            newRivals = newRivals.map(r => r.id === npc.id ? { ...r, statusEffect: 'override' } : r)
            narrative = `Override ativo nos sistemas de ${npc.name}. O rival terá desvantagem no próximo segmento.`
        } else if (skillId === 'plasma') {
            newRivals = newRivals.map(r => r.id === npc.id ? { ...r, damage: Math.min(100, r.damage + 40) } : r)
            narrative = `BRUTAL! Sua Descarga de Plasma Lateral torrou o chassi de ${npc.name}.`
        } else if (skillId === 'smoke') {
            narrative = `Você cobriu a pista com a Cortina de Fumaça Densa. O rival perdeu você de vista, abortando qualquer perseguição.`
        }

        // Processing eliminations if NPC died from Plasma
        const newlyDestroyed = []
        newRivals = newRivals.map(r => {
            if (r.isActive && r.damage >= 100) {
                newlyDestroyed.push(r)
                return { ...r, isActive: false, damage: 100 }
            }
            return r
        })
        const crashEvent = newlyDestroyed.length > 0 ? { type: 'crash', targets: newlyDestroyed } : null

        set({
            player: newPlayer,
            rivals: newRivals,
            pendingConfrontation: { ...pendingConfrontation, stage: 'result', actionNarrative: narrative },
            currentEvent: crashEvent
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
