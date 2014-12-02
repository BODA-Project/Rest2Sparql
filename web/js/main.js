// Custom script for the Rest2Sparql GUI

//var cubeList = {};
//var dimensionList = {};
//var measureList = {};

// Globas vars
var ID = "";
var HASH = "";
var currentCube = "";
var entitiyList = {};

// TODO complete global cube class -> all dimensions -> all entities and measures -> ...

// Selected objects
var xDimensions = [];   // Type: Dimension
var yDimensions = [];   // -
var zDimensions = [];   // -
var measures = [];      // Type: Measure
var filters = [];       // Type: Filter

// Three.js variables
var scene;
var camera;
var renderer;
var controls;
var lighting;
var animationRequest;

// For interaction with 3D objects
var octree;
var intersected;
var mouseDown = {};

// URL Templates
var CUBE_URL = "./backend?func=<getCubes>&id=<__id__>&hash=<__hash__>";
var DIMENSION_URL = "./backend?func=<getDimensions>&c=<__cube__>&id=<__id__>&hash=<__hash__>";
var MEASURE_URL = "./backend?func=<getMeasures>&c=<__cube__>&id=<__id__>&hash=<__hash__>";
var ENTITY_URL = "./backend?func=<getEntities>&c=<__cube__>&d=<__dimension__>&id=<__id__>&hash=<__hash__>";

var EXECUTE_URL = "./backend?func=<execute>&c=<__cube__>,select=<false>&id=<__id__>&hash=<__hash__>";

var DIMENSION_PART_URL = "&d=<__dimension__>,select=<true>,group=<true>";
var DIMENSION_FIX_PART_URL = ",fix=<__fix__>";
var MEASURE_PART_URL = "&m=<__measure__>,select=<true>,group=<false>,agg=<__agg__>";

var FILTER_DIMENSION_PART_URL = "&d=<__dimension__>,select=<false>,group=<false>,fix=<__fix__>";
var FILTER_MEASURE_PART_URL = "&m=<__measure__>,select=<false>,group=<false>,filterR=<__filterR__>,filterV=<__filterV__>";

var MODAL_DIMENSION_TEMPLATE = '<div class="modal fade" id="id_modal"> <div class="modal-dialog modal-lg"> <div class="modal-content"> <div class="modal-header"> <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button> <h4 class="modal-title">Choose Entities for Dimension: &lt;__label__&gt;<br>select all | select none (todo)</h4> </div> <div class="modal-body" id="id_modalBody"></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button><button type="button" class="btn btn-primary" data-dismiss="modal" id="id_modalOkay">Okay</button></div></div></div></div>';
//var MODAL_DIMENSION_TEMPLATE = '<div class="modal fade" id="id_modal"> <div class="modal-dialog"> <div class="modal-content"> <div class="modal-header"> <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button> <h4 class="modal-title">Choose Entities for Dimension: &lt;__label__&gt;</h4> </div> <div class="modal-body" id="id_modalBody"></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button><button type="button" class="btn btn-primary" data-dismiss="modal" id="id_modalOkay">Okay</button></div></div></div></div>';

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
}

// Filter class, either for dimension or measures
function Filter(dimension, measure) {

}



// AJAX TESTS Queries
var testQuery1_getCubes = "./backend?func=<getCubes>&id=<8023903>&hash=<7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc>";
var testQuery2_old = "./backend?func=<execute>&id=<8023903>&hash=<7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc>&m=<http://code-research.eu/resource/Euro>,select=<true>,group=<false>,order=<-1>&d=<http://code-research.eu/resource/Country>,select=<true>,group=<false>,order=<-1>&d=<http://code-research.eu/resource/Species>,select=<false>,group=<false>,order=<-1>,fix=<http://code-research.eu/resource/Entity-279a95fa-ecb7-4ed3-9a1d-c250c6d1acd9>&d=<http://code-research.eu/resource/Year>,select=<true>,group=<false>,order=<-1>&c=<http://code-research.eu/resource/Dataset-173bbc55-68ca-4398-bd28-232415f7db4d>,select=<true>";
var testQuery3_getDimensions = "./backend?func=%3CgetDimensions%3E&c=%3Chttp://code-research.eu/resource/Dataset-173bbc55-68ca-4398-bd28-232415f7db4d%3E&id=%3C8023903%3E&hash=%3C7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc%3E";
var testQuery4_agg_1d = "./backend?func=%3Cexecute%3E&id=%3C8023903%3E&hash=%3C7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc%3E&d=%3Chttp://code-research.eu/resource/Country%3E,select=%3Ctrue%3E,group=%3Ctrue%3E,order=%3C-1%3E&d=%3Chttp://code-research.eu/resource/Species%3E,select=%3Cfalse%3E,group=%3Cfalse%3E,order=%3C-1%3E&d=%3Chttp://code-research.eu/resource/Year%3E,select=%3Cfalse%3E,group=%3Cfalse%3E,order=%3C-1%3E&m=%3Chttp://code-research.eu/resource/Euro%3E,select=%3Ctrue%3E,group=%3Cfalse%3E,order=%3C-1%3E,agg=%3Csum%3E&c=%3Chttp://code-research.eu/resource/Dataset-173bbc55-68ca-4398-bd28-232415f7db4d%3E,select=%3Cfalse%3E";
var testQuery5_agg_2d = "./backend?func=%3Cexecute%3E&id=%3C8023903%3E&hash=%3C7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc%3E&d=%3Chttp://code-research.eu/resource/Country%3E,select=%3Ctrue%3E,group=%3Ctrue%3E,order=%3C-1%3E&d=%3Chttp://code-research.eu/resource/Species%3E,select=%3Cfalse%3E,group=%3Cfalse%3E,order=%3C-1%3E&d=%3Chttp://code-research.eu/resource/Year%3E,select=%3Ctrue%3E,group=%3Ctrue%3E,order=%3C-1%3E&m=%3Chttp://code-research.eu/resource/Euro%3E,select=%3Ctrue%3E,group=%3Cfalse%3E,order=%3C-1%3E,agg=%3Csum%3E&c=%3Chttp://code-research.eu/resource/Dataset-173bbc55-68ca-4398-bd28-232415f7db4d%3E,select=%3Cfalse%3E";
var testQuery6_agg_3d = "./backend?func=%3Cexecute%3E&id=%3C8023903%3E&hash=%3C7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc%3E&d=%3Chttp://code-research.eu/resource/Country%3E,select=%3Ctrue%3E,group=%3Ctrue%3E,order=%3C-1%3E&d=%3Chttp://code-research.eu/resource/Species%3E,select=%3Ctrue%3E,group=%3Ctrue%3E,order=%3C-1%3E,fix=%3Chttp://code-research.eu/resource/Entity-23c3225d-ac7a-40a3-80de-a10ff10a7428,http://code-research.eu/resource/Entity-02de3c11-3f45-448d-b458-8db3534fedc6,http://code-research.eu/resource/Entity-02a8e8de-ad5c-4922-9775-5083e116a37f,http://code-research.eu/resource/Entity-dca07aa6-098e-4bb8-98f4-19d10335b9fa,http://code-research.eu/resource/Entity-25563186-cefe-45a8-a5ff-340c6e908124,http://code-research.eu/resource/Entity-246eacbc-86f1-414e-a0eb-3b80da81c917,http://code-research.eu/resource/Entity-2dcec751-567a-42d7-b0d1-9da463c5a7c2%3E&d=%3Chttp://code-research.eu/resource/Year%3E,select=%3Ctrue%3E,group=%3Ctrue%3E,order=%3C-1%3E&m=%3Chttp://code-research.eu/resource/Euro%3E,select=%3Ctrue%3E,group=%3Cfalse%3E,order=%3C-1%3E,agg=%3Csum%3E&c=%3Chttp://code-research.eu/resource/Dataset-173bbc55-68ca-4398-bd28-232415f7db4d%3E,select=%3Cfalse%3E";
var testQuery7_all_facts = "./backend?func=%3Cexecute%3E&id=%3C8023903%3E&hash=%3C7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc%3E&m=%3Chttp://code-research.eu/resource/Euro%3E,select=%3Ctrue%3E,group=%3Cfalse%3E,order=%3C-1%3E,agg=%3Csum%3E&d=%3Chttp://code-research.eu/resource/Species%3E,select=%3Ctrue%3E,group=%3Ctrue%3E,order=%3C-1%3E&d=%3Chttp://code-research.eu/resource/Country%3E,select=%3Ctrue%3E,group=%3Ctrue%3E,order=%3C-1%3E&d=%3Chttp://code-research.eu/resource/Year%3E,select=%3Ctrue%3E,group=%3Ctrue%3E,order=%3C-1%3E&c=%3Chttp://code-research.eu/resource/Dataset-173bbc55-68ca-4398-bd28-232415f7db4d%3E,select=%3Cfalse%3E";
var testQuery8_test = "./backend?func=<execute>&c=<http://code-research.eu/resource/Dataset-173bbc55-68ca-4398-bd28-232415f7db4d>,select=<false>&id=<8023903>&hash=<7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc>&d=<http://code-research.eu/resource/Country>,select=<true>,group=<true>,fix=<http://code-research.eu/resource/Entity-f36ea72d-9c8b-4c2e-81c8-675d2d613b29,http://code-research.eu/resource/Entity-806e4b72-f41f-48f5-83d3-349e3f20410e,http://code-research.eu/resource/Entity-58724794-f291-4ee3-80ff-32b46948d95b,http://code-research.eu/resource/Entity-0f0335de-1f58-46f4-bae2-bdb413b33410,http://code-research.eu/resource/Entity-6490cd2f-a883-4c66-8312-7cca78218a0f,http://code-research.eu/resource/Entity-a247a5f2-68e8-44da-a704-63fddea89c56,http://code-research.eu/resource/Entity-d970556f-b493-4b98-846d-06e76a321b62,http://code-research.eu/resource/Entity-cd924575-5e31-43e9-a23b-e6df99300e4f,http://code-research.eu/resource/Entity-28509081-1d0e-4b65-b74d-4233be5758e9,http://code-research.eu/resource/Entity-2d2719ec-ee4b-4608-a9dd-5ab3558076ab,http://code-research.eu/resource/Entity-a15344d6-68b0-43c4-b520-d8f4fb4e1719,http://code-research.eu/resource/Entity-7a19c463-b7a5-457b-a532-e1b973b6df00,http://code-research.eu/resource/Entity-c753cd28-967d-400f-a26b-f97a9f62bd0d,http://code-research.eu/resource/Entity-96e4ff5c-095e-4845-a5dc-4d67630e099c,http://code-research.eu/resource/Entity-6bae61ba-200d-4883-b990-0eb8d2009ed5,http://code-research.eu/resource/Entity-80869b46-9704-4b45-9a65-d104b07b5856,http://code-research.eu/resource/Entity-1b7500d2-6e12-42f0-a006-f38ae763418f,http://code-research.eu/resource/Entity-6485f973-7fa2-4696-b132-b1b97e4fb9ee,http://code-research.eu/resource/Entity-b5e33c93-74ff-418a-8c70-0f6024aa38ce,http://code-research.eu/resource/Entity-a2b52514-1fda-4fdd-9a36-413343787622>&d=<http://code-research.eu/resource/Species>,select=<true>,group=<true>,fix=<http://code-research.eu/resource/Entity-876d5090-1d1e-4c35-8e4c-8df5c6a1e8bc,http://code-research.eu/resource/Entity-f8765b24-fdbe-453d-95d5-0c8dd5682204,http://code-research.eu/resource/Entity-488082c9-390c-4c1d-81df-f90d52e30ae5,http://code-research.eu/resource/Entity-b7c6572e-3ba0-4c32-b668-326c4ab5d284,http://code-research.eu/resource/Entity-ecb8502e-1d92-44b3-b595-a918668cf750,http://code-research.eu/resource/Entity-41ae2883-f0a1-4aa2-b93d-facb72fcc4c1,http://code-research.eu/resource/Entity-458b0ae6-706e-4fab-b38b-065f13a498a5,http://code-research.eu/resource/Entity-25563186-cefe-45a8-a5ff-340c6e908124,http://code-research.eu/resource/Entity-825b1100-c375-434e-a2e1-dd3cb3e274c2,http://code-research.eu/resource/Entity-e1ab2fab-93dd-48f1-9b4e-4f567938241f,http://code-research.eu/resource/Entity-4a26dc02-6a66-4426-a9cd-3ef7d14a0927,http://code-research.eu/resource/Entity-069b5fa7-566b-474d-a109-ed1ab59491af,http://code-research.eu/resource/Entity-61d336ef-7f23-4ab4-883d-13020b57c259,http://code-research.eu/resource/Entity-96a1bfb6-0525-40a4-9cd9-2d53ccfa6c63,http://code-research.eu/resource/Entity-3d7d9fdb-aa32-4ebd-b373-305311594bb2,http://code-research.eu/resource/Entity-cd4955cc-ebba-4c17-a281-de7b4ad7c3bf,http://code-research.eu/resource/Entity-f4c70b83-668b-4650-bb3f-8e65d7a90311,http://code-research.eu/resource/Entity-a236243e-3920-421f-92d1-e7e3f530c459,http://code-research.eu/resource/Entity-c4db0260-56b8-49d6-ac52-c57a9adc922a,http://code-research.eu/resource/Entity-f089d4b5-413c-4321-a5ce-6b3bdef8e144>&d=<http://code-research.eu/resource/Year>,select=<true>,group=<true>,fix=<http://code-research.eu/resource/Entity-ba6add0e-2326-4570-9e9b-6a34a69f1a0b,http://code-research.eu/resource/Entity-70333490-1557-4c74-9215-3dedfa1ceb36,http://code-research.eu/resource/Entity-d62ce835-3f59-467e-8bf2-1ab6839d46c2,http://code-research.eu/resource/Entity-ac13007b-7a4c-4787-82cd-907e7219e3db,http://code-research.eu/resource/Entity-2e97ec57-bbe4-403a-a829-f06cd0b9e217,http://code-research.eu/resource/Entity-23ba2426-d022-463d-a7c5-c98979860e24,http://code-research.eu/resource/Entity-3ff13789-6290-4a4b-95c4-0bd27a01bed4,http://code-research.eu/resource/Entity-38e07069-c6ce-4561-8c89-13d523bed01c,http://code-research.eu/resource/Entity-2d641851-cd7d-4639-9fac-0e969039a886,http://code-research.eu/resource/Entity-57c8ffd6-9093-4a22-9a4b-1bda4f52155a,http://code-research.eu/resource/Entity-15c5abb9-14e0-44e7-b03e-f0173f35fe42>&m=<http://code-research.eu/resource/Euro>,select=<true>,group=<false>,agg=<sum>";


// Initialization
$(document).ready(function () {

    // TEST
//    ID = "8023903";
//    HASH = "7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc";

    init();

    // Start rendering TODO: für "loading-screen" ok -> rotierender cube
    resizeVizualisation(); // initially
    animationRequest = requestAnimationFrame(render);

    // TEST
    if (window.location.hash === "#test") {
        visualize(testQuery8_test);
    }

    //<--

});

// Inits the interface and adds listeners
function init() {

    disableInputInitially();

    // add tooltips
//    $('[data-toggle="tooltip"]').tooltip();

    // Add listeners to all interface buttons
    addInterfaceListeners();

    // Setup THREE.JS components
    initThreeJs();

    showLoadingScreen("TEST123...");

    // Resize visualization on browser resize
    $(window).on('resize', resizeVizualisation);

}

function disableInputInitially() {

    // Disable navigation input initially and set conditions of usage
    var opacity = 0.35;
    $("#id_cubePanel").css("opacity", opacity);
    $("#id_dimensionPanel").css("opacity", opacity);
    $("#id_measurePanel").css("opacity", opacity);
    $("#id_filterPanel").css("opacity", opacity);
    $("#id_applyButton").css("opacity", opacity);

//    $("#id_cubePanel").css("display", "none");
//    $("#id_dimensionPanel").css("display", "none");
//    $("#id_measurePanel").css("display", "none");
//    $("#id_filterPanel").css("display", "none");
//    $("#id_filterPanel").css("display", "none");
//    $("#id_applyButton").css("display", "none");

    $("#id_cubePanel button").attr("disabled", "disabled");
    $("#id_dimensionPanel button").attr("disabled", "disabled");
    $("#id_measurePanel button").attr("disabled", "disabled");
    $("#id_filterPanel button").attr("disabled", "disabled");
    $("#id_applyButton").attr("disabled", "disabled");

    $("#id_undoButton").css("opacity", opacity);
    $("#id_redoButton").css("opacity", opacity);
    $("#id_undoButton").attr("disabled", "disabled");
    $("#id_redoButton").attr("disabled", "disabled");
}

// sends the given url and visualizes the results.
// TODO: table vs 3D mode, loading screen, error messages
function visualize(url) {

    // Show a loading screen while waiting
    showLoadingScreen("Loading...");

    var request = $.ajax({
        url: url,
        headers: {
            accept: "application/sparql-results+json"
        }
    });

// TEMP sort result for coordinates in cube
    request.done(function (content) {
//    $("#OUTPUT").append(content);

        var obj = $.parseJSON(content);
        var results = obj.results.bindings; // array
        var head = obj.head; // array TODO reihenfolge, anzahl an measures / dimensions und achsenzuweisung ist bekannt


        // TODO bei rollup keine information über die summierten entities -> aus anfrage schließen -> benennen z.b. "2011, 2012, 2014", (pseudo Entity in die liste)

        // List of used entities
        var entityMap = [];

        // Other vars TODO
        var highestMeasure;
        var lowestMeasure;


        // TODO: erster schritt (1 durchlauf) variablen identifizieren, danach nurnoch "result[x].E_NAME_1_AGG" ...
        var dimensionNumbers = [];
        var measureNumbers = [];
        if (results.length > 0) {
            $.each(results[0], function (key, value) {
                var val = value.value;
                var number;
                if (key.split("_").length > 2) {
                    number = key.split("_")[2];
                }
                if (key.startsWith("V_NAME_")) {
                    // Measure value
                    measureNumbers.push(number); // TODO no numbers, only 'AGG' !?
                } else if (key.startsWith("E_NAME_") && key.endsWith("AGG")) {
                    // Entity name (uri)
                    dimensionNumbers.push(number);
                    entityMap[number] = []; // entry for the dimension
                }
            });
        } else {
            return; // TODO display: "no results"
        }


        // Iterate through results to collect required entities...
        $.each(results, function (index, result) {

            // Iterate through given dimension numbers
            $.each(dimensionNumbers, function (key, number) {
                var entityName = result["E_NAME_" + number].value;              // E_NAME_X
                if (entityMap[number][entityName]) {
                    return true; // continue if already in list
                }
                var label = result["L_NAME_" + number + "_AGG"].value;              // L_NAME_X_AGG
                var dimensionName = result["E_NAME_" + number + "_AGG"].value;      // E_NAME_x_AGG
                var entity = new Entity(dimensionName, entityName, label);
                var index = entityMap[number].length; // next index

                entityMap[number][index] = entity; // add to list
                entityMap[number][entityName] = true; // as flag and to get index easily
//            entityMap[number][entityName] = index.toString(); // as flag and to get index easily
//            return false;
            });

            // Iterate through given measure numbers TODO: fehlende zahlen bei AGG???
            $.each(measureNumbers, function (key, value) {
//            var measure = result["V_NAME_AGG"].value;
//            var measure = result["V_NAME_" + value + "_AGG"].value;   // TODO numbers

                var measure = parseFloat(result["V_NAME_AGG"].value);

                lowestMeasure = (lowestMeasure === undefined || lowestMeasure > measure) ? measure : lowestMeasure;
                highestMeasure = (highestMeasure === undefined || highestMeasure < measure) ? measure : highestMeasure;

            });

        });

        // Compute the center point for the camera too look at
        var centerPoint = [0, 0, 0]; // TODO assumes there is just (xyz)
        $.each(dimensionNumbers, function (key, number) {

            // Sort those entities for the labels and coordinates in the visualization
            entityMap[number].sort(labelCompare);

            // Map name -> index
            $.each(entityMap[number], function (index, entity) {
                var entityName = entity.entityName;
                entityMap[number][entityName] = index;
            });

            centerPoint[key] = entityMap[number].length / 2;

        });

//    console.log("sorted: ", entityMap);
        console.log("lowest measure: ", lowestMeasure, ", highest: " + highestMeasure, ", #results: ", results.length);


        // TODO set labels coordinates (around the cube), problem for 2 dimension per axis -> multiple coordinates, must be calculated...


        // Remove the loading screen and draw the result
        unloadVisualization();

        // Set coordinates for each result
        $.each(results, function (index, result) {

            // DEBUG STOP AFTER 2000 entries, too much data :D
//        if (index > 5000) {
//            return false;
//        }

            var coordinates = [0, 0, 0]; // e.g. (x,y,z) or (x,x,y,zz)
            var measureVals = []; // e.g. (123435, 42)

            // Iterate through given dimension numbers
            $.each(dimensionNumbers, function (key, number) {
                var entityName = result["E_NAME_" + number].value; // E_NAME_X
//            coordinates.push(entityMap[number][entityName]);
                coordinates[key] = entityMap[number][entityName]; // TODO assumes xyz order of results
            });

            // Iterate through given measure numbers TODO: fehlende zahlen bei AGG???
            $.each(measureNumbers, function (key, number) {
                measureVals.push(parseFloat(result["V_NAME_AGG"].value));
            });

            // TODO draw the given result with given coordinates and measures
//        console.log("coordinates: ", coordinates, ", measures: ", measureVals);


            // TODO for each measure -> own cube part

            // Compute the ratio of the results measure
            var ratio = (measureVals[0] - lowestMeasure) / (highestMeasure - lowestMeasure);

//        // Logarithmic test TEMP
            ratio = Math.log((ratio * 10) + 1) / Math.log(11);

            var cubeSize = 0.80 + 0.20 * ratio;
//        var cubeSize = 0.95;

            var geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
            var material = new THREE.MeshLambertMaterial();

            material.shading = THREE.NoShading;
            material.fog = false;

            var colorLowest = new THREE.Color(0xd8d8d8);
            var colorHighest = new THREE.Color(0x1f76c0); // TODO custom color per measure -> ~ multiply/overlay/opacity effect RGB? "multiply(color);"
//        var colorHighest = new THREE.Color(0x389000); // test: green
//        var colorHighest = new THREE.Color(0x404040); // test: red
            var resultColor = colorLowest.multiplyScalar(1 - ratio).add(colorHighest.multiplyScalar(ratio));

//        var material = new THREE.SpriteMaterial({color: resultColor, fog: true});
//        var sprite = new THREE.Sprite(material);
//        scene.add(sprite);

            material.emissive = resultColor;
            var cube = new THREE.Mesh(geometry, material);
            cube.position.set(coordinates[0], coordinates[1], coordinates[2]); // TEST

            // Add result to the scene and the octree
            octree.add(cube, {useFaces: false});
            scene.add(cube);

            // Add additional information to each result cube
            cube.measureColor = resultColor; // save color to object
            cube.popup = function () {
                var str = "";
                $.each(dimensionNumbers, function (key, number) {
                    str += "Dim #" + key + ": ";
                    str += result["L_NAME_" + number + "_AGG"].value;
                    str += "\n";
                });
                $.each(measureNumbers, function (key, number) {
//                str += result["M_NAME_" + number + "_AGG"].value; // TODO
                    str += "Euro"; // TODO: measure label fehlt immer :C also von anfrage nehmen, oder in api ändern
                    str += ": ";
                    str += measureVals[key]; // TODO format nicely
                    str += "\n";
                });
                alert(str); // TEMP
            };

//         Lines
//        var cube2 = new THREE.EdgesHelper(cube);
//        cube2.material.color.set(resultColor);
//        cube2.material.linewidth = 1;
//        scene.add(cube2);

        });

        // Add the labels on the side TODO: where exacltey? here: always up to 3 dimensions?! (0 = cube, 1 = dim1, ...)
        if (entityMap[1]) { // x
            $.each(entityMap[1], function (i, entity) {
                // Dimension name TODO
                var label = createLabel(entity.label);
                var offset = entityMap[3] ? entityMap[3].length - 1 : 0;
                label.rotation.x = -degToRad(90);
                label.rotation.z = degToRad(90);
//                label.rotation.z += degToRad(90);
//                label.position.z -= (0.5 + label.labelWidth / 2);
                label.position.x = i;
                label.position.y = -0.5;
                label.position.z = (offset + 0.5 + label.labelWidth / 2);
                scene.add(label);
            });
        }

        if (entityMap[2]) { // y
            // Dimension name TODO
            $.each(entityMap[2], function (i, entity) {
                var label = createLabel(entity.label);
                var offset = entityMap[1] ? entityMap[1].length - 1 : 0;
                label.position.x = (offset + 0.5 + label.labelWidth / 2);
                label.position.y = i;
                label.position.z = -0.5;
                scene.add(label);
            });
        }

        if (entityMap[3]) { // z
            // Dimension name TODO
            $.each(entityMap[3], function (i, entity) {
                var label = createLabel(entity.label);
                var offset = entityMap[1] ? entityMap[1].length - 1 : 0;
                label.rotation.x = -degToRad(90);
                label.position.x = (offset + 0.5 + label.labelWidth / 2);
                label.position.y = -0.5;
                label.position.z = i;
//                label.scale.set(0.75,0.75,0.75)
                scene.add(label);
            });
        }


        // TODO: more than 3 dimensions -> labels?

        // DEBUG: grid <--
//        var size = 20;
//        var step = 1;
//        var gridHelper = new THREE.GridHelper(size, step);
//        gridHelper.setColors(new THREE.Color(0xd8d8d8), new THREE.Color(0xf0f0f0));
//        gridHelper.position.set(centerPoint[0], -0.5, centerPoint[2]);
//        scene.add(gridHelper);
//         -->



        // Set camera to the center point of the cube
        console.log("center: ", centerPoint);

        var distance = Math.max(centerPoint[0], centerPoint[1], centerPoint[2]);
        camera.position.x = centerPoint[0] * 2 + 5;
        camera.position.y = centerPoint[1] * 2 + 5;
        camera.position.z = centerPoint[2] * 2 + distance * 5; // TODO wie weit weg?
        controls.target = new THREE.Vector3(centerPoint[0], centerPoint[1], centerPoint[2]);
        controls.update();

        // ...

    });
}


// Starts the rendering process of three.js, goes infinitly
function render() {
    renderer.render(scene, camera);
    controls.update();
//    octree.update();
    requestAnimationFrame(render);
}

// Update when the orbit control was moved
function onControlMoved() {
    // Update lighting position
    lighting.position.copy(camera.position);
}

// Resize the cube visualization
function resizeVizualisation() {
    var maxHeight = $(window).height() - 235; // = nav + title + footer
    var maxWidth = $("#id_cube").width();
    var aspectRatio = maxWidth / maxHeight;
    camera.aspect = aspectRatio;
    camera.updateProjectionMatrix();
    renderer.setSize(maxWidth, maxHeight);
}

// ...
function loadCubeList() {
    var oldID = ID;
    var oldHASH = HASH;

    // Read new ID and Hash input
    ID = $("#id_id").val();
    HASH = $("#id_hash").val();

    // Do nothing if ID and hash have not changed
    if (oldID === ID && oldHASH === HASH) {
        return;
    }

    // Make the request
    var url = CUBE_URL.replace("__id__", ID);
    url = url.replace("__hash__", HASH);
    var request = $.ajax({
        url: url,
        headers: {
            accept: "application/sparql-results+json"
        }
    });

    $("#id_cubeList").empty(); // Clear old cube list

    // Recreate dropdown list for cubes
    request.done(function (content) {
        var obj;
        try {
            obj = $.parseJSON(content);
        } catch (e) {
            alert(content);
            return;
        }

        var obj = $.parseJSON(content);
        var results = obj.results.bindings; // array

        if (results.length === 0) {
            return;
        }

        // enable cube selection
        $("#id_cubePanel").css("opacity", "");
        $("#id_cubePanel button").removeAttr("disabled");

        // but disable the rest
        var opacity = 0.35;
        $("#id_dimensionPanel").css("opacity", opacity);
        $("#id_measurePanel").css("opacity", opacity);
        $("#id_filterPanel").css("opacity", opacity);
        $("#id_applyButton").css("opacity", opacity);

        $("#id_undoButton").css("opacity", opacity);
        $("#id_redoButton").css("opacity", opacity);

        $("#id_dimensionPanel button").attr("disabled", "disabled");
        $("#id_measurePanel button").attr("disabled", "disabled");
        $("#id_filterPanel button").attr("disabled", "disabled");
        $("#id_applyButton").attr("disabled", "disabled");

        $("#id_undoButton").attr("disabled", "disabled");
        $("#id_redoButton").attr("disabled", "disabled");


        // Iterate through available cubes and fill the list
        $.each(results, function (index, element) {
            var cubeName = element.CUBE_NAME.value;
            var comment = element.COMMENT.value; // TODO as tooltip? / "information area"
            var label = element.LABEL.value;

            // Create Dropdown entries
            var itemLink = $("<a href='#'></a>");
            itemLink.text(label);
            itemLink.attr("title", label + ":\n\n" + comment); // tooltip
            var item = $("<li></li>");
            item.append(itemLink);
            $("#id_cubeList").append(item);

            // Add on-click handler for chosen cubes
            itemLink.on("click", function (e) {
                e.preventDefault();

                // Set button title and current cube URI
                $("#id_cubeButton").text(label);
                $("#id_pageTitle").text("Cube: " + label); // set page title
                $("#id_cubeButton").attr("title", label + ":\n\n" + comment); // tooltip
                $("#id_cubeButton").append(" <span class='caret'></span>");
                currentCube = cubeName;

                // Query available dimensions and measures and fill the lists
                loadDimensionList();
                loadMeasureList();

                // Enable dimension, measure and filter input
                $("#id_dimensionPanel").css("opacity", "");
                $("#id_dimensionPanel button").removeAttr("disabled");
                $("#id_measurePanel").css("opacity", "");
                $("#id_measurePanel button").removeAttr("disabled");
                $("#id_filterPanel").css("opacity", "");
                $("#id_filterPanel button").removeAttr("disabled");

                $("#id_applyButton").css("opacity", "");
                $("#id_applyButton").removeAttr("disabled");

                $("#id_undoButton").css("opacity", "");
                $("#id_redoButton").css("opacity", "");
                $("#id_undoButton").removeAttr("disabled");
                $("#id_redoButton").removeAttr("disabled");

                // TODO: disable selected element from list

            });
        });

        // Initially select 1st cube in list
//        if (results.length > 0) {
//            var cubeName = results[0].CUBE_NAME.value;
//            var label = results[0].LABEL.value;
//            $("#id_cubeButton").text(label);
//            $("#id_cubeButton").append(" <span class='caret'></span>");
//            currentCube = cubeName;
//        }
    });


}

// ...
function loadDimensionList() {
    var url = DIMENSION_URL.replace("__cube__", currentCube);
    url = url.replace("__id__", ID);
    url = url.replace("__hash__", HASH);

    var request = $.ajax({
        url: url,
        headers: {
            accept: "application/sparql-results+json"
        }
    });

    request.done(function (content) {
        var obj = $.parseJSON(content);
        var results = obj.results.bindings;

        // Clear old dimension lists
        $("#id_xDimensionList").empty();
        $("#id_yDimensionList").empty();
        $("#id_zDimensionList").empty();

        // Load the list of available entities for each dimension
        $.each(results, function (index, dimension) {
            var dimensionName = dimension.DIMENSION_NAME.value;
            entitiyList[dimensionName] = queryEntityList(dimensionName); // TODO hier ajax problem
        });
//        console.log(entitiyList);

        // Add list for X, Y, Z axis
        function fillList(axis, dimensions) { // TODO function ausserhalb, results als parameter
            var dimensionList = $("#id_" + axis + "DimensionList");
            var plusButton = $("#id_" + axis + "Plus");
            var buttonArea = $("#id_" + axis + "ButtonArea");

            // Iterate through available dimensions
            $.each(results, function (index, element) {
                var dimensionName = element.DIMENSION_NAME.value;
                var label = element.LABEL.value;

                // Create Dropdown entries
                var itemLink = $("<a role='menuitem' tabindex='-1' href='#'></a>");
                itemLink.text(label);
                var item = $("<li role='presentation'></li>");
                item.append(itemLink);
                dimensionList.append(item);

                // Add on-click handler for chosen dimension
                itemLink.on("click", function (e) {
                    e.preventDefault();

                    // TEMP only add once, (better disable list item)
                    if (isSelectedDimension(dimensionName)) {
                        return;
                    }


                    var num = 20; // TODO: variable? constant?

                    // TODO mark in entitiyList[dimensionName][entityName] as checked

                    var entities = getFirstEntities(entitiyList, dimensionName, num); // ...
                    var dimension = new Dimension(dimensionName, label, entities);
                    dimensions.push(dimension);

                    // IDs for the HTML elements
                    var buttonID = createUniqueID(10);
                    var badgeID = createUniqueID(10);

                    // TODO: count entities to be displayed as selected in badge

                    // Rebuild a dimension button and its menu
                    var btnGroup = $('<div class="btn-group" id="' + buttonID + '"></div>');
                    var button = $('<button class="btn dropdown-toggle btn-default" type="button" data-toggle="dropdown"></button>');
                    var badge = $('<span class="badge" id="' + badgeID + '"></span>');
                    var menu = $('<ul class="dropdown-menu" role="menu"></ul>');
                    var filterItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Filter Entities...</a></li>');
                    var dividerItem = $('<li role="presentation" class="divider"></li>');
                    var removeItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Remove</a></li>');

                    // Combine button and list
                    btnGroup.append(button);
                    button.text(label + " ");
                    button.append(badge);

                    var numEntities = entitiyList[dimensionName].length;
                    var badgeNum = Math.min(num, numEntities);
                    badge.text(badgeNum + " / " + numEntities); // TODO wieviele zu beginn ? TODO: ajax evtl noch nicht fertig geladen

                    menu.append(filterItem);
                    menu.append(dividerItem);
                    menu.append(removeItem);
                    btnGroup.append(menu);

                    buttonArea.append(btnGroup);
                    buttonArea.append(" ");
                    buttonArea.append(plusButton); // Move plus to end

                    filterItem.on("click", function (e) {

                        // Add popup to the body
                        var modal = $(MODAL_DIMENSION_TEMPLATE.replace("__label__", label));
                        $("body").append(modal);

//                        console.log(dimensionName, entitiyList[dimensionName])

                        // Add all entities to the popup body
                        $.each(entitiyList[dimensionName], function (index, entity) {

                            var btnGroup = $('<div class="btn-group" data-toggle="buttons"></div>');
                            var label = $('<label class="btn btn-default ' + (entitiyList[dimensionName][entity.entityName] ? 'active' : '') + '"></label>');
                            var button = $('<input type="checkbox" autocomplete="off"' + (entitiyList[dimensionName][entity.entityName] ? 'checked' : '') + ' data-entity-name="' + entity.entityName + '" data-entity-label="' + entity.label + '">');


                            // Combine the checkbox and add
                            label.append(button);
                            label.append(document.createTextNode(entity.label));
                            btnGroup.append(label);
                            $("#id_modalBody").append(btnGroup);
                            $("#id_modalBody").append(" ");

                            $("#id_modalBody").css("max-height", $(window).height() - 210 + "px");
                            $("#id_modalBody").css("overflow-y", "scroll");

                        });

                        // Accept action of popup
                        $("#id_modalOkay").on("click", function (e) {

                            // TODO apply selected entities
                            var newEntities = [];

                            $("input[data-entity-name]").each(function () {
                                var entityName = $(this).data('entity-name');
                                var label = $(this).data('entity-label');
                                if ($(this).prop("checked")) {
                                    entitiyList[dimensionName][entityName] = true;
                                    newEntities.push(new Entity(dimensionName, entityName, label));
                                } else {
                                    entitiyList[dimensionName][entityName] = false;
                                }
                            });

                            // Update the badge and set request entity list
                            if (newEntities.length === entitiyList[dimensionName].length) {
                                dimension.entities = []; // causes no fix at all, all entities are included
                            } else {
                                dimension.entities = newEntities; // TEST unschön aber geht
                            }
                            $("#" + badgeID).text(newEntities.length + " / " + entitiyList[dimensionName].length);
                        });

                        // Show the popup
                        $("#id_modal").modal();

                        // Remove when finished
                        modal.on('hidden.bs.modal', function (e) {
                            modal.remove();
                        });

                    });

                    removeItem.on("click", function (e) {
                        // Delete from selected list
                        $.each(dimensions, function (index2, dimension) {
                            if (dimension.dimensionName === dimensionName) {
                                dimensions.splice(index2, 1);
                                return false;
                            }
                        });

                        // Remove HTML button and list
                        $("#" + buttonID).remove();
                    });


                });
            });
        }

        fillList("x", xDimensions);
        fillList("y", yDimensions);
        fillList("z", zDimensions);


    });


    // TODO...

}

/**
 * Compare function for sorting by an objects label property.
 */
function labelCompare(a, b) {
    if (a.label > b.label) {
        return 1;
    } else if (a.label < b.label) {
        return -1;
    } else {
        return 0;
    }
}

// ...
function isSelectedDimension(dimensionName) {
    var result = false;
    function checkDimension(index, dimension) {
        result = dimension.dimensionName === dimensionName ? true : result;
    }
    $.each(xDimensions, checkDimension);
    $.each(yDimensions, checkDimension);
    $.each(zDimensions, checkDimension);
    return result;
}

// ...
function isSelectedMeasure(measureName) {
    var result = false;
    function checkMeasure(index, measure) {
        result = measure.measureName === measureName ? true : result;
    }
    $.each(measures, checkMeasure);
    return result;
}

// ...
function loadMeasureList() {
    var url = MEASURE_URL.replace("__cube__", currentCube);
    url = url.replace("__id__", ID);
    url = url.replace("__hash__", HASH);

    var request = $.ajax({
        url: url,
        headers: {
            accept: "application/sparql-results+json"
        }
    });


    request.done(function (content) {
        var obj = $.parseJSON(content);
        var results = obj.results.bindings;

        // Clear old dimension list
        $("#id_measureList").empty();

        var measureList = $("#id_measureList");
        var plusButton = $("#id_measurePlus");
        var buttonArea = $("#id_measureButtonArea");

        // Iterate through available dimensions
        $.each(results, function (index, element) {
            var measureName = element.MEASURE_NAME.value;
            var label = element.LABEL.value;

            // Create Dropdown entries
            var itemLink = $("<a role='menuitem' tabindex='-1' href='#'></a>");
            itemLink.text(label);
            var item = $("<li role='presentation'></li>");
            item.append(itemLink);
            measureList.append(item);

            // Add on-click handler for chosen measure
            itemLink.on("click", function (e) {
                e.preventDefault();


                // TEMP only add once, (better disable list item)
                if (isSelectedMeasure(measureName)) {
                    return;
                }

                // TODO Add the measure to the chosen list
                //
                // TODO: if only 1 measure -> autoselect it!
                // ...

                measures.push(new Measure(measureName, label, "sum"));
                var randomID = createUniqueID(10); // ID for the HTML element

                // Rebuild a measure button and its menu
                var btnGroup = $('<div class="btn-group" id="' + randomID + '"></div>');
                var button = $('<button class="btn dropdown-toggle btn-default" type="button" data-toggle="dropdown"></button>');
                var badge = $('<span class="badge"></span>');
                var menu = $('<ul class="dropdown-menu" role="menu"></ul>');
                var aggItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Change Aggregation...</a></li>');
                var colorItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Change Color...</a></li>');
                var hideItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Hide</a></li>');
                var dividerItem = $('<li role="presentation" class="divider"></li>');
                var removeItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Remove</a></li>');

                // Combine button and list
                btnGroup.append(button);
                button.text(label + " ");
                button.append(badge);
                badge.addClass("ms-1"); // TODO different badge colors
                badge.text("SUM"); // TODO badge ID -> später agg ändern + toUppercase
                menu.append(aggItem);
                menu.append(colorItem);
                menu.append(hideItem);
                menu.append(dividerItem);
                menu.append(removeItem);
                btnGroup.append(menu);

                buttonArea.append(btnGroup);
                buttonArea.append(" ");
                buttonArea.append(plusButton); // Move plus to end

                aggItem.on("click", function (e) {
//                        TODO
                });

                colorItem.on("click", function (e) {
//                        TODO
                });

                hideItem.on("click", function (e) {
//                        TODO
                });

                removeItem.on("click", function (e) {
                    // Delete from selected list
                    $.each(measures, function (index2, measure) {
                        if (measure.measureName === measureName) {
                            measures.splice(index2, 1);
                            return false;
                        }
                    });

                    // Remove HTML button and list
                    $("#" + randomID).remove();
                });

            });
        });
    });


    // TODO...

}

// ...for filtering in advance... returns a list of possible entities
function queryEntityList(dimensionName) {
    var url = ENTITY_URL.replace("__cube__", currentCube);
    url = url.replace("__id__", ID);
    url = url.replace("__hash__", HASH);
    url = url.replace("__dimension__", dimensionName);
    var list = [];
    var request = $.ajax({
        url: url,
        headers: {
            accept: "application/sparql-results+json"
        }
    });
    request.done(function (content) {
        var obj = $.parseJSON(content);
        var results = obj.results.bindings;
        $.each(results, function (index, result) {
            var entityName = result.ENTITY_NAME.value;
            var label = result.LABEL.value;
            list.push(new Entity(dimensionName, entityName, label));
        });
        list.sort(labelCompare);
    });
    return list;
}

// for initial fix...
function getFirstEntities(entitiyList, dimensionName, number) {
    var list = [];
    for (var i = 0; i < number; i++) {
        var entity = entitiyList[dimensionName][i];
        if (entity === undefined) {
            break;
        }
        list.push(entity);
        entitiyList[dimensionName][entity.entityName] = true; // TODO: boolean to see if checked
    }
    return list;
}

// TODO: NON ROTATING LABEL, immer selbe schriftgröße BUG!
function createLabel(text) {
    var size = 10;
    var backgroundMargin = 5;
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    context.font = size + "px sans-serif";
    var textWidth = context.measureText(text).width;

    canvas.width = textWidth + backgroundMargin;
    canvas.height = size + backgroundMargin;

    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "white";

    // for debugging:
//    canvas.style.zIndex = "9999";
//    canvas.style.position = "absolute";
//    document.body.appendChild(canvas)

    context.fillStyle = "#404040";
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    var material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        useScreenCoordinates: false
    });

    var finalWidth = canvas.width / canvas.height;
    var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(finalWidth, 1), material);
    mesh.labelWidth = finalWidth;
    mesh.doubleSided = true;


    return mesh;
}

// ...
function initThreeJs() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(30, 2 / 1, 0.1, 2000);
    renderer = new THREE.WebGLRenderer({antialias: true}); // TODO AA as option
//    renderer = new THREE.CanvasRenderer();
//    renderer = new THREE.CSS2DRenderer();
//    renderer = new THREE.CSS3DRenderer();
//    renderer = new THREE.SVGRenderer();
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    lighting = new THREE.PointLight(0x202020, 1, 0);
    scene.add(lighting);

    // Orbit controls
    controls.noKeys = true;
//    controls.noPan = true;
    controls.minDistance = 20;
//    controls.maxDistance = 40;
    controls.rotateSpeed = 0.75;
//    controls.zoomSpeed = 0.5;
    controls.addEventListener('change', onControlMoved, false);

    renderer.setClearColor(0xffffff, 1);
    // TODO: 2 renderer: 1. WebGL für Würfel, 2. CSS3D für text (falls einfacher als text as textur)

    // Octree for performant event handling (raycast...)
    octree = new THREE.Octree({
        //scene: scene,
        undeferred: false,
        depthMax: Infinity,
        objectsThreshold: 8,
        overlapPct: 0.15
    });

    // Add the canvas to the page
    $("#id_cube").append(renderer.domElement);

    // TEST: RAYCAST
    $(renderer.domElement).on("mousemove", onCanvasMouseMove);
    $(renderer.domElement).on("click", onCanvasMouseClick);
    $(renderer.domElement).on("mousedown", onCanvasMouseDown);

}

// ...
function addInterfaceListeners() {

    // Top bar
    $("#id_loadCubesButton").on('click', loadCubeList);

    // Side bar
    $("#id_applyButton").on('click', applyOLAP);

    // ...

}

// enables / disables the Apply button according to selected items
function refreshApplyButton() {

}

// ...
function selectEntity(entity) {
    // TODO: zur FIX liste hinzufügen, sidebar -> badge updaten (x / y), entsprechende threejs-objecte highlighten!

}

function showLoadingScreen(loadingMessage) {

    // Remove old vislualization first
    unloadVisualization();

    var cubeSize = 20;

    // Show loading sign as texture
    if (loadingMessage !== undefined) {
//        $("#id_cube").append($("<div id='id_loadingSign'>" + loadingMessage + "</div>"));

        // TODO ...

    }

    var geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    var material = new THREE.MeshLambertMaterial();
    material.shading = THREE.NoShading;
    material.fog = false;
    material.emissive = new THREE.Color(0xe8e8e8);
    var cube = new THREE.Mesh(geometry, material);
    var lines = new THREE.BoxHelper(cube);
    lines.material.color.set(material.emissive);
    lines.material.linewidth = 3;
    cube.rotation.y = 0.5 * (Math.PI / 180);

    // Add the cube to the scene
    scene.add(cube);
    scene.add(lines);

    // Set up camera
    camera.position.x = 50;
    camera.position.y = 30;
    camera.position.z = 50;

    controls.target = new THREE.Vector3(0, 0, 0);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 5;
    controls.update();

}

// ...
function applyOLAP() {

    // TODO apply button enabled only on change -> listener for all buttons...

    var url = createRequestURL();

    console.log("REQUEST:", url);

    visualize(url);
}

function unloadVisualization() {
    // TODO: hide/empty current scene, and show loading screen

//    cancelAnimationFrame(animationRequest);

    scene.children = []; // Clear old scene
    scene.add(lighting); // Add light again

    // Replace old octree
    octree = new THREE.Octree({
        //scene: scene,
        undeferred: false,
        depthMax: Infinity,
        objectsThreshold: 8,
        overlapPct: 0.15
    });

    // Reset controls
    controls.autoRotate = false;

    // Remove loading sign if present
//    $("#id_loadingSign").remove();

}

function createRequestURL() {

    var url = EXECUTE_URL;
    url = url.replace("__id__", ID);
    url = url.replace("__hash__", HASH);
    url = url.replace("__cube__", currentCube);

    // Add dimensions
    function addDim(index, dimension) {
        var tmp = DIMENSION_PART_URL.replace("__dimension__", dimension.dimensionName);

        // Add fix option if entities were selected
//        console.log("DIMENSION: ", dimension)
        if (dimension.entities.length > 0) {
            var tmp2 = "";
            $.each(dimension.entities, function (index, entity) {
                tmp2 += entity.entityName + ",";
            });
            tmp2 = tmp2.substring(0, tmp2.length - 1); // remove last comma
            tmp += DIMENSION_FIX_PART_URL.replace("__fix__", tmp2);
        }
        url += tmp;
    }
    $.each(xDimensions, addDim);
    $.each(yDimensions, addDim);
    $.each(zDimensions, addDim);

    // Add measures
    $.each(measures, function (index, measure) {
        var tmp = MEASURE_PART_URL.replace("__measure__", measure.measureName);
        tmp = tmp.replace("__agg__", measure.agg);
        url += tmp;
//        url += ",filterR=<bigger>,filterV=<999999999>"; // TEST
    });

    // Add filters
    $.each(filters, function (index, filter) {
        //TODO: unterscheiden: dimension / measure!
    });

    return url;
}

// Undo all selected labels and disable Accept button
function deselectAll() {
    // TODO
}

function testPopup() {

}


// Raycast TODO: nur für cubes, für mobile geräte: auch/nur bei click-event
function onCanvasMouseMove(event) {
//    console.log("MOVE", event.buttons, event.which, event.button);
    event.preventDefault();

    // only highlight results if no mouse buttons pressed
    var button = event.buttons === undefined ? event.which || event.button : event.buttons; // TODO check IE10+
    if (button !== 0) {
        return;
    }

    var node = $(renderer.domElement);
    var x = event.pageX - node.position().left;
    var y = event.pageY - node.position().top;
    var mousePosition = new THREE.Vector3();
    mousePosition.x = (x / node.width()) * 2 - 1;
    mousePosition.y = -(y / node.height()) * 2 + 1;
    mousePosition.z = 0.5;

    // project mouse to 3d scene
    var vect = mousePosition.unproject(camera);
    var direction = vect.sub(camera.position).normalize();
    var rayCaster = new THREE.Raycaster(camera.position, direction);
//    var octreeObjects = octree.search(rayCaster.ray.origin, rayCaster.ray.far, true, rayCaster.ray.direction);
//    var intersections = rayCaster.intersectOctreeObjects(octreeObjects);
    var intersections = rayCaster.intersectObjects(scene.children); // TODO erstmal so, inperformant aber geht
    if (intersections.length > 0) {

        // TODO for schleife, nicht alle haben measureColor!

        if (intersected !== intersections[0].object) { // TODO: not always front cube in octree!!!
//            console.log(intersections[0])

            // TEMP no measure color? break
            if (intersections[0].object.measureColor === undefined) {
                return;
            }

            if (intersected) {
                intersected.material.emissive = intersected.measureColor;
                scene.remove(intersected.outline);
            }

//             $.each(octreeObjects, function (index, element) {
//                 element.object.material.emissive.setHex(0x20a000);
//             });

            intersected = intersections[0].object;
            intersected.material.emissive = intersected.measureColor.clone().multiplyScalar(0.9);

            // Show lines around the cube
            intersected.outline = new THREE.EdgesHelper(intersected);
            intersected.outline.material.color.set(intersected.material.emissive);
            intersected.outline.material.linewidth = 3;
            scene.add(intersected.outline);
        }
        renderer.domElement.style.cursor = 'pointer';
    } else if (intersected) {
        intersected.material.emissive = intersected.measureColor;
        scene.remove(intersected.outline);

        intersected = null;
        renderer.domElement.style.cursor = 'auto';
    }

    // update tracker
//    console.log("#objects: ", octreeObjects.length, " intersection: ", intersections.length);
}

// Raycast TODO: onmouseup und onmousedown stattdessen und distanz muss < xpixel sein
function onCanvasMouseClick(event) {
    event.preventDefault();

    // only highlight results if no mouse buttons pressed

    var node = $(renderer.domElement);
    var x = event.pageX - node.position().left;
    var y = event.pageY - node.position().top;

    // cancel if dragged a certain min distance
    var distance = 6;
    if (Math.abs(x - mouseDown.x) > distance || Math.abs(y - mouseDown.y) > distance) {
        return;
    }

    var mousePosition = new THREE.Vector3();
    mousePosition.x = (x / node.width()) * 2 - 1;
    mousePosition.y = -(y / node.height()) * 2 + 1;
    mousePosition.z = 0.5;

    // project mouse to 3d scene
    var vect = mousePosition.unproject(camera);
    var direction = vect.sub(camera.position).normalize();
    var rayCaster = new THREE.Raycaster(camera.position, direction);
//    var octreeObjects = octree.search(rayCaster.ray.origin, rayCaster.ray.far, true, rayCaster.ray.direction);
//    var intersections = rayCaster.intersectOctreeObjects(octreeObjects);
    var intersections = rayCaster.intersectObjects(scene.children); // TODO erstmal so, inperformant aber geht
    if (intersections.length > 0) {
        if (intersections[0].object.popup) {
            intersections[0].object.popup();
        }
    }
}

// For distance limit of clicking
function onCanvasMouseDown(event) {
    var node = $(renderer.domElement);
    mouseDown.x = event.pageX - node.position().left;
    mouseDown.y = event.pageY - node.position().top;
}

// String extension
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

// Creates a pseudo random unique ID for HTML elements
function createUniqueID(length) {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) {
        result += chars[Math.round(Math.random() * (chars.length - 1))];
    }
    return "id_" + result;
}

function degToRad(deg) {
    return deg * Math.PI / 180;
}

// Returns a string like 71.003.345 (adds points)
function formatNumber(num) {
    // TODO
}

// (>'.')>