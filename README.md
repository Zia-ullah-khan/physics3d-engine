# Physics3D Engine 🚀

A lightweight, high-performance 3D physics engine for web browsers built with TypeScript. Perfect for games, simulations, and interactive web applications.

[![npm version](https://badge.fury.io/js/physics3d-engine.svg)](https://badge.fury.io/js/physics3d-engine)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🎯 **Rigid Body Dynamics** - Full 3D physics simulation with realistic movement
- 💥 **Collision Detection** - Efficient AABB, sphere, and box collision detection
- 🎈 **Force System** - Apply forces, impulses, and torques to objects
- 🌍 **Physics World** - Centralized simulation management with gravity
- 🎮 **Game Ready** - Optimized for real-time applications and games
- 🔧 **TypeScript** - Full type safety and excellent IDE support
- 📦 **Multiple Formats** - ES modules, UMD, and CommonJS support
- 🚀 **High Performance** - Optimized algorithms for smooth 60+ FPS
- 🎯 **Raycast Queries** - Spatial queries for gameplay mechanics
- 💫 **Easy Integration** - Simple API that works with any rendering engine

## 🚀 Quick Start

### Installation

```bash
npm install physics3d-engine
```

### Basic Usage

```javascript
import { PhysicsWorld, RigidBody, BoxCollider, Vector3D } from 'physics3d-engine';

// Create a physics world
const world = new PhysicsWorld();
world.setGravity(new Vector3D(0, -9.81, 0));

// Create a falling box
const box = new RigidBody(1.0, new Vector3D(0, 10, 0));
const boxCollider = new BoxCollider(box, new Vector3D(1, 1, 1));
world.addCollider(boxCollider);

// Create static ground
const ground = new RigidBody(0, new Vector3D(0, 0, 0));
ground.makeStatic();
const groundCollider = new BoxCollider(ground, new Vector3D(10, 1, 10));
world.addCollider(groundCollider);

// Game loop
function update() {
    world.step(1/60); // 60 FPS
    console.log('Box position:', box.position);
    requestAnimationFrame(update);
}
update();
```

## 🎮 Live Demo

Try the interactive demo:

```bash
git clone https://github.com/yourusername/physics3d-engine.git
cd physics3d-engine
npm install
npm run build
npm run example
```

Then open `http://localhost:3000` in your browser!

## 📖 Examples

### 🎯 Character Controller

```javascript
class Character {
    constructor(position) {
        this.rigidbody = new RigidBody(70, position); // 70kg
        this.collider = new BoxCollider(this.rigidbody, new Vector3D(0.6, 1.8, 0.6));
        this.moveSpeed = 5;
        this.jumpForce = 500;
    }
    
    move(direction) {
        const force = direction.multiply(this.moveSpeed * this.rigidbody.mass);
        this.rigidbody.addForce(force);
    }
    
    jump() {
        this.rigidbody.addForce(new Vector3D(0, this.jumpForce, 0));
    }
}
```

### 🚗 Vehicle Physics

```javascript
class Car {
    constructor(position) {
        this.rigidbody = new RigidBody(1200, position); // 1.2 tons
        this.collider = new BoxCollider(this.rigidbody, new Vector3D(2, 1, 4));
        this.enginePower = 2000;
    }
    
    accelerate(input) {
        const forward = this.rigidbody.rotation.rotateVector(Vector3D.forward());
        this.rigidbody.addForce(forward.multiply(input * this.enginePower));
    }
}
```

### 🏀 Bouncing Balls

```javascript
function createBouncyBall(position) {
    const ball = new RigidBody(0.5, position);
    ball.restitution = 0.9; // Very bouncy
    ball.friction = 0.1;
    
    const collider = new SphereCollider(ball, 0.5);
    world.addCollider(collider);
    
    return ball;
}
```

## 🔧 API Reference

### Core Classes

- **`PhysicsWorld`** - Manages the entire physics simulation
- **`RigidBody`** - Represents a physical object with mass and motion
- **`Vector3D`** - 3D vector math operations
- **`Quaternion`** - 3D rotations
- **`BoxCollider`** - Box-shaped collision detection
- **`SphereCollider`** - Sphere-shaped collision detection

### Key Methods

```javascript
// Physics World
world.step(deltaTime);              // Advance simulation
world.addCollider(collider);        // Add physics object
world.getCollisions();              // Get current collisions
world.raycast(origin, direction);   // Cast a ray

// Rigid Body
body.addForce(force);               // Apply force
body.addForceAtPoint(force, point); // Apply force at position
body.setPosition(position);         // Set position
body.makeStatic();                  // Make immovable

// Vector3D
v1.add(v2);                        // Vector addition
v1.dot(v2);                        // Dot product
v1.normalize();                    // Unit vector
v1.magnitude();                    // Vector length
```

## 🎯 Use Cases

- **🎮 Browser Games** - Physics-based gameplay mechanics
- **🎨 Interactive Art** - Creative coding and generative art
- **📊 Simulations** - Scientific and educational simulations
- **🏗️ Prototyping** - Rapid physics prototyping
- **🎓 Learning** - Understanding physics programming
- **🕹️ Game Engines** - Building custom game engines

## 🎨 Framework Integration

### React

```jsx
import { useEffect, useRef } from 'react';
import { PhysicsWorld, RigidBody } from 'physics3d-engine';

function PhysicsComponent() {
    const worldRef = useRef(new PhysicsWorld());
    
    useEffect(() => {
        const world = worldRef.current;
        // Setup physics objects...
        
        const gameLoop = () => {
            world.step(1/60);
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }, []);
    
    return <canvas ref={canvasRef} />;
}
```

### Three.js

```javascript
import * as THREE from 'three';
import { PhysicsWorld, RigidBody, BoxCollider } from 'physics3d-engine';

const world = new PhysicsWorld();
const scene = new THREE.Scene();

// Create physics box
const physicsBody = new RigidBody(1, new Vector3D(0, 5, 0));
const collider = new BoxCollider(physicsBody, new Vector3D(1, 1, 1));
world.addCollider(collider);

// Create Three.js mesh
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Sync physics with rendering
function animate() {
    world.step(1/60);
    
    // Update mesh position from physics
    mesh.position.copy(physicsBody.position);
    mesh.quaternion.copy(physicsBody.rotation);
    
    requestAnimationFrame(animate);
}
```

## 📊 Performance

- **60+ FPS** with 100+ physics objects
- **Efficient collision detection** using spatial partitioning
- **Optimized math operations** for real-time performance
- **Memory efficient** object pooling
- **Fixed timestep** simulation for stability

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/yourusername/physics3d-engine.git
cd physics3d-engine

# Install dependencies
npm install

# Build the project
npm run build

# Run examples
npm run example

# Development mode (watch)
npm run dev
```

## 📁 Project Structure

```
src/
├── math/
│   ├── Vector3D.ts       # 3D vector mathematics
│   └── Quaternion.ts     # 3D rotation mathematics
├── physics/
│   ├── RigidBody.ts      # Physics body implementation
│   ├── Collision.ts      # Collision detection system
│   └── PhysicsWorld.ts   # Main physics simulation
└── index.ts              # Main entry point

examples/
├── index.html            # Browser demo
├── demo.js              # Interactive demo
├── node-example.mjs     # Node.js examples
├── react-example.jsx    # React integration
└── API.md               # Detailed API docs

dist/
├── index.esm.js         # ES module build
├── index.umd.js         # UMD build
└── index.d.ts           # TypeScript definitions
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🎉 Acknowledgments

- Inspired by modern physics engines like Bullet Physics and Cannon.js
- Built with performance and simplicity in mind
- Designed for the web platform

## 📞 Support

- 📖 [Documentation](./examples/API.md)
- 🐛 [Issues](https://github.com/yourusername/physics3d-engine/issues)
- 💬 [Discussions](https://github.com/yourusername/physics3d-engine/discussions)
- 📧 [Email](mailto:your-email@example.com)

---

**Ready to add physics to your web project? Install Physics3D Engine today!** 🚀

```bash
npm install physics3d-engine
```
