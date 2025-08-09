import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WEAPONS } from '@/components/game/types';

interface Player {
  health: number;
  armor: number;
  money: number;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number };
}

const Index = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const keysRef = useRef<{[key: string]: boolean}>({});
  
  const [isMouseLocked, setIsMouseLocked] = useState(false);
  const [selectedWeapon, setSelectedWeapon] = useState(WEAPONS[0]);
  const [player, setPlayer] = useState<Player>({
    health: 100,
    armor: 100,
    money: 16000,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0 }
  });

  const handleShoot = useCallback(() => {
    if (selectedWeapon.ammo > 0) {
      setSelectedWeapon(prev => ({
        ...prev,
        ammo: prev.ammo - 1
      }));
    }
  }, [selectedWeapon.ammo]);

  const handleReload = useCallback(() => {
    setSelectedWeapon(prev => ({
      ...prev,
      ammo: prev.maxAmmo
    }));
  }, []);

  // Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
      
      if (e.key.toLowerCase() === ' ') {
        e.preventDefault();
        handleShoot();
      }
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleReload();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isMouseLocked && document.pointerLockElement) {
        setPlayer(prev => ({
          ...prev,
          rotation: {
            x: Math.max(-90, Math.min(90, prev.rotation.x - e.movementY * 0.1)),
            y: prev.rotation.y - e.movementX * 0.1
          }
        }));
      }
    };

    const handlePointerLockChange = () => {
      setIsMouseLocked(!!document.pointerLockElement);
    };

    const handleClick = () => {
      if (!isMouseLocked && gameRef.current) {
        gameRef.current.requestPointerLock();
      }
      handleShoot();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('click', handleClick);
    };
  }, [isMouseLocked, handleShoot, handleReload]);

  // Movement loop
  useEffect(() => {
    const moveSpeed = 0.2;
    const interval = setInterval(() => {
      let deltaX = 0;
      let deltaZ = 0;
      
      if (keysRef.current['w']) deltaZ -= moveSpeed;
      if (keysRef.current['s']) deltaZ += moveSpeed;
      if (keysRef.current['a']) deltaX -= moveSpeed;
      if (keysRef.current['d']) deltaX += moveSpeed;
      
      if (deltaX !== 0 || deltaZ !== 0) {
        setPlayer(prev => {
          const radY = (prev.rotation.y * Math.PI) / 180;
          const newX = prev.position.x + (deltaX * Math.cos(radY) - deltaZ * Math.sin(radY));
          const newZ = prev.position.z + (deltaX * Math.sin(radY) + deltaZ * Math.cos(radY));
          
          return {
            ...prev,
            position: {
              ...prev.position,
              x: Math.max(-20, Math.min(20, newX)),
              z: Math.max(-20, Math.min(20, newZ))
            }
          };
        });
      }
    }, 16);
    
    return () => clearInterval(interval);
  }, []);

  // Create walls and objects
  const walls = [
    // Outer walls
    { x: 0, z: -20, width: 40, height: 8, depth: 1, color: '#8B7D6B' },
    { x: 0, z: 20, width: 40, height: 8, depth: 1, color: '#8B7D6B' },
    { x: -20, z: 0, width: 1, height: 8, depth: 40, color: '#8B7D6B' },
    { x: 20, z: 0, width: 1, height: 8, depth: 40, color: '#8B7D6B' },
    
    // Inner walls
    { x: -10, z: -10, width: 1, height: 6, depth: 8, color: '#D2691E' },
    { x: 10, z: -10, width: 1, height: 6, depth: 8, color: '#D2691E' },
    { x: -10, z: 10, width: 1, height: 6, depth: 8, color: '#D2691E' },
    { x: 10, z: 10, width: 1, height: 6, depth: 8, color: '#D2691E' },
    { x: 0, z: 0, width: 8, height: 6, depth: 1, color: '#D2691E' },
    
    // Boxes
    { x: 5, z: 5, width: 3, height: 3, depth: 3, color: '#8B4513' },
    { x: -5, z: 5, width: 3, height: 3, depth: 3, color: '#8B4513' },
    { x: 5, z: -5, width: 3, height: 3, depth: 3, color: '#8B4513' },
    { x: -5, z: -5, width: 3, height: 3, depth: 3, color: '#8B4513' },
    { x: 12, z: 0, width: 2, height: 4, depth: 2, color: '#654321' },
    { x: -12, z: 0, width: 2, height: 4, depth: 2, color: '#654321' },
  ];

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-sky-400 to-sky-200 overflow-hidden">
      {/* 3D World */}
      <div 
        ref={gameRef}
        className="w-full h-full relative cursor-crosshair"
        style={{
          perspective: '800px',
          perspectiveOrigin: '50% 50%'
        }}
      >
        {/* Floor */}
        <div 
          className="absolute"
          style={{
            width: '2000px',
            height: '2000px',
            background: `
              linear-gradient(45deg, #8B7D6B 25%, transparent 25%),
              linear-gradient(-45deg, #8B7D6B 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #8B7D6B 75%),
              linear-gradient(-45deg, transparent 75%, #8B7D6B 75%)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            transform: `
              rotateX(90deg) 
              translate3d(-1000px, 400px, -1000px)
              rotateY(${player.rotation.y}deg)
              translate3d(${player.position.x * 50}px, 0px, ${player.position.z * 50}px)
            `,
            transformOrigin: 'center center',
          }}
        />

        {/* World container */}
        <div 
          style={{
            transform: `
              rotateX(${player.rotation.x}deg) 
              rotateY(${player.rotation.y}deg) 
              translate3d(${-player.position.x * 50}px, 0px, ${-player.position.z * 50}px)
            `,
            transformOrigin: '50% 50%',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Render walls and objects */}
          {walls.map((wall, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                width: `${wall.width * 20}px`,
                height: `${wall.height * 20}px`,
                backgroundColor: wall.color,
                border: '1px solid rgba(0,0,0,0.3)',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)',
                transform: `
                  translate3d(
                    ${wall.x * 50 - wall.width * 10}px, 
                    ${200 - wall.height * 10}px, 
                    ${wall.z * 50 - wall.depth * 10}px
                  )
                `,
                transformStyle: 'preserve-3d'
              }}
            />
          ))}

          {/* Some additional details */}
          <div
            className="absolute"
            style={{
              width: '100px',
              height: '100px',
              background: 'radial-gradient(circle, #FF4500 0%, #FF6347 50%, transparent 70%)',
              borderRadius: '50%',
              transform: 'translate3d(-50px, 150px, 300px)',
            }}
          />
          
          <div
            className="absolute"
            style={{
              width: '60px',
              height: '60px',
              background: 'radial-gradient(circle, #32CD32 0%, #228B22 50%, transparent 70%)',
              borderRadius: '50%',
              transform: 'translate3d(250px, 180px, -200px)',
            }}
          />
        </div>

        {/* Weapon model */}
        <div 
          className="absolute bottom-0 right-0 pointer-events-none"
          style={{
            width: '400px',
            height: '200px',
            transform: 'translate3d(-50px, -50px, 0)',
          }}
        >
          {/* AK-47 */}
          <div className="relative w-full h-full">
            {/* Stock */}
            <div 
              className="absolute bg-amber-800 rounded-sm"
              style={{
                width: '60px',
                height: '20px',
                bottom: '60px',
                right: '20px',
                transform: 'rotate(-5deg)',
              }}
            />
            {/* Body */}
            <div 
              className="absolute bg-gray-800 rounded-sm"
              style={{
                width: '200px',
                height: '15px',
                bottom: '70px',
                right: '80px',
                transform: 'rotate(-2deg)',
              }}
            />
            {/* Barrel */}
            <div 
              className="absolute bg-gray-900 rounded-full"
              style={{
                width: '120px',
                height: '8px',
                bottom: '77px',
                right: '280px',
                transform: 'rotate(-2deg)',
              }}
            />
            {/* Handle */}
            <div 
              className="absolute bg-amber-700 rounded"
              style={{
                width: '15px',
                height: '40px',
                bottom: '30px',
                right: '150px',
                transform: 'rotate(10deg)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="relative w-8 h-8">
          <div className="absolute w-0.5 h-3 bg-red-500 left-1/2 transform -translate-x-1/2 top-0"></div>
          <div className="absolute w-0.5 h-3 bg-red-500 left-1/2 transform -translate-x-1/2 bottom-0"></div>
          <div className="absolute w-3 h-0.5 bg-red-500 top-1/2 transform -translate-y-1/2 left-0"></div>
          <div className="absolute w-3 h-0.5 bg-red-500 top-1/2 transform -translate-y-1/2 right-0"></div>
          <div className="absolute w-1 h-1 bg-red-500 rounded-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>

      {/* HUD */}
      <div className="absolute top-4 left-4 text-white text-sm pointer-events-none z-20">
        <div className="bg-black/70 p-3 rounded">
          <div className="text-orange-400 font-bold text-lg">COUNTER-STRIKE</div>
          <div className="mt-2">
            <div>WASD - движение</div>
            <div>Мышь - камера</div>
            <div>ЛКМ - стрелять</div>
            <div>R - перезарядка</div>
          </div>
          {!isMouseLocked && (
            <div className="mt-3 text-blue-400 animate-pulse font-semibold">
              🎯 Кликни для начала игры!
            </div>
          )}
        </div>
      </div>

      {/* Weapon info */}
      <div className="absolute bottom-4 right-4 text-white pointer-events-none z-20">
        <div className="bg-black/70 p-4 rounded text-right">
          <div className="text-orange-400 font-bold text-2xl">{selectedWeapon.name}</div>
          <div className="text-3xl font-mono text-yellow-400">{selectedWeapon.ammo} / {selectedWeapon.maxAmmo}</div>
          <div className="text-sm mt-1">
            <div>Урон: <span className="text-red-400">{selectedWeapon.damage}</span></div>
            <div>Точность: <span className="text-blue-400">{selectedWeapon.accuracy}%</span></div>
          </div>
        </div>
      </div>

      {/* Player stats */}
      <div className="absolute bottom-4 left-4 text-white pointer-events-none z-20">
        <div className="bg-black/70 p-4 rounded">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-green-400 text-2xl font-bold">{player.health}</div>
              <div className="text-xs">HP</div>
            </div>
            <div className="text-center">
              <div className="text-blue-400 text-2xl font-bold">{player.armor}</div>
              <div className="text-xs">ARMOR</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-400 text-xl font-bold">${player.money}</div>
              <div className="text-xs">MONEY</div>
            </div>
          </div>
        </div>
      </div>

      {/* Radar/Map */}
      <div className="absolute top-4 right-4 text-white pointer-events-none z-20">
        <div className="bg-black/70 p-2 rounded">
          <div className="w-24 h-24 bg-green-900/50 border border-green-500 relative">
            <div className="text-xs text-green-400 mb-1">RADAR</div>
            {/* Player dot */}
            <div 
              className="absolute w-2 h-2 bg-orange-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${50 + player.position.x * 1.2}%`,
                top: `${50 + player.position.z * 1.2}%`
              }}
            />
            {/* Direction indicator */}
            <div 
              className="absolute w-3 h-0.5 bg-orange-400 origin-left transform -translate-y-1/2"
              style={{
                left: `${50 + player.position.x * 1.2}%`,
                top: `${50 + player.position.z * 1.2}%`,
                transform: `translate(-50%, -50%) rotate(${player.rotation.y}deg)`
              }}
            />
            {/* Static objects on radar */}
            <div className="absolute w-1 h-1 bg-red-500 rounded-full" style={{left: '70%', top: '70%'}}></div>
            <div className="absolute w-1 h-1 bg-red-500 rounded-full" style={{left: '30%', top: '70%'}}></div>
            <div className="absolute w-1 h-1 bg-red-500 rounded-full" style={{left: '70%', top: '30%'}}></div>
            <div className="absolute w-1 h-1 bg-red-500 rounded-full" style={{left: '30%', top: '30%'}}></div>
          </div>
        </div>
      </div>

      {/* Debug info */}
      <div className="absolute bottom-20 right-4 text-white/50 text-xs pointer-events-none z-20">
        <div>X: {player.position.x.toFixed(1)}</div>
        <div>Z: {player.position.z.toFixed(1)}</div>
        <div>Angle: {player.rotation.y.toFixed(0)}°</div>
      </div>
    </div>
  );
};

export default Index;