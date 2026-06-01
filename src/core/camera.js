import * as THREE from 'three';

// Orthographic top-down camera tuned for tile-based rooms (soul-knight style)
export class Camera extends THREE.OrthographicCamera {
    constructor() {
        const aspect = window.innerWidth / Math.max(window.innerHeight, 1);
        const orthoSize = 10; // half-height in world units (will be updated when room known)

        const left = -orthoSize * aspect;
        const right = orthoSize * aspect;
        const top = orthoSize;
        const bottom = -orthoSize;

        super(left, right, top, bottom, 0.1, 2000);

        // default position high above looking down
        this.position.set(0, 100, 0);
        // make camera face straight down with no rotation skew
        this.rotation.set(-Math.PI / 2, 0, 0);
        this.up.set(0, 0, -1);

        // store current ortho half-height for resizing
        this._orthoHalfHeight = orthoSize;

        window.addEventListener('resize', () => {
            const aspect = window.innerWidth / Math.max(window.innerHeight, 1);
            this.setOrthoSize(this._orthoHalfHeight, aspect);
        });
    }

    setOrthoSize(halfHeight, aspect = window.innerWidth / Math.max(window.innerHeight, 1)) {
        this._orthoHalfHeight = halfHeight;
        this.top = halfHeight;
        this.bottom = -halfHeight;
        this.right = halfHeight * aspect;
        this.left = -halfHeight * aspect;
        this.updateProjectionMatrix();
    }

    // Fit the camera to given world bounds (expects bounds from MapRenderer.getWorldBounds)
    fitToBounds(bounds, padding = 0.5) {
        if (!bounds) return;
        const aspect = window.innerWidth / Math.max(window.innerHeight, 1);
        const halfHeightNeed = bounds.heightWorld * 0.5 + padding;
        const halfWidthNeed = bounds.widthWorld * 0.5 + padding;
        const halfHeight = Math.max(halfHeightNeed, halfWidthNeed / aspect, 6);
        this.setOrthoSize(halfHeight, aspect);
        // position Y can remain large - orthographic removes perspective
        // Keep camera looking at center
        this.position.y = 100;
        // center camera over bounds
        if (bounds.centerX !== undefined && bounds.centerZ !== undefined) {
            this.position.x = bounds.centerX;
            this.position.z = bounds.centerZ;
        }
        this.lookAt(bounds.centerX ?? 0, 0, bounds.centerZ ?? 0);
        this.updateProjectionMatrix();
    }
}