import {VisualObject} from "./VisualObject";
import {LabelFeature, LabelFeatureParams} from "../features/LabelFeature";
import {StaticLabelSymbol} from "../symbols/label/StaticLabelSymbol";
import {Symbol} from "../symbols/Symbol";

export interface LabelObjectParams extends LabelFeatureParams {
    symbol?: Symbol<LabelFeature>;
}

export class LabelObject extends VisualObject<LabelFeature> {
    constructor(position, {symbol = new StaticLabelSymbol(), ...params}: LabelObjectParams) {
        super({
            feature: new LabelFeature(position, params),
            symbol
        })
    }
}