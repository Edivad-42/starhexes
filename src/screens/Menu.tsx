import React from 'react';

interface Props {
  onStart: () => void;
  onShowHowToPlay: () => void;
  onShowCustomMatch: () => void;
}

const Menu: React.FC<Props> = ({ onStart, onShowHowToPlay, onShowCustomMatch }) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          STAR HEXES
        </h1>

        <div className="space-y-4">
          <button onClick={onStart} className="btn-primary">Quick Match</button>
          <button onClick={onShowHowToPlay} className="btn-secondary">How to Play</button>
          <button onClick={onShowCustomMatch} className="btn-green">Custom Match</button>
        </div>
      </div>
    </div>
  );
};

export default Menu;
