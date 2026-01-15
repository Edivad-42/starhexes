import React, { useEffect, useState } from 'react';
import Menu from './screens/Menu';
import HowToPlay from './screens/HowToPlay';
import Game from './screens/Game';
import CustomMatch from './screens/CustomMatch';
import type { Config } from './types/Config';

type GameState = 'menu' | 'howto' | 'game' | 'custom';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>('menu');
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    fetch('/config.json')
      .then(r => r.json())
      .then(setConfig);
  }, []);

  if (!config) {
    return <div className="text-white">Loading...</div>;
  }

  /* if (state === 'menu') {
    return (
      <Menu
        onStart={() => setState('game')}
        onHowTo={() => setState('howto')}
        onCustom={() => setState('custom')}
      />
    );
  }

  if (state === 'howto') {
    return <HowToPlay onBack={() => setState('menu')} />;
  }

  if (state === 'custom') {
    return (
      <CustomMatch
        config={config}
        onStart={() => setState('game')}
        onBack={() => setState('menu')}
        customSetup={undefined}
        setCustomSetup={undefined} />
    );
  } */

  return <Game config={config} onExit={() => setState('menu')} />;
};

export default App;
