import {MultiPoint} from "../features/MultiPoint";
import {PointFeature} from "../features/PointFeature";
import {Symbol} from "./Symbol";
import {Render} from "../renders/Render";
import {Crs} from "../Crs";

export class MultiPointSymbol extends Symbol<MultiPoint> {
    pointSymbol: Symbol<PointFeature>;

    constructor(pointSymbol: Symbol<PointFeature>) {
        super();
        this.pointSymbol = pointSymbol;
    }

    renderFunction(feature: MultiPoint, resolution: number, crs: Crs): Render[] {
        let renders = [];
        feature.points.forEach(point => {
            let f = new PointFeature(point, {crs: feature.crs});
            renders = renders.concat(this.pointSymbol.renderFunction(f, resolution, crs));
        });

        return renders;
    }
}