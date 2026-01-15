export interface Unit {
  id: string;
  player: 1 | 2;
  q: number;
  r: number;
  type: string;
  health: number;
  maxHealth: number;
  damage: number;
  capitalDamage: number;
  squadronName?: string;
  abilityStates?: Record<string, any>;
}
