/// Template: "full_screen_map.html"
/// Title: "Polygon creation control"

import {init} from "../../../source/init";
import {TileLayer} from "../../../source/layers/TileLayer";
import {VisualObjectLayer} from "../../../source/layers/VisualObjectLayer";
import {DrawingFinishEvent} from "../../../source/controls/Control";
import {geo} from "../../../source/Crs";
import {PolygonControl} from "../../../source/controls/PolygonControl";
import {PolygonSymbol} from "../../../source/symbols/polygon/Simple";

let layer = new VisualObjectLayer();

let {map} = init({
    wrapper: document.body,
    layers: [new TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png'), layer]
});

let control = new PolygonControl(map, {activeLayer: layer, symbol: getSymbol()});

control.on(DrawingFinishEvent.type, ({feature}) => {
    console.log(feature.projectTo(geo).rings);
    control.symbol = getSymbol();
});

control.activate();

function getSymbol() {
    return new PolygonSymbol({strokeWidth: 2, strokeColor: getRandomColor(), fillColor: getRandomColor()});
}

function getRandomColor() {
    return '#' + ('000000' + Math.floor(Math.random() * 255 * 255 * 255).toString(16)).slice(-6);
}
