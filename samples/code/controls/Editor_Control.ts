/// Template: "full_screen_map.html"
/// Title: "Feature editor control"

import {init} from "../../../source/init";
import {TileLayer} from "../../../source/layers/TileLayer";
import {VisualObjectLayer} from "../../../source/layers/VisualObjectLayer";
import {PointObject} from "../../../source/visualObjects/PointObject";
import {DynamicImageSymbol} from "../../../source/symbols/point/DynamicImageSymbol";
import {PolylineObject} from "../../../source/visualObjects/PolylineObject";
import {PolygonObject} from "../../../source/visualObjects/PolygonObject";
import {Editor} from "../../../source/controls/Editor";
import {StaticImageSymbol} from "../../../source/symbols/point/StaticImageSymbol";

let layer = new VisualObjectLayer();

let {map} = init({
    wrapper: document.body,
    layers: [new TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png'), layer]
});

let step = map.resolution * 50;

layer.add([
    new PointObject([map.position[0], map.position[1]], {crs: map.crs, symbol: new DynamicImageSymbol()}),
    new PointObject([map.position[0], map.position[1] + step], {crs: map.crs, symbol: new StaticImageSymbol()}),
    new PolylineObject([[
        [map.position[0] + step, map.position[1]],
        [map.position[0] + step*2, map.position[1] + step]
    ]], {crs: map.crs}),
    new PolygonObject([[
        [map.position[0] - step, map.position[1]],
        [map.position[0] - step * 2, map.position[1]],
        [map.position[0] - step * 2, map.position[1] + step]
    ]], {crs: map.crs})
]);


let control = new Editor(map, {activeLayer: layer});
control.activate();

