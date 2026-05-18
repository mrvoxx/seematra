// components/global/HeroCanvas.tsx
'use client';

import { useEffect, useRef } from 'react';

export default function HeroCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    let animationFrameId: number;
    let cleanupFn: (() => void) | null = null;

    // Detect mobile: reduce particle count for performance
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // Check WebGL support before loading Three.js — some Android WebViews lack it
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    if (!gl) {
      console.warn('[HeroCanvas] WebGL not supported on this device. Skipping canvas.');
      return;
    }

    // Dynamically import Three.js so it doesn't block initial render
    import('three').then((THREE) => {
      if (!mountRef.current) return; // component unmounted while loading

      try {
        // 1. Scene, Camera, Renderer
        const scene = new THREE.Scene();
        scene.background = null;

        const camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isMobile });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
        mountRef.current.appendChild(renderer.domElement);

        // 2. Geometry: Floating Particles (fewer on mobile)
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = isMobile ? 300 : 800;
        const posArray = new Float32Array(particlesCount * 3);
        const scaleArray = new Float32Array(particlesCount);

        for (let i = 0; i < particlesCount * 3; i += 3) {
          const y = (Math.random() - 0.5) * 10;
          const spread = Math.max(0, 5 - y);
          posArray[i]     = (Math.random() - 0.5) * spread;
          posArray[i + 1] = y;
          posArray[i + 2] = (Math.random() - 0.5) * spread;
          scaleArray[i / 3] = Math.random() * 2;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        particlesGeometry.setAttribute('scale', new THREE.BufferAttribute(scaleArray, 1));

        // Custom shader material
        const particleMaterial = new THREE.ShaderMaterial({
          uniforms: {
            color1: { value: new THREE.Color('#E87F24') },
            color2: { value: new THREE.Color('#73A5CA') },
            time:   { value: 0 },
          },
          vertexShader: `
            attribute float scale;
            varying vec3 vPosition;
            uniform float time;
            void main() {
              vPosition = position;
              vec3 pos = position;
              pos.y += sin(time * 0.5 + position.x) * 0.2;
              vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
              gl_PointSize = scale * (20.0 / -mvPosition.z);
              gl_Position = projectionMatrix * mvPosition;
            }
          `,
          fragmentShader: `
            uniform vec3 color1;
            uniform vec3 color2;
            varying vec3 vPosition;
            void main() {
              float r = distance(gl_PointCoord, vec2(0.5));
              if (r > 0.5) discard;
              float mixValue = (vPosition.y + 5.0) / 10.0;
              vec3 color = mix(color1, color2, mixValue);
              float alpha = 1.0 - (r * 2.0);
              gl_FragColor = vec4(color, alpha * 0.8);
            }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });

        const particlesMesh = new THREE.Points(particlesGeometry, particleMaterial);
        scene.add(particlesMesh);

        // 3. Mouse/Touch Interaction (only on desktop)
        let mouseX = 0;
        let mouseY = 0;
        const handleMouseMove = (event: MouseEvent) => {
          mouseX = (event.clientX / window.innerWidth) * 2 - 1;
          mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        };
        if (!isMobile) {
          window.addEventListener('mousemove', handleMouseMove, { passive: true });
        }

        // 4. Resize Handler
        const handleResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize, { passive: true });

        // 5. Animation Loop
        let elapsedTime = 0;
        let lastTime = performance.now();

        const animate = () => {
          const now = performance.now();
          elapsedTime += (now - lastTime) / 1000;
          lastTime = now;

          particleMaterial.uniforms.time.value = elapsedTime;
          particlesMesh.rotation.y = elapsedTime * 0.05;

          if (!isMobile) {
            camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
            camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.05;
            camera.lookAt(scene.position);
          }

          renderer.render(scene, camera);
          animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        // 6. Cleanup
        cleanupFn = () => {
          if (!isMobile) window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('resize', handleResize);
          cancelAnimationFrame(animationFrameId);
          if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
            mountRef.current.removeChild(renderer.domElement);
          }
          particlesGeometry.dispose();
          particleMaterial.dispose();
          renderer.dispose();
        };

      } catch (err) {
        // Silently fail — the background image will still show
        console.warn('[HeroCanvas] Three.js initialization failed:', err);
      }
    }).catch((err) => {
      console.warn('[HeroCanvas] Failed to load Three.js:', err);
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (cleanupFn) cleanupFn();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-60 dark:opacity-40 transition-opacity"
    />
  );
}
