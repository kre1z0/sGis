sGis.module('render.HtmlElement', [
], () => {
    
    'use strict';

    /**
     * Custom HTML element on the map.
     * @alias sGis.render.HtmlElement
     * @implements sGis.IRender
     */
    class HtmlElement {
        /**
         * @constructor
         * @param {String} htmlText - the inner html value of html element
         * @param {Position} position - projected position of render in [x, y] format
         * @param {Function} [onAfterDisplayed] - callback function that will be called after a render node is drawn to the DOM
         * @param offset
         */
        constructor(htmlText, position, onAfterDisplayed, offset) {
            this._htmlText = htmlText;
            this._position = position;
            this.onAfterDisplayed = onAfterDisplayed;
            this.offset = offset;
        }

        static get isVector() { return false; }

        /**
         * Returns HTML div element as the second parameter to callback function 
         * @param {Function} callback - callback function that will be called after node is ready
         */
        getNode(callback) {
            var node = document.createElement('div');
            node.innerHTML = this._htmlText;
            this._lastNode = node;
            callback(null, node);
        }

        /**
         * Position of the render in [x, y] format
         * @type Position
         * @readonly
         */
        get position() { return this._position; }

        contains(position) {
            var width = this._lastNode.clientWidth || this._lastNode.offsetWidth || 0;
            var height = this._lastNode.clientHeight || this._lastNode.offsetHeight || 0;
            
            return this._position[0] < position.x && this._position[1] < position.y && this._position[0] + width > position.x && this._position[1] + height > position.y;
        }
    }

    return HtmlElement;

});