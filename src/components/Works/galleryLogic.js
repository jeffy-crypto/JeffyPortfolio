import { Camera, Mesh, Box, Program, Renderer, Texture, Transform } from 'ogl';

// Helper function for linear interpolation
const lerp = (p1, p2, t) => p1 + (p2 - p1) * t;

class Media {
    constructor({ geometry, gl, image, index, scene, screen, viewport, radius = 0.3 }) {
        this.extra = 0;
        this.geometry = geometry;
        this.gl = gl;
        this.image = image;
        this.index = index;
        this.scene = scene;
        this.screen = screen;
        this.viewport = viewport;
        this.radius = radius;
        this.imageNaturalSize = { width: 0, height: 0 };
        this.padding = 2;

        this.loaded = new Promise(resolve => {
            this.createShader();
            this.createMesh();

            const img = new Image();
            
            // --- IMPORTANT: Keeps the fix for loading images from Supabase ---
            img.crossOrigin = "anonymous"; 
            // ---------------------------------------------------------------

            img.src = this.image;
            img.onload = () => {
                this.program.uniforms.tMap.value.image = img;
                this.imageNaturalSize.width = img.naturalWidth;
                this.imageNaturalSize.height = img.naturalHeight;
                this.onResize();
                resolve();
            };
        });
    }

    createShader() {
        const texture = new Texture(this.gl, { generateMipmaps: true });
        this.program = new Program(this.gl, {
            depthTest: false,
            depthWrite: false,
            vertex: `
                precision highp float;
                attribute vec3 position;
                attribute vec2 uv;
                attribute vec3 normal;
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
                varying vec2 vUv;
                varying vec3 vNormal;
                void main() {
                    vUv = uv;
                    vNormal = normal;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragment: `
                precision highp float;
                uniform sampler2D tMap;
                uniform float uRadius;
                uniform float uAspectRatio;
                varying vec2 vUv;
                varying vec3 vNormal;

                float sdRoundBox(vec2 p, vec2 b, float r) {
                    vec2 q = abs(p) - b + r;
                    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
                }

                void main() {
                    if (vNormal.z > 0.5) {
                        vec2 p = vUv - 0.5;
                        p.x *= uAspectRatio;
                        vec2 b = vec2(0.5 * uAspectRatio, 0.5);
                        float d = sdRoundBox(p, b, uRadius);
                        float alpha = step(d, 0.0);
                        vec4 color = texture2D(tMap, vUv);
                        color.a *= alpha;
                        if (color.a < 0.1) discard;
                        gl_FragColor = color;
                    } else {
                        gl_FragColor = vec4(0.1, 0.1, 0.1, 1.0);
                    }
                }
            `,
            uniforms: {
                tMap: { value: texture },
                uAspectRatio: { value: 1.0 },
                uRadius: { value: 0 },
            },
            transparent: true
        });
    }

    createMesh() {
        this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program });
        this.plane.setParent(this.scene);
        
        const tiltAmount = 0.2;
        this.plane.rotation.x = (Math.random() - 0.5) * tiltAmount;
        this.plane.rotation.y = (Math.random() - 0.5) * tiltAmount;
    }

    update(scroll, direction) {
        if (this.x === undefined) return;
        this.plane.position.x = this.x - scroll.current - this.extra;
        
        // Logic for infinite scrolling
        const planeOffset = this.plane.scale.x / 2;
        const viewportOffset = this.viewport.width / 2;
        const isBefore = this.plane.position.x + planeOffset < -viewportOffset;
        const isAfter = this.plane.position.x - planeOffset > viewportOffset;
        
        if (direction === 'right' && isBefore) {
            this.extra -= this.widthTotal;
        }
        if (direction === 'left' && isAfter) {
            this.extra += this.widthTotal;
        }
    }

    onResize({ screen, viewport } = {}) {
        if (screen) this.screen = screen;
        if (viewport) this.viewport = viewport;
        if (!this.imageNaturalSize.width) return;
        const uniformHeight = 0.8;
        this.plane.scale.y = this.viewport.height * uniformHeight;
        const aspectRatio = this.imageNaturalSize.width / this.imageNaturalSize.height;
        this.plane.scale.x = this.plane.scale.y * aspectRatio;
        this.width = this.plane.scale.x + this.padding;
        const planeAspectRatio = this.plane.scale.x / this.plane.scale.y;
        this.program.uniforms.uAspectRatio.value = planeAspectRatio;
        if (this.plane.scale.y > 0) {
            this.program.uniforms.uRadius.value = this.radius / this.plane.scale.y;
        }
    }
}

class App {
    constructor(container, callback, images = [], imageKeys = []) {
        this.container = container;
        this.callback = callback;
        this.imageKeys = imageKeys;
        this.scroll = { ease: 0.05, current: 0, target: 0, last: 0 };
        this.isDown = false;
        this.areMediasLoaded = false;

        this.createRenderer();
        this.createCamera();
        this.createScene();
        this.createGeometry();

        this.onResize = this.onResize.bind(this);
        this.update = this.update.bind(this);
        this.addEventListeners();
        this.destroy = this.destroy.bind(this);

        this.onResize();
        this.createMedias(images);
        this.raf = requestAnimationFrame(this.update);
    }
    
    createRenderer() {
        this.renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio, 2) });
        this.gl = this.renderer.gl;
        this.container.appendChild(this.gl.canvas);
    }
    
    createCamera() {
        this.camera = new Camera(this.gl, { fov: 45, near: 1, far: 30 });
        this.camera.position.z = 20;
    }

    createScene() { this.scene = new Transform(); }

    createGeometry() {
        this.planeGeometry = new Box(this.gl, { width: 1, height: 1, depth: 0.05 });
    }

    createMedias(images) {
        // --- FIXED: Do not duplicate images ---
        // Old code was: const galleryItems = [...images, ...images];
        const galleryItems = images; 
        
        this.mediasImages = galleryItems;
        this.medias = galleryItems.map((imageUrl, index) =>
            new Media({
                geometry: this.planeGeometry, gl: this.gl, image: imageUrl,
                index, scene: this.scene,
                screen: this.screen, viewport: this.viewport,
                radius: 0.3
            })
        );

        const loadPromises = this.medias.map(media => media.loaded);
        Promise.all(loadPromises).then(() => {
            this.areMediasLoaded = true;
            this.recalculatePositions();
        });
    }
    
    recalculatePositions() {
        let totalWidth = 0;
        this.medias.forEach(media => {
            media.onResize({ screen: this.screen, viewport: this.viewport });
            totalWidth += media.width;
        });
        this.medias.forEach(media => media.widthTotal = totalWidth);
        let currentX = -totalWidth / 2;
        this.medias.forEach(media => {
            media.x = currentX + media.plane.scale.x / 2;
            currentX += media.width;
        });
    }

    onTouchDown(e) {
        this.isDown = true;
        this.scroll.position = this.scroll.current;
        this.start = e.touches ? e.touches[0].clientX : e.clientX;
    }
    
    onTouchMove(e) {
        if (!this.isDown) return;
        const x = e.touches ? e.touches[0].clientX : e.clientX;
        const distance = (this.start - x) * 0.02;
        this.scroll.target = this.scroll.position + distance;
    }
    
    onTouchUp() { this.isDown = false; }
    onWheel(e) { this.scroll.target += e.deltaY * 0.003; }

    onResize() {
        this.screen = { width: this.container.clientWidth, height: this.container.clientHeight };
        this.renderer.setSize(this.screen.width, this.screen.height);
        this.camera.perspective({ aspect: this.screen.width / this.screen.height });
        const fov = this.camera.fov * Math.PI / 180;
        const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
        this.viewport = { width: height * this.camera.aspect, height };
        if (this.medias && this.areMediasLoaded) {
            this.recalculatePositions();
        }
    }
    
    update() {
        this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
        if (this.medias) {
            const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';
            this.medias.forEach(media => media.update(this.scroll, direction));
        }
        this.renderer.render({ scene: this.scene, camera: this.camera });
        this.scroll.last = this.scroll.current;
        this.raf = requestAnimationFrame(this.update);
    }
    
    addEventListeners() {
        this.container.addEventListener('mousedown', this.onTouchDown.bind(this), { passive: true });
        window.addEventListener('mousemove', this.onTouchMove.bind(this), { passive: true });
        window.addEventListener('mouseup', this.onTouchUp.bind(this), { passive: true });
        window.addEventListener('wheel', this.onWheel.bind(this), { passive: true });
        window.addEventListener('resize', this.onResize);
        this.gl.canvas.addEventListener('click', this.onClick.bind(this));
    }

    onClick(e) {
        if (!this.areMediasLoaded || !this.callback) return;

        const rect = this.gl.canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1; 
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1; 

        const worldX = (x * this.viewport.width) / 2;
        const worldY = (y * this.viewport.height) / 2;

        for (let media of this.medias) {
            if (worldX >= media.x - media.plane.scale.x / 2 &&
                worldX <= media.x + media.plane.scale.x / 2 &&
                worldY >= -media.plane.scale.y / 2 &&
                worldY <= media.plane.scale.y / 2) {
                const index = media.index % this.imageKeys.length;
                const key = this.imageKeys[index];
                this.callback(key);
                break;
            }
        }
    }

    destroy() {
        cancelAnimationFrame(this.raf);
        window.removeEventListener('resize', this.onResize);
        if (this.gl && this.container) {
            this.container.removeChild(this.gl.canvas);
        }
    }
}

export default (container, callback, images = [], imageKeys = []) => new App(container, callback, images, imageKeys);