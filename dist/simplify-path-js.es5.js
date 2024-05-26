/*
  SimplifyPath.js
  (c) 2024, Ignacio Lago

  SimplifyPath may be freely distributed under the BSD 3-Clause License.
*/
var __read = (undefined && undefined.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var SimplifyPath = /** @class */ (function () {
    function SimplifyPath(properties) {
        var _a, _b, _c, _d;
        var _this = this;
        /**
         * Simplify an array of points with an optional tolerance.
         * @param points Array of points to simplify.
         * @param tolerance Tolerance in squared units.
         * @param highestQuality Flag to enable highest quality simplification.
         * @returns Simplified array of points.
         * @example
         * const simplified = simplifyPath.simplify([{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }], 1);
         */
        this.simplify = function (points, tolerance, highestQuality) {
            if (tolerance === void 0) { tolerance = 1; }
            if (highestQuality === void 0) { highestQuality = false; }
            if (points.length <= 2)
                return points;
            var sqTolerance = tolerance * tolerance;
            points = highestQuality ? points : _this.simplifyRadialDist(points, sqTolerance);
            points = _this.simplifyRamerDouglasPeucker(points, sqTolerance);
            return points;
        };
        if (properties) {
            if (properties.length < 2) {
                throw new Error('Invalid properties: Points must have at least two dimensions.');
            }
            this.props = properties;
        }
        else {
            this.props = ['x', 'y'];
        }
        if (this.props.length === 2) {
            this.getSqDist = (_a = this.getSqDist2D).bind.apply(_a, __spreadArray([this], __read(this.props), false));
            this.getSqSegDist = (_b = this.getSqSegDist2D).bind.apply(_b, __spreadArray([this], __read(this.props), false));
        }
        else if (this.props.length === 3) {
            this.getSqDist = (_c = this.getSqDist3D).bind.apply(_c, __spreadArray([this], __read(this.props), false));
            this.getSqSegDist = (_d = this.getSqSegDist3D).bind.apply(_d, __spreadArray([this], __read(this.props), false));
        }
        else {
            this.getSqDist = this.getSqDistND.bind(this, this.props);
            this.getSqSegDist = this.getSqSegDistND.bind(this, this.props);
        }
    }
    /** Square distance between 2 2D points */
    SimplifyPath.prototype.getSqDist2D = function (kx, ky, p1, p2) {
        var dx = p1[kx] - p2[kx];
        var dy = p1[ky] - p2[ky];
        return dx * dx + dy * dy;
    };
    /** Square distance between 2 3D points */
    SimplifyPath.prototype.getSqDist3D = function (kx, ky, kz, p1, p2) {
        var dx = p1[kx] - p2[kx];
        var dy = p1[ky] - p2[ky];
        var dz = p1[kz] - p2[kz];
        return dx * dx + dy * dy + dz * dz;
    };
    /** Square distance between 2 N-dimensional points */
    SimplifyPath.prototype.getSqDistND = function (props, p1, p2) {
        return props.reduce(function (acc, k) { return acc + Math.pow((p1[k] - p2[k]), 2); }, 0);
    };
    /** Square distance from a 2D point to a segment */
    SimplifyPath.prototype.getSqSegDist2D = function (kx, ky, p, p1, p2) {
        var x = p1[kx];
        var y = p1[ky];
        var dx = p2[kx] - x;
        var dy = p2[ky] - y;
        if (dx !== 0 || dy !== 0) {
            var t = ((p[kx] - x) * dx + (p[ky] - y) * dy) / (dx * dx + dy * dy);
            if (t > 1) {
                x = p2[kx];
                y = p2[ky];
            }
            else if (t > 0) {
                x += dx * t;
                y += dy * t;
            }
        }
        dx = p[kx] - x;
        dy = p[ky] - y;
        return dx * dx + dy * dy;
    };
    /** Square distance from a 3D point to a segment */
    SimplifyPath.prototype.getSqSegDist3D = function (kx, ky, kz, p, p1, p2) {
        var x = p1[kx];
        var y = p1[ky];
        var z = p1[kz];
        var dx = p2[kx] - x;
        var dy = p2[ky] - y;
        var dz = p2[kz] - z;
        if (dx !== 0 || dy !== 0 || dz !== 0) {
            var t = ((p[kx] - x) * dx + (p[ky] - y) * dy + (p[kz] - z) * dz) / (dx * dx + dy * dy + dz * dz);
            if (t > 1) {
                x = p2[kx];
                y = p2[ky];
                z = p2[kz];
            }
            else if (t > 0) {
                x += dx * t;
                y += dy * t;
                z += dz * t;
            }
        }
        dx = p[kx] - x;
        dy = p[ky] - y;
        dz = p[kz] - z;
        return dx * dx + dy * dy + dz * dz;
    };
    SimplifyPath.prototype.getSqSegDistND = function (props, p, p1, p2) {
        var vp = props.map(function (k) { return p[k]; });
        var vp1 = props.map(function (k) { return p1[k]; });
        var vp2 = props.map(function (k) { return p2[k]; });
        var d = props.map(function (k) { return p2[k] - p1[k]; });
        if (d.some(function (di) { return di !== 0; })) {
            var t_1 = d.reduce(function (acc, di, i) { return acc + (vp[i] - vp1[i]) * di; }, 0) / d.reduce(function (acc, di) { return acc + di * di; }, 0);
            if (t_1 > 1) {
                vp.forEach(function (_, i) { return (vp[i] = vp2[i]); });
            }
            else if (t_1 > 0) {
                d.forEach(function (di, i) { return (vp[i] += di * t_1); });
            }
        }
        d.forEach(function (di, i) { return (vp[i] -= vp[i]); });
        return d.reduce(function (acc, di) { return acc + di * di; }, 0);
    };
    /** Basic distance-based simplification */
    SimplifyPath.prototype.simplifyRadialDist = function (points, sqTolerance) {
        var prevPoint = points[0];
        var point;
        var newPoints = [prevPoint];
        for (var i = 1, len = points.length; i < len; i++) {
            point = points[i];
            if (this.getSqDist(point, prevPoint) > sqTolerance) {
                newPoints.push(point);
                prevPoint = point;
            }
        }
        if (prevPoint !== point) {
            newPoints.push(point);
        }
        return newPoints;
    };
    /** Simplification using optimized Douglas-Peucker algorithm with recursion elimination */
    SimplifyPath.prototype.simplifyDouglasPeuckerStep = function (points, first, last, sqTolerance, simplified) {
        var maxSqDist = sqTolerance;
        var index = 0;
        for (var i = first + 1; i < last; i++) {
            var sqDist = this.getSqSegDist(points[i], points[first], points[last]);
            if (sqDist > maxSqDist) {
                index = i;
                maxSqDist = sqDist;
            }
        }
        if (maxSqDist > sqTolerance) {
            if (index - first > 1)
                this.simplifyDouglasPeuckerStep(points, first, index, sqTolerance, simplified);
            simplified.push(points[index]);
            if (last - index > 1)
                this.simplifyDouglasPeuckerStep(points, index, last, sqTolerance, simplified);
        }
    };
    /** Simplification using Ramer-Douglas-Peucker algorithm */
    SimplifyPath.prototype.simplifyRamerDouglasPeucker = function (points, sqTolerance) {
        var last = points.length - 1;
        var simplified = [points[0]];
        this.simplifyDouglasPeuckerStep(points, 0, last, sqTolerance, simplified);
        simplified.push(points[last]);
        return simplified;
    };
    return SimplifyPath;
}());

export { SimplifyPath };
