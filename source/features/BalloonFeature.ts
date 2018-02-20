import {FeatureParams} from "./Feature";
import {Crs} from "../Crs";
import {Coordinates} from "../baseTypes";
import {PointFeature} from "./PointFeature";

export interface BalloonFeatureParams extends FeatureParams {
    content: HTMLElement | string;
    crs: Crs;
}

export class BalloonFeature extends PointFeature {
    private _content: HTMLElement;

    constructor(position: Coordinates, {content, crs}: BalloonFeatureParams) {
        super(position, {crs});

        if (content instanceof HTMLElement) {
            this._content = content;
        } else {
            this._content = this._getNode(content);
        }
    }

    private _getNode(htmlString: string): HTMLElement {
        let div = document.createElement('div');
        div.innerHTML = htmlString;
        if (div.children.length === 1) {
            return <HTMLElement>div.firstChild;
        } else {
            return div;
        }
    }

    get content() { return this._content; }

    projectTo(crs: Crs): PointFeature;
    projectTo(crs: Crs): BalloonFeature {
        let projected = this.crs.projectionTo(crs)(this.position);
        return new BalloonFeature(projected, {crs: this.crs, content: this.content.outerHTML});
    }
}