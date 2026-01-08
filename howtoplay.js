// How to Play Component for Star Hexes
const HowToPlay = ({ onBack }) => {
  return (
    <div className="w-full h-full bg-gray-900 overflow-auto">
      <div className="max-w-3xl mx-auto p-6 text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            How to Play
          </h1>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            ← Back to Menu
          </button>
        </div>
        
        {/* Content */}
        <div className="space-y-6 text-gray-300">
          
          {/* Goal */}
          <section className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-bold text-blue-400 mb-2">🎯 Goal</h2>
            <p>
              Win by destroying the enemy Capital Ship (reduce it to 0 HP) OR by eliminating all enemy units.
            </p>
          </section>
          
          {/* Turn Structure */}
          <section className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-bold text-blue-400 mb-2">🔄 Turn Structure</h2>
            <p className="mb-2">The game alternates between <strong>Action Phase</strong> and <strong>Combat Phase</strong>:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Action Phase:</strong> Players take turns activating their units. Each unit can move once per round.</li>
              <li><strong>Combat Phase:</strong> After all units are activated, simultaneous combat occurs between adjacent enemy units.</li>
            </ul>
          </section>
          
          {/* Movement & Engagement */}
          <section className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-bold text-blue-400 mb-2">🚀 Movement & Engagement</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Units can move to any adjacent hex (1 hex per turn by default).</li>
              <li><strong>Engaged Units:</strong> If a unit is adjacent to an enemy, it is <strong>engaged</strong> and <strong>cannot move</strong>.</li>
              <li>You can choose to <strong>Pass</strong> without moving if needed.</li>
            </ul>
          </section>
          
          {/* Combat */}
          <section className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-bold text-blue-400 mb-2">⚔️ Combat</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Combat happens automatically during the Combat Phase.</li>
              <li>Units deal damage to all adjacent enemies simultaneously.</li>
              <li>If a unit has multiple adjacent enemies, its damage is split evenly among them.</li>
              <li>Combat events appear in the feed at the top of the screen.</li>
            </ul>
          </section>
          
          {/* Abilities */}
          <section className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-bold text-blue-400 mb-2">⚡ Abilities</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Active Abilities:</strong> Can be triggered by clicking the ability button when a unit is selected. Some abilities have limited charges or cooldowns.</li>
              <li><strong>Movement Abilities:</strong> Replace your normal movement (e.g., Boost lets you move 2 hexes instead of 1).</li>
              <li><strong>Attack Abilities:</strong> Allow ranged attacks or special effects. You can still move after using these.</li>
              <li><strong>Passive Abilities:</strong> Always active and provide constant bonuses (shown as disabled buttons for reference).</li>
              <li>Click the <strong>ℹ️ Info</strong> button to see details about any unit's abilities.</li>
            </ul>
          </section>
          
          {/* Capital Ships */}
          <section className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-bold text-blue-400 mb-2">🛡️ Capital Ships</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Each player has a Capital Ship in their home zone (3 hexes highlighted in blue or red).</li>
              <li>Capital Ships don't move but have high HP.</li>
              <li>Units in the enemy's capital zone can damage the Capital Ship if they're not engaged with enemy units.</li>
              <li>The amount of damage depends on the unit's <strong>Capital Damage</strong> stat.</li>
            </ul>
          </section>
          
          {/* Tips */}
          <section className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-bold text-blue-400 mb-2">💡 Tips</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Use the Info button to inspect any unit (yours or enemy) to see their stats and abilities.</li>
              <li>Plan your moves carefully - engaged units can't retreat!</li>
              <li>Different unit types excel at different roles: fighters for combat, bombers for capital ships.</li>
              <li>Watch your ability cooldowns and charges to maximize their impact.</li>
            </ul>
          </section>
          
        </div>
        
        {/* Bottom spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
};