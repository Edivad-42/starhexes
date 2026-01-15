import React, { useMemo } from 'react';
import type { Config } from '../types/Config';
import { Utils } from '../functions/utils';

interface Props {
  config: Config;
  customSetup,
  setCustomSetup,
  onStart: () => void;
  onBack: () => void;
}

const CustomMatch: React.FC<Props> = ({ config, customSetup, setCustomSetup, onStart, onBack }) => {
  const p1Points = useMemo(() => {
    return Utils.calculatePoints(customSetup.player1, customSetup.player1Capital, config);
  }, [customSetup.player1, customSetup.player1Capital]);
  const p2Points = useMemo(() => {
    return Utils.calculatePoints(customSetup.player2, customSetup.player2Capital, config);
  }, [customSetup.player2, customSetup.player2Capital]);
  
  return (
    <div className="w-full h-full bg-gray-900 text-white flex flex-col items-center p-6 overflow-auto">
      <h1 className="text-3xl font-bold text-purple-400 mb-6">
        Custom Match
      </h1>

      <div className="grid grid-cols-2 gap-8 w-full max-w-5xl">

        {/* PLAYER 1 */}
        <div className="bg-gray-800 rounded-lg p-4 border border-blue-500">
          <h2 className="text-xl font-bold text-blue-400 mb-4">
            Player 1
          </h2>
          <div className={`text-sm font-bold ${p1Points > config.customGameOptions.pointLimit ? 'text-red-400' : 'text-green-400'}`}>
            {p1Points} / {config.customGameOptions.pointLimit}
          </div>

          {/* SELEZIONE FAZIONE */}
          {!customSetup.player1Faction ? (
            <div className="space-y-2">
              <h3 className="text-sm text-gray-400 mb-2">Choose Faction:</h3>
              {Object.keys(config.factions).map(factionId => {
                const faction = config.factions[factionId];
                return (
                  <button
                    key={factionId}
                    onClick={() => setCustomSetup(s => ({ ...s, player1Faction: factionId }))}
                    className="w-full p-3 bg-gray-700 hover:bg-blue-600 rounded transition-colors"
                  >
                    {faction.name}
                  </button>
                );
              })}
            </div>
          ) : (
            <>
              {/* FAZIONE SCELTA */}
              <div className="text-sm text-gray-400 mb-3">
                Faction: <span className="text-white font-bold">{config.factions[customSetup.player1Faction].name}</span>
                <button
                  onClick={() => setCustomSetup(s => ({ ...s, player1Faction: null, player1Capital: null, player1: [] }))}
                  className="ml-2 text-xs text-red-400 hover:text-red-300 underline"
                >
                  Change
                </button>
              </div>

              {/* SELEZIONE CAPITAL SHIP */}
              {!customSetup.player1Capital ? (
                <div className="mb-4">
                  <h3 className="text-sm text-gray-400 mb-2">Choose Capital Ship:</h3>
                  <div className="space-y-2">
                    {config.factions[customSetup.player1Faction].capitalShips.map(shipType => {
                      const ship = config.capitalShipTypes[shipType];
                      return (
                        <button
                          key={shipType}
                          onClick={() => setCustomSetup(s => ({ ...s, player1Capital: shipType }))}
                          className="w-full flex items-center gap-3 p-3 bg-gray-700 hover:bg-blue-600 rounded transition-colors"
                        >
                          <img src={ship.icon} alt="" className="w-10 h-10" />
                          <div className="text-left">
                            <div className="font-bold">{ship.name}</div>
                            <div className="text-xs text-gray-400">{ship.health} HP</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-sm text-gray-400 mb-3">
                    Capital: <span className="text-white font-bold">{config.capitalShipTypes[customSetup.player1Capital].name}</span>
                    <button
                      onClick={() => setCustomSetup(s => ({ ...s, player1Capital: null }))}
                      className="ml-2 text-xs text-red-400 hover:text-red-300 underline"
                    >
                      Change
                    </button>
                  </div>

                  {/* SELEZIONE UNITÀ */}
                  <h3 className="text-sm text-gray-400 mb-2">
                    Select Units:
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {config.factions[customSetup.player1Faction].units.map(type => {
                      const unit = config.unitTypes[type];

                      return (
                        <button
                          key={type}
                          onClick={() =>
                            setCustomSetup(s => ({
                              ...s,
                              player1: [...s.player1, type]
                            }))
                          }
                          className={'flex items-center gap-2 p-2 rounded bg-gray-700 hover:bg-blue-600'}
                        >
                          <img src={unit.icon} alt="" className="w-6 h-6" />
                          <span className="text-sm">{unit.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* SELECTED UNITS */}
                  <div className="mt-4 space-y-2">
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wide">
                      Fleet
                    </h3>

                    {/* Capital Ship */}
                    {customSetup.player1Capital && (
                      <div className="flex items-center gap-2 bg-gray-700 rounded p-2">
                        <img
                          src={config.capitalShipTypes[customSetup.player1Capital].icon}
                          className="w-6 h-6"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-bold">
                            {config.capitalShipTypes[customSetup.player1Capital].name}
                          </div>
                          <div className="text-xs text-gray-400">
                            Capital Ship
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Fighters */}
                    {customSetup.player1.map((type, i) => {
                      const unit = config.unitTypes[type];
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-2 bg-gray-700 rounded p-2"
                        >
                          <img src={unit.icon} className="w-6 h-6" />
                          <div className="flex-1">
                            <div className="text-sm">{unit.name}</div>
                            <div className="text-xs text-gray-400">
                              {unit.cost} pts
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setCustomSetup(s => ({
                                ...s,
                                player1: s.player1.filter((_, idx) => idx !== i)
                              }))
                            }
                            className="text-red-400 hover:text-red-300"
                          >
                            ❌
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* RESET UNITÀ */}
                  {customSetup.player1.length > 0 && (
                    <button
                      onClick={() => setCustomSetup(s => ({ ...s, player1: [] }))}
                      className="w-full mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                    >
                      Reset Units
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* PLAYER 2 (CPU) */}
        <div className="bg-gray-800 rounded-lg p-4 border border-red-500">
          <h2 className="text-xl font-bold text-red-400 mb-4">
            Player 2 (CPU)
          </h2>
          <div className={`text-sm font-bold ${p2Points > config.customGameOptions.pointLimit ? 'text-red-400' : 'text-green-400'}`}>
            {p2Points} / {config.customGameOptions.pointLimit}
          </div>

          {/* SELEZIONE FAZIONE */}
          {!customSetup.player2Faction ? (
            <div className="space-y-2">
              <h3 className="text-sm text-gray-400 mb-2">Choose Faction:</h3>
              {Object.keys(config.factions).map(factionId => {
                const faction = config.factions[factionId];
                return (
                  <button
                    key={factionId}
                    onClick={() => setCustomSetup(s => ({ ...s, player2Faction: factionId }))}
                    className="w-full p-3 bg-gray-700 hover:bg-red-600 rounded transition-colors"
                  >
                    {faction.name}
                  </button>
                );
              })}
            </div>
          ) : (
            <>
              {/* FAZIONE SCELTA */}
              <div className="text-sm text-gray-400 mb-3">
                Faction: <span className="text-white font-bold">{config.factions[customSetup.player2Faction].name}</span>
                <button
                  onClick={() => setCustomSetup(s => ({ ...s, player2Faction: null, player2Capital: null, player2: [] }))}
                  className="ml-2 text-xs text-red-400 hover:text-red-300 underline"
                >
                  Change
                </button>
              </div>

              {/* SELEZIONE CAPITAL SHIP */}
              {!customSetup.player2Capital ? (
                <div className="mb-4">
                  <h3 className="text-sm text-gray-400 mb-2">Choose Capital Ship:</h3>
                  <div className="space-y-2">
                    {config.factions[customSetup.player2Faction].capitalShips.map(shipType => {
                      const ship = config.capitalShipTypes[shipType];
                      return (
                        <button
                          key={shipType}
                          onClick={() => setCustomSetup(s => ({ ...s, player2Capital: shipType }))}
                          className="w-full flex items-center gap-3 p-3 bg-gray-700 hover:bg-blue-600 rounded transition-colors"
                        >
                          <img src={ship.icon} alt="" className="w-10 h-10" />
                          <div className="text-left">
                            <div className="font-bold">{ship.name}</div>
                            <div className="text-xs text-gray-400">{ship.health} HP</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-sm text-gray-400 mb-3">
                    Capital: <span className="text-white font-bold">{config.capitalShipTypes[customSetup.player2Capital].name}</span>
                    <button
                      onClick={() => setCustomSetup(s => ({ ...s, player2Capital: null }))}
                      className="ml-2 text-xs text-red-400 hover:text-red-300 underline"
                    >
                      Change
                    </button>
                  </div>

                  {/* SELEZIONE UNITÀ */}
                  <h3 className="text-sm text-gray-400 mb-2">
                    Select Units:
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {config.factions[customSetup.player2Faction].units.map(type => {
                      const unit = config.unitTypes[type];

                      return (
                        <button
                          key={type}
                          onClick={() =>
                            setCustomSetup(s => ({
                              ...s,
                              player2: [...s.player2, type]
                            }))
                          }
                          className={'flex items-center gap-2 p-2 rounded bg-gray-700 hover:bg-blue-600'}
                        >
                          <img src={unit.icon} alt="" className="w-6 h-6" />
                          <span className="text-sm">{unit.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* SELECTED UNITS */}
                  <div className="mt-4 space-y-2">
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wide">
                      Fleet
                    </h3>

                    {/* Capital Ship */}
                    {customSetup.player2Capital && (
                      <div className="flex items-center gap-2 bg-gray-700 rounded p-2">
                        <img
                          src={config.capitalShipTypes[customSetup.player2Capital].icon}
                          className="w-6 h-6"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-bold">
                            {config.capitalShipTypes[customSetup.player2Capital].name}
                          </div>
                          <div className="text-xs text-gray-400">
                            Capital Ship
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Fighters */}
                    {customSetup.player2.map((type, i) => {
                      const unit = config.unitTypes[type];
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-2 bg-gray-700 rounded p-2"
                        >
                          <img src={unit.icon} className="w-6 h-6" />
                          <div className="flex-1">
                            <div className="text-sm">{unit.name}</div>
                            <div className="text-xs text-gray-400">
                              {unit.cost} pts
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setCustomSetup(s => ({
                                ...s,
                                player2: s.player2.filter((_, idx) => idx !== i)
                              }))
                            }
                            className="text-red-400 hover:text-red-300"
                          >
                            ❌
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* RESET UNITÀ */}
                  {customSetup.player2.length > 0 && (
                    <button
                      onClick={() => setCustomSetup(s => ({ ...s, player2: [] }))}
                      className="w-full mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                    >
                      Reset Units
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* BOTTONE START */}
      <button
        disabled={
          !customSetup.player1Faction ||
          !customSetup.player2Faction ||
          !customSetup.player1Capital ||
          !customSetup.player2Capital ||
          customSetup.player1.length < 1 ||
          customSetup.player2.length < 1 ||
          p1Points > config.customGameOptions.pointLimit ||
          p2Points > config.customGameOptions.pointLimit
        }
        onClick={onStart}
        className={`mt-8 px-8 py-4 rounded-lg text-xl font-bold
                  ${!customSetup.player1Faction ||
            !customSetup.player2Faction ||
            !customSetup.player1Capital ||
            !customSetup.player2Capital ||
            customSetup.player1.length < 1 ||
            customSetup.player2.length < 1 ||
            p1Points > config.customGameOptions.pointLimit ||
            p2Points > config.customGameOptions.pointLimit
            ? 'bg-gray-600 opacity-40 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700'}
      `}
      >
        Start Match
      </button>

      <button
        onClick={onBack}
        className="mt-4 text-gray-400 hover:text-white underline"
      >
        Back to Menu
      </button>
    </div>
  );
};

export default CustomMatch;
