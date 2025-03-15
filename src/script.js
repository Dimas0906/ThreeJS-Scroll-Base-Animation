import * as THREE from "three";
import GUI from "lil-gui";
import gsap from "gsap";

// texture
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load("textures/gradients/5.jpg");
gradientTexture.magFilter = THREE.NearestFilter;

//debug
const gui = new GUI();

const parameters = {
  materialColor: "#ffeded",
};

gui.addColor(parameters, "materialColor").onChange(() => {
  material.color.set(parameters.materialColor);
  particleMaterial.color.set(parameters.materialColor);
});

// handling scroll
let scrollY = window.scrollY;
let currentSection = 0;

// handling paralax
const cursor = {};
cursor.x = 0;
cursor.y = 0;

// get the user position
window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
});

// get the mouse position
window.addEventListener("mousemove", (e) => {
  cursor.x = e.clientX / sizes.width - 0.5;
  cursor.y = -(e.clientY / sizes.height - 0.5);
});

// handling scroll action
window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
  const newSection = Math.min(
    Math.round(scrollY / sizes.height),
    sectionMeshes.length - 1
  );

  if (newSection != currentSection) {
    currentSection = newSection;

    const currentRotation = sectionMeshes[currentSection].rotation;
    gsap.to(sectionMeshes[currentSection].rotation, {
      duration: 1.5,
      ease: "power2.inOut",
      x: currentRotation.x + Math.PI * 2,
      y: currentRotation.y + Math.PI,
      z: currentRotation.z + Math.PI / 2,
    });
  }
});

// creating group
const cameraGroup = new THREE.Group();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.add(cameraGroup);

// create material with toon effect
// Note : This material need light, so it can be seen on the screen
const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture,
});

// Create Meshes
const mesh3 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), material);
const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material);
const mesh1 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
  material
);

// create array that contain all meshes
const sectionMeshes = [mesh1, mesh2, mesh3];

// object distance
const objectsDistance = 4;

// set position
mesh1.scale.set(0.7, 0.7, 0.7);
mesh2.scale.set(0.7, 0.7, 0.7);
mesh3.scale.set(0.7, 0.7, 0.7);

mesh1.position.y = -objectsDistance * 0;
mesh2.position.y = -objectsDistance * 1;
mesh3.position.y = -objectsDistance * 2;
mesh1.position.x = 2;
mesh2.position.x = -2;
mesh3.position.x = 2;

scene.add(mesh1, mesh2, mesh3);

// handling particle
const particlesCount = 200;
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 1] =
    objectsDistance * 0.5 -
    Math.random() * objectsDistance * sectionMeshes.length;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}

// geometry for particle
const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);
const particleMaterial = new THREE.PointsMaterial({
  color: parameters.materialColor,
  sizeAttenuation: true,
  size: 0.03,
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

// light
const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

// sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
cameraGroup.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearAlpha(0);

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Continuous rotation for all meshes
  for (const mesh of sectionMeshes) {
    mesh.rotation.x += deltaTime * 0.1;
    mesh.rotation.y += deltaTime * 0.12;
  }

  camera.position.y = (-scrollY / sizes.height) * objectsDistance;

  // handling paralax
  const paralaxX = cursor.x * 0.5;
  const paralaxY = cursor.y * 0.5;
  cameraGroup.position.x += (paralaxX - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y += (paralaxY - cameraGroup.position.y) * 5 * deltaTime;

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
