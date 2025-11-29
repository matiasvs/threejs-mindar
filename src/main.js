import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class ARApp {
    constructor() {
        this.mindarThree = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.anchor = null;
        this.model = null;
    }

    async init() {
        try {
            const loadingScreen = document.getElementById('loading-screen');
            const errorMessage = document.getElementById('error-message');
            const container = document.getElementById('ar-container');

            // Validate container exists
            if (!container) {
                throw new Error('AR container not found');
            }

            // Ensure container has dimensions
            if (container.clientWidth === 0 || container.clientHeight === 0) {
                console.warn('Container has no dimensions, setting defaults');
                container.style.width = '100vw';
                container.style.height = '100vh';
            }

            // Wait a bit to ensure DOM is fully ready
            await new Promise(resolve => setTimeout(resolve, 100));

            // 1. Verify targets.mind exists
            console.log('Checking targets.mind...');
            try {
                const response = await fetch('./targets.mind');
                if (!response.ok) {
                    throw new Error(`Failed to load targets.mind: ${response.status} ${response.statusText}`);
                }
                console.log('targets.mind found and accessible');
            } catch (networkError) {
                throw new Error(`Network error loading targets.mind: ${networkError.message}`);
            }

            // 2. Verify Camera Permissions and Availability
            console.log('Checking camera permissions...');
            try {
                // List all devices first for debugging
                const devices = await navigator.mediaDevices.enumerateDevices();
                console.log('Available devices:', devices.map(d => `${d.kind}: ${d.label}`));

                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                if (videoDevices.length === 0) {
                    throw new Error('No video input devices found. Please connect a webcam or use a mobile device.');
                }

                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                // Stop the stream immediately, we just wanted to check permissions
                stream.getTracks().forEach(track => track.stop());
                console.log('Camera permission granted');
            } catch (cameraError) {
                let msg = cameraError.message;
                if (cameraError.name === 'NotFoundError' || msg.includes('device not found')) {
                    msg = 'No se encontró ninguna cámara. Por favor conecta una webcam o usa un dispositivo móvil.';
                } else if (cameraError.name === 'NotAllowedError' || msg.includes('permission denied')) {
                    msg = 'Permiso de cámara denegado. Por favor permite el acceso.';
                }
                throw new Error(msg);
            }

            console.log('Initializing MindAR...');

            // Initialize MindAR with smoothing for better stability
            this.mindarThree = new MindARThree({
                container: container,
                imageTargetSrc: './targets.mind',
                filterMinCF: 0.000001, // Aggressive smoothing to prevent jitter
                filterBeta: 0.001,     // Very low beta for maximum stability
                uiLoading: 'no', // Disable default loading UI to prevent conflicts
                uiScanning: 'no', // Disable default scanning UI
                uiError: 'no',    // Disable default error UI
            });

            // Wait for MindAR to be ready
            await new Promise(resolve => setTimeout(resolve, 200));

            const { renderer, scene, camera } = this.mindarThree;

            if (!renderer || !scene || !camera) {
                throw new Error('MindAR failed to initialize renderer, scene, or camera');
            }

            this.renderer = renderer;
            this.scene = scene;
            this.camera = camera;

            console.log('MindAR initialized successfully');

            // Add ambient light
            const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // Increased intensity for models
            this.scene.add(ambientLight);

            // Add directional light
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // Increased intensity
            directionalLight.position.set(1, 1, 1);
            this.scene.add(directionalLight);

            // Create anchor (target 0)
            this.anchor = this.mindarThree.addAnchor(0);

            if (!this.anchor) {
                throw new Error('Failed to create anchor');
            }

            // Load 3D Model
            const loader = new GLTFLoader();
            console.log('Loading model...');

            try {
                const gltf = await new Promise((resolve, reject) => {
                    loader.load(
                        './mi-modelo.glb',
                        (gltf) => resolve(gltf),
                        (progress) => console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%'),
                        (error) => reject(error)
                    );
                });

                this.model = gltf.scene;
                this.model.scale.set(0.5, 0.5, 0.5); // Default scale
                this.model.position.set(0, 0, 0);

                // Center the model
                const box = new THREE.Box3().setFromObject(this.model);
                const center = box.getCenter(new THREE.Vector3());
                this.model.position.sub(center); // Center it at 0,0,0
                this.model.position.z += 0.5; // Move it slightly up/forward if needed, or keep at 0

                this.anchor.group.add(this.model);
                console.log('Model loaded successfully');

            } catch (loadError) {
                console.error('Error loading model:', loadError);
                throw new Error(`Failed to load model: ${loadError.message}`);
            }

            // Event listeners
            this.anchor.onTargetFound = () => {
                console.log('Target found!');
            };

            this.anchor.onTargetLost = () => {
                console.log('Target lost!');
            };

            console.log('Starting AR...');

            // Start AR with error handling
            try {
                await this.mindarThree.start();
                console.log('AR started successfully');
            } catch (startError) {
                console.error('Error starting AR:', startError);
                const errorMsg = startError && typeof startError === 'object' && startError.message
                    ? startError.message
                    : String(startError || 'Unknown error');
                throw new Error(`Failed to start AR: ${errorMsg}`);
            }

            // Hide loading screen
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);

            // Start animation loop
            this.animate();

        } catch (error) {
            console.error('Error initializing AR:', error);
            const loadingScreen = document.getElementById('loading-screen');
            const errorMessage = document.getElementById('error-message');
            const errorText = errorMessage.querySelector('p');

            loadingScreen.style.display = 'none';

            // Provide specific error messages
            const errorMsg = error?.message || String(error);

            if (errorMsg.includes('targets.mind') || errorMsg.includes('404')) {
                errorText.innerHTML = '⚠️ Archivo targets.mind no encontrado.<br>Por favor, compila tu imagen objetivo primero.';
            } else if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
                errorText.innerHTML = '📷 Permiso de cámara denegado.<br>Por favor, permite el acceso a la cámara y recarga la página.';
            } else {
                errorText.innerHTML = `⚠️ Error al inicializar AR:<br>${errorMsg}`;
            }

            errorMessage.style.display = 'block';
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Slow rotation on Z-axis for the model
        if (this.model) {
            this.model.rotation.y += 0.01; // Rotate around Y axis (usually better for models)
        }

        this.renderer.render(this.scene, this.camera);
    }

    stop() {
        if (this.mindarThree) {
            this.mindarThree.stop();
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const app = new ARApp();
        await app.init();

        // Stop AR when page is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                app.stop();
            }
        });
    } catch (error) {
        console.error('Error initializing AR:', error);
        document.getElementById('loading-screen').style.display = 'none';
        const errorMessage = document.getElementById('error-message');
        const errorText = errorMessage.querySelector('p');
        errorText.innerHTML = `⚠️ Error al inicializar AR:<br>${error.message}`;
        errorMessage.style.display = 'block';
    }
});
