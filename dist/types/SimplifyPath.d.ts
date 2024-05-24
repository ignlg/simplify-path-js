export type Point<T, P extends keyof T = any> = {
    [key in P]: number;
} & {
    [key: string]: unknown;
};
export type PointXYZ = Point<{
    x: number;
    y: number;
    z?: number;
}, 'x' | 'y' | 'z'>;
export interface SimplifyFn<T, P extends keyof T> {
    (points: Point<T, P>[], tolerance?: number, highestQuality?: boolean): T[];
}
export declare class SimplifyPath<T = PointXYZ, P extends keyof T = any> {
    /**
     * Properties of the point object as x, y, z, etc.
     * Array of properties of T
     */
    protected readonly props: P[];
    constructor(properties?: P[]);
    /** Square distance between two points */
    protected readonly getSqDist: ((...args: any[]) => number) | ((p1: Point<T, P>, p2: Point<T, P>) => number);
    /** Square distance from a point to a segment */
    protected readonly getSqSegDist: ((...args: any[]) => number) | ((p: Point<T, P>, p1: Point<T, P>, p2: Point<T, P>) => number);
    /** Square distance between 2 2D points */
    protected getSqDist2D(kx: P, ky: P, p1: Point<T, P>, p2: Point<T, P>): number;
    /** Square distance between 2 3D points */
    protected getSqDist3D(kx: P, ky: P, kz: P, p1: Point<T, P>, p2: Point<T, P>): number;
    /** Square distance between 2 N-dimensional points */
    protected getSqDistND(props: P[], p1: Point<T, P>, p2: Point<T, P>): number;
    /** Square distance from a 2D point to a segment */
    protected getSqSegDist2D(kx: P, ky: P, p: Point<T, P>, p1: Point<T, P>, p2: Point<T, P>): number;
    /** Square distance from a 3D point to a segment */
    protected getSqSegDist3D(kx: P, ky: P, kz: P, p: Point<T, P>, p1: Point<T, P>, p2: Point<T, P>): number;
    protected getSqSegDistND(props: P[], p: Point<T, P>, p1: Point<T, P>, p2: Point<T, P>): number;
    /** Basic distance-based simplification */
    protected simplifyRadialDist(points: Point<T, P>[], sqTolerance: number): Point<T, P>[];
    /** Simplification using optimized Douglas-Peucker algorithm with recursion elimination */
    protected simplifyDouglasPeuckerStep(points: Point<T, P>[], first: number, last: number, sqTolerance: number, simplified: Point<T, P>[]): void;
    /** Simplification using Ramer-Douglas-Peucker algorithm */
    protected simplifyRamerDouglasPeucker(points: Point<T, P>[], sqTolerance: number): Point<T, P>[];
    /** Both algorithms combined for awesome performance */
    simplify: SimplifyFn<T, P>;
}
