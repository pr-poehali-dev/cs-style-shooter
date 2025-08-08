import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { WEAPONS } from '@/components/game/types';

interface Player {
  health: number;
  armor: number;
  money: number;
  kills: number;
  deaths: number;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number };
}

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

const Index = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const keysRef = useRef<{[key: string]: boolean}>({});
  const mouseRef = useRef({ x: 0, y: 0 });
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMouseLocked, setIsMouseLocked] = useState(false);
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon>(WEAPONS[0]);
  const [player, setPlayer] = useState<Player>({
    health: 100,
    armor: 100,
    money: 16000,
    kills: 0,
    deaths: 0,
    position: { x: 0, y: 1.6, z: 0 },
    rotation: { x: 0, y: 0 }
  });

  const handleShoot = useCallback(() => {
    if (selectedWeapon.ammo > 0) {
      setSelectedWeapon(prev => ({
        ...prev,
        ammo: prev.ammo - 1
      }));
      
      // Weapon flash effect
      if (cameraRef.current && cameraRef.current.children[0]) {
        const weaponGroup = cameraRef.current.children[0];
        weaponGroup.position.z += 0.1;
        setTimeout(() => {
          weaponGroup.position.z -= 0.1;
        }, 100);
      }
    }
  }, [selectedWeapon.ammo]);

  const handleReload = useCallback(() => {
    setSelectedWeapon(prev => ({
      ...prev,
      ammo: prev.maxAmmo
    }));
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current || isInitialized) return;

    try {
      // Scene setup
      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x404040, 1, 100);
      scene.background = new THREE.Color(0x87CEEB);
      sceneRef.current = scene;

      // Camera setup
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 1.6, 0);
      cameraRef.current = camera;

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x87CEEB);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      mountRef.current.appendChild(renderer.domElement);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
      directionalLight.position.set(10, 20, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      scene.add(directionalLight);

      // Create floor
      const floorGeometry = new THREE.PlaneGeometry(100, 100);
      const floorMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x8B7D6B,
      });
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      // Create walls
      const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xB8860B });
      const wallGeometry = new THREE.BoxGeometry(2, 4, 0.2);

      // Create CS-like map layout
      const wallPositions = [
        // Outer perimeter
        [0, 2, -25], [10, 2, -25], [-10, 2, -25], [20, 2, -25], [-20, 2, -25],
        [25, 2, 0], [25, 2, 10], [25, 2, -10], [25, 2, 20], [25, 2, -20],
        [-25, 2, 0], [-25, 2, 10], [-25, 2, -10], [-25, 2, 20], [-25, 2, -20],
        [0, 2, 25], [10, 2, 25], [-10, 2, 25], [20, 2, 25], [-20, 2, 25],
        
        // Inner maze structure
        [8, 2, 0], [-8, 2, 0], [0, 2, 8], [0, 2, -8],
        [15, 2, 8], [-15, 2, 8], [15, 2, -8], [-15, 2, -8],
        [8, 2, 15], [-8, 2, 15], [8, 2, -15], [-8, 2, -15],
      ];

      wallPositions.forEach(([x, y, z]) => {
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(x, y, z);
        wall.castShadow = true;
        wall.receiveShadow = true;
        scene.add(wall);
      });

      // Create boxes (CS crates)
      const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
      const boxMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
      
      const boxPositions = [
        [5, 1, 5], [-5, 1, 5], [5, 1, -5], [-5, 1, -5],
        [12, 1, 3], [-12, 1, 3], [3, 1, 12], [-3, 1, 12],
        [18, 1, 0], [-18, 1, 0], [0, 1, 18], [0, 1, -18]
      ];

      boxPositions.forEach(([x, y, z]) => {
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.position.set(x, y, z);
        box.castShadow = true;
        box.receiveShadow = true;
        scene.add(box);
      });

      // Create weapon model
      const weaponGroup = new THREE.Group();
      
      // AK-47 body
      const bodyGeometry = new THREE.BoxGeometry(0.15, 0.08, 1.2);
      const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x2F2F2F });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.set(0.4, -0.4, -0.6);
      weaponGroup.add(body);

      // Barrel
      const barrelGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.6);
      const barrelMaterial = new THREE.MeshLambertMaterial({ color: 0x1A1A1A });
      const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
      barrel.rotation.z = Math.PI / 2;
      barrel.position.set(0.7, -0.35, -0.4);
      weaponGroup.add(barrel);

      // Stock
      const stockGeometry = new THREE.BoxGeometry(0.08, 0.12, 0.4);
      const stockMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
      const stock = new THREE.Mesh(stockGeometry, stockMaterial);
      stock.position.set(0.2, -0.3, -1.0);
      weaponGroup.add(stock);

      camera.add(weaponGroup);
      scene.add(camera);

      setIsInitialized(true);

      console.log('3D Scene initialized successfully');

    } catch (error) {
      console.error('Failed to initialize 3D scene:', error);
    }

    return () => {
      if (mountRef.current && rendererRef.current?.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, []);

  // Controls and movement
  useEffect(() => {
    if (!isInitialized) return;

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
      if (isMouseLocked && document.pointerLockElement && cameraRef.current) {
        const camera = cameraRef.current;
        
        mouseRef.current.x -= e.movementX * 0.002;
        mouseRef.current.y = Math.max(-Math.PI/2, Math.min(Math.PI/2, mouseRef.current.y - e.movementY * 0.002));
        
        camera.rotation.order = 'YXZ';
        camera.rotation.y = mouseRef.current.x;
        camera.rotation.x = mouseRef.current.y;
        
        setPlayer(prev => ({
          ...prev,
          rotation: { x: mouseRef.current.y, y: mouseRef.current.x }
        }));
      }
    };

    const handlePointerLockChange = () => {
      setIsMouseLocked(!!document.pointerLockElement);
    };

    const handleClick = () => {
      if (!isMouseLocked) {
        document.body.requestPointerLock();
      } else {
        handleShoot();
      }
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
  }, [isInitialized, isMouseLocked, handleShoot, handleReload]);

  // Game loop
  useEffect(() => {
    if (!isInitialized || !cameraRef.current || !rendererRef.current || !sceneRef.current) return;

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const camera = cameraRef.current!;
      const renderer = rendererRef.current!;
      const scene = sceneRef.current!;

      // Movement
      const moveSpeed = 5 * delta; // 5 units per second
      const direction = new THREE.Vector3();
      const right = new THREE.Vector3();
      
      camera.getWorldDirection(direction);
      right.crossVectors(direction, camera.up).normalize();
      
      let moved = false;
      const oldPosition = camera.position.clone();
      
      if (keysRef.current['w']) {
        camera.position.add(direction.clone().multiplyScalar(moveSpeed));
        moved = true;
      }
      if (keysRef.current['s']) {
        camera.position.add(direction.clone().multiplyScalar(-moveSpeed));
        moved = true;
      }
      if (keysRef.current['a']) {
        camera.position.add(right.clone().multiplyScalar(-moveSpeed));
        moved = true;
      }
      if (keysRef.current['d']) {
        camera.position.add(right.clone().multiplyScalar(moveSpeed));
        moved = true;
      }

      // Keep camera at eye level
      camera.position.y = 1.6;

      // Boundary checks
      camera.position.x = Math.max(-23, Math.min(23, camera.position.x));
      camera.position.z = Math.max(-23, Math.min(23, camera.position.z));

      // Update player position
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

      // Weapon sway
      if (camera.children[0]) {
        const weaponGroup = camera.children[0];
        const time = clock.getElapsedTime();
        
        if (moved) {
          weaponGroup.position.y = -0.4 + Math.sin(time * 10) * 0.03;
          weaponGroup.rotation.z = Math.sin(time * 8) * 0.02;
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
  }, [isInitialized]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-game-dark flex items-center justify-center">
        <div className="text-white text-xl">
          Загрузка 3D движка...
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />
      
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
      <div className="absolute top-4 left-4 text-white text-sm pointer-events-none">
        <div className="bg-black/50 p-2 rounded">
          <div className="text-orange-400 font-bold">CS 1.6 Style</div>
          <div>WASD - движение</div>
          <div>Мышь - камера</div>
          <div>ЛКМ - стрелять</div>
          <div>R - перезарядка</div>
          {!isMouseLocked && (
            <div className="mt-2 text-blue-400 animate-pulse">
              Кликни для игры!
            </div>
          )}
        </div>
      </div>

      {/* Weapon info */}
      <div className="absolute bottom-4 right-4 text-white pointer-events-none">
        <div className="bg-black/50 p-3 rounded text-right">
          <div className="text-orange-400 font-bold text-xl">{selectedWeapon.name}</div>
          <div className="text-2xl font-mono">{selectedWeapon.ammo} / {selectedWeapon.maxAmmo}</div>
          <div className="text-sm">Урон: {selectedWeapon.damage}</div>
        </div>
      </div>

      {/* Player stats */}
      <div className="absolute bottom-4 left-4 text-white pointer-events-none">
        <div className="bg-black/50 p-3 rounded">
          <div className="text-green-400">Здоровье: {player.health}</div>
          <div className="text-blue-400">Броня: {player.armor}</div>
          <div className="text-yellow-400">Деньги: ${player.money}</div>
        </div>
      </div>

      {/* Position debug */}
      <div className="absolute top-4 right-4 text-white/50 text-xs pointer-events-none">
        <div>X: {player.position.x.toFixed(1)}</div>
        <div>Z: {player.position.z.toFixed(1)}</div>
        <div>Угол: {(player.rotation.y * 180 / Math.PI).toFixed(0)}°</div>
      </div>
    </div>
  );
};

export default Index;