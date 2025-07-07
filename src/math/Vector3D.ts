/**
 * Vector3D class for 3D mathematical operations
 */
export class Vector3D {
  public x: number;
  public y: number;
  public z: number;

  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * Add another vector to this vector
   */
  add(v: Vector3D): Vector3D {
    return new Vector3D(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  /**
   * Subtract another vector from this vector
   */
  subtract(v: Vector3D): Vector3D {
    return new Vector3D(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  /**
   * Multiply vector by a scalar
   */
  multiply(scalar: number): Vector3D {
    return new Vector3D(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  /**
   * Divide vector by a scalar
   */
  divide(scalar: number): Vector3D {
    if (scalar === 0) throw new Error("Cannot divide by zero");
    return new Vector3D(this.x / scalar, this.y / scalar, this.z / scalar);
  }

  /**
   * Calculate dot product with another vector
   */
  dot(v: Vector3D): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  /**
   * Calculate cross product with another vector
   */
  cross(v: Vector3D): Vector3D {
    return new Vector3D(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  /**
   * Calculate the magnitude (length) of the vector
   */
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  /**
   * Get the magnitude squared (more efficient than magnitude)
   */
  magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  /**
   * Normalize the vector (make it unit length)
   */
  normalize(): Vector3D {
    const mag = this.magnitude();
    if (mag === 0) return new Vector3D(0, 0, 0);
    return this.divide(mag);
  }

  /**
   * Calculate distance to another vector
   */
  distanceTo(v: Vector3D): number {
    return this.subtract(v).magnitude();
  }

  /**
   * Linear interpolation between this vector and another
   */
  lerp(v: Vector3D, t: number): Vector3D {
    return this.add(v.subtract(this).multiply(t));
  }

  /**
   * Check if this vector is equal to another vector
   */
  equals(v: Vector3D, epsilon: number = 1e-6): boolean {
    return (
      Math.abs(this.x - v.x) < epsilon &&
      Math.abs(this.y - v.y) < epsilon &&
      Math.abs(this.z - v.z) < epsilon
    );
  }

  /**
   * Create a copy of this vector
   */
  clone(): Vector3D {
    return new Vector3D(this.x, this.y, this.z);
  }

  /**
   * Set the values of this vector
   */
  set(x: number, y: number, z: number): Vector3D {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  /**
   * Convert to array
   */
  toArray(): [number, number, number] {
    return [this.x, this.y, this.z];
  }

  /**
   * Convert to string
   */
  toString(): string {
    return `Vector3D(${this.x}, ${this.y}, ${this.z})`;
  }

  // Static methods
  static zero(): Vector3D {
    return new Vector3D(0, 0, 0);
  }

  static one(): Vector3D {
    return new Vector3D(1, 1, 1);
  }

  static up(): Vector3D {
    return new Vector3D(0, 1, 0);
  }

  static down(): Vector3D {
    return new Vector3D(0, -1, 0);
  }

  static left(): Vector3D {
    return new Vector3D(-1, 0, 0);
  }

  static right(): Vector3D {
    return new Vector3D(1, 0, 0);
  }

  static forward(): Vector3D {
    return new Vector3D(0, 0, 1);
  }

  static backward(): Vector3D {
    return new Vector3D(0, 0, -1);
  }
}
