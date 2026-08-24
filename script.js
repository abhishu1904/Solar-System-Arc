import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
const scene = new THREE.Scene();
const textureLoader = new THREE.TextureLoader();
const spaceTexture = textureLoader.load("./Solar.jpg");
spaceTexture.colorSpace = THREE.SRGBColorSpace;
scene.background = spaceTexture;

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 8, 12);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize(
    window.innerWidth,
    window.innerHeight
);
document.getElementById("app").appendChild(
    renderer.domElement
);

const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
const sunMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: {
            value: 0
        }
    },
    vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main(){
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    fragmentShader: `
    uniform float time;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main(){
        float pulse = sin(vPosition.x * 4.0 + time) * 0.05;
        float brightness = 0.085 + pulse;
        vec3 innerColor = vec3(1.0, 0.95, 0.45);
        vec3 outerColor = vec3(1.0, 0.25, 0.01);
        float edge = 1.0 - abs(vNormal.z);
        vec3 color = mix(
            innerColor,
            outerColor,
            edge
        );
        color *= brightness;
        gl_FragColor = vec4(color, 1.0);
    }
    `
});

const sun = new THREE.Mesh(
    sunGeometry,
    sunMaterial
);

scene.add(sun);

const glowCanvas = document.createElement("canvas");
glowCanvas.width = 256;
glowCanvas.height = 256;
const glowContext = glowCanvas.getContext("2d");
const gradient = glowContext.createRadialGradient(
    128, 128, 0,
    128, 128, 128
);
gradient.addColorStop(0, "rgba(255, 230, 120, 1)");
gradient.addColorStop(0.3, "rgba(255, 150, 20, 0.5)");
gradient.addColorStop(0.7, "rgba(255, 100, 0, 0.1)");
gradient.addColorStop(1, "rgba(255, 80, 0, 0)");

glowContext.fillStyle = gradient;
glowContext.fillRect(0, 0, 256, 256);

const glowTexture = new THREE.CanvasTexture(glowCanvas);
const glowMaterial = new THREE.SpriteMaterial({
    map: glowTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const sunGlow = new THREE.Sprite(glowMaterial);
sunGlow.scale.set(8, 8, 1);
scene.add(sunGlow);
sunGlow.position.copy(sun.position);

const sunLight = new THREE.PointLight(
    0xffffff,
    3,
    100
);

const frontLight = new THREE.DirectionalLight(
    0xffffff,
    1.5
);

frontLight.position.set(
    0,
    5,
    15
);

frontLight.target.position.set(
    0,
    0,
    0
);

scene.add(frontLight);
scene.add(frontLight.target);

sunLight.position.set(0, 0, 0);
scene.add(sunLight);

const earthTexture = textureLoader.load("https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg");

function createPlanet(size, color, orbitRadius, speed, texture = null) {
    const geometry = new THREE.SphereGeometry(
        size,
        32,
        32
    );
    const material = new THREE.MeshStandardMaterial({
        color: color,
        map: texture || null,
        roughness: 0.9,
        flatShading: false,
        metalness: 0
    });
    const planet = new THREE.Mesh(
        geometry,
        material
    );
    scene.add(planet);

    const orbitGeometry = new THREE.RingGeometry(
        orbitRadius - 0.015,
        orbitRadius + 0.015,
        100
    )

    const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0x444444,
        side: THREE.DoubleSide
    });

    const orbit = new THREE.Mesh(
        orbitGeometry,
        orbitMaterial
    );

    orbit.rotation.x = Math.PI / 2;
    scene.add(orbit);

    return {
        planet: planet,
        orbitRadius: orbitRadius,
        speed: speed,
        angle: Math.random() * Math.PI * 2
    };
}

const mercury = createPlanet(0.25, 0x8c8c8c, 3.2, 0.025);
const venus = createPlanet(0.38, 0xd9a441, 4.2, 0.020);
const earth = createPlanet(0.42, 0x2196fe, 5.3, 0.016, earthTexture);
const mars = createPlanet(0.32, 0xc1440e, 6.5, 0.013);
const jupiter = createPlanet(0.9, 0xd69b6d, 8.2, 0.009);
const saturn = createPlanet(0.75, 0xd6c28a, 10.5, 0.007);
const uranus = createPlanet(0.55, 0x72d6e8, 12.5, 0.005);
const neptune = createPlanet(0.52, 0x4169e1, 14.5, 0.004);

const saturnRingGeometry = new THREE.RingGeometry(
    1.0,
    1.5,
    64
);
const saturnRingMaterial = new THREE.MeshBasicMaterial({
    color: 0xc9b78c,
    side: THREE.DoubleSide
});
const saturnRing = new THREE.Mesh(
    saturnRingGeometry,
    saturnRingMaterial
);
saturnRing.rotation.x = Math.PI / 2;
saturn.planet.add(saturnRing);

const ambientLight = new THREE.AmbientLight(
    0xffffff,
    0.15
);

scene.add(ambientLight);

function animate() {
    requestAnimationFrame(animate);
    sunMaterial.uniforms.time.value += 0.02;

    mercury.angle += mercury.speed;
    mercury.planet.position.x = mercury.orbitRadius * Math.cos(mercury.angle);
    mercury.planet.position.z = mercury.orbitRadius * Math.sin(mercury.angle);

    venus.angle += venus.speed;
    venus.planet.position.x = venus.orbitRadius * Math.cos(venus.angle);
    venus.planet.position.z = venus.orbitRadius * Math.sin(venus.angle);

    earth.angle += earth.speed;
    earth.planet.position.x = earth.orbitRadius * Math.cos(earth.angle);
    earth.planet.position.z = earth.orbitRadius * Math.sin(earth.angle);

    mars.angle += mars.speed;
    mars.planet.position.x = mars.orbitRadius * Math.cos(mars.angle);
    mars.planet.position.z = mars.orbitRadius * Math.sin(mars.angle);

    jupiter.angle += jupiter.speed;
    jupiter.planet.position.x = jupiter.orbitRadius * Math.cos(jupiter.angle);
    jupiter.planet.position.z = jupiter.orbitRadius * Math.sin(jupiter.angle);

    saturn.angle += saturn.speed;
    saturn.planet.position.x = saturn.orbitRadius * Math.cos(saturn.angle);
    saturn.planet.position.z = saturn.orbitRadius * Math.sin(saturn.angle);

    uranus.angle += uranus.speed;
    uranus.planet.position.x = uranus.orbitRadius * Math.cos(uranus.angle);
    uranus.planet.position.z = uranus.orbitRadius * Math.sin(uranus.angle);

    neptune.angle += neptune.speed;
    neptune.planet.position.x = neptune.orbitRadius * Math.cos(neptune.angle);
    neptune.planet.position.z = neptune.orbitRadius * Math.sin(neptune.angle);

    renderer.render(
        scene,
        camera
    );
}

animate();