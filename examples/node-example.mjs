// Node.js example using the Physics3D Engine
// This shows how to use the physics engine in a server environment or Node.js application

import { 
    Vector3D, 
    RigidBody, 
    PhysicsWorld, 
    BoxCollider, 
    SphereCollider 
} from '../dist/index.esm.js';

class PhysicsSimulation {
    constructor() {
        // Create a physics world
        this.world = new PhysicsWorld();
        
        // Set gravity (Earth-like)
        this.world.setGravity(new Vector3D(0, -9.81, 0));
        
        console.log('🚀 Physics3D Engine - Node.js Example');
        console.log('=====================================');
    }

    // Example 1: Basic rigid body simulation
    basicSimulation() {
        console.log('\n📦 Example 1: Basic Rigid Body Simulation');
        
        // Create a falling box
        const boxBody = new RigidBody(1, new Vector3D(0, 10, 0));
        boxBody.restitution = 0.7; // Bouncy
        boxBody.friction = 0.5;
        
        const boxCollider = new BoxCollider(boxBody, new Vector3D(1, 1, 1));
        this.world.addCollider(boxCollider);
        
        // Create ground
        const groundBody = new RigidBody(0, new Vector3D(0, -0.5, 0));
        groundBody.makeStatic();
        
        const groundCollider = new BoxCollider(groundBody, new Vector3D(10, 1, 10));
        this.world.addCollider(groundCollider);
        
        // Simulate for 3 seconds
        console.log('Simulating falling box...');
        this.simulate(3.0, (time, world) => {
            if (time % 0.5 < 0.016) { // Print every 0.5 seconds
                const pos = boxBody.position;
                const vel = boxBody.velocity;
                console.log(`Time: ${time.toFixed(1)}s | Position: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}) | Velocity: ${vel.magnitude().toFixed(2)} m/s`);
            }
        });
        
        // Clean up
        this.world.clear();
    }

    // Example 2: Multiple object collision
    multiObjectCollision() {
        console.log('\n⚽ Example 2: Multiple Object Collision');
        
        // Create several bouncing balls
        const balls = [];
        for (let i = 0; i < 5; i++) {
            const ball = new RigidBody(0.5, new Vector3D(
                (Math.random() - 0.5) * 4, // Random X
                5 + i * 2,                 // Stacked Y
                (Math.random() - 0.5) * 4  // Random Z
            ));
            
            ball.restitution = 0.8;
            ball.friction = 0.3;
            
            // Add some initial velocity
            ball.velocity = new Vector3D(
                (Math.random() - 0.5) * 5,
                0,
                (Math.random() - 0.5) * 5
            );
            
            const ballCollider = new SphereCollider(ball, 0.5);
            this.world.addCollider(ballCollider);
            balls.push(ball);
        }
        
        // Create ground
        const groundBody = new RigidBody(0, new Vector3D(0, -0.5, 0));
        groundBody.makeStatic();
        const groundCollider = new BoxCollider(groundBody, new Vector3D(20, 1, 20));
        this.world.addCollider(groundCollider);
        
        console.log('Simulating bouncing balls...');
        this.simulate(4.0, (time, world) => {
            if (time % 1.0 < 0.016) { // Print every second
                const collisions = world.getCollisions().length;
                const totalEnergy = balls.reduce((sum, ball) => sum + ball.getKineticEnergy(), 0);
                console.log(`Time: ${time.toFixed(1)}s | Active Collisions: ${collisions} | Total Kinetic Energy: ${totalEnergy.toFixed(2)} J`);
            }
        });
        
        // Clean up
        this.world.clear();
    }

    // Example 3: Force application
    forceExample() {
        console.log('\n🚀 Example 3: Force Application');
        
        // Create a box to apply forces to
        const box = new RigidBody(2, new Vector3D(0, 5, 0));
        box.friction = 0.2;
        box.restitution = 0.3;
        
        const boxCollider = new BoxCollider(box, new Vector3D(1, 1, 1));
        this.world.addCollider(boxCollider);
        
        // Create ground
        const groundBody = new RigidBody(0, new Vector3D(0, -0.5, 0));
        groundBody.makeStatic();
        const groundCollider = new BoxCollider(groundBody, new Vector3D(10, 1, 10));
        this.world.addCollider(groundCollider);
        
        console.log('Applying periodic forces to a box...');
        this.simulate(5.0, (time, world) => {
            // Apply upward force every 2 seconds
            if (Math.sin(time * Math.PI) > 0.99) {
                box.addForce(new Vector3D(0, 50, 0));
                console.log(`💥 Applied upward force at time ${time.toFixed(2)}s`);
            }
            
            // Apply sideways force randomly
            if (Math.random() > 0.98) {
                const force = new Vector3D((Math.random() - 0.5) * 20, 0, 0);
                box.addForce(force);
                console.log(`➡️ Applied sideways force: ${force.x.toFixed(2)} N`);
            }
            
            if (time % 1.0 < 0.016) {
                const pos = box.position;
                console.log(`Position: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`);
            }
        });
        
        // Clean up
        this.world.clear();
    }

    // Example 4: Raycast query
    raycastExample() {
        console.log('\n🎯 Example 4: Raycast Queries');
        
        // Create some objects to raycast against
        const targets = [];
        for (let i = 0; i < 3; i++) {
            const target = new RigidBody(1, new Vector3D(i * 3, 2, 0));
            target.makeStatic();
            
            const collider = new BoxCollider(target, new Vector3D(1, 2, 1));
            this.world.addCollider(collider);
            targets.push(target);
        }
        
        // Perform raycasts
        console.log('Performing raycast queries...');
        
        for (let angle = 0; angle < 360; angle += 45) {
            const radians = (angle * Math.PI) / 180;
            const direction = new Vector3D(Math.cos(radians), 0, Math.sin(radians));
            const origin = new Vector3D(0, 2, 0);
            
            const hit = this.world.raycast(origin, direction, 10);
            
            if (hit) {
                const distance = origin.distanceTo(hit.position);
                console.log(`🎯 Raycast at ${angle}° hit object at distance ${distance.toFixed(2)} units`);
            } else {
                console.log(`❌ Raycast at ${angle}° missed all objects`);
            }
        }
        
        // Clean up
        this.world.clear();
    }

    // Example 5: Performance test
    performanceTest() {
        console.log('\n⚡ Example 5: Performance Test');
        
        const objectCount = 100;
        console.log(`Creating ${objectCount} physics objects...`);
        
        // Create many objects
        for (let i = 0; i < objectCount; i++) {
            const body = new RigidBody(1, new Vector3D(
                (Math.random() - 0.5) * 20,
                Math.random() * 10 + 10,
                (Math.random() - 0.5) * 20
            ));
            
            body.restitution = Math.random() * 0.5 + 0.3;
            body.friction = Math.random() * 0.5 + 0.2;
            
            let collider;
            if (Math.random() > 0.5) {
                collider = new SphereCollider(body, Math.random() * 0.5 + 0.3);
            } else {
                const size = Math.random() * 0.8 + 0.4;
                collider = new BoxCollider(body, new Vector3D(size, size, size));
            }
            
            this.world.addCollider(collider);
        }
        
        // Create ground
        const ground = new RigidBody(0, new Vector3D(0, -1, 0));
        ground.makeStatic();
        const groundCollider = new BoxCollider(ground, new Vector3D(50, 2, 50));
        this.world.addCollider(groundCollider);
        
        // Measure performance
        console.log('Running performance test...');
        const startTime = Date.now();
        let frameCount = 0;
        
        this.simulate(2.0, (time, world) => {
            frameCount++;
            
            if (time % 0.5 < 0.016) {
                const currentTime = Date.now();
                const elapsed = (currentTime - startTime) / 1000;
                const fps = frameCount / elapsed;
                const collisions = world.getCollisions().length;
                
                console.log(`Time: ${time.toFixed(1)}s | FPS: ${fps.toFixed(1)} | Collisions: ${collisions} | Objects: ${objectCount}`);
            }
        });
        
        // Clean up
        this.world.clear();
    }

    // Simulation runner
    simulate(duration, callback) {
        const timeStep = 1/60; // 60 FPS
        let currentTime = 0;
        
        while (currentTime < duration) {
            this.world.step(timeStep);
            
            if (callback) {
                callback(currentTime, this.world);
            }
            
            currentTime += timeStep;
        }
    }

    // Run all examples
    runAllExamples() {
        this.basicSimulation();
        this.multiObjectCollision();
        this.forceExample();
        this.raycastExample();
        this.performanceTest();
        
        console.log('\n✅ All examples completed!');
        console.log('\n📚 Physics3D Engine Features Demonstrated:');
        console.log('   • Rigid body dynamics');
        console.log('   • Collision detection (box-box, sphere-sphere, box-sphere)');
        console.log('   • Force application');
        console.log('   • Gravity simulation');
        console.log('   • Restitution (bounciness)');
        console.log('   • Friction');
        console.log('   • Static vs dynamic bodies');
        console.log('   • Raycast queries');
        console.log('   • Performance with many objects');
    }
}

// Usage examples for different scenarios:

// 1. Basic usage
function basicUsage() {
    console.log('\n🔧 Basic Usage Example:');
    console.log(`
// 1. Create a physics world
const world = new PhysicsWorld();

// 2. Create a rigid body
const body = new RigidBody(1.0, new Vector3D(0, 10, 0));

// 3. Create a collider
const collider = new BoxCollider(body, new Vector3D(1, 1, 1));

// 4. Add to world
world.addCollider(collider);

// 5. Step simulation
world.step(1/60); // 60 FPS

// 6. Get position
console.log(body.position); // Updated position
`);
}

// 2. Game integration example
function gameIntegration() {
    console.log('\n🎮 Game Integration Example:');
    console.log(`
class GameLoop {
    constructor() {
        this.world = new PhysicsWorld();
        this.gameObjects = [];
    }
    
    update(deltaTime) {
        // Update physics
        this.world.step(deltaTime);
        
        // Update game objects
        this.gameObjects.forEach(obj => {
            obj.position = obj.rigidbody.position;
            obj.rotation = obj.rigidbody.rotation;
        });
        
        // Handle collisions
        this.world.getCollisions().forEach(collision => {
            this.handleCollision(collision);
        });
    }
}
`);
}

// Run the examples
if (import.meta.url === `file://${process.argv[1]}`) {
    const simulation = new PhysicsSimulation();
    
    basicUsage();
    gameIntegration();
    
    simulation.runAllExamples();
}
