(function () {
  const canvas = document.getElementById("bg-canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 20);

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const sunLight = new THREE.DirectionalLight(0xffffff, 0.6);
  sunLight.position.set(5, 10, 10);
  scene.add(sunLight);

  // ---------- 비 ----------
  const RAIN_COUNT = 900;
  const rainPositions = new Float32Array(RAIN_COUNT * 2 * 3);
  const rainSpeeds = new Float32Array(RAIN_COUNT);
  for (let i = 0; i < RAIN_COUNT; i++) {
    resetDrop(i);
  }
  function resetDrop(i, initial) {
    const x = (Math.random() - 0.5) * 60;
    const y = initial ? Math.random() * 40 - 10 : 25 + Math.random() * 10;
    const z = (Math.random() - 0.5) * 40;
    const len = 0.4 + Math.random() * 0.5;
    rainPositions[i * 6 + 0] = x;
    rainPositions[i * 6 + 1] = y;
    rainPositions[i * 6 + 2] = z;
    rainPositions[i * 6 + 3] = x;
    rainPositions[i * 6 + 4] = y - len;
    rainPositions[i * 6 + 5] = z;
    rainSpeeds[i] = 0.3 + Math.random() * 0.3;
  }
  for (let i = 0; i < RAIN_COUNT; i++) resetDrop(i, true);
  const rainGeo = new THREE.BufferGeometry();
  rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPositions, 3));
  const rainMat = new THREE.LineBasicMaterial({ color: 0x9fc7ff, transparent: true, opacity: 0.6 });
  const rain = new THREE.LineSegments(rainGeo, rainMat);
  rain.visible = false;
  scene.add(rain);

  function updateRain() {
    const pos = rainGeo.attributes.position.array;
    for (let i = 0; i < RAIN_COUNT; i++) {
      pos[i * 6 + 1] -= rainSpeeds[i];
      pos[i * 6 + 4] -= rainSpeeds[i];
      if (pos[i * 6 + 1] < -20) resetDrop(i);
    }
    rainGeo.attributes.position.needsUpdate = true;
  }

  // ---------- 눈 ----------
  const SNOW_COUNT = 500;
  const snowGeo = new THREE.BufferGeometry();
  const snowPositions = new Float32Array(SNOW_COUNT * 3);
  const snowPhase = new Float32Array(SNOW_COUNT);
  for (let i = 0; i < SNOW_COUNT; i++) {
    snowPositions[i * 3 + 0] = (Math.random() - 0.5) * 60;
    snowPositions[i * 3 + 1] = Math.random() * 40 - 10;
    snowPositions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    snowPhase[i] = Math.random() * Math.PI * 2;
  }
  snowGeo.setAttribute("position", new THREE.BufferAttribute(snowPositions, 3));
  const snowMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.25, transparent: true, opacity: 0.9 });
  const snow = new THREE.Points(snowGeo, snowMat);
  snow.visible = false;
  scene.add(snow);

  let t = 0;
  function updateSnow() {
    const pos = snowGeo.attributes.position.array;
    for (let i = 0; i < SNOW_COUNT; i++) {
      pos[i * 3 + 1] -= 0.06;
      pos[i * 3 + 0] += Math.sin(t + snowPhase[i]) * 0.02;
      if (pos[i * 3 + 1] < -20) pos[i * 3 + 1] = 25;
    }
    snowGeo.attributes.position.needsUpdate = true;
  }

  // ---------- 태양 / 달 ----------
  const sunGroup = new THREE.Group();
  const sunCore = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffd54f })
  );
  const sunHalo = new THREE.Mesh(
    new THREE.SphereGeometry(3.4, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffe082, transparent: true, opacity: 0.35 })
  );
  sunGroup.add(sunCore, sunHalo);
  sunGroup.position.set(6, 8, -5);
  sunGroup.visible = false;
  scene.add(sunGroup);

  // ---------- 구름 ----------
  function makeCloud() {
    const group = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: 0xf2f4f7 });
    const puffs = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < puffs; i++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(1 + Math.random() * 0.8, 12, 12), mat);
      puff.position.set(i * 1.2 - puffs * 0.6, Math.random() * 0.6, Math.random() * 0.6);
      group.add(puff);
    }
    return group;
  }
  const clouds = [];
  for (let i = 0; i < 5; i++) {
    const cloud = makeCloud();
    cloud.position.set((Math.random() - 0.5) * 50, 6 + Math.random() * 8, -8 - Math.random() * 10);
    cloud.scale.setScalar(1 + Math.random());
    cloud.visible = false;
    clouds.push(cloud);
    scene.add(cloud);
  }
  function updateClouds() {
    clouds.forEach((cloud, i) => {
      cloud.position.x += 0.01 + i * 0.002;
      if (cloud.position.x > 30) cloud.position.x = -30;
    });
  }

  // ---------- 번개 플래시 ----------
  let flashTimer = 0;
  let flashing = false;
  let currentMode = "";

  function animate() {
    requestAnimationFrame(animate);
    t += 0.02;

    if (rain.visible) updateRain();
    if (snow.visible) updateSnow();
    if (clouds[0].visible) updateClouds();
    if (sunGroup.visible) {
      sunGroup.rotation.y += 0.002;
      sunHalo.scale.setScalar(1 + Math.sin(t) * 0.05);
    }

    if (currentMode === "thunderstorm") {
      flashTimer -= 1;
      if (flashTimer <= 0) {
        flashing = !flashing;
        flashTimer = flashing ? 4 : 40 + Math.random() * 120;
        sunLight.intensity = flashing ? 3 : 0.6;
      }
    }

    renderer.render(scene, camera);
  }
  animate();

  window.setWeatherScene = function (main, isNight) {
    const mode = (main || "").toLowerCase();
    currentMode = mode;

    rain.visible = false;
    snow.visible = false;
    sunGroup.visible = false;
    clouds.forEach((c) => (c.visible = false));
    sunLight.intensity = 0.6;

    let bg = "#4facfe, #00f2fe";

    if (mode === "clear") {
      sunGroup.visible = true;
      sunCore.material.color.set(isNight ? 0xd7e3ff : 0xffd54f);
      sunHalo.material.color.set(isNight ? 0x9fb4ff : 0xffe082);
      bg = isNight ? "#0f2027, #203a43" : "#4facfe, #00f2fe";
    } else if (mode === "clouds") {
      clouds.forEach((c) => (c.visible = true));
      bg = isNight ? "#232526, #414345" : "#bdc3c7, #8fa5b5";
    } else if (mode === "rain" || mode === "drizzle") {
      rain.visible = true;
      clouds.forEach((c) => (c.visible = true));
      bg = "#57606f, #2f3542";
    } else if (mode === "thunderstorm") {
      rain.visible = true;
      clouds.forEach((c) => (c.visible = true));
      bg = "#232526, #0f0f0f";
    } else if (mode === "snow") {
      snow.visible = true;
      clouds.forEach((c) => (c.visible = true));
      bg = "#e6eef5, #b8c6db";
    } else {
      // mist, fog, haze 등
      clouds.forEach((c) => (c.visible = true));
      bg = "#bdc3c7, #778899";
    }

    document.body.style.background = `linear-gradient(135deg, ${bg.split(", ")[0]} 0%, ${bg.split(", ")[1]} 100%)`;
  };
})();
