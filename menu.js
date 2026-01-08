// Main Menu Component for Star Hexes
const MainMenu = ({ onStartGame, onShowHowToPlay }) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
      <div className="text-center space-y-8 px-4">
        {/* Title */}
        <div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            STAR HEXES
          </h1>
          <p className="text-gray-400 text-lg tracking-widest">TACTICAL SPACE COMBAT</p>
        </div>
        
        {/* Main Buttons */}
        <div className="space-y-4">
          <button
            onClick={onStartGame}
            className="w-64 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all transform hover:scale-105 active:scale-95"
          >
            🎯 Quick Match
          </button>
          
          <button
            onClick={onShowHowToPlay}
            className="w-64 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-xl font-bold rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105 active:scale-95"
          >
            📖 How to Play
          </button>
          
          {/* Coming Soon Buttons */}
          <button
            disabled
            className="w-64 px-8 py-4 bg-gray-700 text-gray-500 text-xl font-bold rounded-lg cursor-not-allowed opacity-50"
          >
            🎮 Campaign <span className="text-sm">(Coming Soon)</span>
          </button>
          
          <button
            disabled
            className="w-64 px-8 py-4 bg-gray-700 text-gray-500 text-xl font-bold rounded-lg cursor-not-allowed opacity-50"
          >
            ⚙️ Settings <span className="text-sm">(Coming Soon)</span>
          </button>
        </div>
        
        {/* Version Info */}
        <div className="text-gray-500 text-sm mt-8">
          v0.1.0 Alpha
        </div>
      </div>
    </div>
  );
};