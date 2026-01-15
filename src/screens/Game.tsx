import React, { useEffect, useRef, useState } from 'react';
import type { Config } from '../types/Config';
import CustomMatch from './CustomMatch';
import { ABILITIES } from '../functions/abilities';
import { Utils } from '../functions/utils';
import Menu from './Menu';
import HowToPlay from './HowToPlay';

interface Props {
  config: Config;
  onExit: () => void;
}

const Game: React.FC<Props> = ({ config }) => {
  // ==================== STATE ====================
  const [gameState, setGameState] = useState('menu');
  const [customSetup, setCustomSetup] = useState({
    player1Faction: null,
    player1Capital: null,
    player1: [],
    player2Faction: null,
    player2Capital: null,
    player2: []
  });
  const [units, setUnits] = useState([]);
  const [capitalShips, setCapitalShips] = useState({ player1: null, player2: null });
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [infoTarget, setInfoTarget] = useState(null);
  const [activatedUnits, setActivatedUnits] = useState(new Set());
  const [gamePhase, setGamePhase] = useState('action'); // 'action' or 'combat'
  const [combatLog, setCombatLog] = useState([]);
  const [showCombatLog, setShowCombatLog] = useState(false);
  const [needsAIMove, setNeedsAIMove] = useState(false);
  const [activeAbility, setActiveAbility] = useState(null);
  const [winner, setWinner] = useState(null);

  const unitsRef = useRef(units);
  const capitalShipsRef = useRef(capitalShips);
  const activatedRef = useRef(activatedUnits);

  const DEFAULT_SPAWNS = {
    player1: [
      { q: 2, r: 1 },
      { q: 2, r: 2 },
      { q: 1, r: 3 },
      { q: 1, r: 1 },
      { q: 1, r: 2 },
      { q: 2, r: 0 },
      { q: 0, r: 3 },
    ],
    player2: [
      { q: 7, r: 4 },
      { q: 6, r: 5 },
      { q: 6, r: 6 },
      { q: 7, r: 5 },
      { q: 7, r: 6 },
      { q: 6, r: 7 },
      { q: 8, r: 4 }
    ]
  };

  useEffect(() => {
    unitsRef.current = units;
    capitalShipsRef.current = capitalShips;
    activatedRef.current = activatedUnits;
  }, [units, capitalShips, activatedUnits]);

  // ==================== LOAD CONFIG ====================
  useEffect(() => {
    fetch('config.json')
      .then(res => res.json())
      .then(data => {

        setCapitalShips({
          player1: {
            ...data.capitalShipTypes.mc80liberty,
            currentHealth: data.capitalShipTypes.mc80liberty.health,
            owner: 1
          },
          player2: {
            ...data.capitalShipTypes.isd,
            currentHealth: data.capitalShipTypes.isd.health,
            owner: 2
          }
        });

        const initialUnits = [];
        let unitId = 1;

        data.startingUnits.player1.forEach(u => {
          const unitType = data.unitTypes[u.type];
          const unit = {
            id: `p1_${unitId++}`,
            player: 1,
            q: u.q,
            r: u.r,
            health: unitType.health,
            maxHealth: unitType.health,
            type: u.type,
            damage: unitType.damage,
            capitalDamage: unitType.capitalDamage
          };

          Utils.initAbilities(unit, unitType.abilities || []);
          initialUnits.push(unit);
        });

        unitId = 1;
        data.startingUnits.player2.forEach(u => {
          const unitType = data.unitTypes[u.type];
          const unit = {
            id: `p2_${unitId++}`,
            player: 2,
            q: u.q,
            r: u.r,
            health: unitType.health,
            maxHealth: unitType.health,
            type: u.type,
            damage: unitType.damage,
            capitalDamage: unitType.capitalDamage
          };

          Utils.initAbilities(unit, unitType.abilities || []);
          initialUnits.push(unit);
        });

        setUnits(initialUnits);
      })
      .catch(err => console.error('Error loading config:', err));
  }, []);

  // ==================== MENU HANDLERS ====================
  const handleStartGame = () => {
    setGameState('game');
  };

  const handleShowHowToPlay = () => {
    setGameState('howtoplay');
  };

  const handleBackToMenu = () => {
    setGameState('menu');
  };

  // ==================== CUSTOM GAME ====================
  const assignSquadronNames = (units, faction1, faction2) => {
    const usedNames = new Set();

    const getUniqueName = (factionId) => {
      const availableNames = config.factions[factionId].squadronNames.filter(
        name => !usedNames.has(name)
      );

      if (availableNames.length === 0) {
        // Fallback se finisci i nomi
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
  };

  const startCustomGame = () => {
    // Imposta le capital ships
    setCapitalShips({
      player1: {
        ...config.capitalShipTypes[customSetup.player1Capital],
        currentHealth: config.capitalShipTypes[customSetup.player1Capital].health,
        owner: 1
      },
      player2: {
        ...config.capitalShipTypes[customSetup.player2Capital],
        currentHealth: config.capitalShipTypes[customSetup.player2Capital].health,
        owner: 2
      }
    });

    //imposta le unità
    const units = [];
    let id = 1;

    customSetup.player1.forEach((type, i) => {
      const def = config.unitTypes[type];
      const spawn = DEFAULT_SPAWNS.player1[i];

      const unit = {
        id: `p1_${id++}`,
        player: 1,
        type,
        q: spawn.q,
        r: spawn.r,
        health: def.health,
        maxHealth: def.health,
        damage: def.damage,
        capitalDamage: def.capitalDamage
      };

      Utils.initAbilities(unit, def.abilities || []);
      units.push(unit);
    });

    id = 1;
    customSetup.player2.forEach((type, i) => {
      const def = config.unitTypes[type];
      const spawn = DEFAULT_SPAWNS.player2[i];

      const unit = {
        id: `p2_${id++}`,
        player: 2,
        type,
        q: spawn.q,
        r: spawn.r,
        health: def.health,
        maxHealth: def.health,
        damage: def.damage,
        capitalDamage: def.capitalDamage
      };

      Utils.initAbilities(unit, def.abilities || []);
      units.push(unit);
    });

    // Assegna nomi squadrone
    const namedUnits = assignSquadronNames(
      units,
      customSetup.player1Faction,
      customSetup.player2Faction
    );

    setUnits(namedUnits);
    setGameState('game');
  };

  // ==================== CHECK ALL UNITS ACTIVATED ====================
  useEffect(() => {
    if (gamePhase !== 'action') return;

    const aliveUnits = units.filter(u => u.health > 0);
    if (aliveUnits.length === 0) return;

    const allActivated = aliveUnits.every(u => activatedUnits.has(u.id));

    if (allActivated) {
      console.log('All units activated - starting combat');
      Utils.resolveCombat(unitsRef.current, capitalShipsRef.current, config,
        setUnits, setCapitalShips, setCombatLog, setShowCombatLog, setGamePhase, setWinner);
    }
  }, [activatedUnits, gamePhase, units]);

  // ==================== AI TURN ====================
  useEffect(() => {
    if (!needsAIMove || gamePhase !== 'action' || currentPlayer !== 2) return;

    const timer = setTimeout(() => {
      /*          const aiUnits = units.filter(
                  u => u.player === 2 && !activatedUnits.has(u.id) && u.health > 0
                );
                const playerUnits = unitsRef.current.filter(
                  u => u.player === 1 && u.health > 0
                ); */

      Utils.makeAIMove(config, unitsRef, activatedRef, units, setNeedsAIMove, setCurrentPlayer, setActivatedUnits, setUnits);

      /*           // SE NON CI SONO AZIONI, FINISCI IL TURNO AI
                if (!result) {
                  endTurn();
                } */
    }, 1000);


    return () => clearTimeout(timer);
  }, [needsAIMove, gamePhase, currentPlayer, units, activatedUnits]);

  // ==================== COMBAT RESOLUTION ====================

  const handleCombatLogOk = () => {
    console.log('Combat log OK');
    setShowCombatLog(false);
    setCombatLog([]);
    setGamePhase('action');
    setActivatedUnits(new Set());
    setCurrentPlayer(1);
    setSelectedUnit(null);
  };

  // ==================== PLAYER ACTIONS ====================
  const handleUnitClick = (unit) => {
    // SE C'È UN'ABILITÀ DI ATTACCO ATTIVA E CLICCO SU UN BERSAGLIO VALIDO
    if (
      activeAbility &&
      activeAbility.validTargets &&
      Array.isArray(activeAbility.validTargets) &&
      activeAbility.validTargets.some(([aq, ar]) => aq === unit.q && ar === unit.r)
    ) {
      handleAbilityTarget(unit.q, unit.r);
      return; // IMPORTANTE: esci subito senza selezionare l'unità
    }

    // Se cambio unità mentre un'abilità è attiva → disattiva abilità
    if (activeAbility) {
      setActiveAbility(null);
    }

    // Se clicco la stessa unità già selezionata → non fare nulla
    if (selectedUnit && selectedUnit.id === unit.id) {
      return;
    }

    // Seleziona SEMPRE (anche nemici / unità già attivate)
    setSelectedUnit(unit);

    // Solo le mie unità NON attivate possono generare movimenti base
    if (
      unit.player === currentPlayer &&
      !activatedUnits.has(unit.id)
    ) {
      const moves = Utils.getValidMoves(unit, units, config);
      //setCurrentValidHexes(moves);
    } else {
      //setCurrentValidHexes([]);
    }
  };

  const handleHexClick = (q, r) => {
    if (!selectedUnit) return;

    // MOVIMENTO DA ABILITÀ
    if (
      activeAbility &&
      activeAbility.unitId === selectedUnit.id &&
      activeAbility.validMoves
    ) {
      const isValid = activeAbility.validMoves.some(
        ([mq, mr]) => mq === q && mr === r
      );

      if (!isValid) return;

      setUnits(prev =>
        prev.map(u =>
          u.id === selectedUnit.id ? { ...u, q, r } : u
        )
      );

      const ability = ABILITIES[activeAbility.abilityId];
      ability?.onUse?.(selectedUnit);

      setActiveAbility(null);
      setActivatedUnits(prev => new Set([...prev, selectedUnit.id]));
      setSelectedUnit(null);
      setCurrentPlayer(2);
      setNeedsAIMove(true);
      return;
    }

    // MOVIMENTO NORMALE
    if (selectedUnit.player !== currentPlayer) return;
    if (activatedUnits.has(selectedUnit.id)) return;

    const validMoves = Utils.getValidMoves(selectedUnit, units, config);
    const isValid = validMoves.some(([mq, mr]) => mq === q && mr === r);

    if (!isValid) return;

    setUnits(prev =>
      prev.map(u =>
        u.id === selectedUnit.id ? { ...u, q, r } : u
      )
    );

    setActivatedUnits(prev => new Set([...prev, selectedUnit.id]));
    setSelectedUnit(null);
    setCurrentPlayer(2);
    setNeedsAIMove(true);
  };

  const handlePass = () => {
    if (!selectedUnit || activatedUnits.has(selectedUnit.id)) return;

    if (selectedUnit.player !== currentPlayer) return;

    setActivatedUnits(prev => new Set([...prev, selectedUnit.id]));
    setSelectedUnit(null);
    setCurrentPlayer(2);
    setNeedsAIMove(true);
  };

  const activateAbility = (unit, abilityId) => {
    // toggle off
    if (
      activeAbility &&
      activeAbility.unitId === unit.id &&
      activeAbility.abilityId === abilityId
    ) {
      setActiveAbility(null);
      return;
    }

    const ability = ABILITIES[abilityId];
    if (!ability) return;

    let data = {
      validMoves: null,
      validTargets: null
    };

    if (ability.trigger === 'movement') {
      const result = ability.effect(
        unit,
        gameStateForAbilities,
        { getNeighbors: Utils.getNeighbors }
      );
      data.validMoves = result?.validMoves || [];
    }

    if (ability.trigger === 'attack') {
      const result = ability.effect(
        unit,
        gameStateForAbilities,
        { getNeighbors: Utils.getNeighbors }
      );
      data.validTargets = result?.targetHexes || [];
    }

    setActiveAbility({
      unitId: unit.id,
      abilityId,
      ...data
    });
  };

  const handleAbilityTarget = (q, r) => {
    if (!activeAbility) return;

    const { unitId, abilityId } = activeAbility;
    const unit = unitsRef.current.find(u => u.id === unitId);
    if (!unit) return;

    const ability = ABILITIES[abilityId];
    const result = ability.onUse(unit, { q, r });

    // aggiorna danni
    if (result?.damage) {
      setUnits(prev =>
        prev.map(u =>
          u.q === q && u.r === r
            ? { ...u, health: Math.max(0, u.health - result.damage) }
            : u
        )
      );
    }

    // 🔥 FORZA REACT A VEDERE IL CAMBIAMENTO DI CARICHE
    setUnits(prev =>
      prev.map(u =>
        u.id === unit.id
          ? { ...u, abilityStates: { ...u.abilityStates } }
          : u
      )
    );

    setActiveAbility(null);
  };

  // ==================== RENDERING ====================
  const hexSize = config?.map.hexSize;
  const hexWidth = hexSize * Math.sqrt(3);
  const hexHeight = hexSize * 2;
  const vertDist = hexHeight * 0.75;
  const gameStateForAbilities = {
    config,
    getUnitAt: (q, r) => Utils.getUnitAt(units, q, r),
    isOccupied: (q, r, excludeId) => Utils.isOccupied(units, q, r, excludeId),
    isEngaged: (unit) => Utils.isEngaged(unit, units)
  };

  const renderUnitActions = () => {
    if (!selectedUnit) return null;

    const isMine =
      selectedUnit.player === 1 &&
      gamePhase === 'action';

    const isActivated = activatedUnits.has(selectedUnit.id);

    return (
      <>
        {/* HEADER */}
        <div className="mb-2">
          <div className="text-white font-bold">
            {config.unitTypes[selectedUnit.type].name}
          </div>
          <div className="text-xs text-gray-400">
            {selectedUnit.squadronName}
          </div>
        </div>

        {/* PASS */}
        {isMine && !isActivated && (
          <button
            onClick={handlePass}
            className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
          >
            ⏭ Pass
          </button>
        )}

        {/* ABILITÀ */}
        {isMine &&
          Utils
            .getAvailableAbilities(selectedUnit, gameStateForAbilities)
            .filter(a => a.type === 'active')
            .map(ability => {
              const active = activeAbility?.abilityId === ability.id;
              const abilityDef = ABILITIES[ability.id];
              const disabled =
                abilityDef?.canUse
                  ? !abilityDef.canUse(selectedUnit, gameStateForAbilities)
                  : false;

              return (
                <button
                  key={ability.id}
                  disabled={isActivated || disabled}
                  onClick={() => activateAbility(selectedUnit, ability.id)}
                  className={`w-full px-3 py-2 rounded text-white
            ${(isActivated || disabled)
                      ? 'bg-gray-600 opacity-40 cursor-not-allowed'
                      : active
                        ? 'bg-yellow-600'
                        : 'bg-purple-700 hover:bg-purple-800'}
          `}
                >
                  {ability.icon} {ability.name}
                  {ability.state?.charges !== undefined && (
                    <span className="ml-2 text-xs opacity-80">
                      ({ability.state.charges})
                    </span>
                  )}
                </button>
              );
            })}

        {/* INFO – SEMPRE VISIBILE */}
        <button
          onClick={() => setInfoTarget({ kind: 'unit', data: selectedUnit })}
          className="w-full mt-auto px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold"
        >
          ℹ️ Info
        </button >
      </>
    );
  };

  return (
    <>
      {!config && (
        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      )}

      {config && gameState === 'menu' && (
        <Menu
          onStart={handleStartGame}
          onShowHowToPlay={handleShowHowToPlay}
          onShowCustomMatch={() => setGameState('custom')}
        />
      )}

      {config && gameState === 'howtoplay' && (
        <HowToPlay onBack={handleBackToMenu} />
      )}

      {config && gameState === 'game' && (
        <div className="w-full h-full bg-gray-800 flex flex-col">
          <div className="w-full h-full bg-gray-800 flex flex-col">
            {/* Top Bar */}
            <div className="flex justify-center items-center py-2 bg-gray-900 text-white">
              {gamePhase === 'action' ? (
                <>
                  <span className={currentPlayer === 1 ? 'text-blue-400' : 'text-red-400'}>
                    P{currentPlayer}
                  </span>
                  {' '}- {currentPlayer === 1 ? 'Move unit' : 'AI thinking...'}
                </>
              ) : (
                <span className="text-yellow-400">COMBAT</span>
              )}
            </div>

            {/* Game Board */}
            <div className="flex-1 bg-gray-900 flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 600 400" className="max-w-full max-h-full" preserveAspectRatio="xMidYMid meet" >
                {/* Hexes */}
                {Array.from({ length: config.map.height }, (_, r) =>
                  Array.from({ length: config.map.width }, (_, q) => {
                    if (config.map.disabledHexes.some(h => h.q === q && h.r === r)) return null;

                    const x = hexWidth * q + (r % 2) * (hexWidth / 2) + 40;
                    const y = vertDist * r + 35;

                    const unit = units.find(u => u.q === q && u.r === r && u.health > 0);
                    const isSelected = selectedUnit && selectedUnit.q === q && selectedUnit.r === r;

                    let validMoves = [];

                    if (
                      selectedUnit &&
                      selectedUnit.player === currentPlayer &&
                      !activatedUnits.has(selectedUnit.id)
                    ) {
                      if (activeAbility?.unitId === selectedUnit.id) {
                        validMoves = activeAbility.validMoves || [];
                      } else {
                        validMoves = Utils.getValidMoves(selectedUnit, units, config);
                      }
                    }

                    const isValidMove = validMoves.some(([mq, mr]) => mq === q && mr === r);

                    const isAbilityTarget = activeAbility
                      && activeAbility.unitId === selectedUnit?.id
                      && Array.isArray(activeAbility.validTargets)
                      && activeAbility.validTargets.some(([aq, ar]) => aq === q && ar === r);

                    const isP1Zone = config.capitalZones.player1.some(z => z.q === q && z.r === r);
                    const isP2Zone = config.capitalZones.player2.some(z => z.q === q && z.r === r);

                    let fill = '#1e293b';
                    let stroke = '#475569';
                    let strokeWidth = 2;

                    if (isP1Zone) { fill = '#1e3a5f'; stroke = '#3b82f6'; strokeWidth = 2; }
                    if (isP2Zone) { fill = '#4a1a1a'; stroke = '#ef4444'; strokeWidth = 2; }
                    if (isValidMove) fill = '#064e3b';
                    if (isSelected) fill = '#fbbf24';
                    if (isAbilityTarget) fill = '#7f1d1d';

                    return (
                      <g key={`${q}-${r}`}>
                        <polygon
                          points={`${x},${y - hexSize} ${x + hexSize * 0.866},${y - hexSize / 2} ${x + hexSize * 0.866},${y + hexSize / 2} ${x},${y + hexSize} ${x - hexSize * 0.866},${y + hexSize / 2} ${x - hexSize * 0.866},${y - hexSize / 2}`}
                          fill={fill}
                          stroke={stroke}
                          strokeWidth={strokeWidth}
                          strokeLinejoin="round"
                          onClick={() => {
                            if (unit) {
                              handleUnitClick(unit);
                            } else {
                              handleHexClick(q, r);
                            }
                          }}
                          className="cursor-pointer hover:opacity-80"
                        />

                        {unit && (
                          <>
                            <circle
                              cx={x}
                              cy={y}
                              r={20}
                              fill={config.players[`player${unit.player}`].color}
                              stroke={activatedUnits.has(unit.id) ? '#22c55e' : '#ffffff'}
                              strokeWidth="3"
                              onClick={() => handleUnitClick(unit)}
                              className="cursor-pointer"
                            />
                            <image
                              href={config.unitTypes[unit.type].icon}
                              x={x - 12}
                              y={y - 12}
                              width={24}
                              height={24}
                              style={{ pointerEvents: 'none' }}
                            />
                            <text
                              x={x}
                              y={y + 12}
                              textAnchor="middle"
                              fill="white"
                              fontSize="9"
                              fontWeight="bold"
                              style={{ pointerEvents: 'none' }}
                            >
                              {Math.round(unit.health)}
                            </text>
                          </>
                        )}
                      </g>
                    );
                  })
                )}
              </svg>

              {/* Action Buttons */}
              <div className="w-64 bg-gray-900 border-l border-gray-700 p-3 flex flex-col gap-2">
                {selectedUnit && renderUnitActions()}
              </div>
            </div>
          </div>

          {/* Bottom Status */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-gray-900 text-xs">
            {/* Player 1 */}
            <div className="bg-blue-900 p-1 rounded">
              <div className="flex justify-between text-white mb-1 items-center">
                <div
                  className="flex items-center gap-2"
                  onClick={() =>
                    setInfoTarget({
                      kind: 'capital',
                      data: capitalShips.player1
                    })
                  }
                >
                  <span className="font-bold text-blue-300 cursor-pointer hover:underline" >
                    {capitalShips.player1.name}
                  </span>
                  <button className="text-blue-400 hover:text-blue-200" >
                    ℹ️
                  </button>
                </div>
                <span>{units.filter(u => u.player === 1 && u.health > 0).length} units</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex-1 bg-gray-700 rounded h-2">
                  <div
                    className="bg-blue-400 h-full"
                    style={{ width: `${(capitalShips.player1?.currentHealth / capitalShips.player1?.health * 100) || 0}%` }}
                  ></div>
                </div>
                <span className="text-white text-[10px]">{capitalShips.player1?.currentHealth || 0}</span>
              </div>
            </div>

            {/* Player 2 */}
            <div className="bg-red-900 p-1 rounded">
              <div className="flex justify-between text-white mb-1 items-center">
                <span>{units.filter(u => u.player === 2 && u.health > 0).length} units</span>
                <div
                  className="flex items-center gap-2"
                  onClick={() =>
                    setInfoTarget({
                      kind: 'capital',
                      data: capitalShips.player2
                    })
                  }
                >
                  <button className="text-red-400 hover:text-red-200" >
                    ℹ️
                  </button>
                  <span className="font-bold text-red-300 cursor-pointer hover:underline" >
                    {capitalShips.player2.name}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex-1 bg-gray-700 rounded h-2">
                  <div
                    className="bg-red-400 h-full"
                    style={{ width: `${(capitalShips.player2?.currentHealth / capitalShips.player2?.health * 100) || 0}%` }}
                  ></div>
                </div>
                <span className="text-white text-[10px]">{capitalShips.player2?.currentHealth || 0}</span>
              </div>
            </div>
          </div>

          {/* Combat Log Modal */}
          {showCombatLog && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
              <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 border-4 border-yellow-500 max-h-[80vh] flex flex-col">
                <h2 className="text-3xl font-bold text-yellow-400 text-center mb-4">⚔️ COMBAT LOG ⚔️</h2>

                <div className="flex-1 overflow-y-auto bg-gray-800 rounded p-4 mb-4 font-mono text-sm text-white">
                  {combatLog.map((line, i) => (
                    <div key={i} className="mb-1">{line}</div>
                  ))}
                </div>

                <button
                  onClick={handleCombatLogOk}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-lg"
                >
                  OK
                </button>
              </div>
            </div>
          )}

          {/* Unit Info Modal */}
          {infoTarget && (
            <div
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
              onClick={() => setInfoTarget(false)}
            >
              {infoTarget.kind === 'unit' && (
                <div
                  className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border-4"
                  style={{ borderColor: config.players[`player${selectedUnit.player}`].color }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img src={config.unitTypes[selectedUnit.type].icon} alt="" className="w-16 h-16" />
                    <div>
                      <h2 className="text-2xl font-bold text-white">{config.unitTypes[selectedUnit.type].name}</h2>
                      <p className="text-gray-400 text-sm">{selectedUnit.squadronName}</p>
                    </div>
                  </div>

                  <p className="text-gray-300 mb-4 italic">{config.unitTypes[selectedUnit.type].description}</p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-700 rounded p-2">
                      <div className="text-gray-400 text-xs mb-1">Health</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-600 rounded h-3">
                          <div
                            className="bg-green-500 h-full"
                            style={{ width: `${(selectedUnit.health / selectedUnit.maxHealth * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-white text-sm font-bold">{Math.round(selectedUnit.health)}/{selectedUnit.maxHealth}</span>
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded p-2">
                      <div className="text-gray-400 text-xs">Damage</div>
                      <div className="text-white font-bold text-lg">{selectedUnit.damage}</div>
                    </div>

                    <div className="bg-gray-700 rounded p-2">
                      <div className="text-gray-400 text-xs">Capital Damage</div>
                      <div className="text-white font-bold text-lg">{selectedUnit.capitalDamage}</div>
                    </div>
                  </div>

                  {/* ABILITIES */}
                  <div className="mt-4">
                    <h3 className="text-lg font-bold text-yellow-400 mb-2">
                      Abilities
                    </h3>

                    <div className="space-y-2">
                      {(config.unitTypes[selectedUnit.type].abilities || []).map(abilityId => {
                        const ability = ABILITIES[abilityId];
                        const state = selectedUnit.abilityStates?.[abilityId];

                        if (!ability) return null;

                        return (
                          <div
                            key={abilityId}
                            className="bg-gray-700 rounded p-2 border border-gray-600"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{ability.icon}</span>
                              <span className="font-bold text-white">
                                {ability.name}
                              </span>
                              <span className="ml-auto text-xs text-gray-400">
                                {ability.type.toUpperCase()}
                              </span>
                            </div>

                            <div className="text-gray-300 text-sm mt-1">
                              {ability.description}
                            </div>

                            {state?.charges !== undefined && (
                              <div className="text-xs text-gray-400 mt-1">
                                Charges: {state.charges} / {ability.maxCharges}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => setInfoTarget(false)}
                    className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                  >
                    Close
                  </button>
                </div>
              )}
              {infoTarget.kind === 'capital' && (
                <div
                  className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border-4"
                  style={{ borderColor: config.players[`player${infoTarget.data.owner}`].color }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img src={infoTarget.data.icon} alt="" className="w-16 h-16" />
                    <h2 className="text-2xl font-bold text-white">{infoTarget.data.name}</h2>
                  </div>

                  <p className="text-gray-300 mb-4 italic">{infoTarget.data.description}</p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-700 rounded p-2">
                      <div className="text-gray-400 text-xs mb-1">Health</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-600 rounded h-3">
                          <div
                            className="bg-green-500 h-full"
                            style={{ width: `${(infoTarget.data.currentHealth / infoTarget.data.health * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-white text-sm font-bold">{Math.round(infoTarget.data.currentHealth)}/{infoTarget.data.health}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setInfoTarget(false)}
                    className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          )}

          {winner && (
            <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
              <div className="bg-gray-900 border-4 border-yellow-500 rounded-xl p-8 text-center">
                <h1 className="text-4xl font-bold text-yellow-400 mb-4">
                  🏆 PLAYER {winner} WINS!
                </h1>
                <p className="text-gray-300 mb-6">
                  {winner === 1
                    ? 'The enemy fleet has been destroyed.'
                    : 'Your fleet has been annihilated.'}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-xl rounded-lg"
                >
                  Back to menu
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {config && gameState === 'custom' && (
        <CustomMatch
          config={config}
          customSetup={customSetup}
          setCustomSetup={setCustomSetup}
          onStart={startCustomGame}
          onBack={() => setGameState('menu')}
        />
      )}
    </>
  );
};

export default Game;
