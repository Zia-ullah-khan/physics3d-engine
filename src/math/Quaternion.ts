import { Vector3D } from './Vector3D.js';

/**
 * Quaternion class for 3D rotations
 */
export class Quaternion {
  public w: number;
  public x: number;
  public y: number;
  public z: number;

  constructor(w: number = 1, x: number = 0, y: number = 0, z: number = 0) {
    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * Multiply this quaternion by another quaternion
   */
  multiply(q: Quaternion): Quaternion {
    return new Quaternion(
      this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z,
      this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y,
      this.w * q.y - this.x * q.z + this.y * q.w + this.z * q.x,
      this.w * q.z + this.x * q.y - this.y * q.x + this.z * q.w
    );
  }

  /**
   * Calculate the magnitude of the quaternion
   */
  magnitude(): number {
    return Math.sqrt(this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z);
  }

  /**
   * Normalize the quaternion
   */
  normalize(): Quaternion {
    const mag = this.magnitude();
    if (mag === 0) return new Quaternion(1, 0, 0, 0);
    return new Quaternion(this.w / mag, this.x / mag, this.y / mag, this.z / mag);
  }

  /**
   * Get the conjugate of the quaternion
   */
  conjugate(): Quaternion {
    return new Quaternion(this.w, -this.x, -this.y, -this.z);
  }

  /**
   * Rotate a vector by this quaternion
   */
  rotateVector(v: Vector3D): Vector3D {
    const qv = new Quaternion(0, v.x, v.y, v.z);
    const result = this.multiply(qv).multiply(this.conjugate());
    return new Vector3D(result.x, result.y, result.z);
  }

  /**
   * Convert to rotation matrix (3x3)
   */
  toMatrix3(): number[] {
    const w = this.w, x = this.x, y = this.y, z = this.z;
    return [
      1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y),
      2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x),
      2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)
    ];
  }

  /**
   * Create quaternion from axis and angle (in radians)
   */
  static fromAxisAngle(axis: Vector3D, angle: number): Quaternion {
    const halfAngle = angle * 0.5;
    const sin = Math.sin(halfAngle);
    const normalized = axis.normalize();
    return new Quaternion(
      Math.cos(halfAngle),
      normalized.x * sin,
      normalized.y * sin,
      normalized.z * sin
    );
  }

  /**
   * Create quaternion from Euler angles (in radians)
   */
  static fromEuler(x: number, y: number, z: number): Quaternion {
    const cx = Math.cos(x * 0.5);
    const sx = Math.sin(x * 0.5);
    const cy = Math.cos(y * 0.5);
    const sy = Math.sin(y * 0.5);
    const cz = Math.cos(z * 0.5);
    const sz = Math.sin(z * 0.5);

    return new Quaternion(
      cx * cy * cz + sx * sy * sz,
      sx * cy * cz - cx * sy * sz,
      cx * sy * cz + sx * cy * sz,
      cx * cy * sz - sx * sy * cz
    );
  }

  /**
   * Identity quaternion
   */
  static identity(): Quaternion {
    return new Quaternion(1, 0, 0, 0);
  }

  /**
   * Clone this quaternion
   */
  clone(): Quaternion {
    return new Quaternion(this.w, this.x, this.y, this.z);
  }
}
