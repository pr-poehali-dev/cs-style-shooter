import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import { Weapon, Player, WeaponCustomization, WEAPONS } from './types';

interface WeaponSidebarProps {
  selectedWeapon: Weapon;
  setSelectedWeapon: (weapon: Weapon) => void;
  player: Player;
  gameMode: 'weapons' | 'customization';
  setGameMode: (mode: 'weapons' | 'customization') => void;
  weaponCustomization: WeaponCustomization;
  setWeaponCustomization: React.Dispatch<React.SetStateAction<WeaponCustomization>>;
  buyWeapon: (weapon: Weapon) => void;
}

const WeaponSidebar: React.FC<WeaponSidebarProps> = ({
  selectedWeapon,
  setSelectedWeapon,
  player,
  gameMode,
  setGameMode,
  weaponCustomization,
  setWeaponCustomization,
  buyWeapon
}) => {
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
  );
};

export default WeaponSidebar;