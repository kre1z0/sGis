import {Poly} from "./Poly";
import {Feature, FeatureParams} from "./Feature";
import {Crs} from "../Crs";
import {projectRings} from "../geotools";
import {copyArray} from "../utils/utils";

/**
 * A line or a set of geographical lines.
 * @alias sGis.feature.Polyline
 */
export class Polyline extends Poly {
    protected _isEnclosed: boolean = false;

    constructor(rings, {crs}: FeatureParams = {}) {
        super(rings, {crs});
    }

    clone() {
        return new Polyline(copyArray(this.rings), {crs: this.crs});
    }

    projectTo(crs: Crs): Polyline
    projectTo(crs: Crs): Feature {
        let projected = projectRings(this.rings, this.crs, crs);
        return new Polyline(projected, {crs: this.crs});
    }
}
