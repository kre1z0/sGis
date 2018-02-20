import {VisualObject} from "./VisualObject";
import {FeatureParams} from "../features/Feature";
import {Symbol} from "../symbols/Symbol";
import {Polyline} from "../features/Polyline";
import {PolylineSymbol} from "../symbols/PolylineSymbol";

export interface PolylineObjectParams extends FeatureParams {
    symbol?: Symbol<Polyline>;
}

export class PolylineObject extends VisualObject<Polyline> {
    constructor(rings, {symbol = new PolylineSymbol(), ...params}: PolylineObjectParams = {}) {
        super({
            feature: new Polyline(rings, params),
            symbol
        });
    }
}