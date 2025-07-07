import { Vector3D, Quaternion } from '../math/index.js';

/**
 * RigidBody represents a physical object with mass, position, and velocity
 */
export class RigidBody {
  public position: Vector3D;
  public velocity: Vector3D;
  public acceleration: Vector3D;
  public rotation: Quaternion;
  public angularVelocity: Vector3D;
  public angularAcceleration: Vector3D;
  
  public mass: number;
  public inverseMass: number;
  public restitution: number; // Bounciness (0 = no bounce, 1 = perfect bounce)
  public friction: number;
  public drag: number; // Air resistance
  public angularDrag: number;
  
  public isStatic: boolean;
  public isKinematic: boolean;
  public useGravity: boolean;
  
  private forces: Vector3D[];
  private torques: Vector3D[];

  constructor(mass: number = 1, position: Vector3D = Vector3D.zero()) {
    this.position = position.clone();
    this.velocity = Vector3D.zero();
    this.acceleration = Vector3D.zero();
    this.rotation = Quaternion.identity();
    this.angularVelocity = Vector3D.zero();
    this.angularAcceleration = Vector3D.zero();
    
    this.mass = mass;
    this.inverseMass = mass > 0 ? 1 / mass : 0;
    this.restitution = 0.6;
    this.friction = 0.5;
    this.drag = 0.01;
    this.angularDrag = 0.05;
    
    this.isStatic = false;
    this.isKinematic = false;
    this.useGravity = true;
    
    this.forces = [];
    this.torques = [];
  }

  /**
   * Apply a force to the rigid body
   */
  addForce(force: Vector3D): void {
    if (this.isStatic) return;
    this.forces.push(force);
  }

  /**
   * Apply a force at a specific point (creates torque)
   */
  addForceAtPoint(force: Vector3D, point: Vector3D): void {
    if (this.isStatic) return;
    this.addForce(force);
    
    // Calculate torque: torque = (point - center_of_mass) × force
    const r = point.subtract(this.position);
    const torque = r.cross(force);
    this.addTorque(torque);
  }

  /**
   * Apply a torque to the rigid body
   */
  addTorque(torque: Vector3D): void {
    if (this.isStatic) return;
    this.torques.push(torque);
  }

  /**
   * Set the mass of the rigid body
   */
  setMass(mass: number): void {
    this.mass = mass;
    this.inverseMass = mass > 0 ? 1 / mass : 0;
    if (mass === 0) {
      this.isStatic = true;
    }
  }

  /**
   * Make the rigid body static (immovable)
   */
  makeStatic(): void {
    this.isStatic = true;
    this.inverseMass = 0;
    this.velocity = Vector3D.zero();
    this.angularVelocity = Vector3D.zero();
  }

  /**
   * Make the rigid body kinematic (movable but not affected by forces)
   */
  makeKinematic(): void {
    this.isKinematic = true;
    this.inverseMass = 0;
  }

  /**
   * Make the rigid body dynamic (affected by forces)
   */
  makeDynamic(mass: number = 1): void {
    this.isStatic = false;
    this.isKinematic = false;
    this.setMass(mass);
  }

  /**
   * Integrate forces and update physics (called by PhysicsWorld)
   */
  integrate(deltaTime: number): void {
    if (this.isStatic) return;

    // Calculate net force
    let netForce = Vector3D.zero();
    for (const force of this.forces) {
      netForce = netForce.add(force);
    }

    // Calculate net torque
    let netTorque = Vector3D.zero();
    for (const torque of this.torques) {
      netTorque = netTorque.add(torque);
    }

    if (!this.isKinematic) {
      // Apply drag
      const dragForce = this.velocity.multiply(-this.drag * this.velocity.magnitude());
      netForce = netForce.add(dragForce);

      const angularDragTorque = this.angularVelocity.multiply(-this.angularDrag * this.angularVelocity.magnitude());
      netTorque = netTorque.add(angularDragTorque);

      // Update acceleration: F = ma, so a = F/m
      this.acceleration = netForce.multiply(this.inverseMass);
      this.angularAcceleration = netTorque.multiply(this.inverseMass); // Simplified (should use inertia tensor)
    }

    // Update velocity: v = v0 + at
    this.velocity = this.velocity.add(this.acceleration.multiply(deltaTime));
    this.angularVelocity = this.angularVelocity.add(this.angularAcceleration.multiply(deltaTime));

    // Update position: p = p0 + vt
    this.position = this.position.add(this.velocity.multiply(deltaTime));

    // Update rotation (simplified integration)
    if (this.angularVelocity.magnitude() > 0) {
      const angle = this.angularVelocity.magnitude() * deltaTime;
      const axis = this.angularVelocity.normalize();
      const deltaRotation = Quaternion.fromAxisAngle(axis, angle);
      this.rotation = this.rotation.multiply(deltaRotation).normalize();
    }

    // Clear forces and torques for next frame
    this.forces = [];
    this.torques = [];
  }

  /**
   * Get the total kinetic energy of the rigid body
   */
  getKineticEnergy(): number {
    const translational = 0.5 * this.mass * this.velocity.magnitudeSquared();
    const rotational = 0.5 * this.mass * this.angularVelocity.magnitudeSquared(); // Simplified
    return translational + rotational;
  }

  /**
   * Get the momentum of the rigid body
   */
  getMomentum(): Vector3D {
    return this.velocity.multiply(this.mass);
  }

  /**
   * Set the position of the rigid body
   */
  setPosition(position: Vector3D): void {
    this.position = position.clone();
  }

  /**
   * Set the rotation of the rigid body
   */
  setRotation(rotation: Quaternion): void {
    this.rotation = rotation.clone();
  }

  /**
   * Clone this rigid body
   */
  clone(): RigidBody {
    const rb = new RigidBody(this.mass, this.position);
    rb.velocity = this.velocity.clone();
    rb.acceleration = this.acceleration.clone();
    rb.rotation = this.rotation.clone();
    rb.angularVelocity = this.angularVelocity.clone();
    rb.angularAcceleration = this.angularAcceleration.clone();
    rb.restitution = this.restitution;
    rb.friction = this.friction;
    rb.drag = this.drag;
    rb.angularDrag = this.angularDrag;
    rb.isStatic = this.isStatic;
    rb.isKinematic = this.isKinematic;
    rb.useGravity = this.useGravity;
    return rb;
  }
}
