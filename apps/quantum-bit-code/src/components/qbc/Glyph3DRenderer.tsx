import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { EncodedPath3D, LatticeAnchors3D } from '@/lib/qbc/types3d';
import { GlyphStyle, GlyphOrientation } from '@/lib/qbc/types';
import { Slider } from '@/components/ui/slider';

interface Glyph3DRendererProps {
  path: EncodedPath3D;
  anchors: LatticeAnchors3D;
  style: GlyphStyle;
  orientation: GlyphOrientation;
  latticeType: '7x7x7' | 'metatron';
  showLabels?: boolean;
  showAnchors?: boolean;
  className?: string;
}

export function Glyph3DRenderer({
  path,
  anchors,
  style,
  orientation,
  latticeType,
  showLabels = false,
  showAnchors = true,
  className = '',
}: Glyph3DRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const labelSpritesRef = useRef<THREE.Sprite[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(50); // 0-100 slider value

  // Convert zoom slider value to camera distance
  const updateCameraFromZoom = useCallback((zoomValue: number) => {
    if (!cameraRef.current) return;
    // Map 0-100 to camera distance 4 (zoomed out) to 1 (zoomed in)
    const distance = 4 - (zoomValue / 100) * 3;
    cameraRef.current.position.set(distance, distance, distance);
    cameraRef.current.lookAt(0, 0, 0);
  }, []);

  // Memoize the points to avoid recalculating
  const pathPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    path.events.forEach((event) => {
      if (event.type === 'move' || event.type === 'line') {
        points.push(new THREE.Vector3(
          event.x - 0.5,
          event.y - 0.5,
          event.z - 0.5
        ));
      } else if (event.type === 'tick') {
        points.push(new THREE.Vector3(event.x - 0.5, event.y - 0.5, event.z - 0.5));
        if (event.tickEndX !== undefined) {
          points.push(new THREE.Vector3(
            event.tickEndX - 0.5,
            event.tickEndY! - 0.5,
            event.tickEndZ! - 0.5
          ));
        }
      }
    });
    return points;
  }, [path]);

  // Create text sprite for labels
  const createTextSprite = (text: string, position: THREE.Vector3, isVisited: boolean) => {
    const canvas = document.createElement('canvas');
    const size = 64;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    ctx.fillStyle = isVisited ? '#22c55e' : '#666666';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.toUpperCase(), size / 2, size / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.position.copy(position);
    sprite.scale.set(0.08, 0.08, 1);
    return sprite;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(style.backgroundColor);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(1.5, 1.5, 1.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Set initial zoom
    updateCameraFromZoom(zoom);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(2, 3, 2);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.4);
    pointLight.position.set(-2, -2, 2);
    scene.add(pointLight);

    // Create group for all objects
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // Grid helper for context
    if (style.showGrid) {
      const gridHelper = new THREE.GridHelper(1, 7, style.gridColor, style.gridColor);
      gridHelper.position.y = -0.5;
      group.add(gridHelper);

      const gridX = new THREE.GridHelper(1, 7, style.gridColor, style.gridColor);
      gridX.rotation.x = Math.PI / 2;
      gridX.position.z = -0.5;
      group.add(gridX);

      const gridZ = new THREE.GridHelper(1, 7, style.gridColor, style.gridColor);
      gridZ.rotation.z = Math.PI / 2;
      gridZ.position.x = -0.5;
      group.add(gridZ);
    }

    // Create anchor spheres and labels
    labelSpritesRef.current = [];
    if (showAnchors) {
      const sphereGeometry = new THREE.SphereGeometry(style.nodeSize * 0.005, 16, 16);
      const nodeMaterial = new THREE.MeshPhongMaterial({ 
        color: style.nodeColor,
        emissive: style.nodeColor,
        emissiveIntensity: 0.2,
      });
      const visitedMaterial = new THREE.MeshPhongMaterial({ 
        color: style.strokeColor,
        emissive: style.strokeColor,
        emissiveIntensity: 0.4,
      });

      Object.entries(anchors).forEach(([char, coords]) => {
        const [x, y, z] = coords;
        const isVisited = path.visitedChars.includes(char);
        const sphere = new THREE.Mesh(
          sphereGeometry,
          isVisited ? visitedMaterial : nodeMaterial
        );
        const position = new THREE.Vector3(x - 0.5, y - 0.5, z - 0.5);
        sphere.position.copy(position);
        group.add(sphere);

        // Add label if enabled
        if (showLabels) {
          const labelPosition = position.clone().add(new THREE.Vector3(0, 0.05, 0));
          const sprite = createTextSprite(char, labelPosition, isVisited);
          group.add(sprite);
          labelSpritesRef.current.push(sprite);
        }
      });
    }

    // Create path line with tube geometry
    if (pathPoints.length > 1) {
      const curve = new THREE.CatmullRomCurve3(pathPoints, false, 'catmullrom', 0.1);
      const tubeGeometry = new THREE.TubeGeometry(curve, pathPoints.length * 10, style.strokeWidth * 0.008, 8, false);
      const tubeMaterial = new THREE.MeshPhongMaterial({
        color: style.strokeColor,
        emissive: style.strokeColor,
        emissiveIntensity: 0.3,
      });
      const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
      group.add(tube);
    }

    // Subtle start/end markers - small and unobtrusive
    if (pathPoints.length > 0) {
      // Start marker - small white sphere with subtle outline
      const markerSize = style.nodeSize * 0.006;
      const startGeometry = new THREE.SphereGeometry(markerSize, 12, 12);
      const startMaterial = new THREE.MeshPhongMaterial({
        color: '#ffffff',
        emissive: '#ffffff',
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.8,
      });
      const startSphere = new THREE.Mesh(startGeometry, startMaterial);
      startSphere.position.copy(pathPoints[0]);
      group.add(startSphere);

      // End marker - slightly different shade, same subtle size
      if (pathPoints.length > 1) {
        const endMaterial = new THREE.MeshPhongMaterial({
          color: '#cccccc',
          emissive: '#999999',
          emissiveIntensity: 0.1,
          transparent: true,
          opacity: 0.7,
        });
        const endSphere = new THREE.Mesh(startGeometry, endMaterial);
        endSphere.position.copy(pathPoints[pathPoints.length - 1]);
        group.add(endSphere);
      }
    }

    // Apply initial orientation
    group.rotation.set(
      ((orientation.pitch || 0) * Math.PI) / 180,
      ((orientation.yaw || 0) * Math.PI) / 180,
      ((orientation.roll || 0) * Math.PI) / 180
    );

    // Animation loop - NO auto-rotation
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [path, anchors, style, orientation, pathPoints, showAnchors, showLabels, updateCameraFromZoom, zoom]);

  // Handle zoom slider change
  const handleZoomChange = (value: number[]) => {
    setZoom(value[0]);
    updateCameraFromZoom(value[0]);
  };

  // Mouse interaction handlers for manual rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !groupRef.current) return;
    e.preventDefault();

    const deltaX = e.clientX - lastMouse.x;
    const deltaY = e.clientY - lastMouse.y;

    groupRef.current.rotation.y += deltaX * 0.01;
    groupRef.current.rotation.x += deltaY * 0.01;

    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile - prevent page scroll
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      setLastMouse({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !groupRef.current || e.touches.length !== 1) return;
    e.preventDefault();
    e.stopPropagation();

    const deltaX = e.touches[0].clientX - lastMouse.x;
    const deltaY = e.touches[0].clientY - lastMouse.y;

    groupRef.current.rotation.y += deltaX * 0.01;
    groupRef.current.rotation.x += deltaY * 0.01;

    setLastMouse({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div
        ref={containerRef}
        className={`w-full h-full min-h-[300px] cursor-grab touch-none ${isDragging ? 'cursor-grabbing' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      />
      
      {/* Zoom slider */}
      <div className="absolute bottom-10 left-4 right-4 flex items-center gap-3 bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg">
        <span className="text-xs text-muted-foreground whitespace-nowrap">Zoom</span>
        <Slider
          value={[zoom]}
          onValueChange={handleZoomChange}
          min={0}
          max={100}
          step={1}
          className="flex-1"
        />
      </div>

      <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
        <span className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
          Drag to rotate
        </span>
      </div>
    </div>
  );
}
