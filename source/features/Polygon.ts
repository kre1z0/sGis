import {Poly} from "./Poly";
import {Feature, FeatureParams} from "./Feature";
import {copyArray} from "../utils/utils";
import {Crs} from "../Crs";
import {projectRings} from "../geotools";

/**
 * Polygon with one or more contours (rings). Coordinates in the contours must not be enclosed (first and last points must not be same).
 * @alias sGis.feature.Polygon
 */
export class Polygon extends Poly {
    protected _isEnclosed: boolean = true;

    constructor(rings, {crs}: FeatureParams = {}) {
        super(rings, {crs});
    }

    /**
     * Returns a copy of the feature. Only generic properties are copied.
     */
    clone() {
        return new Polygon(copyArray(this.rings), {crs: this.crs});
    }

    projectTo(crs: Crs): Polygon
    projectTo(crs: Crs): Feature {
        let projected = projectRings(this.rings, this.crs, crs);
        return new Polygon(projected, {crs: this.crs});
    }
}
