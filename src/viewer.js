import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class Viewer3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.model = null;
    }

    init() {
        const container = document.getElementById('viewer-container');

        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(2, 2, 3);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);

        // Add OrbitControls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 10;

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // Increased intensity
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // Increased intensity
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0x00ff88, 0.5);
        pointLight.position.set(-5, 3, -5);
        this.scene.add(pointLight);

        // Load 3D Model
        const loader = new GLTFLoader();
        console.log('Loading model in viewer...');

        loader.load(
            './mi-modelo.glb',
            (gltf) => {
                this.model = gltf.scene;
                this.model.scale.set(0.5, 0.5, 0.5); // Default scale

                // Center the model
                const box = new THREE.Box3().setFromObject(this.model);
                const center = box.getCenter(new THREE.Vector3());
                this.model.position.sub(center); // Center it at 0,0,0

                this.scene.add(this.model);
                console.log('Model loaded in viewer');

                // Update info text
                const infoP = document.querySelector('#info p:nth-child(2)');
                if (infoP) infoP.textContent = 'Modelo: mi-modelo.glb';
            },
            (progress) => {
                console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.error('Error loading model:', error);
                const info = document.getElementById('info');
                if (info) {
                    const errorMsg = document.createElement('p');
                    errorMsg.style.color = '#ff4444';
                    errorMsg.textContent = 'Error cargando modelo';
                    info.appendChild(errorMsg);
                }
            }
        );

        // Add grid helper
        const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
        this.scene.add(gridHelper);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Start animation loop
        this.animate();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Update controls
        this.controls.update();

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize viewer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const viewer = new Viewer3D();
    viewer.init();
});
