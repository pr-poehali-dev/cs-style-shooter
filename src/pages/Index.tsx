import React from 'react';
import WeaponSidebar from '@/components/game/WeaponSidebar';
import GameView from '@/components/game/GameView';
import PlayerHUD from '@/components/game/PlayerHUD';
import { useGameLogic } from '@/components/game/useGameLogic';

const Index = () => {
  const {
    selectedWeapon,
    setSelectedWeapon,
    player,
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
  } = useGameLogic();

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
        <WeaponSidebar
          selectedWeapon={selectedWeapon}
          setSelectedWeapon={setSelectedWeapon}
          player={player}
          gameMode={gameMode}
          setGameMode={setGameMode}
          weaponCustomization={weaponCustomization}
          setWeaponCustomization={setWeaponCustomization}
          buyWeapon={buyWeapon}
        />

        {/* Main Game Area */}
        <GameView
          player={player}
          weaponCustomization={weaponCustomization}
          crosshairPosition={crosshairPosition}
          isAiming={isAiming}
          isMouseLocked={isMouseLocked}
          handleShoot={handleShoot}
        />

        {/* Right Sidebar - HUD */}
        <PlayerHUD
          player={player}
          selectedWeapon={selectedWeapon}
          handleReload={handleReload}
        />
      </div>
    </div>
  );
};

export default Index;