import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, Grid, Sky } from "@react-three/drei";
import * as THREE from "three";
import { supabase } from "@/integrations/supabase/client";

interface SceneObject {
  id: string;
  type: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color?: string;
  metadata?: any;
}

interface SceneViewerProps {
  sceneObjects?: SceneObject[];
  environmentPath?: string;
  environmentImages?: string[];
  onObjectSelect?: (id: string | null) => void;
  selectedObjectId?: string | null;
}

// Placeholder mesh for products (will be replaced with actual 3D models)
const ProductMesh = ({ 
  object, 
  isSelected, 
  onClick 
}: { 
  object: SceneObject; 
  isSelected: boolean; 
  onClick: () => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered]);

  const getGeometry = () => {
    switch (object.type) {
      case "table":
        return <boxGeometry args={[2, 0.1, 1]} />;
      case "chair":
        return <boxGeometry args={[0.5, 1, 0.5]} />;
      case "flower":
        return <cylinderGeometry args={[0.3, 0.1, 1, 8]} />;
      case "light":
        return <sphereGeometry args={[0.2, 16, 16]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={object.position}
      rotation={object.rotation}
      scale={object.scale}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {getGeometry()}
      <meshStandardMaterial
        color={object.color || "#ffffff"}
        emissive={isSelected ? "#ffd700" : "#000000"}
        emissiveIntensity={isSelected ? 0.3 : 0}
        metalness={0.3}
        roughness={0.7}
      />
    </mesh>
  );
};

// Ground plane
const Ground = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial color="#f5f5f0" />
    </mesh>
  );
};

// Environment placeholder (will be replaced with Gaussian splat)
const EnvironmentPlaceholder = ({ path }: { path?: string }) => {
  return (
    <>
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#ffd4a3" />
    </>
  );
};

// Main scene content
const SceneContent = ({ 
  sceneObjects = [],
  environmentImages = [],
  onObjectSelect, 
  selectedObjectId 
}: SceneViewerProps) => {
  const { camera } = useThree();
  const [loadedImageUrls, setLoadedImageUrls] = useState<string[]>([]);

  useEffect(() => {
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Load environment images from storage
  useEffect(() => {
    const loadImages = async () => {
      if (environmentImages.length === 0) return;
      
      const urls = environmentImages.map(path => {
        const { data } = supabase.storage
          .from("environments")
          .getPublicUrl(path);
        return data.publicUrl;
      });
      
      setLoadedImageUrls(urls);
    };
    
    loadImages();
  }, [environmentImages]);

  const handleBackgroundClick = () => {
    onObjectSelect?.(null);
  };

  return (
    <>
      <PerspectiveCamera makeDefault position={[5, 5, 5]} />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2}
      />
      
      <EnvironmentPlaceholder />
      <Ground />
      <Grid
        args={[50, 50]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#d4af37"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#c9a961"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={false}
      />

      {/* Display uploaded environment images */}
      {loadedImageUrls.map((url, index) => (
        <mesh 
          key={`env-${index}`}
          position={[index * 3 - (loadedImageUrls.length * 1.5), 2, -5]}
          rotation={[0, 0, 0]}
        >
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial>
            <primitive 
              attach="map" 
              object={new THREE.TextureLoader().load(url)} 
            />
          </meshBasicMaterial>
        </mesh>
      ))}

      {sceneObjects.map((obj) => (
        <ProductMesh
          key={obj.id}
          object={obj}
          isSelected={obj.id === selectedObjectId}
          onClick={() => onObjectSelect?.(obj.id)}
        />
      ))}

      {/* Clickable background plane for deselection */}
      <mesh
        position={[0, -0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={handleBackgroundClick}
        visible={false}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
};

// Loading fallback
const LoadingScene = () => {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ffd700" wireframe />
    </mesh>
  );
};

export const SceneViewer = (props: SceneViewerProps) => {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <Suspense fallback={<LoadingScene />}>
          <SceneContent {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
};
