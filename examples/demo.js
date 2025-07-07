// Demo using the Physics3D Engine
// This demonstrates how to use the physics engine in a real application

class PhysicsDemo {
    constructor() {
        this.canvas = document.getElementById('physicsCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize physics world
        this.world = new Physics3D.PhysicsWorld();
        this.world.setGravity(new Physics3D.Vector3D(0, 500, 0)); // Gravity pointing down
        
        // Demo objects
        this.objects = [];
        this.colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'];
        
        // Drag trail effect
        this.dragTrail = [];
        this.maxTrailLength = 10;
        
        // Create boundaries
        this.createBoundaries();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Animation state
        this.lastTime = 0;
        this.fpsCounter = 0;
        this.fpsTime = 0;
        
        // Start the animation loop
        this.animate();
    }

    createBoundaries() {
        // Ground
        const ground = new Physics3D.RigidBody(0, new Physics3D.Vector3D(400, 580, 0));
        ground.makeStatic();
        const groundCollider = new Physics3D.BoxCollider(ground, new Physics3D.Vector3D(800, 40, 100));
        this.world.addCollider(groundCollider);
        this.objects.push({ 
            rigidbody: ground, 
            collider: groundCollider, 
            color: '#333', 
            type: 'boundary' 
        });

        // Left wall
        const leftWall = new Physics3D.RigidBody(0, new Physics3D.Vector3D(-20, 300, 0));
        leftWall.makeStatic();
        const leftWallCollider = new Physics3D.BoxCollider(leftWall, new Physics3D.Vector3D(40, 600, 100));
        this.world.addCollider(leftWallCollider);
        this.objects.push({ 
            rigidbody: leftWall, 
            collider: leftWallCollider, 
            color: '#333', 
            type: 'boundary' 
        });

        // Right wall
        const rightWall = new Physics3D.RigidBody(0, new Physics3D.Vector3D(820, 300, 0));
        rightWall.makeStatic();
        const rightWallCollider = new Physics3D.BoxCollider(rightWall, new Physics3D.Vector3D(40, 600, 100));
        this.world.addCollider(rightWallCollider);
        this.objects.push({ 
            rigidbody: rightWall, 
            collider: rightWallCollider, 
            color: '#333', 
            type: 'boundary' 
        });

        // Top wall
        const topWall = new Physics3D.RigidBody(0, new Physics3D.Vector3D(400, -20, 0));
        topWall.makeStatic();
        const topWallCollider = new Physics3D.BoxCollider(topWall, new Physics3D.Vector3D(800, 40, 100));
        this.world.addCollider(topWallCollider);
        this.objects.push({ 
            rigidbody: topWall, 
            collider: topWallCollider, 
            color: '#333', 
            type: 'boundary' 
        });
    }

    setupEventListeners() {
        let isDragging = false;
        let lastSpawnTime = 0;
        const spawnCooldown = 50; // Minimum milliseconds between spawns during drag

        // Mouse click to add objects
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Randomly add sphere or box
            if (Math.random() > 0.5) {
                this.addSphereAt(x, y);
            } else {
                this.addBoxAt(x, y);
            }
        });

        // Mouse down - start dragging
        this.canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastSpawnTime = 0; // Reset cooldown
            this.canvas.style.cursor = 'grabbing';
            
            // Spawn object at initial position
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (Math.random() > 0.5) {
                this.addSphereAt(x, y);
            } else {
                this.addBoxAt(x, y);
            }
        });

        // Mouse move - spawn objects while dragging
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (isDragging) {
                const currentTime = Date.now();
                if (currentTime - lastSpawnTime >= spawnCooldown) {
                    // Randomly add sphere or box
                    if (Math.random() > 0.5) {
                        this.addSphereAt(x, y);
                    } else {
                        this.addBoxAt(x, y);
                    }
                    lastSpawnTime = currentTime;
                }
                
                // Add to trail for visual effect
                this.dragTrail.push({ x, y, time: currentTime });
                if (this.dragTrail.length > this.maxTrailLength) {
                    this.dragTrail.shift();
                }
            } else {
                // Clear trail when not dragging
                this.dragTrail = [];
            }
        });

        // Mouse up - stop dragging
        this.canvas.addEventListener('mouseup', () => {
            isDragging = false;
            this.canvas.style.cursor = 'crosshair';
        });

        // Mouse leave - stop dragging if mouse leaves canvas
        this.canvas.addEventListener('mouseleave', () => {
            isDragging = false;
            this.canvas.style.cursor = 'crosshair';
        });

        // Touch support for mobile devices
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isDragging = true;
            lastSpawnTime = 0;
            
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            if (Math.random() > 0.5) {
                this.addSphereAt(x, y);
            } else {
                this.addBoxAt(x, y);
            }
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!isDragging) return;
            
            const currentTime = Date.now();
            if (currentTime - lastSpawnTime < spawnCooldown) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            if (Math.random() > 0.5) {
                this.addSphereAt(x, y);
            } else {
                this.addBoxAt(x, y);
            }
            
            lastSpawnTime = currentTime;
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            isDragging = false;
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case ' ':
                    e.preventDefault();
                    this.toggleGravity();
                    break;
                case 'r':
                    this.resetScene();
                    break;
                case 's':
                    this.addSphere();
                    break;
                case 'b':
                    this.addBox();
                    break;
            }
        });
    }

    addSphere() {
        const x = Math.random() * 700 + 50;
        const y = Math.random() * 200 + 50;
        this.addSphereAt(x, y);
    }

    addSphereAt(x, y) {
        const radius = Math.random() * 20 + 10;
        const mass = radius * 0.1;
        
        const rigidbody = new Physics3D.RigidBody(mass, new Physics3D.Vector3D(x, y, 0));
        rigidbody.restitution = Math.random() * 0.8 + 0.2;
        rigidbody.friction = Math.random() * 0.5 + 0.1;
        
        // Add some initial velocity
        rigidbody.velocity = new Physics3D.Vector3D(
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200,
            0
        );

        const collider = new Physics3D.SphereCollider(rigidbody, radius);
        this.world.addCollider(collider);

        this.objects.push({
            rigidbody,
            collider,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            type: 'sphere',
            radius
        });

        this.updateObjectCount();
    }

    addBox() {
        const x = Math.random() * 700 + 50;
        const y = Math.random() * 200 + 50;
        this.addBoxAt(x, y);
    }

    addBoxAt(x, y) {
        const width = Math.random() * 30 + 20;
        const height = Math.random() * 30 + 20;
        const mass = (width * height) * 0.01;
        
        const rigidbody = new Physics3D.RigidBody(mass, new Physics3D.Vector3D(x, y, 0));
        rigidbody.restitution = Math.random() * 0.6 + 0.1;
        rigidbody.friction = Math.random() * 0.8 + 0.2;
        
        // Add some initial velocity
        rigidbody.velocity = new Physics3D.Vector3D(
            (Math.random() - 0.5) * 150,
            (Math.random() - 0.5) * 150,
            0
        );

        const collider = new Physics3D.BoxCollider(rigidbody, new Physics3D.Vector3D(width, height, 20));
        this.world.addCollider(collider);

        this.objects.push({
            rigidbody,
            collider,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            type: 'box',
            width,
            height
        });

        this.updateObjectCount();
    }

    addBall() {
        const x = Math.random() * 700 + 50;
        const y = 100;
        
        const rigidbody = new Physics3D.RigidBody(1, new Physics3D.Vector3D(x, y, 0));
        rigidbody.restitution = 0.95; // Very bouncy
        rigidbody.friction = 0.1;

        const collider = new Physics3D.SphereCollider(rigidbody, 15);
        this.world.addCollider(collider);

        this.objects.push({
            rigidbody,
            collider,
            color: '#FFD700',
            type: 'sphere',
            radius: 15
        });

        this.updateObjectCount();
    }

    toggleGravity() {
        if (this.world.gravity.magnitude() > 0) {
            this.world.setGravity(new Physics3D.Vector3D(0, 0, 0));
            document.getElementById('gravityStatus').textContent = 'OFF';
        } else {
            this.world.setGravity(new Physics3D.Vector3D(0, 500, 0));
            document.getElementById('gravityStatus').textContent = 'ON';
        }
    }

    resetScene() {
        // Remove all non-boundary objects
        this.objects = this.objects.filter(obj => obj.type === 'boundary');
        
        // Clear physics world and re-add boundaries
        this.world.clear();
        this.objects.forEach(obj => {
            this.world.addCollider(obj.collider);
        });

        this.updateObjectCount();
    }

    clearExcess() {
        // Remove half of the non-boundary objects to improve performance
        const nonBoundaryObjects = this.objects.filter(obj => obj.type !== 'boundary');
        const objectsToRemove = nonBoundaryObjects.slice(0, Math.floor(nonBoundaryObjects.length / 2));
        
        // Remove from physics world
        objectsToRemove.forEach(obj => {
            this.world.removeCollider(obj.collider);
        });
        
        // Remove from objects array
        this.objects = this.objects.filter(obj => 
            obj.type === 'boundary' || !objectsToRemove.includes(obj)
        );
        
        this.updateObjectCount();
        console.log(`Removed ${objectsToRemove.length} objects to improve performance`);
    }

    updateObjectCount() {
        const count = this.objects.filter(obj => obj.type !== 'boundary').length;
        document.getElementById('objectCount').textContent = count;
        
        // Auto-configure physics for dense scenes
        if (count > 50) {
            this.world.configureDenseScene(true);
            console.log('Dense scene mode enabled for better collision handling');
        } else {
            this.world.configureDenseScene(false);
        }
        
        // Warn if approaching limit
        const perfInfo = this.world.getPerformanceInfo();
        if (count > perfInfo.maxObjects * 0.8) {
            console.warn(`Approaching object limit (${count}/${perfInfo.maxObjects}). Performance may degrade.`);
        }
    }

    animate(currentTime = 0) {
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 1/30); // Cap at 30 FPS
        this.lastTime = currentTime;

        // Update FPS counter
        this.fpsCounter++;
        this.fpsTime += deltaTime;
        if (this.fpsTime >= 1) {
            document.getElementById('fps').textContent = this.fpsCounter;
            this.fpsCounter = 0;
            this.fpsTime = 0;
        }

        // Step physics simulation
        this.world.step(deltaTime);

        // Update collision count
        document.getElementById('collisionCount').textContent = this.world.getCollisions().length;

        // Render
        this.render();

        // Continue animation
        requestAnimationFrame(this.animate.bind(this));
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw drag trail
        if (this.dragTrail.length > 1) {
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 3;
            this.ctx.globalAlpha = 0.5;
            this.ctx.beginPath();
            
            for (let i = 0; i < this.dragTrail.length; i++) {
                const point = this.dragTrail[i];
                const alpha = (i + 1) / this.dragTrail.length; // Fade effect
                
                if (i === 0) {
                    this.ctx.moveTo(point.x, point.y);
                } else {
                    this.ctx.lineTo(point.x, point.y);
                }
            }
            
            this.ctx.stroke();
            this.ctx.globalAlpha = 1; // Reset alpha
        }

        // Draw all objects
        this.objects.forEach(obj => {
            this.ctx.fillStyle = obj.color;
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;

            const pos = obj.rigidbody.position;

            if (obj.type === 'sphere') {
                // Draw sphere as circle
                this.ctx.beginPath();
                this.ctx.arc(pos.x, pos.y, obj.radius, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
            } else {
                // Draw box as rectangle
                const width = obj.width || obj.collider.size.x;
                const height = obj.height || obj.collider.size.y;
                
                this.ctx.fillRect(pos.x - width/2, pos.y - height/2, width, height);
                this.ctx.strokeRect(pos.x - width/2, pos.y - height/2, width, height);
            }
        });

        // Draw collision points
        this.ctx.fillStyle = '#FF0000';
        this.world.getCollisions().forEach(collision => {
            this.ctx.beginPath();
            this.ctx.arc(collision.contactPoint.x, collision.contactPoint.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
}

// Global functions for buttons
function addSphere() {
    if (window.demo) {
        window.demo.addSphere();
    }
}

function addBox() {
    if (window.demo) {
        window.demo.addBox();
    }
}

function addBall() {
    if (window.demo) {
        window.demo.addBall();
    }
}

function toggleGravity() {
    if (window.demo) {
        window.demo.toggleGravity();
    }
}

function clearExcess() {
    if (window.demo) {
        window.demo.clearExcess();
    }
}

function resetScene() {
    if (window.demo) {
        window.demo.resetScene();
    }
}

// Start the demo when the page loads
window.addEventListener('load', () => {
    window.demo = new PhysicsDemo();
});
