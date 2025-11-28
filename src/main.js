// THREE and MindARThree will be loaded globally from CDN
// We access them from window after they're loaded
/* global THREE */

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

            // Check if MindAR is loaded from CDN
            if (!window.MINDAR || !window.MINDAR.IMAGE) {
                throw new Error('MindAR library not loaded. Please check your internet connection.');
            }

            // Initialize MindAR (loaded from CDN)
            const { MindARThree } = window.MINDAR.IMAGE;

            this.mindarThree = new MindARThree({
                container: document.getElementById('ar-container'),
                imageTargetSrc: './targets.mind', // Compiled target file
            });

            const { renderer, scene, camera } = this.mindarThree;
            this.renderer = renderer;
            this.scene = scene;
            this.camera = camera;

            // Add ambient light
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            this.scene.add(ambientLight);

            // Add directional light
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(1, 1, 1);
            this.scene.add(directionalLight);

            // Create anchor (target 0)
            this.anchor = this.mindarThree.addAnchor(0);

            // Create 3D content - Animated cube
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial({
                color: 0x00ff88,
                metalness: 0.5,
                roughness: 0.3,
            });
            this.cube = new THREE.Mesh(geometry, material);
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

            // Start AR
            await this.mindarThree.start();

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
            if (error.message && error.message.includes('targets.mind')) {
                errorText.innerHTML = '⚠️ Archivo targets.mind no encontrado.<br>Por favor, compila tu imagen objetivo primero.';
            } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                errorText.innerHTML = '📷 Permiso de cámara denegado.<br>Por favor, permite el acceso a la cámara y recarga la página.';
            } else if (error.message && error.message.includes('MindAR')) {
                errorText.innerHTML = '⚠️ Error cargando MindAR.<br>Verifica tu conexión a internet.';
            } else {
                errorText.innerHTML = `⚠️ Error al inicializar AR:<br>${error.message}`;
            }

            errorMessage.style.display = 'block';
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Rotate cube
        if (this.cube) {
            this.cube.rotation.x += 0.01;
            this.cube.rotation.y += 0.01;
        }

        this.renderer.render(this.scene, this.camera);
    }

    stop() {
        if (this.mindarThree) {
            this.mindarThree.stop();
        }
    }
}

// Wait for MindAR to be available
function waitForMindAR(timeout = 30000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        const checkMindAR = () => {
            if (window.MINDAR && window.MINDAR.IMAGE && window.THREE) {
                console.log('✅ All libraries loaded successfully');
                resolve();
            } else if (Date.now() - startTime > timeout) {
                const missing = [];
                if (!window.THREE) missing.push('Three.js');
                if (!window.MINDAR) missing.push('MindAR');
                reject(new Error(`Failed to load: ${missing.join(', ')}`));
            } else {
                setTimeout(checkMindAR, 100);
            }
        };

        checkMindAR();
    });
}

// Initialize app when DOM and MindAR are ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Wait for MindAR to load
        await waitForMindAR();

        const app = new ARApp();
        await app.init();

        // Stop AR when page is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                app.stop();
            }
        });
    } catch (error) {
        console.error('Failed to load MindAR:', error);
        document.getElementById('loading-screen').style.display = 'none';
        const errorMessage = document.getElementById('error-message');
        const errorText = errorMessage.querySelector('p');
        errorText.innerHTML = '⚠️ Error cargando MindAR.<br>Verifica tu conexión a internet y recarga la página.';
        errorMessage.style.display = 'block';
    }
});
