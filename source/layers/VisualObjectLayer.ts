import {Layer, LayerConstructorParams} from "./Layer";
import {error} from "../utils/utils";
import {Bbox} from "../Bbox";
import {sGisEvent} from "../EventHandler";
import {Render} from "../renders/Render";
import {StaticImageRender} from "../renders/StaticImageRender";
import {VisualFeature} from "../visualObjects/VisualObject";

export interface VisualObjectLayerParams extends LayerConstructorParams {
    visualObjects?: VisualFeature[]
}

/**
 * New visualObjects are added to the feature layer
 * @event FeaturesAddEvent
 */
export class FeaturesAddEvent extends sGisEvent {
    static type: string = 'featuresAdd';

    /**
     * Array of visualObjects that were added
     */
    readonly visualObjects: VisualFeature[];

    constructor(features: VisualFeature[]) {
        super(FeaturesAddEvent.type);
        this.visualObjects = features;
    }
}

/**
 * Some visualObjects were removed from the feature layer
 * @event FeaturesRemoveEvent
 */
export class FeaturesRemoveEvent extends sGisEvent {
    static type: string = 'featuresRemove';

    /**
     * Array of visualObjects that were removed
     */
    readonly visualObjects: VisualFeature[];

    constructor(features: VisualFeature[]) {
        super(FeaturesRemoveEvent.type);
        this.visualObjects = features;
    }
}

/**
 * A layer that contains arbitrary set of visualObjects.
 * @alias sGis.VisualObjectLayer
 */
export class VisualObjectLayer extends Layer {
    private _visualObjects: VisualFeature[];

    /**
     * @param __namedParameters - properties to be set to the corresponding fields.
     * @param extensions - [JS ONLY]additional properties to be copied to the created instance.
     */
    constructor({delayedUpdate = true, visualObjects = [], ...layerParams}: VisualObjectLayerParams = {}, extensions?: Object) {
        super({delayedUpdate, ...layerParams}, extensions);
        this._visualObjects = visualObjects;
    }

    getRenders(bbox: Bbox, resolution: number): Render[] {
        let renders = [];
        this.getFeatures(bbox, resolution).forEach(feature => {
            renders = renders.concat(feature.render(resolution, bbox.crs));
            renders.forEach(render => {
                if (render instanceof StaticImageRender) {
                    render.onLoad = () => {
                        this.redraw();
                    }
                }
            });
        });

        return renders;
    }

    getFeatures(bbox: Bbox, resolution: number): VisualFeature[] {
        if (!this.checkVisibility(resolution)) return [];

        return this._visualObjects.filter(visualObject => visualObject.feature.crs.canProjectTo(bbox.crs) &&
            (visualObject.persistOnMap || visualObject.feature.bbox.intersects(bbox)))
    }

    /**
     * Adds a feature or an array of visualObjects to the layer.
     * @param features - visualObjects to add.
     * @throws if one of the visualObjects is already in the layer.
     * @fires FeaturesAddEvent
     */
    add(features: VisualFeature | VisualFeature[]): void {
        const toAdd = Array.isArray(features) ? features : [features];
        if (toAdd.length === 0) return;
        toAdd.forEach(f => {
            if (this._visualObjects.indexOf(f) !== -1) error(new Error(`Feature ${f} is already in the layer`));
        });
        this._visualObjects = this._visualObjects.concat(toAdd);
        this.fire(new FeaturesAddEvent(toAdd));
        this.redraw();
    }

    /**
     * Removes a feature or an array of visualObjects from the layer.
     * @param features - feature or visualObjects to be removed.
     * @throws if the one of the visualObjects is not in the layer.
     * @fires [[FeaturesRemoveEvent]]
     */
    remove(features: VisualFeature | VisualFeature[]): void {
        const toRemove = Array.isArray(features) ? features : [features];
        if (toRemove.length === 0) return;
        toRemove.forEach(f => {
            let index = this._visualObjects.indexOf(f);
            if (index === -1) error(new Error(`Feature ${f} is not in the layer`));
            this._visualObjects.splice(index, 1);
        });
        this.fire(new FeaturesRemoveEvent(toRemove));
        this.redraw();
    }

    /**
     * Returns true if the given feature is in the layer.
     * @param feature
     */
    has(feature: VisualFeature): boolean {
        return this._visualObjects.indexOf(feature) !== -1;
    }

    /**
     * Moves the given feature to the top of the layer (end of the list). If the feature is not in the layer, the command is ignored.
     * @param feature
     */
    moveToTop(feature: VisualFeature): void {
        let index = this._visualObjects.indexOf(feature);
        if (index !== -1) {
            this._visualObjects.splice(index, 1);
            this._visualObjects.push(feature);
            this.redraw();
        }
    }

    /**
     * List of visualObjects in the layer. If assigned, it removes all visualObjects and add new ones, firing all the respective events.
     * @fires [[FeaturesAddEvent]]
     * @fires [[FeaturesRemoveEvent]]
     */
    get visualObjects(): VisualFeature[] {
        return this._visualObjects;
    }
    set visualObjects(features: VisualFeature[]) {
        const currFeatures = this._visualObjects;
        this._visualObjects = [];
        this.fire(new FeaturesRemoveEvent(currFeatures));
        this.add(features);

        this.redraw();
    }
}
