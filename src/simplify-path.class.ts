/*
  SimplifyPath.js
  (c) 2024, Ignacio Lago

  SimplifyPath may be freely distributed under the BSD 3-Clause License.
*/

// type that ensures that the keys of T introduced in the constructor are valid properties of T and contain a number
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Point<T, P extends keyof T = any> = {
  [key in P]: number;
} & {
  [key: string]: unknown;
};

export type PointXYZ = Point<{ x: number; y: number; z?: number }, 'x' | 'y' | 'z'>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class SimplifyPath<T = PointXYZ, P extends keyof T = any> {
  /**
   * Properties of the point object as x, y, z, etc.
   * Array of properties of T
   */
  protected readonly props: P[];

  constructor(properties?: P[]) {
    if (properties) {
      if (properties.length < 2) {
        throw new Error('Invalid properties: Points must have at least two dimensions.');
      }
      this.props = properties;
    } else {
      this.props = ['x', 'y'] as P[];
    }

    if (this.props.length === 2) {
      this.getSqDist = this.getSqDist2D.bind(this, ...this.props);
      this.getSqSegDist = this.getSqSegDist2D.bind(this, ...this.props);
    } else if (this.props.length === 3) {
      this.getSqDist = this.getSqDist3D.bind(this, ...this.props);
      this.getSqSegDist = this.getSqSegDist3D.bind(this, ...this.props);
    } else {
      this.getSqDist = this.getSqDistND.bind(this, this.props);
      this.getSqSegDist = this.getSqSegDistND.bind(this, this.props);
    }
  }

  /** Square distance between two points */
  protected readonly getSqDist;
  /** Square distance from a point to a segment */
  protected readonly getSqSegDist;

  /** Square distance between 2 2D points */
  protected getSqDist2D(kx: P, ky: P, p1: Point<T, P>, p2: Point<T, P>): number {
    const dx = p1[kx] - p2[kx];
    const dy = p1[ky] - p2[ky];

    return dx * dx + dy * dy;
  }

  /** Square distance between 2 3D points */
  protected getSqDist3D(kx: P, ky: P, kz: P, p1: Point<T, P>, p2: Point<T, P>): number {
    const dx = p1[kx] - p2[kx];
    const dy = p1[ky] - p2[ky];
    const dz = p1[kz] - p2[kz];

    return dx * dx + dy * dy + dz * dz;
  }

  /** Square distance between 2 N-dimensional points */
  protected getSqDistND(props: P[], p1: Point<T, P>, p2: Point<T, P>): number {
    return props.reduce((acc, k) => acc + (p1[k] - p2[k]) ** 2, 0);
  }

  /** Square distance from a 2D point to a segment */
  protected getSqSegDist2D(kx: P, ky: P, p: Point<T, P>, p1: Point<T, P>, p2: Point<T, P>): number {
    let x: number = p1[kx];
    let y: number = p1[ky];
    let dx: number = p2[kx] - x;
    let dy: number = p2[ky] - y;

    if (dx !== 0 || dy !== 0) {
      const t = ((p[kx] - x) * dx + (p[ky] - y) * dy) / (dx * dx + dy * dy);

      if (t > 1) {
        x = p2[kx];
        y = p2[ky];
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }

    dx = p[kx] - x;
    dy = p[ky] - y;

    return dx * dx + dy * dy;
  }

  /** Square distance from a 3D point to a segment */
  protected getSqSegDist3D(kx: P, ky: P, kz: P, p: Point<T, P>, p1: Point<T, P>, p2: Point<T, P>): number {
    let x: number = p1[kx];
    let y: number = p1[ky];
    let z: number = p1[kz];
    let dx: number = p2[kx] - x;
    let dy: number = p2[ky] - y;
    let dz: number = p2[kz] - z;

    if (dx !== 0 || dy !== 0 || dz !== 0) {
      const t = ((p[kx] - x) * dx + (p[ky] - y) * dy + (p[kz] - z) * dz) / (dx * dx + dy * dy + dz * dz);

      if (t > 1) {
        x = p2[kx];
        y = p2[ky];
        z = p2[kz];
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
        z += dz * t;
      }
    }

    dx = p[kx] - x;
    dy = p[ky] - y;
    dz = p[kz] - z;

    return dx * dx + dy * dy + dz * dz;
  }

  protected getSqSegDistND(props: P[], p: Point<T, P>, p1: Point<T, P>, p2: Point<T, P>): number {
    const vp: number[] = props.map((k) => p[k]);
    const vp1: number[] = props.map((k) => p1[k]);
    const vp2: number[] = props.map((k) => p2[k]);
    const d = props.map((k) => p2[k] - p1[k]);
    if (d.some((di) => di !== 0)) {
      const t =
        d.reduce((acc, di, i) => acc + (vp[i] - vp1[i]) * di, 0) / d.reduce((acc, di) => acc + di * di, 0);
      if (t > 1) {
        vp.forEach((_, i) => (vp[i] = vp2[i]));
      } else if (t > 0) {
        d.forEach((di, i) => (vp[i] += di * t));
      }
    }
    d.forEach((di, i) => (vp[i] -= vp[i]));
    return d.reduce((acc, di) => acc + di * di, 0);
  }

  /** Basic distance-based simplification */
  protected simplifyRadialDist(points: Point<T, P>[], sqTolerance: number): Point<T, P>[] {
    let prevPoint = points[0];
    let point;
    const newPoints = [prevPoint];

    for (let i = 1, len = points.length; i < len; i++) {
      point = points[i];

      if (this.getSqDist(point, prevPoint) > sqTolerance) {
        newPoints.push(point);
        prevPoint = point;
      }
    }

    if (prevPoint !== point) {
      newPoints.push(point as Point<T, P>);
    }

    return newPoints;
  }

  /** Simplification using optimized Douglas-Peucker algorithm with recursion elimination */
  protected simplifyDouglasPeuckerStep(
    points: Point<T, P>[],
    first: number,
    last: number,
    sqTolerance: number,
    simplified: Point<T, P>[]
  ): void {
    let maxSqDist = sqTolerance;
    let index = 0;

    for (let i = first + 1; i < last; i++) {
      const sqDist = this.getSqSegDist(points[i], points[first], points[last]);

      if (sqDist > maxSqDist) {
        index = i;
        maxSqDist = sqDist;
      }
    }

    if (maxSqDist > sqTolerance) {
      if (index - first > 1) this.simplifyDouglasPeuckerStep(points, first, index, sqTolerance, simplified);
      simplified.push(points[index]);
      if (last - index > 1) this.simplifyDouglasPeuckerStep(points, index, last, sqTolerance, simplified);
    }
  }

  /** Simplification using Ramer-Douglas-Peucker algorithm */
  protected simplifyRamerDouglasPeucker(points: Point<T, P>[], sqTolerance: number): Point<T, P>[] {
    const last = points.length - 1;

    const simplified = [points[0]];
    this.simplifyDouglasPeuckerStep(points, 0, last, sqTolerance, simplified);
    simplified.push(points[last]);

    return simplified;
  }

  /**
   * Simplify an array of points with an optional tolerance.
   * @param points Array of points to simplify.
   * @param tolerance Tolerance in squared units.
   * @param highestQuality Flag to enable highest quality simplification.
   * @returns Simplified array of points.
   * @example
   * const simplified = simplifyPath.simplify([{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }], 1);
   */
  public simplify = (points: Point<T, P>[], tolerance = 1, highestQuality = false): T[] => {
    if (points.length <= 2) return points as T[];

    const sqTolerance = tolerance * tolerance;

    points = highestQuality ? points : this.simplifyRadialDist(points, sqTolerance);
    points = this.simplifyRamerDouglasPeucker(points, sqTolerance);

    return points as T[];
  };
}
