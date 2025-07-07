import { Vector3D } from '../math/index.js';
import { RigidBody } from './RigidBody.js';

/**
 * Represents a collision between two rigid bodies
 */
export interface Collision {
  bodyA: RigidBody;
  bodyB: RigidBody;
  contactPoint: Vector3D;
  contactNormal: Vector3D;
  penetrationDepth: number;
}

/**
 * Base collider class
 */
export abstract class Collider {
  public rigidbody: RigidBody;
  public isTrigger: boolean;

  constructor(rigidbody: RigidBody) {
    this.rigidbody = rigidbody;
    this.isTrigger = false;
  }

  abstract getAABB(): AABB;
  abstract checkCollision(other: Collider): Collision | null;
}

/**
 * Axis-Aligned Bounding Box
 */
export class AABB {
  public min: Vector3D;
  public max: Vector3D;

  constructor(min: Vector3D, max: Vector3D) {
    this.min = min.clone();
    this.max = max.clone();
  }

  /**
   * Check if this AABB intersects with another AABB
   */
  intersects(other: AABB): boolean {
    return (
      this.min.x <= other.max.x &&
      this.max.x >= other.min.x &&
      this.min.y <= other.max.y &&
      this.max.y >= other.min.y &&
      this.min.z <= other.max.z &&
      this.max.z >= other.min.z
    );
  }

  /**
   * Check if a point is inside this AABB
   */
  containsPoint(point: Vector3D): boolean {
    return (
      point.x >= this.min.x && point.x <= this.max.x &&
      point.y >= this.min.y && point.y <= this.max.y &&
      point.z >= this.min.z && point.z <= this.max.z
    );
  }

  /**
   * Get the center of the AABB
   */
  getCenter(): Vector3D {
    return this.min.add(this.max).multiply(0.5);
  }

  /**
   * Get the size of the AABB
   */
  getSize(): Vector3D {
    return this.max.subtract(this.min);
  }

  /**
   * Expand the AABB by a given amount
   */
  expand(amount: number): AABB {
    const expansion = new Vector3D(amount, amount, amount);
    return new AABB(this.min.subtract(expansion), this.max.add(expansion));
  }
}

/**
 * Box collider
 */
export class BoxCollider extends Collider {
  public size: Vector3D;

  constructor(rigidbody: RigidBody, size: Vector3D) {
    super(rigidbody);
    this.size = size.clone();
  }

  getAABB(): AABB {
    const halfSize = this.size.multiply(0.5);
    return new AABB(
      this.rigidbody.position.subtract(halfSize),
      this.rigidbody.position.add(halfSize)
    );
  }

  checkCollision(other: Collider): Collision | null {
    if (other instanceof BoxCollider) {
      return this.checkBoxCollision(other);
    } else if (other instanceof SphereCollider) {
      return this.checkSphereCollision(other);
    }
    return null;
  }

  checkBoxCollision(other: BoxCollider): Collision | null {
    const aabb1 = this.getAABB();
    const aabb2 = other.getAABB();

    if (!aabb1.intersects(aabb2)) {
      return null;
    }

    // Calculate overlap
    const overlap = new Vector3D(
      Math.min(aabb1.max.x, aabb2.max.x) - Math.max(aabb1.min.x, aabb2.min.x),
      Math.min(aabb1.max.y, aabb2.max.y) - Math.max(aabb1.min.y, aabb2.min.y),
      Math.min(aabb1.max.z, aabb2.max.z) - Math.max(aabb1.min.z, aabb2.min.z)
    );

    // Find the axis with minimum overlap (separation axis)
    let minOverlap = overlap.x;
    let normal = new Vector3D(1, 0, 0);

    if (overlap.y < minOverlap) {
      minOverlap = overlap.y;
      normal = new Vector3D(0, 1, 0);
    }

    if (overlap.z < minOverlap) {
      minOverlap = overlap.z;
      normal = new Vector3D(0, 0, 1);
    }

    // Determine normal direction
    const direction = other.rigidbody.position.subtract(this.rigidbody.position);
    if (normal.dot(direction) < 0) {
      normal = normal.multiply(-1);
    }

    const contactPoint = this.rigidbody.position.add(other.rigidbody.position).multiply(0.5);

    return {
      bodyA: this.rigidbody,
      bodyB: other.rigidbody,
      contactPoint,
      contactNormal: normal,
      penetrationDepth: minOverlap
    };
  }

  checkSphereCollision(sphere: SphereCollider): Collision | null {
    const aabb = this.getAABB();
    const sphereCenter = sphere.rigidbody.position;

    // Find the closest point on the box to the sphere
    const closestPoint = new Vector3D(
      Math.max(aabb.min.x, Math.min(sphereCenter.x, aabb.max.x)),
      Math.max(aabb.min.y, Math.min(sphereCenter.y, aabb.max.y)),
      Math.max(aabb.min.z, Math.min(sphereCenter.z, aabb.max.z))
    );

    const distance = sphereCenter.distanceTo(closestPoint);

    if (distance > sphere.radius) {
      return null;
    }

    const normal = sphereCenter.subtract(closestPoint).normalize();
    const penetrationDepth = sphere.radius - distance;

    return {
      bodyA: this.rigidbody,
      bodyB: sphere.rigidbody,
      contactPoint: closestPoint,
      contactNormal: normal,
      penetrationDepth
    };
  }
}

/**
 * Sphere collider
 */
export class SphereCollider extends Collider {
  public radius: number;

  constructor(rigidbody: RigidBody, radius: number) {
    super(rigidbody);
    this.radius = radius;
  }

  getAABB(): AABB {
    const radiusVec = new Vector3D(this.radius, this.radius, this.radius);
    return new AABB(
      this.rigidbody.position.subtract(radiusVec),
      this.rigidbody.position.add(radiusVec)
    );
  }

  checkCollision(other: Collider): Collision | null {
    if (other instanceof SphereCollider) {
      return this.checkSphereCollision(other);
    } else if (other instanceof BoxCollider) {
      const collision = other.checkSphereCollision(this);
      if (collision) {
        // Swap bodies and flip normal
        return {
          bodyA: collision.bodyB,
          bodyB: collision.bodyA,
          contactPoint: collision.contactPoint,
          contactNormal: collision.contactNormal.multiply(-1),
          penetrationDepth: collision.penetrationDepth
        };
      }
    }
    return null;
  }

  checkSphereCollision(other: SphereCollider): Collision | null {
    const distance = this.rigidbody.position.distanceTo(other.rigidbody.position);
    const totalRadius = this.radius + other.radius;

    if (distance >= totalRadius) {
      return null;
    }

    const normal = other.rigidbody.position.subtract(this.rigidbody.position).normalize();
    const penetrationDepth = totalRadius - distance;
    const contactPoint = this.rigidbody.position.add(normal.multiply(this.radius - penetrationDepth * 0.5));

    return {
      bodyA: this.rigidbody,
      bodyB: other.rigidbody,
      contactPoint,
      contactNormal: normal,
      penetrationDepth
    };
  }
}
