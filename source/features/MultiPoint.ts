import {Point} from "../Point";
import {Feature, FeatureParams} from "./Feature";
import {Bbox} from "../Bbox";
import {Crs} from "../Crs";

/**
 * Represents a set of points on a map that behave as one feature: have same symbol, can be added, transformed or removed as one.
 * @alias sGis.feature.MultiPoint
 */
export class MultiPoint extends Feature {
    private _points: any[];
    private _bbox: Bbox;

    /**
     * @param {Position[]} points - set of the points' coordinates
     * @param {Object} properties - key-value set of properties to be set to the instance
     */
    constructor(points = [], {crs}: FeatureParams  = {}) {
        super({crs});
        this._points = points;
    }

    /**
     * Set of points' coordinates
     * @type {Position[]}
     * @default []
     */
    get points() { return this._points; }
    set points(/** Position[] */ points) {
        this._points = points.slice();
        this._update();
    }

    projectTo(crs: Crs): Feature
    projectTo(crs: Crs): MultiPoint {
        let projected = [];
        this._points.forEach(point => {
            projected.push(new Point(point, this.crs).projectTo(crs).coordinates);
        });

        return new MultiPoint(projected, {crs: crs});
    }

    /**
     * Returns a copy of the feature. Only generic properties are copied.
     * @returns {sGis.feature.MultiPoint}
     */
    clone() {
        return this.projectTo(this.crs);
    }

    /**
     * Adds a point to the end of the coordinates' list
     * @param {sGis.IPoint|Position} point - if sGis.IPoint instance is given, it will be automatically projected to the multipoint coordinate system.
     */
    addPoint(point) {
        if (point.position && point.crs) {
            this._points.push(point.projectTo(this.crs).position);
        } else {
            this._points.push([point[0], point[1]]);
        }
        this._update();
    }

    protected _update() {
        this._bbox = null;
        super._update();
    }

    get bbox() {
        if (this._bbox) return this._bbox;
        let xMin = Number.MAX_VALUE;
        let yMin = Number.MAX_VALUE;
        let xMax = Number.MIN_VALUE;
        let yMax = Number.MIN_VALUE;

        this._points.forEach(point => {
            xMin = Math.min(xMin, point[0]);
            yMin = Math.min(yMin, point[1]);
            xMax = Math.max(xMax, point[0]);
            yMax = Math.max(yMax, point[1]);
        });

        this._bbox = new Bbox([xMin, yMin], [xMax, yMax], this.crs);
        return this._bbox;
    }

    /**
     * @deprecated
     */
    get coordinates() { return this._points.slice(); }
    set coordinates(points) { this.points = points; }
}
