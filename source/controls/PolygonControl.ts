import {PolyControl, PolyControlParams} from "./PolyControl";
import {PolygonSymbol} from "../symbols/polygon/Simple";
import {Coordinates} from "../baseTypes";
import {Poly} from "../features/Poly";
import {Map} from "../Map";
import {VisualObject} from "../visualObjects/VisualObject";
import {PolygonObject} from "../visualObjects/PolygonObject";

/**
 * Control for drawing polygon visualObjects.
 * @alias sGis.control.Polygon
 */
export class PolygonControl extends PolyControl {
    /**
     * @param map - map the control will work with
     * @param properties - key-value set of properties to be set to the instance
     */
    constructor(map: Map, {symbol = new PolygonSymbol(), ...controlOptions}: PolyControlParams = {}) {
        super(map, {symbol, ...controlOptions});
    }

    protected _getNewVisualObject(position: Coordinates): VisualObject<Poly> {
        return new PolygonObject([[position, position]], {crs: this.map.crs, symbol: this.symbol});
    }
}
