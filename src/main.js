import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';

class ARApp {
    constructor() {
        this.mindarThree = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.anchor = null;
        this.cube = null;
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
                filterMinCF: 0.0001,
                filterBeta: 1000,
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
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            this.scene.add(ambientLight);

            // Add directional light
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(1, 1, 1);
            this.scene.add(directionalLight);

            // Create anchor (target 0)
            this.anchor = this.mindarThree.addAnchor(0);

            if (!this.anchor) {
                throw new Error('Failed to create anchor');
            }

            // Create 3D content - Cube (50% size) with Z-axis rotation
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial({
                color: 0x00ff88,
                metalness: 0.5,
                roughness: 0.3,
            });
            this.cube = new THREE.Mesh(geometry, material);
            this.cube.scale.set(0.5, 0.5, 0.5); // Reduced by 50%
            this.cube.position.set(0, 0, 0.5);
            this.anchor.group.add(this.cube);

            // Add wireframe overlay
            const wireframe = new THREE.LineSegments(
                new THREE.EdgesGeometry(geometry),
                new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
            );
            this.cube.add(wireframe);

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

        // Slow rotation on Z-axis
        if (this.cube) {
            this.cube.rotation.z += 0.005; // Slow rotation
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
