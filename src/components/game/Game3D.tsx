import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Player, WeaponCustomization } from './types';

interface Game3DProps {
  player: Player;
  weaponCustomization: WeaponCustomization;
  crosshairPosition: { x: number; y: number };
  isAiming: boolean;
  isMouseLocked: boolean;
  handleShoot: () => void;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
}

const Game3D: React.FC<Game3DProps> = ({
  player,
  weaponCustomization,
  crosshairPosition,
  isAiming,
  isMouseLocked,
  handleShoot,
  setPlayer
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const keysRef = useRef<{[key: string]: boolean}>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current || isInitialized) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x404040, 1, 100);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 0); // Eye level height
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x87CEEB); // Sky blue
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Create floor
    const floorGeometry = new THREE.PlaneGeometry(50, 50);
    const floorMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x8B4513,
      transparent: true,
      opacity: 0.8
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Create walls (like CS map)
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xDDDDDD });
    const wallGeometry = new THREE.BoxGeometry(1, 4, 0.2);

    // Create maze-like structure
    const wallPositions = [
      // Outer walls
      [0, 2, -10], [5, 2, -10], [-5, 2, -10],
      [10, 2, -5], [10, 2, 0], [10, 2, 5],
      [-10, 2, -5], [-10, 2, 0], [-10, 2, 5],
      [0, 2, 10], [5, 2, 10], [-5, 2, 10],
      
      // Inner walls
      [3, 2, 0], [-3, 2, 0],
      [0, 2, 3], [0, 2, -3],
      [6, 2, 3], [-6, 2, 3],
      [6, 2, -6], [-6, 2, -6],
    ];

    wallPositions.forEach(pos => {
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.position.set(pos[0], pos[1], pos[2]);
      wall.castShadow = true;
      wall.receiveShadow = true;
      scene.add(wall);
    });

    // Create boxes (like CS crates)
    const boxGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const boxMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    
    const boxPositions = [
      [4, 0.75, 4], [-4, 0.75, 4], [4, 0.75, -4], [-4, 0.75, -4],
      [7, 0.75, 0], [-7, 0.75, 0], [0, 0.75, 7], [0, 0.75, -7]
    ];

    boxPositions.forEach(pos => {
      const box = new THREE.Mesh(boxGeometry, boxMaterial);
      box.position.set(pos[0], pos[1], pos[2]);
      box.castShadow = true;
      box.receiveShadow = true;
      scene.add(box);
    });

    // Create weapon model (simple AK-47 shape)
    const weaponGroup = new THREE.Group();
    
    // Weapon body
    const weaponBodyGeometry = new THREE.BoxGeometry(0.1, 0.05, 0.8);
    const weaponBodyMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const weaponBody = new THREE.Mesh(weaponBodyGeometry, weaponBodyMaterial);
    weaponBody.position.set(0.3, -0.3, -0.5);
    weaponGroup.add(weaponBody);

    // Weapon barrel
    const barrelGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.4);
    const barrelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
    barrel.rotation.z = Math.PI / 2;
    barrel.position.set(0.5, -0.28, -0.3);
    weaponGroup.add(barrel);

    // Weapon stock
    const stockGeometry = new THREE.BoxGeometry(0.05, 0.08, 0.3);
    const stockMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const stock = new THREE.Mesh(stockGeometry, stockMaterial);
    stock.position.set(0.15, -0.25, -0.8);
    weaponGroup.add(stock);

    camera.add(weaponGroup);
    scene.add(camera);

    setIsInitialized(true);

    // Handle resize
    const handleResize = () => {
      if (mountRef.current && camera && renderer) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isInitialized]);

  // Movement and controls
  useEffect(() => {
    if (!isInitialized) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
      
      if (e.key.toLowerCase() === ' ') {
        e.preventDefault();
        handleShoot();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isMouseLocked && document.pointerLockElement && cameraRef.current) {
        const camera = cameraRef.current;
        
        // Update player rotation state
        setPlayer(prev => {
          const newRotationY = prev.rotation.y - e.movementX * 0.002;
          const newRotationX = Math.max(-Math.PI/2, Math.min(Math.PI/2, prev.rotation.x - e.movementY * 0.002));
          
          // Apply rotation to camera
          camera.rotation.order = 'YXZ';
          camera.rotation.y = newRotationY;
          camera.rotation.x = newRotationX;
          
          return {
            ...prev,
            rotation: { x: newRotationX, y: newRotationY }
          };
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isInitialized, isMouseLocked, handleShoot, setPlayer]);

  // Game loop
  useEffect(() => {
    if (!isInitialized || !cameraRef.current || !rendererRef.current || !sceneRef.current) return;

    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const scene = sceneRef.current;

    let animationId: number;

    const animate = () => {
      // Movement
      const moveSpeed = 0.1;
      const direction = new THREE.Vector3();
      const right = new THREE.Vector3();
      
      camera.getWorldDirection(direction);
      right.crossVectors(direction, camera.up).normalize();
      
      let moved = false;
      
      if (keysRef.current['w']) {
        camera.position.add(direction.multiplyScalar(moveSpeed));
        moved = true;
      }
      if (keysRef.current['s']) {
        camera.position.add(direction.multiplyScalar(-moveSpeed));
        moved = true;
      }
      if (keysRef.current['a']) {
        camera.position.add(right.multiplyScalar(-moveSpeed));
        moved = true;
      }
      if (keysRef.current['d']) {
        camera.position.add(right.multiplyScalar(moveSpeed));
        moved = true;
      }

      // Keep camera at eye level
      camera.position.y = 1.6;

      // Update player position in state
      if (moved) {
        setPlayer(prev => ({
          ...prev,
          position: {
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z
          }
        }));
      }

      // Weapon sway effect
      if (camera.children[0]) {
        const weaponGroup = camera.children[0];
        const time = Date.now() * 0.001;
        
        if (moved) {
          weaponGroup.position.y = -0.3 + Math.sin(time * 10) * 0.02;
          weaponGroup.rotation.z = Math.sin(time * 8) * 0.01;
        }
        
        if (isAiming) {
          weaponGroup.position.x = 0.2;
          weaponGroup.position.y = -0.2;
        } else {
          weaponGroup.position.x = 0.3;
          weaponGroup.position.y = -0.3;
        }
      }

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isInitialized, isAiming, setPlayer]);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mountRef} 
        className="w-full h-full cursor-none"
        onClick={() => {
          if (!isMouseLocked && mountRef.current) {
            mountRef.current.requestPointerLock();
          }
          handleShoot();
        }}
      />
      
      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className={`transition-all duration-200 ${isAiming ? 'scale-110' : 'scale-100'}`}>
          <div className="relative w-8 h-8">
            <div className="absolute w-0.5 h-3 bg-game-orange left-1/2 transform -translate-x-1/2 top-0"></div>
            <div className="absolute w-0.5 h-3 bg-game-orange left-1/2 transform -translate-x-1/2 bottom-0"></div>
            <div className="absolute w-3 h-0.5 bg-game-orange top-1/2 transform -translate-y-1/2 left-0"></div>
            <div className="absolute w-3 h-0.5 bg-game-orange top-1/2 transform -translate-y-1/2 right-0"></div>
            {weaponCustomization.scope && (
              <div className="absolute w-1 h-1 bg-game-blue rounded-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            )}
          </div>
        </div>
      </div>

      {/* Game Instructions */}
      <div className="absolute top-4 left-4 text-white/70 text-sm pointer-events-none">
        <div className="mb-2 text-game-orange font-semibold">УПРАВЛЕНИЕ CS 1.6:</div>
        <div>WASD - движение</div>
        <div>Мышь - поворот камеры</div>
        <div>ЛКМ - стрелять</div>
        <div>R - перезарядка</div>
        {!isMouseLocked && (
          <div className="mt-2 text-game-blue font-semibold animate-pulse">
            Кликни для захвата мыши!
          </div>
        )}
      </div>
      
      {/* Position indicator */}
      <div className="absolute top-4 right-4 text-white/70 text-xs pointer-events-none">
        <div>X: {player.position.x.toFixed(1)}</div>
        <div>Z: {player.position.z.toFixed(1)}</div>
        <div>Поворот: {(player.rotation.y * 180 / Math.PI).toFixed(0)}°</div>
      </div>

      {/* Weapon info */}
      <div className="absolute bottom-4 right-4 text-white/90 text-sm pointer-events-none">
        <div className="bg-black/50 p-2 rounded">
          <div className="text-game-orange font-bold">AK-47</div>
          <div>Патроны: 30/90</div>
        </div>
      </div>
    </div>
  );
};

export default Game3D;