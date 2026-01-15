export interface Config {
  map: {
    width: number;
    height: number;
    hexSize: number;
    disabledHexes: { q: number; r: number }[];
  };

  factions: Record<string, {
    name: string;
    units: string[];
    capitalShips: string[];
    squadronNames: string[];
  }>;

  unitTypes: Record<string, {
    name: string;
    icon: string;
    description: string;
    health: number;
    damage: number;
    capitalDamage: number;
    abilities?: string[];
    cost?: number;
  }>;

  capitalShipTypes: Record<string, {
    name: string;
    icon: string;
    description: string;
    health: number;
    cost?: number;
  }>;

  capitalZones: {
    player1: { q: number; r: number }[];
    player2: { q: number; r: number }[];
  };

  players: {
    player1: { color: string };
    player2: { color: string };
  };

  customGameOptions: {
    pointLimit: number;
  }
}
