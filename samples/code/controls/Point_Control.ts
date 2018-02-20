/// Template: "full_screen_map.html"
/// Title: "Point creation control"

import {init} from "../../../source/init";
import {TileLayer} from "../../../source/layers/TileLayer";
import {VisualObjectLayer} from "../../../source/layers/VisualObjectLayer";
import {PointControl} from "../../../source/controls/PointControl";
import {MaskedImage} from "../../../source/symbols/point/MaskedImage";
import {DrawingFinishEvent} from "../../../source/controls/Control";
import {geo} from "../../../source/Crs";

let layer = new VisualObjectLayer();

let {map} = init({
    wrapper: document.body,
    layers: [new TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png'), layer]
});

let control = new PointControl(map, {activeLayer: layer, symbol: getSymbol()});

control.on(DrawingFinishEvent.type, ({feature}) => {
    console.log(feature.projectTo(geo).position);
    control.symbol = getSymbol();
});

control.activate();

function getSymbol() {
    return new MaskedImage({maskColor: getRandomColor()});
}

function getRandomColor() {
    return '#' + ('000000' + Math.floor(Math.random() * 255 * 255 * 255).toString(16)).slice(-6);
}
