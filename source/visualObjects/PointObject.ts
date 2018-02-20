import {PointFeature} from "../features/PointFeature";
import {VisualObject} from "./VisualObject";
import {Coordinates} from "../baseTypes";
import {Crs} from "../Crs";
import {Symbol} from "../symbols/Symbol";
import {PointSymbol} from "../symbols/point/Point";

export interface PointObjectParams {
    crs?: Crs;
    symbol?: Symbol<PointFeature>;
}

export class PointObject extends VisualObject<PointFeature> {
    constructor(position: Coordinates, {crs, symbol = new PointSymbol()}: PointObjectParams = {}) {
        super({
            feature: new PointFeature(position, {crs}),
            symbol
        });
    }
}