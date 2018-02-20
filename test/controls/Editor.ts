import "jest";
import {Map} from "../../source/Map";
import {VisualObjectLayer} from "../../source/layers/VisualObjectLayer";
import {PointFeature} from "../../source/features/PointFeature";
import {Editor} from "../../source/controls/Editor";

describe('Editor Control', () => {

    let map, layer, features, control;

    beforeEach(() => {
        map = new Map();
        layer = new VisualObjectLayer();
        map.addLayer(layer);

        features = [];
        for (let i = 0; i < 5; i++) {
            features.push(new PointFeature([i, i]));
        }

        control = new Editor(map);
    });

    it('should select clicked feature in the active layer', () => {
        layer.add(features);
        control.activeLayer = layer;
        control.activate();

        expect(control.activeFeature).toBe(null);

        features[0].fire('click');
        expect(control.activeFeature).toBe(features[0]);

        features[1].fire('click');
        expect(control.activeFeature).toBe(features[1]);
    });

    it('should listen for added visualObjects', () => {
        layer.add(features[0]);
        control.activeLayer = layer;
        control.activate();

        layer.add(features[1]);
        features[1].fire('click');
        expect(control.activeFeature).toBe(features[1]);

        layer.add([features[2], features[3]]);
        features[3].fire('click');
        expect(control.activeFeature).toBe(features[3]);

        layer.visualObjects = features;
        features[4].fire('click');
        expect(control.activeFeature).toBe(features[4]);
    });

    it('should remove listeners from removed visualObjects', () => {
        layer.add(features);
        control.activeLayer = layer;
        control.activate();

        layer.remove(features[0]);
        features[0].fire('click');
        expect(control.activeFeature).toBe(null);
        expect(features[0].hasListeners('click')).toBe(false);

        layer.remove([features[1], features[2]]);
        features[2].fire('click');
        expect(control.activeFeature).toBe(null);

        layer.visualObjects = [];
        features[3].fire('click');
        expect(control.activeFeature).toBe(null);
    });

});