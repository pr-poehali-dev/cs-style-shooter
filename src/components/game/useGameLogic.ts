import { useState, useEffect, useCallback } from 'react';
import { Player, Weapon, WeaponCustomization, WEAPONS } from './types';

export const useGameLogic = () => {
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon>(WEAPONS[0]);
  const [player, setPlayer] = useState<Player>({
    health: 100,
    armor: 100,
    money: 16000,
    kills: 0,
    deaths: 0,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0 }
  });
  const [crosshairPosition, setCrosshairPosition] = useState({ x: 50, y: 50 });
  const [keys, setKeys] = useState<{[key: string]: boolean}>({});
  const [mouseMovement, setMouseMovement] = useState({ x: 0, y: 0 });
  const [isMouseLocked, setIsMouseLocked] = useState(false);
  const [isAiming, setIsAiming] = useState(false);
  const [gameMode, setGameMode] = useState<'weapons' | 'customization'>('weapons');
  const [weaponCustomization, setWeaponCustomization] = useState<WeaponCustomization>({
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

  // Movement system
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setKeys(prev => ({ ...prev, [key]: true }));
      
      // Handle special keys
      switch(key) {
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

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setKeys(prev => ({ ...prev, [key]: false }));
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isMouseLocked && document.pointerLockElement) {
        setPlayer(prev => ({
          ...prev,
          rotation: {
            x: Math.max(-90, Math.min(90, prev.rotation.x - e.movementY * 0.2)),
            y: prev.rotation.y - e.movementX * 0.2
          }
        }));
      }
    };

    const handlePointerLockChange = () => {
      setIsMouseLocked(!!document.pointerLockElement);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [handleShoot, isMouseLocked]);

  // Movement loop
  useEffect(() => {
    const moveSpeed = 0.1;
    const interval = setInterval(() => {
      let deltaX = 0;
      let deltaZ = 0;
      
      // WASD movement
      if (keys['w']) deltaZ -= moveSpeed;
      if (keys['s']) deltaZ += moveSpeed;
      if (keys['a']) deltaX -= moveSpeed;
      if (keys['d']) deltaX += moveSpeed;
      
      if (deltaX !== 0 || deltaZ !== 0) {
        setPlayer(prev => {
          const radY = (prev.rotation.y * Math.PI) / 180;
          const newX = prev.position.x + (deltaX * Math.cos(radY) - deltaZ * Math.sin(radY));
          const newZ = prev.position.z + (deltaX * Math.sin(radY) + deltaZ * Math.cos(radY));
          
          return {
            ...prev,
            position: {
              ...prev.position,
              x: Math.max(-10, Math.min(10, newX)),
              z: Math.max(-10, Math.min(10, newZ))
            }
          };
        });
      }
    }, 16); // ~60fps
    
    return () => clearInterval(interval);
  }, [keys]);

  return {
    selectedWeapon,
    setSelectedWeapon,
    player,
    setPlayer,
    crosshairPosition,
    isAiming,
    gameMode,
    setGameMode,
    weaponCustomization,
    setWeaponCustomization,
    isMouseLocked,
    handleShoot,
    handleReload,
    buyWeapon
  };
};