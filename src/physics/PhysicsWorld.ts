import { Vector3D } from '../math/index.js';
import { RigidBody } from './RigidBody.js';
import { Collider, Collision, AABB } from './Collision.js';

/**
 * Physics World manages all rigid bodies and handles physics simulation
 */
export class PhysicsWorld {
  public gravity: Vector3D;
  public rigidbodies: RigidBody[];
  public colliders: Collider[];
  public collisions: Collision[];
  
  private timeStep: number;
  private maxSubSteps: number;
  private accumulator: number;
  private collisionIterations: number; // Number of collision resolution iterations
  private maxObjectsPerFrame: number; // Limit objects to prevent performance issues

  constructor() {
    this.gravity = new Vector3D(0, 9.81, 0); // Earth gravity (positive Y = down for screen coordinates)
    this.rigidbodies = [];
    this.colliders = [];
    this.collisions = [];
    
    this.timeStep = 1 / 60; // 60 FPS
    this.maxSubSteps = 5;
    this.accumulator = 0;
    this.collisionIterations = 8; // Multiple passes for better collision resolution
    this.maxObjectsPerFrame = 200; // Performance limit
  }

  /**
   * Add a rigid body to the world
   */
  addRigidBody(rigidbody: RigidBody): void {
    if (!this.rigidbodies.includes(rigidbody)) {
      this.rigidbodies.push(rigidbody);
    }
  }

  /**
   * Remove a rigid body from the world
   */
  removeRigidBody(rigidbody: RigidBody): void {
    const index = this.rigidbodies.indexOf(rigidbody);
    if (index !== -1) {
      this.rigidbodies.splice(index, 1);
    }
  }

  /**
   * Add a collider to the world with object limit checking
   */
  addCollider(collider: Collider): void {
    if (!this.colliders.includes(collider)) {
      // Check object limit to prevent performance issues
      if (this.colliders.length >= this.maxObjectsPerFrame) {
        console.warn(`Physics world has reached maximum objects limit (${this.maxObjectsPerFrame}). Consider removing some objects.`);
        return;
      }
      
      this.colliders.push(collider);
      this.addRigidBody(collider.rigidbody);
    }
  }

  /**
   * Remove a collider from the world
   */
  removeCollider(collider: Collider): void {
    const index = this.colliders.indexOf(collider);
    if (index !== -1) {
      this.colliders.splice(index, 1);
    }
  }

  /**
   * Set the gravity for the world
   */
  setGravity(gravity: Vector3D): void {
    this.gravity = gravity.clone();
  }

  /**
   * Step the physics simulation
   */
  step(deltaTime: number): void {
    this.accumulator += deltaTime;
    
    let subSteps = 0;
    while (this.accumulator >= this.timeStep && subSteps < this.maxSubSteps) {
      this.fixedUpdate(this.timeStep);
      this.accumulator -= this.timeStep;
      subSteps++;
    }
  }

  /**
   * Fixed update for consistent physics simulation
   */
  private fixedUpdate(deltaTime: number): void {
    // Apply gravity to all dynamic rigid bodies
    this.applyGravity();

    // Integrate forces for all rigid bodies
    for (const rigidbody of this.rigidbodies) {
      rigidbody.integrate(deltaTime);
    }

    // Detect collisions
    this.detectCollisions();

    // Resolve collisions
    this.resolveCollisions();
  }

  /**
   * Apply gravity to all dynamic rigid bodies
   */
  private applyGravity(): void {
    for (const rigidbody of this.rigidbodies) {
      if (rigidbody.useGravity && !rigidbody.isStatic && !rigidbody.isKinematic) {
        const gravityForce = this.gravity.multiply(rigidbody.mass);
        rigidbody.addForce(gravityForce);
      }
    }
  }

  /**
   * Detect collisions between all colliders with improved handling
   */
  private detectCollisions(): void {
    this.collisions = [];

    for (let i = 0; i < this.colliders.length; i++) {
      for (let j = i + 1; j < this.colliders.length; j++) {
        const colliderA = this.colliders[i];
        const colliderB = this.colliders[j];

        // Skip if both are static
        if (colliderA.rigidbody.isStatic && colliderB.rigidbody.isStatic) {
          continue;
        }

        // Broad phase: AABB check with small margin for better catching
        const aabbA = colliderA.getAABB().expand(0.01);
        const aabbB = colliderB.getAABB().expand(0.01);

        if (!aabbA.intersects(aabbB)) {
          continue;
        }

        // Narrow phase: Detailed collision check
        const collision = colliderA.checkCollision(colliderB);
        if (collision && collision.penetrationDepth > 0.001) {
          this.collisions.push(collision);
        }
      }
    }
  }

  /**
   * Resolve all detected collisions with multiple iterations
   */
  private resolveCollisions(): void {
    // Multiple iterations to handle complex collision scenarios
    for (let iteration = 0; iteration < this.collisionIterations; iteration++) {
      let hasCollisions = false;
      
      for (const collision of this.collisions) {
        if (this.resolveCollision(collision)) {
          hasCollisions = true;
        }
      }
      
      // If no collisions were resolved, we can exit early
      if (!hasCollisions) {
        break;
      }
      
      // Re-detect collisions after resolution for next iteration
      if (iteration < this.collisionIterations - 1) {
        this.detectCollisions();
      }
    }
  }

  /**
   * Resolve a single collision
   * @returns true if collision was resolved, false if no resolution was needed
   */
  private resolveCollision(collision: Collision): boolean {
    const { bodyA, bodyB, contactNormal, penetrationDepth } = collision;

    // Skip impulse resolution for static bodies
    if (bodyA.isStatic && bodyB.isStatic) return false;

    // Check if objects are still penetrating (collision is still valid)
    if (penetrationDepth <= 0.001) return false;

    // Separate objects
    this.separateObjects(bodyA, bodyB, contactNormal, penetrationDepth);

    // Calculate relative velocity
    const relativeVelocity = bodyB.velocity.subtract(bodyA.velocity);
    const velocityAlongNormal = relativeVelocity.dot(contactNormal);

    // Don't resolve if velocities are separating
    if (velocityAlongNormal > 0) return false;

    // Calculate restitution
    const restitution = Math.min(bodyA.restitution, bodyB.restitution);

    // Calculate impulse scalar
    let j = -(1 + restitution) * velocityAlongNormal;
    j /= bodyA.inverseMass + bodyB.inverseMass;

    // Apply impulse
    const impulse = contactNormal.multiply(j);

    if (!bodyA.isStatic) {
      bodyA.velocity = bodyA.velocity.subtract(impulse.multiply(bodyA.inverseMass));
    }

    if (!bodyB.isStatic) {
      bodyB.velocity = bodyB.velocity.add(impulse.multiply(bodyB.inverseMass));
    }

    // Apply friction
    this.applyFriction(bodyA, bodyB, contactNormal, relativeVelocity, j);
    
    return true; // Collision was resolved
  }

  /**
   * Separate overlapping objects with improved correction
   */
  private separateObjects(
    bodyA: RigidBody,
    bodyB: RigidBody,
    normal: Vector3D,
    penetration: number
  ): void {
    const totalInverseMass = bodyA.inverseMass + bodyB.inverseMass;
    if (totalInverseMass === 0) return;

    // More aggressive separation for dense scenes
    const separationPercent = 0.9; // Increased from 0.8 to 0.9
    const slop = 0.005; // Reduced slop for tighter separation

    const correctionMagnitude = Math.max(penetration - slop, 0) / totalInverseMass * separationPercent;
    const correction = normal.multiply(correctionMagnitude);

    if (!bodyA.isStatic) {
      bodyA.position = bodyA.position.subtract(correction.multiply(bodyA.inverseMass));
    }

    if (!bodyB.isStatic) {
      bodyB.position = bodyB.position.add(correction.multiply(bodyB.inverseMass));
    }
  }

  /**
   * Apply friction between two bodies
   */
  private applyFriction(
    bodyA: RigidBody,
    bodyB: RigidBody,
    normal: Vector3D,
    relativeVelocity: Vector3D,
    normalImpulse: number
  ): void {
    // Calculate friction direction
    const tangent = relativeVelocity.subtract(normal.multiply(relativeVelocity.dot(normal)));
    
    if (tangent.magnitude() < 1e-6) return; // No friction if no tangential movement
    
    const tangentDirection = tangent.normalize();

    // Calculate friction coefficient
    const friction = Math.sqrt(bodyA.friction * bodyB.friction);

    // Calculate friction impulse
    let frictionImpulse = -relativeVelocity.dot(tangentDirection);
    frictionImpulse /= bodyA.inverseMass + bodyB.inverseMass;

    // Clamp friction impulse to Coulomb friction law
    const maxFriction = Math.abs(normalImpulse) * friction;
    frictionImpulse = Math.max(-maxFriction, Math.min(frictionImpulse, maxFriction));

    const frictionVector = tangentDirection.multiply(frictionImpulse);

    // Apply friction impulse
    if (!bodyA.isStatic) {
      bodyA.velocity = bodyA.velocity.subtract(frictionVector.multiply(bodyA.inverseMass));
    }

    if (!bodyB.isStatic) {
      bodyB.velocity = bodyB.velocity.add(frictionVector.multiply(bodyB.inverseMass));
    }
  }

  /**
   * Get all collisions in the current frame
   */
  getCollisions(): Collision[] {
    return [...this.collisions];
  }

  /**
   * Query for rigid bodies within an AABB
   */
  queryAABB(aabb: AABB): RigidBody[] {
    const result: RigidBody[] = [];
    
    for (const collider of this.colliders) {
      if (aabb.intersects(collider.getAABB())) {
        result.push(collider.rigidbody);
      }
    }
    
    return result;
  }

  /**
   * Raycast from a point in a direction
   */
  raycast(origin: Vector3D, direction: Vector3D, maxDistance: number = Infinity): RigidBody | null {
    let closestBody: RigidBody | null = null;
    let closestDistance = maxDistance;
    
    const normalizedDirection = direction.normalize();
    
    for (const collider of this.colliders) {
      const aabb = collider.getAABB();
      const distance = this.raycastAABB(origin, normalizedDirection, aabb);
      
      if (distance !== null && distance < closestDistance) {
        closestDistance = distance;
        closestBody = collider.rigidbody;
      }
    }
    
    return closestBody;
  }

  /**
   * Helper method for AABB raycast
   */
  private raycastAABB(origin: Vector3D, direction: Vector3D, aabb: AABB): number | null {
    const invDir = new Vector3D(1 / direction.x, 1 / direction.y, 1 / direction.z);
    
    const t1 = (aabb.min.x - origin.x) * invDir.x;
    const t2 = (aabb.max.x - origin.x) * invDir.x;
    const t3 = (aabb.min.y - origin.y) * invDir.y;
    const t4 = (aabb.max.y - origin.y) * invDir.y;
    const t5 = (aabb.min.z - origin.z) * invDir.z;
    const t6 = (aabb.max.z - origin.z) * invDir.z;
    
    const tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
    const tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6));
    
    if (tmax < 0 || tmin > tmax) {
      return null;
    }
    
    return tmin > 0 ? tmin : tmax;
  }

  /**
   * Clear all objects from the world
   */
  clear(): void {
    this.rigidbodies = [];
    this.colliders = [];
    this.collisions = [];
  }

  /**
   * Configure physics settings for dense scenes with many objects
   */
  configureDenseScene(enable: boolean): void {
    if (enable) {
      this.collisionIterations = 12; // More iterations for better stability
      this.timeStep = 1 / 120; // Smaller timestep for more precision
      this.maxSubSteps = 8; // More substeps
    } else {
      this.collisionIterations = 8; // Default
      this.timeStep = 1 / 60; // Default
      this.maxSubSteps = 5; // Default
    }
  }

  /**
   * Set maximum objects limit to prevent performance issues
   */
  setMaxObjects(limit: number): void {
    this.maxObjectsPerFrame = Math.max(10, limit);
  }

  /**
   * Get current object count and performance info
   */
  getPerformanceInfo(): { objectCount: number; collisionCount: number; maxObjects: number; iterations: number } {
    return {
      objectCount: this.colliders.length,
      collisionCount: this.collisions.length,
      maxObjects: this.maxObjectsPerFrame,
      iterations: this.collisionIterations
    };
  }
}
