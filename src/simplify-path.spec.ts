/* eslint-disable @typescript-eslint/no-explicit-any */
import { SimplifyPath } from './simplify-path.class';

const randomSigned = (max: number) => Math.random() * max * (Math.random() < 0.5 ? -1 : 1);

const cases = [
  {
    name: 'an empty path',
    path: [],
    tolerance: 1,
    simplified: [],
  },
  {
    name: 'one 2-dimensional point',
    path: Array.from({ length: 1 }, (_, i) => ({ x: i, y: i })),
    tolerance: 1,
    simplified: [{ x: 0, y: 0 }],
  },
  {
    name: 'two 2-dimensional points',
    path: Array.from({ length: 2 }, (_, i) => ({ x: i, y: i })),
    tolerance: 1,
    simplified: [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ],
  },
  {
    name: 'three 2-dimensional points on a line',
    path: Array.from({ length: 3 }, (_, i) => ({ x: i, y: i })),
    tolerance: 1,
    simplified: [
      { x: 0, y: 0 },
      { x: 2, y: 2 },
    ],
  },
  {
    name: 'one hundred 2-dimensional points on a line',
    path: Array.from({ length: 100 }, (_, i) => ({ x: i, y: i })),
    tolerance: 1,
    simplified: [
      { x: 0, y: 0 },
      { x: 99, y: 99 },
    ],
  },
  {
    name: 'three 2-dimensional points not on a line',
    path: [
      { x: 1, y: 1 },
      { x: 0, y: 0 },
      { x: 0.5, y: 0 },
    ],
    tolerance: 1,
    simplified: [
      { x: 1, y: 1 },
      { x: 0.5, y: 0 },
    ],
  },
  {
    name: 'three 2-dimensional points forming a triangle',
    path: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 0, y: 100 },
    ],
    tolerance: 100,
    simplified: [
      { x: 0, y: 0 },
      { x: 0, y: 100 },
    ],
  },
  {
    name: 'three 2-dimensional points forming a triangle with low tolerance',
    path: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ],
    tolerance: 0.5,
    simplified: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ],
  },
  {
    name: 'six 2-dimensional points forming a triangle with high tolerance',
    path: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
    ],
    tolerance: 1,
    simplified: [
      { x: 0, y: 0 },
      { x: 1, y: 2 },
    ],
  },
  {
    name: 'five 2-dimensional points forming a sin wave with normal tolerance',
    path: Array.from({ length: 5 }, (_, i) => ({ x: i, y: Math.sin(i) })),
    tolerance: 1,
    simplified: [
      { x: 0, y: 0 },
      { x: 2, y: Math.sin(2) },
      { x: 4, y: Math.sin(4) },
    ],
  },
  {
    name: 'one hundred 2-dimensional points forming a sin wave with high tolerance',
    path: Array.from({ length: 100 }, (_, i) => ({ x: i, y: Math.sin(i) })),
    tolerance: 10,
    simplified: [
      { x: 0, y: 0 },
      { x: 99, y: Math.sin(99) },
    ],
  },
  {
    name: 'one hundred 2-dimensional points with complex head',
    path: (() => {
      const arr = Array.from({ length: 100 }, (_, i) => ({
        x: i <= 50 && i % 2 !== 0 ? 0.5 : i,
        y: i <= 50 ? 0.5 : i,
      }));
      return arr;
    })(),
    tolerance: 1,
    simplified: [
      { x: 0, y: 0.5 },
      { x: 50, y: 0.5 },
      { x: 51, y: 51 },
      { x: 99, y: 99 },
    ],
  },
  {
    name: 'one hundred 2-dimensional noise',
    path: (() => {
      const arr = Array.from({ length: 100 }, (_, i) => ({
        x: i > 0 && i < 99 ? i + randomSigned(0.1) : i,
        y: i > 0 && i < 99 ? i + randomSigned(0.1) : i,
      }));
      return arr;
    })(),
    tolerance: 1,
    simplified: [
      { x: 0, y: 0 },
      { x: 99, y: 99 },
    ],
  },
  {
    name: 'one hundred 2-dimensional noise on a line',
    path: (() => {
      const arr = Array.from({ length: 100 }, (_, i) => ({
        x: i > 0 && i < 99 ? i + randomSigned(0.1) : i,
        y: i,
      }));
      return arr;
    })(),
    tolerance: 0.1,
    simplified: [
      { x: 0, y: 0 },
      { x: 99, y: 99 },
    ],
  },
  // 3-dimensional points
  {
    name: 'three 3-dimensional points on a line',
    path: Array.from({ length: 3 }, (_, i) => ({ x: i, y: i, z: i })),
    tolerance: 1,
    simplified: [
      { x: 0, y: 0, z: 0 },
      { x: 2, y: 2, z: 2 },
    ],
  },
  {
    name: 'three 3-dimensional points not on a line',
    path: [
      { x: 1, y: 1, z: 1 },
      { x: 0, y: 0, z: 0 },
      { x: 0.5, y: 0.5, z: 0 },
    ],
    tolerance: 1,
    simplified: [
      { x: 1, y: 1, z: 1 },
      { x: 0.5, y: 0.5, z: 0 },
    ],
  },
  {
    name: 'three 3-dimensional points not on a line',
    path: [
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 0, z: 0.5 },
    ],
    tolerance: 1,
    simplified: [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 0.5 },
    ],
  },
  {
    name: 'five 3-dimensional points forming a pyramid with high tolerance',
    path: [
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 0, y: 0, z: 1 },
      { x: 1, y: 1, z: 1 },
    ],
    tolerance: 1,
    simplified: [
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 1, z: 1 },
    ],
  },
  {
    name: 'five 3-dimensional points forming a pyramid with low tolerance',
    path: [
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 0, y: 0, z: 1 },
      { x: 1, y: 1, z: 1 },
    ],
    tolerance: 0.5,
    simplified: [
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 0, y: 0, z: 1 },
      { x: 1, y: 1, z: 1 },
    ],
  },
  {
    name: 'one hundred 3-dimensional noise',
    path: (() => {
      const arr = Array.from({ length: 100 }, (_, i) => ({
        x: i > 0 && i < 99 ? i + randomSigned(0.1) : i,
        y: i > 0 && i < 99 ? i + randomSigned(0.1) : i,
        z: i > 0 && i < 99 ? i + randomSigned(0.1) : i,
      }));
      return arr;
    })(),
    tolerance: 1,
    simplified: [
      { x: 0, y: 0, z: 0 },
      { x: 99, y: 99, z: 99 },
    ],
  },
  {
    name: 'one hundred 3-dimensional noise on a line',
    path: (() => {
      const arr = Array.from({ length: 100 }, (_, i) => ({
        x: i > 0 && i < 99 ? i + randomSigned(0.1) : i,
        y: i,
        z: i > 0 && i < 99 ? i + randomSigned(0.1) : i,
      }));
      return arr;
    })(),
    tolerance: 0.3,
    simplified: [
      { x: 0, y: 0, z: 0 },
      { x: 99, y: 99, z: 99 },
    ],
  },
  // 4-dimensional points
  {
    name: 'five 4-dimensional points on a line',
    path: Array.from({ length: 5 }, (_, i) => ({ x: i, y: i, z: i, w: i })),
    tolerance: 5,
    hq: false,
    simplified: [
      { x: 0, y: 0, z: 0, w: 0 },
      { x: 3, y: 3, z: 3, w: 3 },
      { x: 4, y: 4, z: 4, w: 4 },
    ],
  },
  {
    name: 'five 4-dimensional points on a line',
    path: Array.from({ length: 5 }, (_, i) => ({ x: i, y: i, z: i, w: i })),
    tolerance: 5,
    hq: true,
    simplified: [
      { x: 0, y: 0, z: 0, w: 0 },
      { x: 1, y: 1, z: 1, w: 1 },
      { x: 2, y: 2, z: 2, w: 2 },
      { x: 4, y: 4, z: 4, w: 4 },
    ],
  },
  {
    name: 'three 4-dimensional points not on a line',
    path: [
      { x: 1, y: 1, z: 1, w: 1 },
      { x: 0, y: 0, z: 0, w: 0 },
      { x: 0.5, y: 0.5, z: 0.5, w: 0.5 },
    ],
    tolerance: 1,
    simplified: [
      { x: 1, y: 1, z: 1, w: 1 },
      { x: 0.5, y: 0.5, z: 0.5, w: 0.5 },
    ],
  },
  {
    name: 'one hundred 4-dimensional noisy points',
    path: (() => {
      const arr = Array.from({ length: 100 }, (_, i) => ({
        x: i > 0 && i < 99 ? i + randomSigned(0.1) : i,
        y: i > 0 && i < 99 ? i + randomSigned(0.1) : i,
        z: i > 0 && i < 99 ? i + randomSigned(0.1) : i,
        w: i > 0 && i < 99 ? i + randomSigned(0.1) : i,
      }));
      return arr;
    })(),
    tolerance: 200,
    simplified: [
      { x: 0, y: 0, z: 0, w: 0 },
      { x: 99, y: 99, z: 99, w: 99 },
    ],
  },
];

describe('simplify', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should crash if dimensions are less than 2', () => {
    expect(() => new SimplifyPath([]).simplify([{ x: 0, y: 0 }], 1)).toThrow();
    expect(() => new SimplifyPath(['x']).simplify([{ x: 0, y: 0 }], 1)).toThrow();
  });

  for (const { name, path, tolerance, hq, simplified } of cases) {
    describe(`should simplify ${name}`, () => {
      let keys = path[0] ? Object.keys(path[0]) : undefined;
      if (keys?.length === 1) keys = undefined;
      const simplify = new SimplifyPath<any, any>(keys).simplify;
      if (!hq) {
        it('should return the simplified path', () => {
          if (tolerance == 1) {
            expect(simplify(path)).toEqual(simplified);
          }
          expect(simplify(path, tolerance)).toEqual(simplified);
          expect(simplify(path, tolerance, false)).toEqual(simplified);
        });
      }
      if (hq || hq === undefined) {
        it('should return the simplified path with high quality', () => {
          expect(simplify(path, tolerance, true)).toEqual(simplified);
        });
      }
    });
  }
});
