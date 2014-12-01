// Custom script for the Rest2Sparql GUI

//var cubeList = {};
//var dimensionList = {};
//var measureList = {};

// Globas vars
var ID = "";
var HASH = "";
var currentCube = "";

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

    visualize(testQuery6_agg_3d);

    //<--

});

// Inits the interface and adds listeners
function init() {

    // Disable navigation input initially and set conditions of usage
    var opacity = 0.35;
    $("#id_cubePanel").css("opacity", opacity);
    $("#id_dimensionPanel").css("opacity", opacity);
    $("#id_measurePanel").css("opacity", opacity);
    $("#id_filterPanel").css("opacity", opacity);
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

    // add tooltips
//    $('[data-toggle="tooltip"]').tooltip();

    // Add listeners to all interface buttons
    addInterfaceListeners();

    // Setup THREE.JS components
    initThreeJs();

    // Resize visualization on browser resize
    $(window).on('resize', resizeVizualisation);

}

// sends the given url and visualizes the results.
// TODO: table vs 3D mode, loading screen, error messages
function visualize(url) {

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

        // Sort those entities for the labels and coordinates in the visualization
        function compare(a, b) {
            if (a.label > b.label) {
                return 1;
            } else if (a.label < b.label) {
                return -1;
            } else {
                return 0;
            }
        }

        // Compute the center point for the camera too look at
        var centerPoint = [0, 0, 0]; // TODO assumes there is just (xyz)
        $.each(dimensionNumbers, function (key, number) {
            entityMap[number].sort(compare);

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
//                str += result["M_NAME_" + number + "_AGG"].value; // TODO: fehlt immer :C also von anfrage nehmen, oder in api ändern
                    str += "Euro"; // TODO: fehlt immer :C also von anfrage nehmen, oder in api ändern
                    str += ": ";
                    str += measureVals[key];
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

//     TODO Test sprite
//    var sprite = createTextSprite("Germany");
////    var sprite = createLabel("TEST 123");
//    sprite.position.set(-1, 0, 0);
//    scene.add(sprite);

        // DEBUG: grid <--
//        var size = 20;
//        var step = 1;
//        var gridHelper = new THREE.GridHelper(size, step);
//        gridHelper.setColors(new THREE.Color(0xd8d8d8), new THREE.Color(0xf0f0f0));
//        gridHelper.position.set(centerPoint[0], -0.5, centerPoint[2]);
//        scene.add(gridHelper);
        // -->



        // Set camera to the center point of the cube
        console.log("center: ", centerPoint);
        camera.position.x = centerPoint[0] * 2 + 1;
        camera.position.y = centerPoint[1] * 2 + 1;
        camera.position.z = centerPoint[2] * 2 + 20; // TODO wie weit weg?
        controls.target = new THREE.Vector3(centerPoint[0], centerPoint[1], centerPoint[2]);
        controls.update();

        // ...

    });
}


// Starts the rendering process of three.js, goes infinitly
function render() {
    renderer.render(scene, camera);
//    octree.update();
    requestAnimationFrame(render);
}

// Update when the orbit control was moved
function controlMoved() {
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
                $("#id_cubeButton").attr("title", label + ":\n\n" + comment); // tooltip
                $("#id_cubeButton").append(" <span class='caret'></span>");
                currentCube = cubeName;

                // Query available dimensions and measures and fill the lists
                loadDimensionList(cubeName);
                loadMeasureList(cubeName);

                // Enable dimension, measure and filter input
                $("#id_dimensionPanel").css("opacity", "");
                $("#id_dimensionPanel button").removeAttr("disabled");
                $("#id_measurePanel").css("opacity", "");
                $("#id_measurePanel button").removeAttr("disabled");
                $("#id_filterPanel").css("opacity", "");
                $("#id_filterPanel button").removeAttr("disabled");

                $("#id_applyButton").css("opacity", "");
                $("#id_applyButton").removeAttr("disabled");

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

function loadDimensionList(cubeName) {
    var url = DIMENSION_URL.replace("__cube__", cubeName);
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

        // Add list for X, Y, Z axis

        function fillList(axis, dimensionList) { // TODO function ausserhalb, results als parameter
            var dimList = $("#id_" + axis + "DimensionList");
            var plusButton = $("#id_" + axis + "Plus");
            var buttonArea = $("#id_" + axis + "ButtonArea");

            // Iterate through available dimensions
            $.each(results, function (index1, element) {
                var dimensionName = element.DIMENSION_NAME.value;
                var label = element.LABEL.value;

                // Create Dropdown entries
                var itemLink = $("<a role='menuitem' tabindex='-1' href='#'></a>");
                itemLink.text(label);
                var item = $("<li role='presentation'></li>");
                item.append(itemLink);

                dimList.append(item);

                // Add on-click handler for chosen dimension
                itemLink.on("click", function (e) {
                    e.preventDefault();

                    var entities = []; // empty list means: all / no fix
                    dimensionList.push(new Dimension(dimensionName, label, entities));


                    // TODO: count entities to be displayed as selected in badge

                    // Rebuild a dimension button and its menu
                    var btnGroup = $('<div class="btn-group"></div>');
                    var button = $('<button class="btn dropdown-toggle btn-default" type="button" data-toggle="dropdown"></button>');
                    var badge = $('<span class="badge"></span>');
                    var menu = $('<ul class="dropdown-menu" role="menu"></ul>');
                    var filterItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Filter Entities...</a></li>');
                    var dividerItem = $('<li role="presentation" class="divider"></li>');
                    var removeItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Remove</a></li>');

                    // Combine button and list
                    btnGroup.append(button);
                    button.text(label + " ");
                    button.append(badge);
                    badge.text("123 / 456"); // TODO number of entities? -> getEntities() entweder zu start oder jetzt! + badgeID
                    menu.append(filterItem);
                    menu.append(dividerItem);
                    menu.append(removeItem);
                    btnGroup.append(menu);

                    buttonArea.append(btnGroup);
                    buttonArea.append(" ");
                    buttonArea.append(plusButton); // Move plus to end

                    filterItem.on("click", function (e) {
//                        TODO
                    });

                    removeItem.on("click", function (e) {
//                        TODO
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

function loadMeasureList(cubeName) {
    var url = MEASURE_URL.replace("__cube__", cubeName);
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
        var plusButton = $("#measurePlus");
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

                // TODO Add the measure to the chosen list
                //
                // TODO: if only 1 measure -> autoselect it!
                // ...

                measures.push(new Measure(measureName, label, "sum"));

                // Rebuild a measure button and its menu
                var btnGroup = $('<div class="btn-group"></div>');
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
//                        TODO
                });

            });
        });
    });


    // TODO...

}

// ...for filtering in advance...
function loadEntityList(cubeName, dimensionName) {

    // TODO...

}


// TODO
// Creates sprites for labels
function createTextSprite(text) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    context.font = "bold 20px Helvetica";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "#000000";

//    context.fillStyle = "#404040";

    var metrics = context.measureText(text);
    var textWidth = metrics.width;

    canvas.width = textWidth;
    canvas.height = 20 + 10;

    context.fillText(text, textWidth / 2, canvas.height / 2);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    var material = new THREE.SpriteMaterial({map: texture, useScreenCoordinates: false});
    var sprite = new THREE.Sprite(material);
//    sprite.scale.set(2, 2, 2);
    sprite.scale.normalize().multiplyScalar(4);
    return sprite;
}


// TODO: NON ROTATING LABEL
function createLabel(text) {
    var size = 20;
    var backgroundMargin = 10;

    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    context.font = size + "px Arial";

    var textWidth = context.measureText(text).width;

    canvas.width = textWidth + backgroundMargin;
    canvas.height = size + backgroundMargin;

    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "#404040";
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    var material = new THREE.MeshBasicMaterial({
        map: texture,
        useScreenCoordinates: false
    });

    var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(canvas.width, canvas.height), material);
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
    controls.addEventListener('change', controlMoved, false);

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

    // CSS3D Renderer Test
//    var test = document.createElement("div");
//    test.className = "CSS3DTest";
//    test.innerHTML = "12.781.015"; // or "12M 781K"
//    var object = new THREE.CSS3DObject(test);
//    object.position.x = 0;
//    object.position.y = 0;
//    object.position.z = 0;
//    object.rotation.x = 0.5;
//    scene.add(object);

    // Add the canvas to the page
    $("#id_cube").append(renderer.domElement);

    // TEST: RAYCAST
    $(renderer.domElement).on("mousemove", onCanvasMouseMove);
    $(renderer.domElement).on("click", onCanvasMouseClick);

}

function addInterfaceListeners() {

    // Top bar
    $("#id_loadCubesButton").on('click', loadCubeList);

    // Side bar

    $("#id_applyButton").on('click', applyOLAP);





}

// enables / disables the Apply button according to selected items
function refreshApplyButton() {

}

// ...
function selectEntity(entity) {
    // TODO: zur FIX liste hinzufügen, sidebar -> badge updaten (x / y), entsprechende threejs-objecte highlighten!

}

// ...
function applyOLAP() {

    var url = createRequestURL();

    console.log("REQUEST:", url);

    unloadVisualization();

//    showLoadingScreen();

    visualize(url);
}

function unloadVisualization() {
    // TODO: hide/empty current scene, and show loading screen

    cancelAnimationFrame(animationRequest);

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
        if (dimension.entities.length > 0) {
            var tmp2 = "";
            $.each(dimension.entities, function (index, entity) {
                tmp2 += entity + ",";
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
        if (intersected !== intersections[0].object) { // TODO: not always front cube in octree!!!
//            console.log(intersections[0])
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

// (>'.')>