import { useEffect, useRef } from "react";
import * as THREE from "three";

const GeometricBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create geometric lattice structure (Metatron's Cube inspired)
    const group = new THREE.Group();
    
    // Colors
    const cyanColor = new THREE.Color(0x00d4ff);
    const purpleColor = new THREE.Color(0xbf40ff);
    const blueColor = new THREE.Color(0x4d7fff);
    
    // Create icosahedron wireframe (core geometric form)
    const icosaGeometry = new THREE.IcosahedronGeometry(3, 0);
    const icosaEdges = new THREE.EdgesGeometry(icosaGeometry);
    const icosaMaterial = new THREE.LineBasicMaterial({ 
      color: cyanColor,
      transparent: true,
      opacity: 0.6 
    });
    const icosaWireframe = new THREE.LineSegments(icosaEdges, icosaMaterial);
    group.add(icosaWireframe);
    
    // Create outer dodecahedron
    const dodecaGeometry = new THREE.DodecahedronGeometry(5, 0);
    const dodecaEdges = new THREE.EdgesGeometry(dodecaGeometry);
    const dodecaMaterial = new THREE.LineBasicMaterial({ 
      color: purpleColor,
      transparent: true,
      opacity: 0.3 
    });
    const dodecaWireframe = new THREE.LineSegments(dodecaEdges, dodecaMaterial);
    group.add(dodecaWireframe);
    
    // Create innermost tetrahedron
    const tetraGeometry = new THREE.TetrahedronGeometry(1.5, 0);
    const tetraEdges = new THREE.EdgesGeometry(tetraGeometry);
    const tetraMaterial = new THREE.LineBasicMaterial({ 
      color: blueColor,
      transparent: true,
      opacity: 0.8 
    });
    const tetraWireframe = new THREE.LineSegments(tetraEdges, tetraMaterial);
    group.add(tetraWireframe);
    
    // Add floating particles
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 4 + Math.random() * 4;
      
      particlePositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i + 2] = radius * Math.cos(phi);
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: cyanColor,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    group.add(particles);
    
    scene.add(group);
    camera.position.z = 10;

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    
    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / width - 0.5) * 2;
      mouseY = (event.clientY / height - 0.5) * 2;
    };
    
    window.addEventListener('mousemove', handleMouseMove);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate geometric forms
      icosaWireframe.rotation.x += 0.002;
      icosaWireframe.rotation.y += 0.003;
      
      dodecaWireframe.rotation.x -= 0.001;
      dodecaWireframe.rotation.y += 0.002;
      
      tetraWireframe.rotation.x += 0.004;
      tetraWireframe.rotation.z += 0.003;
      
      // Rotate particles
      particles.rotation.y += 0.0005;
      
      // Mouse influence
      group.rotation.x += (mouseY * 0.1 - group.rotation.x) * 0.02;
      group.rotation.y += (mouseX * 0.1 - group.rotation.y) * 0.02;
      
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
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 z-0"
      style={{ opacity: 0.7 }}
    />
  );
};

export default GeometricBackground;
