import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { Player, Weapon } from './types';

interface PlayerHUDProps {
  player: Player;
  selectedWeapon: Weapon;
  handleReload: () => void;
}

const PlayerHUD: React.FC<PlayerHUDProps> = ({
  player,
  selectedWeapon,
  handleReload
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
            {/* Player position on minimap */}
            <div 
              className="absolute w-2 h-2 bg-game-orange rounded-full transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${50 + player.position.x * 3}%`,
                top: `${50 + player.position.z * 3}%`
              }}
            ></div>
            {/* Player direction indicator */}
            <div 
              className="absolute w-4 h-0.5 bg-game-orange transform -translate-x-1/2 -translate-y-1/2 origin-left"
              style={{
                left: `${50 + player.position.x * 3}%`,
                top: `${50 + player.position.z * 3}%`,
                transform: `translate(-50%, -50%) rotate(${player.rotation.y}deg)`
              }}
            ></div>
            <div className="absolute top-3 right-3 w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
            <div className="absolute bottom-3 left-3 w-1 h-1 bg-game-blue rounded-full"></div>
            <div className="absolute top-4 left-1/3 w-1 h-1 bg-green-400 rounded-full"></div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PlayerHUD;