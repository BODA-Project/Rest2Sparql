/* global d3 */

// Custom script for the Rest2Sparql GUI

// CLASSES =====================================================================

// Cube class (getCubes)
function Cube(cubeName, comment, label) {
    this.cubeName = cubeName;           // e.g. http://code-research.eu/resource/Dataset-173bbc55-68ca-4398-bd28-232415f7db4d
    this.comment = comment;             // e.g. fish_ld_be.xlsx  +  fish_ld_bg.xlsx  +  ...
    this.label = label;                 // e.g. headlessMergedCube
}

// Dimension class (getDimensions)
function Dimension(dimensionName, label, entities) {
    this.dimensionName = dimensionName; // e.g. http://code-research.eu/resource/Country
    this.label = label;                 // e.g. Country
    this.entities = entities;           // list of entities selected
    this.rollup = false;                // to be set later
}

// Measure class (getMeasures)
function Measure(measureName, label, agg) {
    this.measureName = measureName;     // e.g. http://code-research.eu/resource/Euro
    this.label = label;                 // e.g. Euro
    this.agg = agg;                     // e.g. sum
}

// Entity class (getEntities)
function Entity(dimensionName, entityName, label) {
    this.dimensionName = dimensionName; // e.g. http://code-research.eu/resource/Country
    this.entityName = entityName;       // e.g. http://code-research.eu/resource/Entity-1b7500d2-6e12-42f0-a006-f38ae763418f
    this.label = label;                 // e.g. Netherlands
    this.position;                      // x, y or z coordinate (to be set later)
}

// Main namespace

var MAIN = new function () {

    // Constants
    this.COLOR_OVERLAP = "#ea5f5f";

    this.SCALE_LOG = 0;
    this.SCALE_LINEAR = 1;

    // Globas vars
    this.ID = "";
    this.HASH = "";
    this.currentCube;

    // All possible dimensions and measures
    this.availableCubes = [];
    this.availableDimensions = [];
    this.availableMeasures = [];

    // Selected objects for creating a query uri later
    this.xDimensions = [];   // Type: Dimension
    this.yDimensions = [];   // -
    this.zDimensions = [];   // -
    this.measures = [];      // Type: Measure

    // Dimension -> label list
    this.labelMap = {};

    // List of actually used entities (for the visualization only) with stacked dimensions in every entity (if more than one dimension / axis))
    this.entityMap = {};

    // Cache olap results
    this.resultCache = {}; // Map (url: content)

    // Initialization
    $(document).ready(function () {
        MAIN.init();
    });


    // Inits the whole interface
    this.init = function () {

        // TODO

        // Setup wizard
        $('#id_rootWizard').bootstrapWizard({
            onTabClick: function (tab, navigation, index) {
                return false;
            }
        });


    };


    // Returns a string like 71,003,345 (adds points and comma)
    this.formatNumber = function (num, nrDigits) {
        nrDigits = nrDigits === undefined ? 0 : nrDigits; // no digits by default
        // round numbers to X digits
        var roundedNum = Math.round(num * Math.pow(10, nrDigits)) / Math.pow(10, nrDigits);
        return d3.format(",")(roundedNum); // add commas for thousand-steps
    };

    /**
     * Converts a hex color string to rgba(...)
     * @param {string} hex
     * @param {float} opacity
     * @returns {String}
     */
    this.hexToRGBA = function (hex, opacity) {
        hex = hex.replace('#', '');
        var r = parseInt(hex.substring(0, 2), 16);
        var g = parseInt(hex.substring(2, 4), 16);
        var b = parseInt(hex.substring(4, 6), 16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')';
    };

    // String extensions
    if (typeof String.prototype.contains === 'undefined') {
        String.prototype.contains = function (str) {
            return this.indexOf(str) > -1;
        };
    }
    if (typeof String.prototype.startsWith === 'undefined') {
        String.prototype.startsWith = function (str) {
            return this.lastIndexOf(str, 0) === 0;
        };
    }
    if (typeof String.prototype.endsWith === 'undefined') {
        String.prototype.endsWith = function (str) {
            return this.indexOf(str, this.length - str.length) !== -1;
        };
    }

};

// (>'.')>