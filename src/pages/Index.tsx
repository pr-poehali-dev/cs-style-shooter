import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';

interface Weapon {
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

interface Player {
  health: number;
  armor: number;
  money: number;
  kills: number;
  deaths: number;
}

const WEAPONS: Weapon[] = [
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

const Index = () => {
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon>(WEAPONS[0]);
  const [player, setPlayer] = useState<Player>({
    health: 100,
    armor: 100,
    money: 16000,
    kills: 0,
    deaths: 0
  });
  const [crosshairPosition, setCrosshairPosition] = useState({ x: 50, y: 50 });
  const [isAiming, setIsAiming] = useState(false);
  const [gameMode, setGameMode] = useState<'weapons' | 'customization'>('weapons');
  const [weaponCustomization, setWeaponCustomization] = useState({
    scope: false,
    silencer: false,
    grip: false,
    laser: false
  });

  const handleShoot = useCallback(() => {
    if (selectedWeapon.ammo > 0) {
      setSelectedWeapon(prev => ({
        ...prev,
        ammo: prev.ammo - 1
      }));
      
      // Simulate recoil effect
      setIsAiming(true);
      setTimeout(() => setIsAiming(false), 200);
      
      // Random crosshair shake for recoil
      const recoilIntensity = selectedWeapon.recoil / 100;
      setCrosshairPosition(prev => ({
        x: Math.max(45, Math.min(55, prev.x + (Math.random() - 0.5) * recoilIntensity * 10)),
        y: Math.max(45, Math.min(55, prev.y + (Math.random() - 0.5) * recoilIntensity * 10))
      }));
      
      // Reset crosshair position after recoil
      setTimeout(() => {
        setCrosshairPosition({ x: 50, y: 50 });
      }, 300);
    }
  }, [selectedWeapon.ammo, selectedWeapon.recoil]);

  const handleReload = () => {
    setSelectedWeapon(prev => ({
      ...prev,
      ammo: prev.maxAmmo
    }));
  };

  const buyWeapon = (weapon: Weapon) => {
    if (player.money >= weapon.price) {
      setPlayer(prev => ({
        ...prev,
        money: prev.money - weapon.price
      }));
      setSelectedWeapon(weapon);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch(e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          handleShoot();
          break;
        case 'r':
          e.preventDefault();
          handleReload();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleShoot]);

  const getWeaponIcon = (type: string) => {
    switch(type) {
      case 'assault': return 'Rifle';
      case 'sniper': return 'Crosshair';
      case 'pistol': return 'Zap';
      case 'shotgun': return 'Target';
      default: return 'Rifle';
    }
  };

  return (
    <div className="min-h-screen bg-game-dark text-white relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-20 grid-rows-20 h-full">
          {Array.from({ length: 400 }).map((_, i) => (
            <div key={i} className="border border-game-blue/20"></div>
          ))}
        </div>
      </div>

      {/* Game Area */}
      <div className="relative z-10 flex h-screen">
        {/* Left Sidebar - Weapon Selection */}
        <Card className="w-80 m-4 bg-game-dark/90 border-game-blue/30 backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Icon name="Shield" className="text-game-orange" size={24} />
              <h2 className="text-xl font-bold text-game-orange">АРСЕНАЛ</h2>
            </div>

            <div className="flex gap-2 mb-4">
              <Button
                variant={gameMode === 'weapons' ? 'default' : 'outline'}
                onClick={() => setGameMode('weapons')}
                className="flex-1 bg-game-orange hover:bg-game-orange/80 text-white"
              >
                Оружие
              </Button>
              <Button
                variant={gameMode === 'customization' ? 'default' : 'outline'}
                onClick={() => setGameMode('customization')}
                className="flex-1 bg-game-blue hover:bg-game-blue/80 text-white"
              >
                Кастом
              </Button>
            </div>

            {gameMode === 'weapons' && (
              <div className="space-y-3">
                {WEAPONS.map(weapon => (
                  <Card key={weapon.id} 
                    className={`p-4 cursor-pointer transition-all border ${
                      selectedWeapon.id === weapon.id 
                        ? 'border-game-orange bg-game-orange/10' 
                        : 'border-game-blue/30 hover:border-game-blue/50'
                    }`}
                    onClick={() => setSelectedWeapon(weapon)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon name={getWeaponIcon(weapon.type)} size={16} className="text-game-blue" />
                        <span className="font-semibold">{weapon.name}</span>
                      </div>
                      <Badge variant="secondary" className="bg-game-orange/20 text-game-orange">
                        ${weapon.price}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Урон</span>
                        <div className="flex items-center gap-1">
                          <div className="w-16 h-1 bg-gray-700 rounded">
                            <div 
                              className="h-full bg-game-orange rounded" 
                              style={{ width: `${weapon.damage}%` }}
                            ></div>
                          </div>
                          <span className="text-game-orange">{weapon.damage}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>Точность</span>
                        <div className="flex items-center gap-1">
                          <div className="w-16 h-1 bg-gray-700 rounded">
                            <div 
                              className="h-full bg-game-blue rounded" 
                              style={{ width: `${weapon.accuracy}%` }}
                            ></div>
                          </div>
                          <span className="text-game-blue">{weapon.accuracy}</span>
                        </div>
                      </div>
                    </div>

                    {player.money >= weapon.price && selectedWeapon.id !== weapon.id && (
                      <Button 
                        size="sm" 
                        className="w-full mt-2 bg-game-blue hover:bg-game-blue/80"
                        onClick={(e) => {
                          e.stopPropagation();
                          buyWeapon(weapon);
                        }}
                      >
                        Купить
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            )}

            {gameMode === 'customization' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-game-blue">Модификации {selectedWeapon.name}</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name="Focus" size={16} />
                      <span>Прицел</span>
                    </div>
                    <Button
                      size="sm"
                      variant={weaponCustomization.scope ? 'default' : 'outline'}
                      onClick={() => setWeaponCustomization(prev => ({
                        ...prev,
                        scope: !prev.scope
                      }))}
                      className="bg-game-orange hover:bg-game-orange/80"
                    >
                      {weaponCustomization.scope ? 'ON' : 'OFF'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name="VolumeX" size={16} />
                      <span>Глушитель</span>
                    </div>
                    <Button
                      size="sm"
                      variant={weaponCustomization.silencer ? 'default' : 'outline'}
                      onClick={() => setWeaponCustomization(prev => ({
                        ...prev,
                        silencer: !prev.silencer
                      }))}
                      className="bg-game-blue hover:bg-game-blue/80"
                    >
                      {weaponCustomization.silencer ? 'ON' : 'OFF'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name="Grip" size={16} />
                      <span>Рукоять</span>
                    </div>
                    <Button
                      size="sm"
                      variant={weaponCustomization.grip ? 'default' : 'outline'}
                      onClick={() => setWeaponCustomization(prev => ({
                        ...prev,
                        grip: !prev.grip
                      }))}
                      className="bg-game-orange hover:bg-game-orange/80"
                    >
                      {weaponCustomization.grip ? 'ON' : 'OFF'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name="Flashlight" size={16} />
                      <span>Лазер</span>
                    </div>
                    <Button
                      size="sm"
                      variant={weaponCustomization.laser ? 'default' : 'outline'}
                      onClick={() => setWeaponCustomization(prev => ({
                        ...prev,
                        laser: !prev.laser
                      }))}
                      className="bg-game-blue hover:bg-game-blue/80"
                    >
                      {weaponCustomization.laser ? 'ON' : 'OFF'}
                    </Button>
                  </div>
                </div>

                <Separator className="bg-game-blue/30" />
                
                <div className="space-y-3">
                  <h4 className="font-medium text-game-orange">Настройки прицела</h4>
                  <div>
                    <label className="text-sm mb-2 block">Чувствительность</label>
                    <Slider 
                      defaultValue={[50]} 
                      max={100} 
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm mb-2 block">Размер перекрестия</label>
                    <Slider 
                      defaultValue={[25]} 
                      max={100} 
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Main Game Area */}
        <div className="flex-1 relative">
          {/* 3D Game View */}
          <div 
            className="h-full relative bg-gradient-to-br from-game-dark via-gray-900 to-game-dark border-2 border-game-blue/20 m-4 rounded-lg overflow-hidden cursor-crosshair"
            onClick={handleShoot}
          >
            {/* Crosshair */}
            <div 
              className={`absolute w-8 h-8 transition-all duration-200 ${isAiming ? 'scale-110' : 'scale-100'}`}
              style={{ 
                left: `${crosshairPosition.x}%`, 
                top: `${crosshairPosition.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="relative w-full h-full">
                <div className="absolute w-0.5 h-3 bg-game-orange left-1/2 transform -translate-x-1/2 top-0"></div>
                <div className="absolute w-0.5 h-3 bg-game-orange left-1/2 transform -translate-x-1/2 bottom-0"></div>
                <div className="absolute w-3 h-0.5 bg-game-orange top-1/2 transform -translate-y-1/2 left-0"></div>
                <div className="absolute w-3 h-0.5 bg-game-orange top-1/2 transform -translate-y-1/2 right-0"></div>
                {weaponCustomization.scope && (
                  <div className="absolute w-1 h-1 bg-game-blue rounded-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                )}
                {weaponCustomization.laser && (
                  <div className="absolute w-px h-32 bg-red-500 opacity-60 left-1/2 top-1/2 transform -translate-x-1/2"></div>
                )}
              </div>
            </div>

            {/* 3D Environment Elements */}
            <div className="absolute inset-0">
              {/* Floor Grid */}
              <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-30">
                <div className="grid grid-cols-12 grid-rows-6 h-full">
                  {Array.from({ length: 72 }).map((_, i) => (
                    <div key={i} className="border border-game-blue/20"></div>
                  ))}
                </div>
              </div>

              {/* 3D Boxes/Walls */}
              <div className="absolute top-1/4 left-1/4 w-16 h-24 bg-gradient-to-b from-gray-600 to-gray-800 border border-gray-500 transform rotate-3"></div>
              <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-600 transform -rotate-2"></div>
              <div className="absolute bottom-1/3 left-1/3 w-12 h-32 bg-gradient-to-t from-gray-800 to-gray-600 border border-gray-500"></div>
            </div>

            {/* Game Instructions */}
            <div className="absolute top-4 left-4 text-white/70 text-sm">
              <div>ПРОБЕЛ - стрелять</div>
              <div>R - перезарядка</div>
              <div>Клик - стрелять</div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - HUD */}
        <Card className="w-80 m-4 bg-game-dark/90 border-game-blue/30 backdrop-blur-sm">
          <div className="p-6">
            {/* Player Stats */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Icon name="User" className="text-game-blue" size={20} />
                <h3 className="font-bold text-game-blue">ИГРОК</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Здоровье</span>
                  <div className="flex items-center gap-2">
                    <Progress value={player.health} className="w-16" />
                    <span className="text-game-orange font-bold">{player.health}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Броня</span>
                  <div className="flex items-center gap-2">
                    <Progress value={player.armor} className="w-16" />
                    <span className="text-game-blue font-bold">{player.armor}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Деньги</span>
                  <span className="text-green-400 font-bold">${player.money}</span>
                </div>

                <Separator className="bg-game-blue/30" />

                <div className="flex justify-between">
                  <div className="text-center">
                    <div className="text-game-orange font-bold text-lg">{player.kills}</div>
                    <div className="text-xs text-gray-400">Убийства</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-400 font-bold text-lg">{player.deaths}</div>
                    <div className="text-xs text-gray-400">Смерти</div>
                  </div>
                  <div className="text-center">
                    <div className="text-game-blue font-bold text-lg">
                      {player.deaths > 0 ? (player.kills / player.deaths).toFixed(2) : player.kills.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400">K/D</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Weapon Stats */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Icon name={getWeaponIcon(selectedWeapon.type)} className="text-game-orange" size={20} />
                <h3 className="font-bold text-game-orange">ОРУЖИЕ</h3>
              </div>

              <div className="bg-game-blue/10 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{selectedWeapon.name}</span>
                  <Badge className="bg-game-orange text-white">{selectedWeapon.type.toUpperCase()}</Badge>
                </div>
                
                <div className="text-2xl font-bold text-game-orange mb-2">
                  {selectedWeapon.ammo} / {selectedWeapon.maxAmmo}
                </div>
                
                <Button 
                  onClick={handleReload}
                  disabled={selectedWeapon.ammo === selectedWeapon.maxAmmo}
                  className="w-full bg-game-blue hover:bg-game-blue/80"
                >
                  <Icon name="RotateCcw" size={16} className="mr-2" />
                  Перезарядить (R)
                </Button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Урон</span>
                  <span className="text-game-orange">{selectedWeapon.damage}</span>
                </div>
                <div className="flex justify-between">
                  <span>Точность</span>
                  <span className="text-game-blue">{selectedWeapon.accuracy}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Дальность</span>
                  <span>{selectedWeapon.range}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Скорострельность</span>
                  <span>{selectedWeapon.fireRate} RPM</span>
                </div>
                <div className="flex justify-between">
                  <span>Отдача</span>
                  <span className="text-red-400">{selectedWeapon.recoil}%</span>
                </div>
              </div>
            </div>

            {/* Mini Map */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Icon name="Map" className="text-game-blue" size={20} />
                <h3 className="font-bold text-game-blue">КАРТА</h3>
              </div>

              <div className="bg-game-dark border border-game-blue/30 p-4 rounded-lg h-32 relative">
                <div className="absolute inset-2 border border-game-orange/50 rounded"></div>
                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-game-orange rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute top-3 right-3 w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
                <div className="absolute bottom-3 left-3 w-1 h-1 bg-game-blue rounded-full"></div>
                <div className="absolute top-4 left-1/3 w-1 h-1 bg-green-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;