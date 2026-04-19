/**
 * three-scene.js — 3D визуализация с импортом кастомной модели
 * - OBJLoader для загрузки diamond.obj (custom asset)
 * - OrbitControls (перетаскивание, зум, инерция)
 * - Вращающиеся цветные точечные источники света
 * - Система частиц (particle field)
 * - Адаптивный resize
 */

(function () {
  'use strict';

  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  const container = canvas.parentElement;

  // ─── Renderer ──────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);

  function resize() {
    const W = container.clientWidth;
    const H = canvas.clientHeight || 600;
    renderer.setSize(W, H);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  }

  // ─── Scene ─────────────────────────────────────────────
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x060606, 0.06);

  // ─── Camera ────────────────────────────────────────────
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0.5, 8);

  // ─── OrbitControls ─────────────────────────────────────
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 4;
  controls.maxDistance = 14;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.2;
  controls.enablePan = false;
  controls.maxPolarAngle = Math.PI * 0.8;

  // ─── Ambient Light ─────────────────────────────────────
  scene.add(new THREE.AmbientLight(0x111111, 2));

  // ─── Colored Point Lights (orbit around gem) ───────────
  const lightData = [
    { color: 0xd4f54a, intensity: 6, dist: 10 }, // lime
    { color: 0x45c8ff, intensity: 5, dist: 10 }, // cyan
    { color: 0xff6b45, intensity: 4, dist: 10 }, // orange
  ];

  const orbitLights = lightData.map(({ color, intensity, dist }) => {
    const light = new THREE.PointLight(color, intensity, dist);
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 8),
      new THREE.MeshBasicMaterial({ color })
    );
    light.add(sphere);
    scene.add(light);
    return light;
  });

  // ─── Ground grid ───────────────────────────────────────
  const grid = new THREE.GridHelper(20, 24, 0x1a1a1a, 0x141414);
  grid.position.y = -3.5;
  scene.add(grid);

  // ─── Particle system ───────────────────────────────────
  const PARTICLE_COUNT = 1200;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors    = new Float32Array(PARTICLE_COUNT * 3);
  const colorOptions = [
    new THREE.Color(0xd4f54a),
    new THREE.Color(0x45c8ff),
    new THREE.Color(0x888888),
  ];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Spread in a sphere
    const r = 8 + Math.random() * 6;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    const c = colorOptions[Math.floor(Math.random() * colorOptions.length)];
    colors[i * 3]     = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.04,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ─── Load custom OBJ model (diamond.obj) ──────────────
  let gemGroup = null;
  const loader = new THREE.OBJLoader();

  // Build a Blob URL from the OBJ file so it works with file:// too
  loader.load('./models/diamond.obj',
    (obj) => {
      // Apply materials to all meshes in the loaded object
      obj.traverse(child => {
        if (child.isMesh) {
          // Primary gem material - phong with high specularity
          child.material = new THREE.MeshPhongMaterial({
            color:       0xd4f54a,
            emissive:    0x101a00,
            specular:    0xffffff,
            shininess:   200,
            transparent: true,
            opacity:     0.82,
            side:        THREE.DoubleSide,
          });
          child.castShadow    = true;
          child.receiveShadow = true;
        }
      });

      obj.scale.set(0.85, 0.85, 0.85);
      scene.add(obj);
      gemGroup = obj;

      // Add wireframe overlay for crystalline look
      obj.traverse(child => {
        if (child.isMesh) {
          const wire = new THREE.Mesh(
            child.geometry,
            new THREE.MeshBasicMaterial({
              color: 0xd4f54a,
              wireframe: true,
              transparent: true,
              opacity: 0.12,
            })
          );
          child.add(wire);
        }
      });
    },
    (xhr) => {
      const pct = (xhr.loaded / xhr.total * 100).toFixed(0);
      const hint = document.querySelector('.three-controls-hint');
      if (hint) hint.textContent = `Loading model… ${pct}%`;
    },
    (err) => {
      console.warn('OBJ load failed, using fallback geometry:', err);
      // ─── Fallback: procedural gem geometry ────────────
      const geo = new THREE.OctahedronGeometry(1.8, 0);
      // Stretch to diamond shape
      geo.scale(1, 1.4, 1);
      const mat = new THREE.MeshPhongMaterial({
        color:       0xd4f54a,
        emissive:    0x101a00,
        specular:    0xffffff,
        shininess:   200,
        transparent: true,
        opacity:     0.82,
        side:        THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;

      const wireGeo = geo.clone();
      const wireMesh = new THREE.Mesh(wireGeo, new THREE.MeshBasicMaterial({
        color: 0xd4f54a, wireframe: true, transparent: true, opacity: 0.14
      }));
      mesh.add(wireMesh);

      const group = new THREE.Group();
      group.add(mesh);
      scene.add(group);
      gemGroup = group;

      const hint = document.querySelector('.three-controls-hint');
      if (hint) hint.innerHTML = '🖱 Drag to rotate &nbsp;·&nbsp; Scroll to zoom';
    }
  );

  // ─── Animate ───────────────────────────────────────────
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Orbit lights in a ring
    orbitLights.forEach((light, i) => {
      const angle = t * 0.6 + (i * Math.PI * 2) / orbitLights.length;
      const radius = 4;
      light.position.x = Math.cos(angle) * radius;
      light.position.y = Math.sin(t * 0.3 + i) * 1.5;
      light.position.z = Math.sin(angle) * radius;
    });

    // Slow particle drift
    particles.rotation.y = t * 0.04;
    particles.rotation.x = Math.sin(t * 0.02) * 0.1;

    // Gentle gem bob if not being dragged
    if (gemGroup && !controls.isActive) {
      gemGroup.position.y = Math.sin(t * 0.7) * 0.12;
    }

    controls.update();
    renderer.render(scene, camera);
  }

  // ─── Init resize + start ────────────────────────────────
  resize();
  window.addEventListener('resize', resize, { passive: true });
  animate();

  // ─── UX: slow autorotate on user interaction ───────────
  renderer.domElement.addEventListener('mousedown', () => {
    controls.autoRotateSpeed = 0;
  });
  renderer.domElement.addEventListener('mouseup', () => {
    setTimeout(() => { controls.autoRotateSpeed = 1.2; }, 1500);
  });
  renderer.domElement.addEventListener('touchstart', () => {
    controls.autoRotateSpeed = 0;
  }, { passive: true });
  renderer.domElement.addEventListener('touchend', () => {
    setTimeout(() => { controls.autoRotateSpeed = 1.2; }, 1500);
  }, { passive: true });

  // ─── Hint text ─────────────────────────────────────────
  const hint = document.querySelector('.three-controls-hint');
  if (hint) {
    setTimeout(() => {
      hint.innerHTML = '🖱 Drag to rotate &nbsp;·&nbsp; Scroll to zoom';
    }, 100);
  }

})();