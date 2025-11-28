import * as THREE from 'three';
// MindARThree is loaded globally from CDN

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
            // Hide loading screen after initialization
            const loadingScreen = document.getElementById('loading-screen');
            const errorMessage = document.getElementById('error-message');

            // Initialize MindAR (loaded from CDN)
            const { MindARThree } = window.MINDAR.IMAGE;

            this.mindarThree = new MindARThree({
                container: document.getElementById('ar-container'),
                imageTargetSrc: '/targets.mind', // Compiled target file
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
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('error-message').style.display = 'block';
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

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new ARApp();
    app.init();

    // Stop AR when page is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            app.stop();
        }
    });
});
