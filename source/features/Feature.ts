import {Crs, geo} from "../Crs";
import {EventHandler, sGisEvent} from "../EventHandler";
import {Bbox} from "../Bbox";

export class UpdatedEvent extends sGisEvent {
    static type: string = 'updated';

    constructor() {
        super(UpdatedEvent.type);
    }
}

export interface FeatureParams {
    crs?: Crs;
}

/**
 * Abstract feature object without any geometry. All other visualObjects inherit from this class. It can be used to store attributes in the way compatible with other visualObjects.
 * @alias sGis.Feature
 */
export abstract class Feature extends EventHandler {
    private _crs: Crs;
    private _updateTs: number = Date.now();

    /**
     * Sets default coordinate system for all visualObjects.<br><br>
     *     <strong>
     *     NOTE: This method affects all already created visualObjects that do not have explicitly specified crs.
     *     You should use this function only when initializing the library.
     *     </strong>
     * @param crs
     */
    static setDefaultCrs(crs: Crs): void {
        Feature.prototype._crs = crs;
    }

    constructor({crs = geo}: FeatureParams = {}) {
        super();
        this._crs = crs;
    }

    /**
     * Coordinate system of the feature.
     */
    get crs(): Crs { return this._crs; }


    /**
     * Bounding box of the feature.
     */
    abstract get bbox(): Bbox;

    abstract clone(): Feature;
    abstract projectTo(crs: Crs): Feature;

    protected _update() {
        this._updateTs = Date.now();
    }

    get updateTs(): number {
        return this._updateTs;
    }
}

