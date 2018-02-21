import {Feature, UpdatedEvent} from "../features/Feature";
import {Symbol} from "../symbols/Symbol";
import {MouseEventFlags} from "../EventHandler";
import {Crs} from "../Crs";
import {Render} from "../renders/Render";
import {error} from "../utils/utils";

export type RenderCache = {
    updateTs: number;
    resolution: number;
    crs: Crs;
    renders: Render[];
};

export type VisualFeature = VisualObject<Feature>;

export interface VisualObjectParams<T extends Feature> {
    feature: T;
    symbol: Symbol<T>;
    persistOnMap?: boolean;
    hidden?: boolean;
}

export class VisualObject<T extends Feature> {
    private _feature: T;
    protected _symbol: Symbol<T>;
    private _tempSymbol: Symbol<T>;
    private _updatedHandler: () => void;

    private _hidden: boolean;
    private _rendered: RenderCache | null = null;

    persistOnMap: boolean;

    constructor({feature, symbol, persistOnMap = false, hidden = false}: VisualObjectParams<T>) {
        this._feature = feature;

        this._symbol = symbol;
        this._hidden = hidden;
        this.persistOnMap = persistOnMap;

        this._updatedHandler = () => this.update();
    }

    get symbol(): Symbol<T> { return this._symbol; }
    set symbol(value: Symbol<T>) {
        if (this._symbol === value) return;
        this._symbol = value;
        this.update();
    }

    get tempSymbol(): Symbol<T> { return this._tempSymbol; }
    set tempSymbol(value: Symbol<T>) {
        this._tempSymbol = value;
        this.update();
    }

    get currentSymbol(): Symbol<T> { return this._tempSymbol || this._symbol; }

    get feature(): T { return this._feature; }

    update(): void {
        this._rendered = null;
    }

    render(resolution: number, crs: Crs): Render[] {
        if (this._hidden || !this.currentSymbol) return [];
        if (!this._needToRender(resolution, crs)) return this._rendered.renders;

        this._rendered = {
            resolution: resolution,
            crs: crs,
            renders: this.currentSymbol.renderFunction(this._feature, resolution, crs),
            updateTs: this._feature.updateTs
        };

        if (this._feature.eventFlags !== MouseEventFlags.None) this._rendered.renders.forEach(render => {
            render.listenFor(this._feature.eventFlags, (event) => {
                this._feature.fire(event);
            });
        });

        return this._rendered.renders;
    }

    protected _needToRender(resolution: number, crs: Crs): boolean {
        return !this._rendered
            || this._rendered.resolution !== resolution
            || this._rendered.updateTs !== this._feature.updateTs
            || this._rendered.crs !== crs
            || this._rendered.renders.length === 0;
    }

    setTempSymbol(symbol: Symbol<T>): void {
        this._tempSymbol = symbol;
        this.update();
    }

    clearTempSymbol() {
        this._tempSymbol = null;
        this.update();
    }

    get hidden(): boolean { return this._hidden; }

    hide(): void {
        this._hidden = true;
        this.update();
    }

    show(): void {
        this._hidden = false;
        this.update();
    }

    get originalSymbol(): Symbol<T> { return this._symbol; }

    get isTempSymbolSet(): boolean { return !!this._tempSymbol; }
}
