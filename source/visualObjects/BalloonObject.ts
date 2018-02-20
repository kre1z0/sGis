import {VisualObject} from "./VisualObject";
import {BalloonFeature, BalloonFeatureParams} from "../features/BalloonFeature";
import {BalloonSymbol} from "../symbols/BalloonSymbol";
import {Coordinates} from "../baseTypes";

export interface BalloonObjectParams extends BalloonFeatureParams {
    symbol?: BalloonSymbol;
}

export class BalloonObject extends VisualObject<BalloonFeature> {
    constructor(position: Coordinates, {symbol, ...params}: BalloonObjectParams) {
        super({
            feature: new BalloonFeature(position, params),
            symbol
        });
    }
}