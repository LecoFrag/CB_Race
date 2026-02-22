import { create } from 'zustand'
import raceData from '../data/race.json'

// Function to ensure unique positions 1-8 based on points and original position
function calculateNewRankings(player, rivals, playerPointsGained, rivalPointsGained) {
    const allRacers = [
        { id: player.id, originalPos: player.position, change: playerPointsGained, isPlayer: true, isActive: true },
        ...rivals.map(r => ({
            id: r.id,
            originalPos: r.position,
            change: rivalPointsGained[r.id] || 0,
            isPlayer: false,
            isActive: r.isActive
        }))
    ]

    allRacers.forEach(r => {
        const basePoints = 9 - r.originalPos; // 1st gets 8, 8th gets 1
        let score = basePoints + r.change;

        // Tie breaker based on original position
        // Higher originalPos value (meaning originally worse rank/behind) means higher tiebreaker score.
        score += (r.originalPos * 0.01);
        r.targetScore = score;
    });

    // Sort active racers first. Higher targetScore = better rank
    const activeRacers = allRacers.filter(r => r.isActive).sort((a, b) => b.targetScore - a.targetScore)

    // Assign new sequential 1-based ranks
    const newRanks = {}
    activeRacers.forEach((r, index) => {
        newRanks[r.id] = index + 1
    })

    const bottomRank = activeRacers.length + 1
    allRacers.filter(r => !r.isActive).forEach(r => {
        newRanks[r.id] = bottomRank
    })

    return newRanks
}

function getPathOutcome(difficulty, roll) {
    let points = 0;
    let damage = 0;

    if (difficulty === 'low') {
        if (roll <= 1) { points = -1; damage = 20; }
        else if (roll === 2) { points = 0; damage = 10; }
        else if (roll >= 3 && roll <= 8) { points = 0; damage = 0; }
        else if (roll >= 9) { points = 1; damage = 0; }
    } else if (difficulty === 'medium') {
        if (roll <= 1) { points = -2; damage = 25; }
        else if (roll >= 2 && roll <= 4) { points = -1; damage = 20; }
        else if (roll >= 5 && roll <= 7) { points = 0; damage = 0; }
        else if (roll >= 8 && roll <= 9) { points = 1; damage = 0; }
        else if (roll >= 10) { points = 2; damage = 0; }
    } else if (difficulty === 'high') {
        if (roll <= 1) { points = -3; damage = 30; }
        else if (roll >= 2 && roll <= 4) { points = -2; damage = 25; }
        else if (roll >= 5 && roll <= 6) { points = -1; damage = 20; }
        else if (roll === 7) { points = 1; damage = 0; }
        else if (roll >= 8 && roll <= 9) { points = 2; damage = 0; }
        else if (roll >= 10) { points = 3; damage = 0; }
    }
    return { points, damage };
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
    phase: 'lobby', // lobby | choosing | inputRoll | revealing | confrontation | finished
    difficulty: 3, // 1 to 5
    playerBonus: 0, // -3 to +3
    player: INITIAL_PLAYER,
    rivals: INITIAL_RIVALS,
    pendingRoll: null,
    masterOverrideValue: null,
    pendingPath: null,
    currentNarrative: raceData.race.segments[0].description,
    currentOutcomeNarrative: null,
    currentEvent: null,
    raceData: raceData.race,
    pendingConfrontation: null, // { npcId, stage: 'defense'|'attack'|'result', npcPath, actionNarrative: string, lastResult: any }
    raceLogs: [{ id: Date.now(), text: "Aguardando Configuração Inicial.", type: 'system', segment: 1 }],
}

export const useRaceStore = create((set, get) => ({
    ...INITIAL_STATE,

    // Define game start from lobby
    startGame: (playerName, difficultyLevel, pBonus) => {
        const { player } = get()
        set({
            phase: 'choosing',
            difficulty: difficultyLevel,
            playerBonus: pBonus,
            player: { ...player, name: playerName || 'JOGADOR' },
            raceLogs: [{ id: Date.now(), text: "Corrida Iniciada.", type: 'system', segment: 1 }]
        })
    },

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
        const { pendingPath, player, rivals, raceData, difficulty, playerBonus } = get()
        let finalRoll = parseInt(value, 10)

        // Apply any debuff from previous confrontation
        if (player.nextTurnModifier) {
            finalRoll += player.nextTurnModifier
        }

        // Apply player bonus from lobby (ensuring it's present)
        finalRoll += playerBonus

        // Apply nitro modifier if player used nitro this turn
        const nitroActive = get().nitroThisTurn || false
        const rollWithNitro = nitroActive ? Math.min(10, finalRoll + 3) : finalRoll

        const path = pendingPath
        const totalRoll = Math.max(1, rollWithNitro) // Prevent raw below 1

        // Determine narrative outcome
        let outcomeNarrativeType;
        if (totalRoll >= path.outcomes.success.minRoll) outcomeNarrativeType = 'success';
        else if (totalRoll >= path.outcomes.partial.minRoll) outcomeNarrativeType = 'partial';
        else outcomeNarrativeType = 'failure';

        const outcomeObj = path.outcomes[outcomeNarrativeType];
        const outcome = { ...outcomeObj, type: outcomeNarrativeType };

        const playerOutcome = getPathOutcome(path.difficulty, totalRoll);

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

            // Map difficulty (1-5) to (-2, -1, 0, 1, 2)
            const diffModifier = difficulty - 3;

            let npcFinalRoll = roll + diffModifier;
            if (isOverridden) npcFinalRoll -= 3;

            npcFinalRoll = Math.max(1, npcFinalRoll); // Prevent falling below critical failure base

            // Assign random path
            const npcPathId = availablePaths[Math.floor(Math.random() * availablePaths.length)];
            npcPaths[r.id] = npcPathId;
            const npcPathObj = currentSegmentObj.paths ? currentSegmentObj.paths.find(p => p.id === npcPathId) : null;
            const npcDiff = npcPathObj ? npcPathObj.difficulty : 'medium';

            const npcOutcome = getPathOutcome(npcDiff, npcFinalRoll);
            rivalChanges[r.id] = npcOutcome.points;

            return {
                ...r,
                damage: Math.min(100, r.damage + npcOutcome.damage),
                statusEffect: isOverridden ? null : r.statusEffect, // clear override
            };
        });

        // Calculate unique new positions
        const newRanks = calculateNewRankings(player, rivalsStatsUpdated, playerOutcome.points, rivalChanges);

        const newLogs = [];
        const allOldRacers = [player, ...rivals];

        // Format the table data for the race log
        const tableData = allOldRacers.map(r => {
            const oldPos = r.position;
            const newPos = newRanks[r.id];

            const basePoints = 9 - oldPos;
            const change = r.id === 'player' ? playerOutcome.points : (rivalChanges[r.id] || 0);

            return {
                id: r.id,
                name: r.name,
                newPos,
                oldPos,
                basePoints,
                modifier: change,
                total: basePoints + change
            }
        }).sort((a, b) => a.newPos - b.newPos); // Sort to show 1st place at the top

        newLogs.push({
            id: Date.now() + Math.random(),
            type: 'round_summary',
            segment: player.currentSegment + 1,
            tableData
        });

        let newDamage = Math.min(100, player.vehicleDamage + playerOutcome.damage)
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
                    stage: 'initiative',
                    playerInitiativeChoice: null,
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
            currentEvent: crashEvent,
            raceLogs: [...newLogs, ...get().raceLogs]
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

        // Positions are no longer recalculated here. We only move phases!

        set({
            phase: 'choosing',
            player: {
                ...player,
                currentSegment: nextSegment,
                chosenPath: null,
                statusEffect: null, // clears status for new turn
            },
            currentNarrative: raceData.segments[nextSegment].description,
            currentOutcomeNarrative: null,
            pendingPath: null,
            currentEvent: null,
            pendingConfrontation: null
        })
    },

    resolveConfrontationInitiative: (choice) => {
        const { pendingConfrontation } = get()
        set({
            pendingConfrontation: {
                ...pendingConfrontation,
                playerInitiativeChoice: choice,
                stage: choice === 'attackFirst' ? 'attack' : 'defense',
                actionNarrative: null,
                lastResult: null
            }
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
            narrative = `O Abalroamento Brutal de ${npc.name} lhe causou ${dmg}% de dano${dmg > 0 ? ' e reduziu seu desempenho' : ', mas você evitou o pior'}.`
        } else if (npc.style === 'saboteur') { // Vírus de HUD
            if (reactionId === 'firewall') {
                narrative = `Você evitou a tentativa de hack, mantendo o controle íntegro.`
            } else {
                damageToPlayer = 5
                stabilityToPlayer = 15
                narrative = `O Vírus de HUD de ${npc.name} embaralhou seus sistemas, custando estabilidade e pequeno dano no chassi.`
            }
        } else if (npc.style === 'technical') {
            // NPC Técnico: Traçado Perfeito - Rouba a posição do player se ele estiver na frente
            if (npc.position > player.position) { // NPC is behind
                newPlayerPos = npc.position
                updatedRivals = updatedRivals.map(r => r.id === npc.id ? { ...r, position: player.position } : r)
                narrative = `${npc.name} utilizou um Traçado Perfeito, encontrando a linha ideal e roubando sua posição!`
            } else {
                narrative = `${npc.name} tentou um Traçado Perfeito, mas você já estava atrás dele e ele não alterou as posições.`
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

        const newLogs = [];
        if (newPlayerPos !== player.position) {
            const moved = player.position > newPlayerPos ? 'avançou para' : 'caiu para';
            newLogs.push({
                id: Date.now() + Math.random(),
                text: `Jogador ${moved} ${newPlayerPos}º após sofrer ação técnica de ${npc.name}.`,
                type: 'position',
                segment: player.currentSegment + 1
            });
            const npcMoved = npc.position > player.position ? 'avançou para' : 'caiu para';
            newLogs.push({
                id: Date.now() + Math.random(),
                text: `${npc.name} ${npcMoved} ${player.position}º ao ultrapassar o Jogador.`,
                type: 'position',
                segment: player.currentSegment + 1
            });
        }

        let nextStage = pendingConfrontation.playerInitiativeChoice === 'defendFirst' ? 'attack' : 'result';
        if (finalDamage >= 100) nextStage = 'result';

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
                stage: nextStage,
                actionNarrative: narrative,
                lastResult: {
                    success: damageToPlayer === 0 && stabilityToPlayer === 0 && newPlayerPos === player.position,
                    damage: damageToPlayer
                }
            },
            raceLogs: [...newLogs, ...get().raceLogs]
        })
    },

    resolveConfrontationAttack: (skillId) => {
        const { player, rivals, pendingConfrontation } = get()

        const npc = rivals.find(r => r.id === pendingConfrontation.npcId)
        let newRivals = [...rivals]

        let newPlayer = { ...player }
        if (skillId !== 'skip') {
            newPlayer.skills = {
                ...player.skills,
                [skillId]: Math.max(0, player.skills[skillId] - 1)
            }
        }

        let narrative = ''
        const newLogs = [];
        let skipDefense = false;

        if (skillId === 'skip') {
            narrative = "Você preferiu guardar seus sistemas ofensivos e não atacou.";
        } else if (skillId === 'harpoon') {
            // Swap positions only if NPC is ahead
            if (npc.position < player.position) {
                const pPos = newPlayer.position
                newPlayer.position = npc.position
                newPlayer.stability = Math.max(0, newPlayer.stability - 10)
                newRivals = newRivals.map(r => r.id === npc.id ? { ...r, position: pPos } : r)
                narrative = `Você fisgou ${npc.name} com o Arpão Magnético e roubou a posição instantaneamente!`

                const moved = pPos > npc.position ? 'avançou para' : 'caiu para';
                newLogs.push({
                    id: Date.now() + Math.random(),
                    text: `Jogador ${moved} ${npc.position}º usando o Arpão.`,
                    type: 'position',
                    segment: player.currentSegment + 1
                });
                const npcMoved = npc.position > pPos ? 'avançou para' : 'caiu para';
                newLogs.push({
                    id: Date.now() + Math.random(),
                    text: `${npc.name} ${npcMoved} ${pPos}º após ser fisgado pelo Jogador.`,
                    type: 'position',
                    segment: player.currentSegment + 1
                });
            } else {
                narrative = `O Arpão foi inútil! ${npc.name} já estava atrás de você.`;
            }
        } else if (skillId === 'override') {
            newRivals = newRivals.map(r => r.id === npc.id ? { ...r, statusEffect: 'override' } : r)
            narrative = `Override ativo nos sistemas de ${npc.name}. O rival terá desvantagem no próximo segmento.`
        } else if (skillId === 'plasma') {
            newRivals = newRivals.map(r => r.id === npc.id ? { ...r, damage: Math.min(100, r.damage + 40) } : r)
            narrative = `BRUTAL! Sua Descarga de Plasma Lateral torrou o chassi de ${npc.name}.`
        } else if (skillId === 'smoke') {
            narrative = `Você cobriu a pista com a Cortina de Fumaça Densa. O rival perdeu você de vista, abortando qualquer perseguição.`
            skipDefense = true;
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

        let nextStage = pendingConfrontation.playerInitiativeChoice === 'attackFirst' ? 'defense' : 'result';
        if (skipDefense || newlyDestroyed.length > 0) nextStage = 'result';

        set({
            player: newPlayer,
            rivals: newRivals,
            pendingConfrontation: {
                ...pendingConfrontation,
                stage: nextStage,
                actionNarrative: narrative,
                lastResult: { success: skillId !== 'skip' && narrative.indexOf('inútil') === -1 }
            },
            currentEvent: crashEvent,
            raceLogs: [...newLogs, ...get().raceLogs]
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
