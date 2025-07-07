# Physics3D Engine - API Documentation

## Quick Start

```javascript
import { PhysicsWorld, RigidBody, BoxCollider, SphereCollider, Vector3D } from 'physics3d-engine';

// 1. Create a physics world
const world = new PhysicsWorld();
world.setGravity(new Vector3D(0, -9.81, 0));

// 2. Create a falling box
const body = new RigidBody(1.0, new Vector3D(0, 10, 0));
const collider = new BoxCollider(body, new Vector3D(1, 1, 1));
world.addCollider(collider);

// 3. Create static ground
const ground = new RigidBody(0, new Vector3D(0, 0, 0));
ground.makeStatic();
const groundCollider = new BoxCollider(ground, new Vector3D(10, 1, 10));
world.addCollider(groundCollider);

// 4. Step the simulation
function gameLoop() {
    world.step(1/60); // 60 FPS
    console.log('Box position:', body.position);
    requestAnimationFrame(gameLoop);
}
gameLoop();
```

## Core Classes

### Vector3D

3D vector class for position, velocity, and mathematical operations.

```javascript
const v1 = new Vector3D(1, 2, 3);
const v2 = new Vector3D(4, 5, 6);

// Basic operations
const sum = v1.add(v2);           // Vector addition
const diff = v1.subtract(v2);     // Vector subtraction
const scaled = v1.multiply(2);    // Scalar multiplication
const normalized = v1.normalize(); // Unit vector

// Advanced operations
const dot = v1.dot(v2);           // Dot product
const cross = v1.cross(v2);       // Cross product
const distance = v1.distanceTo(v2); // Distance between vectors
const lerp = v1.lerp(v2, 0.5);   // Linear interpolation

// Static vectors
Vector3D.zero();     // (0, 0, 0)
Vector3D.up();       // (0, 1, 0)
Vector3D.forward();  // (0, 0, 1)
```

### RigidBody

Represents a physical object with mass, position, and velocity.

```javascript
const body = new RigidBody(mass, position);

// Properties
body.position;        // Vector3D - Current position
body.velocity;        // Vector3D - Current velocity
body.acceleration;    // Vector3D - Current acceleration
body.rotation;        // Quaternion - Current rotation
body.mass;            // number - Mass of the body
body.restitution;     // number - Bounciness (0-1)
body.friction;        // number - Surface friction (0-1)
body.drag;            // number - Air resistance
body.useGravity;      // boolean - Affected by gravity

// Methods
body.addForce(force);                    // Apply force
body.addForceAtPoint(force, point);      // Apply force at point (creates torque)
body.addTorque(torque);                  // Apply rotational force
body.makeStatic();                       // Make immovable
body.makeKinematic();                    // Movable but not affected by forces
body.makeDynamic(mass);                  // Normal physics object
body.setPosition(position);              // Set position
body.setRotation(rotation);              // Set rotation
```

### PhysicsWorld

Manages all physics objects and simulation.

```javascript
const world = new PhysicsWorld();

// Configuration
world.setGravity(new Vector3D(0, -9.81, 0));  // Set gravity

// Object management
world.addRigidBody(body);       // Add rigid body
world.addCollider(collider);    // Add collider (also adds rigid body)
world.removeRigidBody(body);    // Remove rigid body
world.removeCollider(collider); // Remove collider

// Simulation
world.step(deltaTime);          // Step simulation forward

// Queries
world.getCollisions();          // Get current frame collisions
world.queryAABB(aabb);         // Query objects in bounding box
world.raycast(origin, direction, maxDistance); // Cast ray

// Cleanup
world.clear();                  // Remove all objects
```

### Colliders

Define the shape for collision detection.

#### BoxCollider

```javascript
const boxCollider = new BoxCollider(rigidbody, size);
// size: Vector3D representing width, height, depth
```

#### SphereCollider

```javascript
const sphereCollider = new SphereCollider(rigidbody, radius);
// radius: number representing sphere radius
```

## Usage Patterns

### Basic Game Object

```javascript
class GameObject {
    constructor(position, mass = 1) {
        this.rigidbody = new RigidBody(mass, position);
        this.collider = null; // Set in subclasses
        this.mesh = null;     // Your 3D model/sprite
    }
    
    update() {
        // Sync visual representation with physics
        this.mesh.position = this.rigidbody.position;
        this.mesh.rotation = this.rigidbody.rotation;
    }
}

class Box extends GameObject {
    constructor(position, size) {
        super(position);
        this.collider = new BoxCollider(this.rigidbody, size);
        // Create box mesh...
    }
}

class Ball extends GameObject {
    constructor(position, radius) {
        super(position);
        this.collider = new SphereCollider(this.rigidbody, radius);
        // Create sphere mesh...
    }
}
```

### Game Loop Integration

```javascript
class Game {
    constructor() {
        this.world = new PhysicsWorld();
        this.gameObjects = [];
        this.lastTime = 0;
    }
    
    update(currentTime) {
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Step physics
        this.world.step(deltaTime);
        
        // Update game objects
        this.gameObjects.forEach(obj => obj.update());
        
        // Handle collisions
        this.world.getCollisions().forEach(collision => {
            this.handleCollision(collision);
        });
        
        requestAnimationFrame(this.update.bind(this));
    }
    
    handleCollision(collision) {
        // Custom collision response
        console.log('Collision between:', collision.bodyA, collision.bodyB);
    }
}
```

### Character Controller

```javascript
class CharacterController {
    constructor(position) {
        this.rigidbody = new RigidBody(70, position); // 70kg character
        this.rigidbody.friction = 0.8;
        this.rigidbody.useGravity = true;
        this.collider = new BoxCollider(this.rigidbody, new Vector3D(0.6, 1.8, 0.6));
        
        this.moveSpeed = 5;
        this.jumpForce = 500;
        this.isGrounded = false;
    }
    
    move(direction) {
        const force = direction.multiply(this.moveSpeed * this.rigidbody.mass);
        this.rigidbody.addForce(force);
    }
    
    jump() {
        if (this.isGrounded) {
            this.rigidbody.addForce(new Vector3D(0, this.jumpForce, 0));
            this.isGrounded = false;
        }
    }
    
    checkGrounded(world) {
        // Raycast downward to check if on ground
        const rayOrigin = this.rigidbody.position;
        const rayDirection = Vector3D.down();
        const hit = world.raycast(rayOrigin, rayDirection, 1.0);
        this.isGrounded = hit !== null;
    }
}
```

### Vehicle Physics

```javascript
class Vehicle {
    constructor(position) {
        this.rigidbody = new RigidBody(1500, position); // 1.5 ton car
        this.rigidbody.drag = 0.1;
        this.rigidbody.angularDrag = 0.2;
        this.collider = new BoxCollider(this.rigidbody, new Vector3D(2, 1, 4));
        
        this.enginePower = 2000;
        this.brakePower = 5000;
        this.steerAngle = 0;
    }
    
    accelerate(input) {
        const forward = this.rigidbody.rotation.rotateVector(Vector3D.forward());
        const force = forward.multiply(input * this.enginePower);
        this.rigidbody.addForce(force);
    }
    
    brake(input) {
        const brakeForce = this.rigidbody.velocity.multiply(-input * this.brakePower);
        this.rigidbody.addForce(brakeForce);
    }
    
    steer(input) {
        const torque = new Vector3D(0, input * 100, 0);
        this.rigidbody.addTorque(torque);
    }
}
```

## Performance Tips

1. **Use Static Bodies**: For objects that never move (walls, floors), use `makeStatic()`
2. **Limit Object Count**: More objects = more collision checks. Consider pooling.
3. **Optimize Collision Shapes**: Simpler shapes (spheres, boxes) are faster than complex ones
4. **Fixed Time Step**: Use consistent physics time steps for stability
5. **Spatial Partitioning**: For many objects, consider dividing space into regions

```javascript
// Good: Fixed timestep
const PHYSICS_TIMESTEP = 1/60;
let accumulator = 0;

function gameLoop(deltaTime) {
    accumulator += deltaTime;
    
    while (accumulator >= PHYSICS_TIMESTEP) {
        world.step(PHYSICS_TIMESTEP);
        accumulator -= PHYSICS_TIMESTEP;
    }
}
```

## Browser Support

- **ES Modules**: Modern browsers with ES6 module support
- **UMD**: All browsers via script tag
- **TypeScript**: Full type definitions included
- **Node.js**: Server-side physics simulation

## Installation

```bash
npm install physics3d-engine
```

```javascript
// ES Modules
import { PhysicsWorld, RigidBody } from 'physics3d-engine';

// CommonJS
const { PhysicsWorld, RigidBody } = require('physics3d-engine');

// Browser (UMD)
<script src="node_modules/physics3d-engine/dist/index.umd.js"></script>
<script>
    const world = new Physics3D.PhysicsWorld();
</script>
```
