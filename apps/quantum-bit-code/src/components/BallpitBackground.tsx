import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const BallpitBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const spheresRef = useRef<Array<{
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
    target: THREE.Vector3;
  }>>([]);
  const mouseRef = useRef(new THREE.Vector2());
  const mouse3DRef = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Cyan color palette from design system
    const colors = [
      0x0BA5CC, // --accent: 189 94% 43%
      0x3DC5E3, // --cyan-light: 189 94% 65%
      0x068BAA, // Darker cyan
      0x5DD5F0, // Lighter cyan
      0x0995B8, // Mid cyan
    ];

    // Create spheres
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereCount = 30;

    for (let i = 0; i < sphereCount; i++) {
      const material = new THREE.MeshStandardMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        metalness: 0.3,
        roughness: 0.4,
      });

      const sphere = new THREE.Mesh(sphereGeometry, material);
      
      // Random initial position
      sphere.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 20
      );

      scene.add(sphere);

      spheresRef.current.push({
        mesh: sphere,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.05
        ),
        target: new THREE.Vector3(),
      });
    }

    // Mouse move handler
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Convert 2D mouse to 3D position
      const vector = new THREE.Vector3(mouseRef.current.x, mouseRef.current.y, 0.5);
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      mouse3DRef.current.copy(camera.position).add(dir.multiplyScalar(distance));
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      spheresRef.current.forEach((sphereData, index) => {
        const { mesh, velocity, target } = sphereData;

        // Calculate attraction/repulsion from mouse
        const mouseDistance = mesh.position.distanceTo(mouse3DRef.current);
        const attractionRadius = 10;
        const repulsionRadius = 5;

        if (mouseDistance < repulsionRadius) {
          // Repulsion
          const direction = new THREE.Vector3()
            .subVectors(mesh.position, mouse3DRef.current)
            .normalize();
          velocity.add(direction.multiplyScalar(0.05));
        } else if (mouseDistance < attractionRadius) {
          // Slight attraction
          const direction = new THREE.Vector3()
            .subVectors(mouse3DRef.current, mesh.position)
            .normalize();
          velocity.add(direction.multiplyScalar(0.01));
        }

        // Floating motion
        target.y = Math.sin(Date.now() * 0.001 + index) * 2;
        target.x = Math.cos(Date.now() * 0.0008 + index) * 2;
        
        const toTarget = new THREE.Vector3().subVectors(target, mesh.position);
        velocity.add(toTarget.multiplyScalar(0.001));

        // Apply velocity
        mesh.position.add(velocity);

        // Damping
        velocity.multiplyScalar(0.95);

        // Boundary constraints
        const boundary = 25;
        if (Math.abs(mesh.position.x) > boundary) {
          mesh.position.x = Math.sign(mesh.position.x) * boundary;
          velocity.x *= -0.5;
        }
        if (Math.abs(mesh.position.y) > boundary) {
          mesh.position.y = Math.sign(mesh.position.y) * boundary;
          velocity.y *= -0.5;
        }
        if (Math.abs(mesh.position.z) > 15) {
          mesh.position.z = Math.sign(mesh.position.z) * 15;
          velocity.z *= -0.5;
        }

        // Gentle rotation
        mesh.rotation.x += 0.005;
        mesh.rotation.y += 0.005;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      spheresRef.current.forEach(({ mesh }) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 -z-10 opacity-40"
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default BallpitBackground;
