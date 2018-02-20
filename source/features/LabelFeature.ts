import {FeatureParams} from "./Feature";
import {Crs} from "../Crs";
import {Coordinates} from "../baseTypes";
import {PointFeature} from "./PointFeature";

export interface LabelFeatureParams extends FeatureParams {
    content: string;
}

/**
 * @example symbols/Label_Symbols
 */
export class LabelFeature extends PointFeature {
    private _content: string;

    constructor(position: Coordinates, {crs, content}: LabelFeatureParams) {
        super(position, {crs});

        this._content = content;
    }

    get content(): string { return this._content; }
    set content(value: string) {
        this._content = value;
    }

    projectTo(crs: Crs): PointFeature;
    projectTo(crs: Crs): LabelFeature {
        let projected = this.crs.projectionTo(crs)(this.position);
        return new LabelFeature(projected, {crs: this.crs, content: this.content});
    }
}