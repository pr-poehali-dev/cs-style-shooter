import React from 'react';
import Game3D from './Game3D';
import { Player, WeaponCustomization } from './types';

interface GameViewProps {
  player: Player;
  weaponCustomization: WeaponCustomization;
  crosshairPosition: { x: number; y: number };
  isAiming: boolean;
  isMouseLocked: boolean;
  handleShoot: () => void;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
}

const GameView: React.FC<GameViewProps> = ({
  player,
  weaponCustomization,
  crosshairPosition,
  isAiming,
  isMouseLocked,
  handleShoot,
  setPlayer
}) => {
  return (
    <div className="flex-1 relative">
      <div className="h-full relative border-2 border-game-blue/20 m-4 rounded-lg overflow-hidden">
        <Game3D
          player={player}
          weaponCustomization={weaponCustomization}
          crosshairPosition={crosshairPosition}
          isAiming={isAiming}
          isMouseLocked={isMouseLocked}
          handleShoot={handleShoot}
          setPlayer={setPlayer}
        />
      </div>
    </div>
  );
};

export default GameView;