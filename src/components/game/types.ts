export interface Weapon {
  id: string;
  name: string;
  damage: number;
  accuracy: number;
  range: number;
  fireRate: number;
  recoil: number;
  ammo: number;
  maxAmmo: number;
  type: 'assault' | 'sniper' | 'pistol' | 'shotgun';
  price: number;
}

export interface Player {
  health: number;
  armor: number;
  money: number;
  kills: number;
  deaths: number;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number };
}

export interface WeaponCustomization {
  scope: boolean;
  silencer: boolean;
  grip: boolean;
  laser: boolean;
}

export const WEAPONS: Weapon[] = [
  {
    id: 'ak47',
    name: 'AK-47',
    damage: 95,
    accuracy: 73,
    range: 88,
    fireRate: 75,
    recoil: 85,
    ammo: 30,
    maxAmmo: 30,
    type: 'assault',
    price: 2700
  },
  {
    id: 'm4a4',
    name: 'M4A4',
    damage: 85,
    accuracy: 78,
    range: 90,
    fireRate: 78,
    recoil: 65,
    ammo: 30,
    maxAmmo: 30,
    type: 'assault',
    price: 3100
  },
  {
    id: 'awp',
    name: 'AWP',
    damage: 100,
    accuracy: 95,
    range: 100,
    fireRate: 30,
    recoil: 95,
    ammo: 10,
    maxAmmo: 10,
    type: 'sniper',
    price: 4750
  },
  {
    id: 'glock',
    name: 'Glock-18',
    damage: 45,
    accuracy: 60,
    range: 55,
    fireRate: 85,
    recoil: 40,
    ammo: 20,
    maxAmmo: 20,
    type: 'pistol',
    price: 400
  }
];