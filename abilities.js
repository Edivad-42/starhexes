// Sistema di abilità per Star Hexes
const ABILITIES = {
    // ==================== ABILITÀ MOVIMENTO ====================

    doubleMove: {
        name: "Boost Engines",
        description: "Muovi di 2 esagoni invece di 1",
        type: "active",
        trigger: "movement",
        charges: 2,
        maxCharges: 2,
        cooldown: 1,
        icon: "🚀",

        canUse: (unit, gameState) => {
            const state = unit.abilityStates?.doubleMove;
            if (!state) return false;
            return state.charges > 0 && state.cooldown === 0;
        },

        effect: (unit, gameState, hexUtils) => {
            // Restituisce mosse con raggio 2
            const moves = [];
            const visited = new Set([`${unit.q},${unit.r}`]);
            const queue = [[unit.q, unit.r, 0]];

            while (queue.length > 0) {
                const [q, r, dist] = queue.shift();

                if (dist < 2) {
                    const neighbors = hexUtils.getNeighbors(q, r);
                    neighbors.forEach(([nq, nr]) => {
                        const key = `${nq},${nr}`;
                        if (!visited.has(key) &&
                            nq >= 0 && nq < gameState.config.map.width &&
                            nr >= 0 && nr < gameState.config.map.height &&
                            !gameState.isOccupied(nq, nr, unit.id)) {
                            visited.add(key);
                            moves.push([nq, nr]);
                            queue.push([nq, nr, dist + 1]);
                        }
                    });
                }
            }

            return { validMoves: moves };
        },

        onUse: (unit) => {
            unit.abilityStates.doubleMove.charges--;
            unit.abilityStates.doubleMove.cooldown = 1;
        }
    },

    // ==================== ABILITÀ COMBATTIMENTO ====================

    ionCannon: {
        name: "Ion Cannon",
        description: "Attacca unità a distanza 2",
        type: "active",
        trigger: "attack",
        charges: 1,
        maxCharges: 1,
        cooldown: 2,
        icon: "⚡",

        canUse: (unit, gameState) => {
            const state = unit.abilityStates?.ionCannon;
            if (!state) return false;
            return state.charges > 0 && state.cooldown === 0;
        },

        effect: (unit, gameState, hexUtils) => {
            // Trova tutti i nemici entro raggio 2
            const targets = [];
            const visited = new Set();
            const queue = [[unit.q, unit.r, 0]];

            while (queue.length > 0) {
                const [q, r, dist] = queue.shift();
                const key = `${q},${r}`;

                if (visited.has(key)) continue;
                visited.add(key);

                const target = gameState.getUnitAt(q, r);
                if (target && target.player !== unit.player && dist > 0 && dist <= 2) {
                    targets.push([q, r]);
                }

                if (dist < 2) {
                    hexUtils.getNeighbors(q, r).forEach(([nq, nr]) => {
                        if (nq >= 0 && nq < gameState.config.map.width &&
                            nr >= 0 && nr < gameState.config.map.height) {
                            queue.push([nq, nr, dist + 1]);
                        }
                    });
                }
            }

            return { targetHexes: targets };
        },

        onUse: (unit, targetPos) => {
            unit.abilityStates.ionCannon.charges--;
            unit.abilityStates.ionCannon.cooldown = 2;
            return { target: targetPos, damage: unit.damage };
        }
    },

    protonTorpedoes: {
        name: "Proton Torpedoes",
        description: "Attacca unità a distanza 2 (1 uso)",
        type: "active",
        trigger: "attack",
        charges: 1,
        maxCharges: 1,
        cooldown: 0,
        icon: "🚀",

        canUse: (unit, gameState) => {
            const state = unit.abilityStates?.protonTorpedoes;
            if (!state) return false;
            return state.charges > 0;
        },

        effect: (unit, gameState, hexUtils) => {
            // Trova tutti i nemici entro raggio 2
            const targets = [];
            const visited = new Set();
            const queue = [[unit.q, unit.r, 0]];

            while (queue.length > 0) {
                const [q, r, dist] = queue.shift();
                const key = `${q},${r}`;

                if (visited.has(key)) continue;
                visited.add(key);

                const target = gameState.getUnitAt(q, r);
                if (target && target.player !== unit.player && dist > 0 && dist <= 2) {
                    targets.push([q, r]);
                }

                if (dist < 2) {
                    hexUtils.getNeighbors(q, r).forEach(([nq, nr]) => {
                        if (nq >= 0 && nq < gameState.config.map.width &&
                            nr >= 0 && nr < gameState.config.map.height) {
                            queue.push([nq, nr, dist + 1]);
                        }
                    });
                }
            }

            return { targetHexes: targets };
        },

        onUse: (unit, targetPos) => {
            unit.abilityStates.protonTorpedoes.charges--;
            // Danni maggiorati del 50%
            return { target: targetPos, damage: Math.floor(unit.damage * 1.5) };
        }
    },

    preciseShot: {
        name: "Precise Shot",
        description: "+50% danno per questo turno",
        type: "active",
        trigger: "combat",
        charges: 1,
        maxCharges: 1,
        cooldown: 3,
        icon: "🎯",

        canUse: (unit, gameState) => {
            const state = unit.abilityStates?.preciseShot;
            if (!state) return false;
            return state.charges > 0 && state.cooldown === 0;
        },

        effect: (unit, gameState) => {
            return { damageMultiplier: 1.5 };
        },

        onUse: (unit) => {
            unit.abilityStates.preciseShot.charges--;
            unit.abilityStates.preciseShot.cooldown = 3;
            unit.abilityStates.preciseShot.active = true;
        }
    },

    // ==================== ABILITÀ PASSIVE ====================

    shieldsUp: {
        name: "Shields",
        description: "Riduce danni ricevuti del 25%",
        type: "passive",
        trigger: "onDamage",
        charges: null,
        maxCharges: null,
        icon: "🛡️",

        effect: (unit, damage) => {
            return damage * 0.75;
        }
    },

    evasiveManeuvers: {
        name: "Evasive",
        description: "Riduce danni ricevuti del 15%",
        type: "passive",
        trigger: "onDamage",
        charges: null,
        maxCharges: null,
        icon: "💨",

        effect: (unit, damage) => {
            return damage * 0.85;
        }
    },

    targetingComputer: {
        name: "Targeting",
        description: "+10% danni inflitti",
        type: "passive",
        trigger: "onAttack",
        charges: null,
        maxCharges: null,
        icon: "🎯",

        effect: (unit, damage) => {
            return damage * 1.1;
        }
    },

    armoredHull: {
        name: "Armored",
        description: "Riduce danni ricevuti del 20%",
        type: "passive",
        trigger: "onDamage",
        charges: null,
        maxCharges: null,
        icon: "🛡️",

        effect: (unit, damage) => {
            return damage * 0.8;
        }
    }
};

// Funzioni helper per il sistema abilità
const AbilitySystem = {
    // Inizializza lo stato delle abilità per un'unità
    initAbilities: (unit, abilityNames) => {
        unit.abilityStates = {};
        unit.activeAbility = null;

        abilityNames.forEach(abilityName => {
            const ability = ABILITIES[abilityName];
            if (ability && ability.type === 'active') {
                unit.abilityStates[abilityName] = {
                    charges: ability.charges,
                    cooldown: 0,
                    active: false
                };
            }
        });
    },

    // Resetta i cooldown a fine turno
    resetCooldowns: (units) => {
        units.forEach(unit => {
            if (unit.abilityStates) {
                Object.keys(unit.abilityStates).forEach(abilityName => {
                    const state = unit.abilityStates[abilityName];
                    if (state.cooldown > 0) {
                        state.cooldown--;
                    }
                    // Reset abilità attive che durano 1 turno
                    if (state.active) {
                        state.active = false;
                    }
                });
            }
        });
    },

    // Ottieni abilità disponibili per un'unità
    getAvailableAbilities: (unit, config) => {
        if (!config.unitTypes[unit.type].abilities) return [];
        if (!unit.abilityStates) return [];

        return config.unitTypes[unit.type].abilities.map(abilityName => {
            const ability = ABILITIES[abilityName];
            const state = unit.abilityStates[abilityName];

            return {
                id: abilityName,
                ...ability,
                state,
                canUse: ability.type === 'active'
                    ? ability.canUse(unit, { config })
                    : false
            };
        });
    },

    // Applica modificatori passivi ai danni ricevuti
    applyPassiveDefense: (unit, damage, config) => {
        if (!config.unitTypes[unit.type].abilities) return damage;

        let modifiedDamage = damage;
        config.unitTypes[unit.type].abilities.forEach(abilityName => {
            const ability = ABILITIES[abilityName];
            if (ability && ability.type === 'passive' && ability.trigger === 'onDamage') {
                modifiedDamage = ability.effect(unit, modifiedDamage);
            }
        });

        return modifiedDamage;
    },

    // Applica modificatori passivi ai danni inflitti
    applyPassiveAttack: (unit, damage, config) => {
        if (!config.unitTypes[unit.type].abilities) return damage;

        let modifiedDamage = damage;
        config.unitTypes[unit.type].abilities.forEach(abilityName => {
            const ability = ABILITIES[abilityName];
            if (ability && ability.type === 'passive' && ability.trigger === 'onAttack') {
                modifiedDamage = ability.effect(unit, modifiedDamage);
            }
        });

        // Controlla anche abilità attive temporanee (es. preciseShot)
        if (unit.abilityStates) {
            Object.keys(unit.abilityStates).forEach(abilityName => {
                const ability = ABILITIES[abilityName];
                const state = unit.abilityStates[abilityName];
                if (ability && ability.trigger === 'combat' && state.active) {
                    const result = ability.effect(unit, {});
                    if (result.damageMultiplier) {
                        modifiedDamage *= result.damageMultiplier;
                    }
                }
            });
        }

        return modifiedDamage;
    }
};