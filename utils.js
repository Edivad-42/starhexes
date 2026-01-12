// Utils.js - Utility functions for Star Hexes

const Utils = {
    // ==================== HEX UTILITIES ====================

    // Get neighbor hexes using offset coordinates (even rows shift right)
    getNeighbors: (q, r) => {
        const evenRow = r % 2 === 0;
        if (evenRow) {
            return [
                [q + 1, r], [q - 1, r],
                [q, r - 1], [q - 1, r - 1],
                [q, r + 1], [q - 1, r + 1]
            ];
        } else {
            return [
                [q + 1, r], [q - 1, r],
                [q + 1, r - 1], [q, r - 1],
                [q + 1, r + 1], [q, r + 1]
            ];
        }
    },

    // Find unit at specific hex
    getUnitAt: (units, q, r) => {
        return units.find(u => u.q === q && u.r === r && u.health > 0);
    },

    // Check if hex is occupied
    isOccupied: (units, q, r, excludeId = null) => {
        return units.some(u => u.q === q && u.r === r && u.id !== excludeId && u.health > 0);
    },

    // Check if unit is engaged with enemies
    isEngaged: (unit, units) => {
        const neighbors = Utils.getNeighbors(unit.q, unit.r);
        return neighbors.some(([q, r]) => {
            const neighbor = Utils.getUnitAt(units, q, r);
            return neighbor && neighbor.player !== unit.player;
        });
    },

    // Get valid moves for a unit
    getValidMoves: (unit, units, config) => {
        if (Utils.isEngaged(unit, units)) return [];

        const neighbors = Utils.getNeighbors(unit.q, unit.r);
        return neighbors.filter(([q, r]) =>
            q >= 0 && q < config.map.width &&
            r >= 0 && r < config.map.height &&
            !Utils.isOccupied(units, q, r, unit.id) &&
            !config.map.disabledHexes.some(hex => hex.q === q && hex.r === r)
        );
    },

    // ==================== VICTORY CONDITIONS ====================

    checkVictory: (units, capitalShips) => {
        const p1UnitsAlive = units.some(u => u.player === 1 && u.health > 0);
        const p2UnitsAlive = units.some(u => u.player === 2 && u.health > 0);

        if (!p1UnitsAlive || capitalShips.player1.currentHealth <= 0) {
            return 2;
        }

        if (!p2UnitsAlive || capitalShips.player2.currentHealth <= 0) {
            return 1;
        }

        return null;
    },

    // ==================== SQUADRON NAME ASSIGNMENT ====================

    assignSquadronNames: (units, faction1, faction2, config) => {
        const usedNames = new Set();

        const getUniqueName = (factionId) => {
            const availableNames = config.factions[factionId].squadronNames.filter(
                name => !usedNames.has(name)
            );

            if (availableNames.length === 0) {
                return `Squadron ${Math.floor(Math.random() * 1000)}`;
            }

            const name = availableNames[Math.floor(Math.random() * availableNames.length)];
            usedNames.add(name);
            return name;
        };

        return units.map(unit => ({
            ...unit,
            squadronName: getUniqueName(unit.player === 1 ? faction1 : faction2)
        }));
    },

    // ==================== AI ====================

    makeAIMove: (unitsRef, activatedRef, setNeedsAIMove, setCurrentPlayer, setActivatedUnits, setUnits) => {
        setNeedsAIMove(false);

        const aiUnits = unitsRef.current.filter(u => u.player === 2 && u.health > 0 && !activatedRef.current.has(u.id));

        if (aiUnits.length === 0) {
            setCurrentPlayer(1);
            return;
        }

        const aiUnit = aiUnits[0];
        const playerUnits = unitsRef.current.filter(u => u.player === 1 && u.health > 0);
        const validMoves = Utils.getValidMoves(aiUnit);

        // If can't move, just activate
        if (validMoves.length === 0) {
            setActivatedUnits(prev => new Set([...prev, aiUnit.id]));
            setCurrentPlayer(1);
            return;
        }

        // Simple AI: move towards nearest enemy
        let bestMove = validMoves[0];
        let minDistance = Infinity;

        validMoves.forEach(([mq, mr]) => {
            playerUnits.forEach(pUnit => {
                const dist = Math.abs(mq - pUnit.q) + Math.abs(mr - pUnit.r);
                if (dist < minDistance) {
                    minDistance = dist;
                    bestMove = [mq, mr];
                }
            });
        });

        setUnits(prevUnits => prevUnits.map(u =>
            u.id === aiUnit.id ? { ...u, q: bestMove[0], r: bestMove[1] } : u
        ));
        setActivatedUnits(prev => new Set([...prev, aiUnit.id]));
        setCurrentPlayer(1);
    },

    // ==================== COMBAT RESOLUTION ====================

    resolveCombat: (units, capitalShips, config) => {
        const log = [];
        const aliveUnits = units.filter(u => u.health > 0);

        log.push('=== COMBAT PHASE ===');
        log.push(`Units alive: ${aliveUnits.map(u => `${u.squadronName || u.id}(${u.health}HP)`).join(', ')}`);
        log.push('');

        // Calculate damage for each unit
        const damageQueue = {};
        aliveUnits.forEach(u => damageQueue[u.id] = 0);

        log.push('--- ATTACKS ---');
        aliveUnits.forEach(attacker => {
            const neighbors = Utils.getNeighbors(attacker.q, attacker.r);
            const enemies = aliveUnits.filter(unit => {
                return unit.player !== attacker.player &&
                    neighbors.some(([nq, nr]) => unit.q === nq && unit.r === nr);
            });

            if (enemies.length === 0) {
                log.push(`${attacker.squadronName || attacker.id}: No adjacent enemies`);
                return;
            }

            // Apply passive attack modifiers
            let attackDamage = AbilitySystem.applyPassiveAttack(attacker, attacker.damage, config);
            const damagePerEnemy = attackDamage / enemies.length;

            log.push(`${attacker.squadronName || attacker.id} (${attackDamage.toFixed(1)} dmg) → ${enemies.length} enemies = ${damagePerEnemy.toFixed(1)} dmg each`);

            enemies.forEach(enemy => {
                // Apply passive defense modifiers
                const finalDamage = AbilitySystem.applyPassiveDefense(enemy, damagePerEnemy, config);
                damageQueue[enemy.id] += finalDamage;
                log.push(`  → ${enemy.squadronName || enemy.id} receives ${finalDamage.toFixed(1)} dmg`);
            });
        });

        log.push('');
        log.push('--- DAMAGE APPLICATION ---');

        // Apply damage
        const updatedUnits = units.map(unit => {
            if (unit.health <= 0) return unit;

            const damage = damageQueue[unit.id] || 0;
            if (damage > 0) {
                const newHealth = Math.max(0, unit.health - damage);
                log.push(`${unit.squadronName || unit.id}: ${unit.health.toFixed(1)} - ${damage.toFixed(1)} = ${newHealth.toFixed(1)} HP ${newHealth === 0 ? '💀' : ''}`);
                return { ...unit, health: newHealth };
            }
            return unit;
        });

        log.push('');
        log.push('--- CAPITAL SHIP ATTACKS ---');

        // Capital ship damage
        let newCapitalShips = { ...capitalShips };
        let capitalDamaged = false;

        aliveUnits.forEach(unit => {
            const isInP1Zone = config.capitalZones.player1.some(z => z.q === unit.q && z.r === unit.r);
            const isInP2Zone = config.capitalZones.player2.some(z => z.q === unit.q && z.r === unit.r);
            const isInEnemyZone = unit.player === 1 ? isInP2Zone : isInP1Zone;

            if (!isInEnemyZone) return;

            const neighbors = Utils.getNeighbors(unit.q, unit.r);
            const hasEnemies = aliveUnits.some(other => {
                return other.player !== unit.player &&
                    neighbors.some(([nq, nr]) => other.q === nq && other.r === nr);
            });

            if (hasEnemies) {
                log.push(`${unit.squadronName || unit.id}: In enemy zone but ENGAGED - no capital damage`);
                return;
            }

            const targetShip = unit.player === 1 ? 'player2' : 'player1';
            const oldHealth = newCapitalShips[targetShip].currentHealth;
            newCapitalShips[targetShip] = {
                ...newCapitalShips[targetShip],
                currentHealth: Math.max(0, oldHealth - unit.capitalDamage)
            };

            capitalDamaged = true;
            log.push(`${unit.squadronName || unit.id}: Strikes ${newCapitalShips[targetShip].name} for ${unit.capitalDamage} dmg (${oldHealth} → ${newCapitalShips[targetShip].currentHealth})`);
        });

        if (!capitalDamaged) {
            log.push('No capital ship damage');
        }

        log.push('');
        log.push('=== COMBAT END ===');

        // Reset cooldowns
        AbilitySystem.resetCooldowns(updatedUnits);

        return {
            updatedUnits,
            newCapitalShips,
            log
        };
    },

    // ==================== UNIT CREATION ====================

    createUnit: (id, player, type, position, config) => {
        const unitType = config.unitTypes[type];
        const unit = {
            id,
            player,
            q: position.q,
            r: position.r,
            health: unitType.health,
            maxHealth: unitType.health,
            type,
            damage: unitType.damage,
            capitalDamage: unitType.capitalDamage
        };

        AbilitySystem.initAbilities(unit, unitType.abilities || []);
        return unit;
    }
};