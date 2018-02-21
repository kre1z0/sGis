import {ChangeEvent, Control, ControlParams, EditEvent} from "./Control";
import {StateManager} from "../utils/StateManager";
import {PointEditor} from "./PointEditor";
import {PolyEditor} from "./PolyEditor";
import {PolyTransform} from "./PolyTransform";
import {getGuid} from "../utils/utils";
import {listenDomEvent, removeDomEventListener} from "../utils/domEvent";
import {EditorSymbol} from "../symbols/EditorSymbol";
import {FeaturesAddEvent, FeaturesRemoveEvent} from "../layers/VisualObjectLayer";
import {ISnappingProvider} from "./snapping/ISnappingProvider";
import {sGisClickEvent} from "../commonEvents";
import {Feature} from "../features/Feature";
import {PointFeature} from "../features/PointFeature";
import {Poly} from "../features/Poly";
import {sGisEvent} from "../EventHandler";
import {Contour, Coordinates} from "../baseTypes";
import {Map} from "../Map";
import {SnappingProviderBase} from "./snapping/SnappingProviderBase";
import {emptySnapping} from "./snapping/SnappingMethods";
import {CombinedSnappingProvider} from "./snapping/CombinedSnappingProvider";
import {VisualFeature} from "../visualObjects/VisualObject";

export class FeatureSelectEvent extends sGisEvent {
    static type: string = 'featureSelect';

    readonly feature: Feature;

    constructor(feature: Feature) {
        super(FeatureSelectEvent.type);
        this.feature = feature;
    }
}

export class FeatureDeselectEvent extends sGisEvent {
    static type: string = 'featureDeselect';

    readonly feature: Feature;

    constructor(feature: Feature) {
        super(FeatureDeselectEvent.type);
        this.feature = feature;
    }
}

export class FeatureRemoveEvent extends sGisEvent {
    static type: string = 'featureRemove';

    readonly feature: Feature;

    constructor(feature: Feature) {
        super(FeatureRemoveEvent.type);
        this.feature = feature;
    }
}

type EditState = {
    feature: VisualFeature,
    coordinates: Coordinates | Contour[] | null
}

const modes = ['vertex', 'rotate', 'scale', 'drag'];

/**
 * Control for editing points, polylines and polygons. It uses PointEditor, PolyEditor, PolyTransform and Snapping classes for editing corresponding visualObjects.
 * @alias sGis.controls.Editor
 * @example controls/Editor_Control
 */
export class Editor extends Control {
    private _ignoreEvents: boolean;
    private _scaling: boolean;
    private _rotation: boolean;
    private _dragging: boolean;
    private _activeFeature: any = null;

    private _polyTransform: PolyTransform;
    private _polyEditor: PolyEditor;
    private _pointEditor: PointEditor;

    private _states: StateManager;
    private _ns: string;
    private _deselectAllowed = true;
    private _vertexEditing: boolean;

    /**
     * If set to true the feature will be deleted in one of two cases:<br>
     *     1) User removes last point of polyline or polygon.
     *     2) User presses "del" button
     */
    allowDeletion = true;

    /**
     * @param map - map object the control will work with
     * @param options - key-value set of properties to be set to the instance
     */
    constructor(map: Map, {snappingProvider = null, isActive = false, activeLayer = null}: ControlParams = {}) {
        super(map, {snappingProvider, activeLayer});

        this._ns = '.' + getGuid();
        this._setListener = this._setListener.bind(this);
        this._removeListener = this._removeListener.bind(this);
        this._onEdit = this._onEdit.bind(this);
        this._setEditors();

        this._states = new StateManager();

        this._deselect = this._deselect.bind(this);
        this.setMode(modes);

        this._handleFeatureAdd = this._handleFeatureAdd.bind(this);
        this._handleFeatureRemove = this._handleFeatureRemove.bind(this);

        this._handleKeyDown = this._handleKeyDown.bind(this);

        this.isActive = isActive;
    }

    private _setEditors(): void {
        this._pointEditor = new PointEditor(this.map, {snappingProvider: this.snappingProvider, activeLayer: this.activeLayer});
        this._pointEditor.on(EditEvent.type, this._onEdit);


        this._polyEditor = new PolyEditor(this.map, {snappingProvider: this._getPolyEditorSnappingProvider(), onFeatureRemove: this._delete.bind(this), activeLayer: this.activeLayer});
        this._polyEditor.on(EditEvent.type, this._onEdit);
        this._polyEditor.on(ChangeEvent.type, this._updateTransformControl.bind(this));

        this._polyTransform = new PolyTransform(this.map);
        this._polyTransform.on('rotationEnd scalingEnd', this._onEdit);
    }

    setSnappingProvider(provider: ISnappingProvider) {
        this.snappingProvider = provider;
        if (this._pointEditor) this._pointEditor.snappingProvider = provider;
        if (this._polyEditor) this._polyEditor.snappingProvider = this._getPolyEditorSnappingProvider();
    }

    private _getPolyEditorSnappingProvider() {
        if (!this.snappingProvider) return null;

        const result = this.snappingProvider.clone();
        if (result instanceof SnappingProviderBase) {
            result.snappingMethods = result.snappingMethods.concat([emptySnapping]);
        } else if (result instanceof CombinedSnappingProvider) {
            result.providers.forEach(child => {
                if (child instanceof SnappingProviderBase) {
                    child.snappingMethods = child.snappingMethods.concat([emptySnapping]);
                }
            });
        }

        return result;
    }

    private _onEdit(): void {
        this.fire('edit');
        this._saveState();
    }

    protected _activate(): void {
        if (!this.activeLayer) return;
        this.activeLayer.visualObjects.forEach(this._setListener, this);
        this.activeLayer.on(FeaturesAddEvent.type, this._handleFeatureAdd);
        this.activeLayer.on(FeaturesRemoveEvent.type, this._handleFeatureRemove);
        this.activeLayer.redraw();
        this.map.on(sGisClickEvent.type, this._onMapClick.bind(this));

        listenDomEvent(document, 'keydown', this._handleKeyDown);
    }

    private _handleFeatureAdd(event: FeaturesAddEvent): void {
        event.visualObjects.forEach(this._setListener);
    }

    private _handleFeatureRemove(event: FeaturesRemoveEvent): void {
        event.visualObjects.forEach(this._removeListener);
    }

    private _setListener(visualObject: VisualFeature): void {
        visualObject.feature.on(sGisClickEvent.type + this._ns, this._handleFeatureClick.bind(this, visualObject));
    }

    private _removeListener(visualObject: VisualFeature): void {
        visualObject.feature.off(sGisClickEvent.type + this._ns);
    }

    private _onMapClick(): void {
        if (!this.ignoreEvents) this._deselect();
    }

    protected _deactivate(): void {
        this._deselect();
        this.activeLayer.visualObjects.forEach(this._removeListener, this);
        this.activeLayer.off('featureAdd', this._handleFeatureAdd);
        this.activeLayer.off('featureRemove', this._handleFeatureRemove);
        this.map.off('click', this._deselect);

        removeDomEventListener(document, 'keydown', this._handleKeyDown);
    }

    select(object: VisualFeature) { this.activeObject = object; }

    /**
     * Clears selection if any.
     */
    deselect(): void { this.activeObject = null; }

    /**
     * Currently selected for editing feature.
     */
    get activeObject(): VisualFeature { return this._activeFeature; }
    set activeObject(object: VisualFeature) {
        if (object) this.activate();
        this._select(object);
    }

    private _handleFeatureClick(visualObject: VisualFeature, event: sGisClickEvent): void {
        if (this.ignoreEvents) return;
        event.stopPropagation();
        this._select(visualObject);
    }

    private _select(visualObject: VisualFeature): void {
        if (this._activeFeature === visualObject) return;
        this._deselect();

        this._activeFeature = visualObject;
        if (!visualObject) return;

        visualObject.tempSymbol = new EditorSymbol({ baseSymbol: visualObject.symbol });
        if (visualObject.feature instanceof PointFeature) {
            this._pointEditor.activeLayer = this.activeLayer;
            this._pointEditor.activeFeature = visualObject.feature;
        } else if (visualObject.feature instanceof Poly) {
            this._activatePolyControls(visualObject.feature);
        }
        this.activeLayer.redraw();

        this._saveState();

        this.fire(new FeatureSelectEvent(visualObject.feature));
    }

    private _activatePolyControls(feature: Poly): void {
        this._polyEditor.featureDragAllowed = this._dragging;
        this._polyEditor.vertexChangeAllowed = this._vertexEditing;
        this._polyEditor.activeLayer = this.activeLayer;
        this._polyEditor.activeFeature = feature;

        this._polyTransform.enableRotation = this._rotation;
        this._polyTransform.enableScaling = this._scaling;
        this._polyTransform.activeLayer = this.activeLayer;
        this._polyTransform.activeFeature = feature
    }

    private _deselect(): void {
        if (!this._activeFeature || !this._deselectAllowed) return;

        this._pointEditor.deactivate();
        this._polyEditor.deactivate();
        this._polyTransform.deactivate();

        let feature = this._activeFeature;

        this._activeFeature.tempSymbol = null;
        this._activeFeature = null;
        this.activeLayer.redraw();

        this.fire(new FeatureDeselectEvent(feature));
    }

    private _updateTransformControl(): void {
        if (this._polyTransform.isActive) this._polyTransform.update();
    }

    /**
     * Sets the editing mode. Available modes are:<br>
     *     * vertex - editing vertexes of polygons and polylines.
     *     * rotate - rotation of polygons and polylines
     *     * drag - dragging of whole visualObjects
     *     * scale - scaling of polygons and polylines
     *     * all - all modes are active
     * @param mode - can be coma separated list or array of mode names
     */
    setMode(mode: string | string[]): void {
        if (mode === 'all') mode = modes;
        if (!Array.isArray(mode)) mode = mode.split(',').map(x => x.trim());

        this._vertexEditing = mode.indexOf('vertex') >= 0;
        this._rotation = mode.indexOf('rotate') >= 0;
        this._dragging = mode.indexOf('drag') >= 0;
        this._scaling = mode.indexOf('scale') >= 0;

        if (this._activeFeature && this._activeFeature.rings) {
            this._polyEditor.deactivate();
            this._polyTransform.deactivate();
            this._activatePolyControls(this._activeFeature);
        }
    }

    /**
     * If deselecting was prohibited, this methods turns it on again.
     */
    allowDeselect(): void { this._deselectAllowed = true; }

    /**
     * Prevents feature to be deselected by any user or code interaction. It will not have effect if the control is deactivated though.
     */
    prohibitDeselect(): void { this._deselectAllowed = false; }

    private _delete(): void {
        if (this._deselectAllowed && this.allowDeletion && this._activeFeature) {
            let feature = this._activeFeature;
            this.prohibitEvent(FeatureDeselectEvent.type);
            this._deselect();
            this.allowEvent(FeatureDeselectEvent.type);
            this.activeLayer.remove(feature);

            this._saveState();
            this.fire(new FeatureRemoveEvent(feature));
        }
    }

    private _handleKeyDown(event: KeyboardEvent): boolean {
        switch (event.which) {
            case 27: this._deselect(); return false; // esc
            case 46: this._delete(); return false; // del
            case 90: if (event.ctrlKey) { this.undo(); return false; } break; // ctrl+z
            case 89: if (event.ctrlKey) { this.redo(); return false; } break; // ctrl+y
        }
    }

    private _saveState(): void {
        this._states.setState({ feature: this._activeFeature, coordinates: this._activeFeature && this._activeFeature.coordinates });
    }

    /**
     * Undo last change.
     */
    undo(): void {
        this._setState(this._states.undo());
    }

    /**
     * Redo a change that was undone.
     */
    redo(): void {
        this._setState(this._states.redo());
    }

    private _setState(state: EditState) {
        if (!state) return this._deselect();

        if (!state.coordinates && this.activeLayer.visualObjects.indexOf(state.feature) >= 0) {
            this.activeObject = null;
            this.activeLayer.remove(state.feature);
        } else if (state.coordinates && this.activeLayer.visualObjects.indexOf(state.feature) < 0) {
            this._setCoordinates(state);
            this.activeLayer.add(state.feature);
            this.activeObject = state.feature;
        } else if (state.coordinates) {
            this._setCoordinates(state);
            this.activeObject = state.feature;
        }

        this._updateTransformControl();
        this.activeLayer.redraw();
    }

    private _setCoordinates(state: EditState): void {
        if (state.feature instanceof PointFeature) {
            state.feature.position = <Coordinates>state.coordinates;
        } else if (state.feature instanceof Poly) {
            state.feature.coordinates = <Contour[]>state.coordinates;
        }
    }

    get ignoreEvents(): boolean { return this._ignoreEvents; }
    set ignoreEvents(bool: boolean) {
        this._ignoreEvents = bool;
        this._pointEditor.ignoreEvents = bool;
        this._polyEditor.ignoreEvents = bool;
        this._polyTransform.ignoreEvents = bool;
    }

    get pointEditor(): PointEditor { return this._pointEditor; }
    get polyEditor(): PolyEditor { return this._polyEditor; }
    get polyTransform(): PolyTransform { return this._polyTransform; }
}
