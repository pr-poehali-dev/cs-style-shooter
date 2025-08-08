import React from 'react';
import { Player, WeaponCustomization } from './types';

interface GameViewProps {
  player: Player;
  weaponCustomization: WeaponCustomization;
  crosshairPosition: { x: number; y: number };
  isAiming: boolean;
  isMouseLocked: boolean;
  handleShoot: () => void;
}

const GameView: React.FC<GameViewProps> = ({
  player,
  weaponCustomization,
  crosshairPosition,
  isAiming,
  isMouseLocked,
  handleShoot
}) => {
  return (
    <div className="flex-1 relative">
      {/* 3D Game View */}
      <div 
        className="h-full relative bg-gradient-to-br from-game-dark via-gray-900 to-game-dark border-2 border-game-blue/20 m-4 rounded-lg overflow-hidden cursor-crosshair"
        onClick={(e) => {
          if (!isMouseLocked) {
            e.currentTarget.requestPointerLock();
          }
          handleShoot();
        }}
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
        <div 
          className="absolute inset-0"
          style={{
            transform: `perspective(1000px) rotateX(${player.rotation.x}deg) rotateY(${player.rotation.y}deg) translate3d(${-player.position.x * 50}px, ${player.position.y * 50}px, ${player.position.z * 50}px)`
          }}
        >
          {/* Floor Grid */}
          <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-30">
            <div className="grid grid-cols-12 grid-rows-6 h-full">
              {Array.from({ length: 72 }).map((_, i) => (
                <div key={i} className="border border-game-blue/20"></div>
              ))}
            </div>
          </div>

          {/* 3D Boxes/Walls - now positioned relative to player */}
          <div 
            className="absolute w-16 h-24 bg-gradient-to-b from-gray-600 to-gray-800 border border-gray-500"
            style={{
              left: `${400 - player.position.x * 50}px`,
              top: `${300 - player.position.z * 50}px`,
              transform: 'rotateX(10deg) rotateY(20deg)'
            }}
          ></div>
          <div 
            className="absolute w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-600"
            style={{
              right: `${400 + player.position.x * 50}px`,
              top: `${200 - player.position.z * 50}px`,
              transform: 'rotateX(-5deg) rotateY(-15deg)'
            }}
          ></div>
          <div 
            className="absolute w-12 h-32 bg-gradient-to-t from-gray-800 to-gray-600 border border-gray-500"
            style={{
              left: `${300 - player.position.x * 30}px`,
              bottom: `${100 + player.position.z * 30}px`,
              transform: 'rotateY(10deg)'
            }}
          ></div>
          
          {/* More environment objects */}
          <div 
            className="absolute w-24 h-16 bg-gradient-to-r from-yellow-800 to-yellow-600 border border-yellow-500"
            style={{
              left: `${600 - player.position.x * 40}px`,
              top: `${400 - player.position.z * 40}px`,
              transform: 'rotateX(5deg) rotateZ(-10deg)'
            }}
          ></div>
          <div 
            className="absolute w-8 h-40 bg-gradient-to-t from-green-800 to-green-600 border border-green-500"
            style={{
              right: `${200 + player.position.x * 60}px`,
              top: `${150 - player.position.z * 60}px`,
              transform: 'rotateY(30deg)'
            }}
          ></div>
        </div>

        {/* Game Instructions */}
        <div className="absolute top-4 left-4 text-white/70 text-sm">
          <div className="mb-2 text-game-orange font-semibold">УПРАВЛЕНИЕ:</div>
          <div>WASD - движение</div>
          <div>Мышь - поворот камеры</div>
          <div>ПРОБЕЛ/Клик - стрелять</div>
          <div>R - перезарядка</div>
          {!isMouseLocked && (
            <div className="mt-2 text-game-blue font-semibold animate-pulse">
              Кликни для захвата мыши!
            </div>
          )}
        </div>
        
        {/* Position indicator */}
        <div className="absolute top-4 right-4 text-white/70 text-xs">
          <div>X: {player.position.x.toFixed(1)}</div>
          <div>Z: {player.position.z.toFixed(1)}</div>
          <div>Поворот: {player.rotation.y.toFixed(0)}°</div>
        </div>
      </div>
    </div>
  );
};

export default GameView;