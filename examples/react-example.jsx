// React Component Example using Physics3D Engine
// This shows how to integrate the physics engine with React

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
    Vector3D, 
    RigidBody, 
    PhysicsWorld, 
    BoxCollider, 
    SphereCollider 
} from 'physics3d-engine';

const PhysicsCanvas = () => {
    const canvasRef = useRef(null);
    const worldRef = useRef(null);
    const animationIdRef = useRef(null);
    const objectsRef = useRef([]);
    
    const [stats, setStats] = useState({
        objectCount: 0,
        collisionCount: 0,
        fps: 60,
        isRunning: false
    });

    // Initialize physics world
    useEffect(() => {
        const world = new PhysicsWorld();
        world.setGravity(new Vector3D(0, -500, 0));
        worldRef.current = world;

        // Create boundaries
        createBoundaries(world);

        return () => {
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
        };
    }, []);

    const createBoundaries = (world) => {
        const boundaries = [
            { pos: new Vector3D(400, 580, 0), size: new Vector3D(800, 40, 100) }, // Ground
            { pos: new Vector3D(-20, 300, 0), size: new Vector3D(40, 600, 100) }, // Left wall
            { pos: new Vector3D(820, 300, 0), size: new Vector3D(40, 600, 100) }, // Right wall
            { pos: new Vector3D(400, -20, 0), size: new Vector3D(800, 40, 100) }  // Top wall
        ];

        boundaries.forEach(boundary => {
            const body = new RigidBody(0, boundary.pos);
            body.makeStatic();
            const collider = new BoxCollider(body, boundary.size);
            world.addCollider(collider);
        });
    };

    const addSphere = useCallback((x = null, y = null) => {
        if (!worldRef.current) return;

        const posX = x ?? Math.random() * 700 + 50;
        const posY = y ?? Math.random() * 200 + 50;
        const radius = Math.random() * 20 + 10;
        
        const body = new RigidBody(radius * 0.1, new Vector3D(posX, posY, 0));
        body.restitution = Math.random() * 0.8 + 0.2;
        body.friction = Math.random() * 0.5 + 0.1;
        body.velocity = new Vector3D(
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200,
            0
        );

        const collider = new SphereCollider(body, radius);
        worldRef.current.addCollider(collider);

        objectsRef.current.push({
            type: 'sphere',
            body,
            collider,
            radius,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`
        });

        updateStats();
    }, []);

    const addBox = useCallback((x = null, y = null) => {
        if (!worldRef.current) return;

        const posX = x ?? Math.random() * 700 + 50;
        const posY = y ?? Math.random() * 200 + 50;
        const width = Math.random() * 30 + 20;
        const height = Math.random() * 30 + 20;
        
        const body = new RigidBody((width * height) * 0.01, new Vector3D(posX, posY, 0));
        body.restitution = Math.random() * 0.6 + 0.1;
        body.friction = Math.random() * 0.8 + 0.2;
        body.velocity = new Vector3D(
            (Math.random() - 0.5) * 150,
            (Math.random() - 0.5) * 150,
            0
        );

        const collider = new BoxCollider(body, new Vector3D(width, height, 20));
        worldRef.current.addCollider(collider);

        objectsRef.current.push({
            type: 'box',
            body,
            collider,
            width,
            height,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`
        });

        updateStats();
    }, []);

    const toggleGravity = useCallback(() => {
        if (!worldRef.current) return;

        const currentGravity = worldRef.current.gravity;
        if (currentGravity.magnitude() > 0) {
            worldRef.current.setGravity(new Vector3D(0, 0, 0));
        } else {
            worldRef.current.setGravity(new Vector3D(0, -500, 0));
        }
    }, []);

    const clearObjects = useCallback(() => {
        if (!worldRef.current) return;

        worldRef.current.clear();
        objectsRef.current = [];
        createBoundaries(worldRef.current);
        updateStats();
    }, []);

    const updateStats = useCallback(() => {
        setStats(prev => ({
            ...prev,
            objectCount: objectsRef.current.length,
            collisionCount: worldRef.current?.getCollisions().length || 0
        }));
    }, []);

    const handleCanvasClick = useCallback((event) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (Math.random() > 0.5) {
            addSphere(x, y);
        } else {
            addBox(x, y);
        }
    }, [addSphere, addBox]);

    const startAnimation = useCallback(() => {
        let lastTime = 0;
        let fpsCounter = 0;
        let fpsTime = 0;

        const animate = (currentTime) => {
            if (!worldRef.current || !canvasRef.current) return;

            const deltaTime = Math.min((currentTime - lastTime) / 1000, 1/30);
            lastTime = currentTime;

            // Update FPS
            fpsCounter++;
            fpsTime += deltaTime;
            if (fpsTime >= 1) {
                setStats(prev => ({ ...prev, fps: fpsCounter }));
                fpsCounter = 0;
                fpsTime = 0;
            }

            // Step physics
            worldRef.current.step(deltaTime);

            // Update collision count
            setStats(prev => ({
                ...prev,
                collisionCount: worldRef.current.getCollisions().length
            }));

            // Render
            render();

            animationIdRef.current = requestAnimationFrame(animate);
        };

        setStats(prev => ({ ...prev, isRunning: true }));
        animationIdRef.current = requestAnimationFrame(animate);
    }, []);

    const stopAnimation = useCallback(() => {
        if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
            animationIdRef.current = null;
        }
        setStats(prev => ({ ...prev, isRunning: false }));
    }, []);

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw objects
        objectsRef.current.forEach(obj => {
            ctx.fillStyle = obj.color;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;

            const pos = obj.body.position;

            if (obj.type === 'sphere') {
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, obj.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            } else {
                ctx.fillRect(pos.x - obj.width/2, pos.y - obj.height/2, obj.width, obj.height);
                ctx.strokeRect(pos.x - obj.width/2, pos.y - obj.height/2, obj.width, obj.height);
            }
        });

        // Draw collision points
        if (worldRef.current) {
            ctx.fillStyle = '#ff4444';
            worldRef.current.getCollisions().forEach(collision => {
                ctx.beginPath();
                ctx.arc(collision.contactPoint.x, collision.contactPoint.y, 4, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }, []);

    useEffect(() => {
        startAnimation();
        return stopAnimation;
    }, [startAnimation, stopAnimation]);

    return (
        <div className="physics-demo">
            <div className="controls">
                <button onClick={addSphere}>Add Sphere</button>
                <button onClick={addBox}>Add Box</button>
                <button onClick={toggleGravity}>Toggle Gravity</button>
                <button onClick={clearObjects}>Clear All</button>
                <button onClick={stats.isRunning ? stopAnimation : startAnimation}>
                    {stats.isRunning ? 'Pause' : 'Play'}
                </button>
            </div>

            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                onClick={handleCanvasClick}
                style={{
                    border: '2px solid #333',
                    borderRadius: '8px',
                    cursor: 'crosshair',
                    display: 'block',
                    margin: '20px auto'
                }}
            />

            <div className="stats">
                <div className="stat">
                    <span>Objects: </span>
                    <strong>{stats.objectCount}</strong>
                </div>
                <div className="stat">
                    <span>Collisions: </span>
                    <strong>{stats.collisionCount}</strong>
                </div>
                <div className="stat">
                    <span>FPS: </span>
                    <strong>{stats.fps}</strong>
                </div>
                <div className="stat">
                    <span>Status: </span>
                    <strong>{stats.isRunning ? 'Running' : 'Paused'}</strong>
                </div>
            </div>

            <div className="instructions">
                <h3>Instructions:</h3>
                <ul>
                    <li>Click on the canvas to add objects</li>
                    <li>Use buttons to add specific shapes</li>
                    <li>Toggle gravity to see floating objects</li>
                    <li>Watch the real-time collision detection</li>
                </ul>
            </div>
        </div>
    );
};

// Usage in your React app:
/*
import PhysicsCanvas from './PhysicsCanvas';

function App() {
    return (
        <div className="App">
            <h1>My Physics Game</h1>
            <PhysicsCanvas />
        </div>
    );
}
*/

export default PhysicsCanvas;
