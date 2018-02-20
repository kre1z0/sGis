import {VisualObject} from "./VisualObject";
import {Polygon} from "../features/Polygon";
import {PolygonSymbol} from "../symbols/polygon/Simple";
import {FeatureParams} from "../features/Feature";
import {Symbol} from "../symbols/Symbol";

export interface PolygonObjectParams extends FeatureParams {
    symbol?: Symbol<Polygon>;
}

export class PolygonObject extends VisualObject<Polygon> {
    constructor(rings, {symbol = new PolygonSymbol(), ...params}: PolygonObjectParams = {}) {
        super({
            feature: new Polygon(rings, params),
            symbol: symbol
        });
    }
}