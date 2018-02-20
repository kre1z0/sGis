import {Control, ControlParams, DrawingBeginEvent, DrawingFinishEvent} from "./Control";
import {PolygonSymbol} from "../symbols/polygon/Simple";
import {Polygon} from "../features/Polygon";
import {Map} from "../Map";
import {Symbol} from "../symbols/Symbol";
import {Contour} from "../baseTypes";
import {Point} from "../Point";
import {DragEndEvent, DragEvent, DragStartEvent} from "../commonEvents";
import {PolygonObject} from "../visualObjects/PolygonObject";

export interface PolyDragParams extends ControlParams {
    symbol?: Symbol<Polygon>;
}

/**
 * Base class for controls that create polygon feature by dragging some area on the map. When the control is activated,
 * a new temporary layer is created and added to the map. The feature is drawn on that temp layer. After drawing is
 * finished, if the .activeLayer property is set, the feature is moved to the active layer.
 * @alias sGis.controls.PolyDrag
 * @fires [[DrawingBeginEvent]]
 * @fires [[DrawingFinishEvent]]
 */
export abstract class PolyDrag extends Control {
    /**
     * Symbol that will be used for visualObjects created by this control.
     */
    symbol: Symbol<Polygon>;
    protected _activeObject: PolygonObject | null;

    /**
     * @param map - map the control will work with
     * @param __namedParameters - key-value set of properties to be set to the instance
     */
    constructor(map: Map, {symbol = new PolygonSymbol(), activeLayer = null, isActive = false}: PolyDragParams = {}) {
        super(map, {activeLayer, useTempLayer: true});

        this.symbol = symbol;

        this._handleDragStart = this._handleDragStart.bind(this);
        this._handleDrag = this._handleDrag.bind(this);
        this._handleDragEnd = this._handleDragEnd.bind(this);

        this.isActive = isActive;
    }

    protected _activate(): void {
        this.map.on(DragStartEvent.type, this._handleDragStart);
    }

    protected _deactivate(): void {
        this._activeObject = null;
        this._removeDragListeners();
        this.map.off(DragStartEvent.type, this._handleDragStart);
    }

    private _handleDragStart(event: DragStartEvent): void {
        this._activeObject = new PolygonObject(this._getNewCoordinates(event.point), {crs: event.point.crs, symbol: this.symbol});
        this._tempLayer.add(this._activeObject);

        this.map.on(DragEvent.type, this._handleDrag);
        this.map.on(DragEndEvent.type, this._handleDragEnd);

        this.fire(new DrawingBeginEvent());
    }

    private _handleDrag(event: DragEvent): void {
        this._activeObject.feature.rings = this._getUpdatedCoordinates(event.point);

        this._tempLayer.redraw();
        event.stopPropagation();
    }

    private _handleDragEnd(event: DragEndEvent): void {
        let object = this._activeObject;
        this._activeObject = null;
        if (this._tempLayer && this._tempLayer.has(object)) {
            this._tempLayer.remove(object);
        }
        this._removeDragListeners();

        if (this.activeLayer) this.activeLayer.add(object);
        this.fire(new DrawingFinishEvent(object.feature, event.browserEvent));
    }

    private _removeDragListeners(): void {
        this.map.off(DragEvent.type, this._handleDrag);
        this.map.off(DragEndEvent.type, this._handleDragEnd);
    }

    /**
     * This method is called when a new feature is started. Returns coordinates set for the new feature based on where the drawing has started.
     * @param point - position of the new feature.
     */
    protected abstract _getNewCoordinates(point: Point): Contour[];

    /**
     * This method is called when the coordinates of the active feature must be updated. Returns new coordinates of the feature.
     * @param point
     */
    protected abstract _getUpdatedCoordinates(point: Point): Contour[];

    /**
     * The feature being drawn.
     */
    get activeFeature(): Polygon { return this._activeObject.feature; }
}
