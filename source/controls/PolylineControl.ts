import {PolyControl, PolyControlParams} from "./PolyControl";
import {PolylineSymbol} from "../symbols/PolylineSymbol";
import {Poly} from "../features/Poly";
import {Map} from "../Map";
import {Coordinates} from "../baseTypes";
import {VisualObject} from "../visualObjects/VisualObject";
import {PolylineObject} from "../visualObjects/PolylineObject";

/**
 * Control for drawing polyline visualObjects.
 * @alias sGis.controls.Polyline
 */
export class PolylineControl extends PolyControl {
    /**
     * @param map - map the control will work with
     * @param properties - key-value set of properties to be set to the instance
     */
    constructor(map: Map, {symbol = new PolylineSymbol(), ...controlOptions}: PolyControlParams = {}) {
        super(map, {symbol, ...controlOptions});
    }

    protected _getNewVisualObject(position: Coordinates): VisualObject<Poly> {
        return new PolylineObject([[position, position]], {crs: this.map.crs, symbol: this.symbol});
    }

}
