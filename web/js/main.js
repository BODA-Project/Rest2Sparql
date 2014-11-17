// Custom script for the Rest2Sparql GUI

var cubeList = {};
var dimensionList = {};
var measureList = {};

// Globas vars
var ID = "";
var HASH = "";
var currentCube = "";

var xDimensions = [];   // type: Dimension class
var yDimensions = [];
var zDimensions = [];

// Three.js visualization
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, 2 / 1, 0.1, 2000);
var renderer = new THREE.WebGLRenderer();
var controls = new THREE.OrbitControls(camera, renderer.domElement);
//    var renderer = new THREE.CanvasRenderer();
//    var renderer = new THREE.CSS2DRenderer();
//    var renderer = new THREE.CSS3DRenderer();
//    var renderer = new THREE.CSS3DStereoRenderer();
//    var renderer = new THREE.SVGRenderer();
var lighting = new THREE.PointLight(0x202020, 1, 0);
scene.add(lighting);

// Templates
var CUBE_URL = "./backend?func=<getCubes>&id=<__id__>&hash=<__hash__>";
var DIMENSION_URL = "./backend?func=<getDimensions>&c=<__cube__>&id=<__id__>&hash=<__hash__>";
var MEASURE_URL = "./backend?func=<getMeasures>&c=<__cube__>&id=<__id__>&hash=<__hash__>";
var ENTITY_URL = "./backend?func=<getEntities>&c=<__cube__>&d=<__dimension__>&id=<__id__>&hash=<__hash__>";

// Cube class (getCubes)
function Cube(name, comment, label) {
    this.name = name;                   // e.g. http://code-research.eu/resource/Dataset-173bbc55-68ca-4398-bd28-232415f7db4d
    this.comment = comment;             // e.g. fish_ld_be.xlsx  +  fish_ld_bg.xlsx  +  ...
    this.label = label;                 // e.g. headlessMergedCube
}

// Dimension class (getDimensions)
function Dimension(cubeName, dimensionName, label, entities) {
    this.dimensionName = dimensionName; // e.g. http://code-research.eu/resource/Country
    this.label = label;                 // e.g. Country
    this.entities = entities;           // list of entities belonging to the dimension
}

// Measure class (getMeasures)
function Measure(cubeName, measureName, label) {
    this.measureName = measureName;     // e.g. http://code-research.eu/resource/Euro
    this.label = label;                 // e.g. Euro
}

// Entity class (getEntities)
function Entity(dimensionName, entityName, label) {
    this.dimensionName = dimensionName; // e.g. http://code-research.eu/resource/Country
    this.entityName = entityName;       // e.g. http://code-research.eu/resource/Entity-1b7500d2-6e12-42f0-a006-f38ae763418f
    this.label = label;                 // e.g. Netherlands
}




// AJAX TESTS Queries
var testQuery1 = "http://localhost:8080/rest2sparql/backend?func=<getCubes>&id=<8023903>&hash=<7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc>";
var testQuery2 = "http://localhost:8080/rest2sparql/backend?func=<execute>&id=<8023903>&hash=<7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc>&m=<http://code-research.eu/resource/Euro>,select=<true>,group=<false>,order=<-1>&d=<http://code-research.eu/resource/Country>,select=<true>,group=<false>,order=<-1>&d=<http://code-research.eu/resource/Species>,select=<false>,group=<false>,order=<-1>,fix=<http://code-research.eu/resource/Entity-279a95fa-ecb7-4ed3-9a1d-c250c6d1acd9>&d=<http://code-research.eu/resource/Year>,select=<true>,group=<false>,order=<-1>&c=<http://code-research.eu/resource/Dataset-173bbc55-68ca-4398-bd28-232415f7db4d>,select=<true>";
var testQuery3 = "http://localhost:8080/rest2sparql/backend?func=%3CgetDimensions%3E&c=%3Chttp://code-research.eu/resource/Dataset-173bbc55-68ca-4398-bd28-232415f7db4d%3E&id=%3C8023903%3E&hash=%3C7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc%3E";
var testQuery4_agg = "http://localhost:8080/rest2sparql//backend?func=%3Cexecute%3E&id=%3C8023903%3E&hash=%3C7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc%3E&d=%3Chttp://code-research.eu/resource/Country%3E,select=%3Ctrue%3E,group=%3Ctrue%3E,order=%3C-1%3E&d=%3Chttp://code-research.eu/resource/Species%3E,select=%3Ctrue%3E,group=%3Ctrue%3E,order=%3C-1%3E,fix=%3Chttp://code-research.eu/resource/Entity-02a8e8de-ad5c-4922-9775-5083e116a37f%3E&d=%3Chttp://code-research.eu/resource/Year%3E,select=%3Ctrue%3E,group=%3Ctrue%3E,order=%3C-1%3E&m=%3Chttp://code-research.eu/resource/Euro%3E,select=%3Ctrue%3E,group=%3Cfalse%3E,order=%3C-1%3E,agg=%3Csum%3E&c=%3Chttp://code-research.eu/resource/Dataset-173bbc55-68ca-4398-bd28-232415f7db4d%3E,select=%3Cfalse%3E";
var testQuery5_fix = "http://localhost:8080/rest2sparql//backend?func=%3Cexecute%3E&id=%3C8023903%3E&hash=%3C7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc%3E&m=%3Chttp://code-research.eu/resource/Euro%3E,select=%3Ctrue%3E,group=%3Cfalse%3E,order=%3C-1%3E&d=%3Chttp://code-research.eu/resource/Country%3E,select=%3Cfalse%3E,group=%3Cfalse%3E,order=%3C-1%3E,fix=%3Chttp://code-research.eu/resource/Entity-1b7500d2-6e12-42f0-a006-f38ae763418f%3E&d=%3Chttp://code-research.eu/resource/Species%3E,select=%3Cfalse%3E,group=%3Cfalse%3E,order=%3C-1%3E,fix=%3Chttp://code-research.eu/resource/Entity-02a8e8de-ad5c-4922-9775-5083e116a37f%3E&d=%3Chttp://code-research.eu/resource/Year%3E,select=%3Ctrue%3E,group=%3Cfalse%3E,order=%3C-1%3E&c=%3Chttp://code-research.eu/resource/Dataset-173bbc55-68ca-4398-bd28-232415f7db4d%3E,select=%3Cfalse%3E";
var testQuery6_3d = "http://localhost:8080/rest2sparql//backend?func=%3Cexecute%3E&id=%3C8023903%3E&hash=%3C7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc%3E&m=%3Chttp://code-research.eu/resource/Euro%3E,select=%3Ctrue%3E,group=%3Cfalse%3E,order=%3C-1%3E,agg=%3Csum%3E&d=%3Chttp://code-research.eu/resource/Country%3E,select=%3Ctrue%3E,group=%3Ctrue%3E,order=%3C-1%3E&d=%3Chttp://code-research.eu/resource/Species%3E,select=%3Ctrue%3E,group=%3Ctrue%3E,order=%3C-1%3E&d=%3Chttp://code-research.eu/resource/Year%3E,select=%3Ctrue%3E,group=%3Ctrue%3E,order=%3C-1%3E&c=%3Chttp://code-research.eu/resource/Dataset-173bbc55-68ca-4398-bd28-232415f7db4d%3E,select=%3Cfalse%3E";

var request = $.ajax({
    url: testQuery4_agg,
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

            lowestMeasure = (!lowestMeasure || lowestMeasure > measure) ? measure : lowestMeasure;
            highestMeasure = (!highestMeasure || highestMeasure < measure) ? measure : highestMeasure;

        });

    });

    var centerPoint = []; // TODO assumes there is just (xyz)

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
    $.each(dimensionNumbers, function (key, number) {
        entityMap[number].sort(compare);

        // Map name -> index
        $.each(entityMap[number], function (index, entity) {
            var entityName = entity.entityName;
            entityMap[number][entityName] = index;
        });

        centerPoint[key] = entityMap[number].length / 2; // TODO for center view point; set camera there!

    });

//    console.log("sorted: ", entityMap);
    console.log("lowest measure: ", lowestMeasure, ", highest: " + highestMeasure);


    // TODO set labels coordinates (around the cube), problem for 2 dimension per axis -> multiple coordinates, must be calculated...




    // Set coordinates for each result
    $.each(results, function (index, result) {

        // DEBUG STOP AFTER 2000 entries, too much data :D
//        if (index > 2000) {
//            return false;
//        }

        var coordinates = []; // e.g. (x,y,z) or (x,x,y,zz)
        var measureVals = []; // e.g. (123435, 42)

        // Iterate through given dimension numbers
        $.each(dimensionNumbers, function (key, number) {
            var entityName = result["E_NAME_" + number].value; // E_NAME_X
            coordinates.push(entityMap[number][entityName]); // TODO assumes xyz order of results
        });

        // Iterate through given measure numbers TODO: fehlende zahlen bei AGG???
        $.each(measureNumbers, function (key, value) {
            measureVals.push(parseFloat(result["V_NAME_AGG"].value));
        });

        // TODO draw the given result with given coordinates and measures
//        console.log("coordinates: ", coordinates, ", measures: ", measureVals);

        var cubeSize = 0.95;
        var geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
//        var geometry = new THREE.BoxGeometry(1,1,1);
        var material = new THREE.MeshLambertMaterial();
//        material.color = new THREE.Color(0xffffff);



        // TODO for each measure -> own cube part


        // TEST color from measure ratio
        var ratio = (measureVals[0] - lowestMeasure) / (highestMeasure - lowestMeasure);
        var colorLowest = new THREE.Color(0x404040);
        var colorHighest = new THREE.Color(0x90e040); // TODO custom color per measure


//        var colorLowest = new THREE.Color(0xd0d0d0);
//        var colorHighest = new THREE.Color(0x2040a0); // TODO custom color per measure
        var resultColor = colorLowest.multiplyScalar(1 - ratio).add(colorHighest.multiplyScalar(ratio));

        // darken results that are exactley the lowest value
        var gapColor = colorLowest.clone().multiplyScalar(0.8);
//        var gapColor = colorLowest.clone().multiplyScalar(1.05);
        resultColor = (ratio === 0) ? gapColor : resultColor;

        material.emissive = resultColor;
        var cube = new THREE.Mesh(geometry, material);
        cube.position.set(coordinates[0], coordinates[1], coordinates[2]); // TEST
        scene.add(cube);

//         Lines
//        var cube2 = new THREE.BoxHelper(cube);
//        cube2.material.color.set(resultColor);
//        cube2.material.linewidth = 1;
//        scene.add(cube2);

    });

//     TODO Test sprite
//    var sprite = createTextSprite("Germany");
////    var sprite = createLabel("TEST 123");
//    sprite.position.set(-1, 0, 0);
//    scene.add(sprite);




    // Set camera to the center point of the cube
    console.log("center: ", centerPoint);
    camera.position.x = centerPoint[0] * 2 + 1;
    camera.position.y = centerPoint[1] * 2 + 1;
    camera.position.z = centerPoint[2] * 2 + 10; // TODO wie weit weg?
    controls.target = new THREE.Vector3(centerPoint[0], centerPoint[1], centerPoint[2]);
    controls.update();

    // ...

});


// Initialization
$(document).ready(function () {
    init();

    // TODO disable input for unconfigured fields
//    $("#test *").attr("disabled", "disabled").off('click');

    // TODO for DEBUG
    ID = "8023903";
    HASH = "7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc";
    loadCubeList();

    // TEST of three.js -->

    // Orbit controls
    controls.noKeys = true;
//    controls.noPan = true;
    controls.minDistance = 10;
//    controls.maxDistance = 40;
    controls.rotateSpeed = 0.75;
//    controls.zoomSpeed = 0.5;
//    controls.addEventListener( 'change', render );

    // TODO: 2 renderer: 1. WebGL für Würfel, 2. CSS3D für text (falls einfacher als text as textur)

    renderer.setClearColor(0xffffff, 1);

    // TODO Rotating cUbe as loading screen
//    var geometry = new THREE.BoxGeometry(4, 4, 4);
//    var material = new THREE.MeshLambertMaterial();
//    material.color = new THREE.Color(0xffffff);
//    material.emissive = new THREE.Color(0xe8e8e8);
//    var cube = new THREE.Mesh(geometry, material);
//    scene.add(cube);
//    // Lines
//    var cube2 = new THREE.BoxHelper(cube);
//    cube2.material.color.set(0xc0c0c0);
//    cube2.material.linewidth = 2;
//    scene.add(cube2);


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

//    console.log(camera.position);
//    console.log(directionalLight.position);


//  TODO : add events to onjects -> Raycaster -> webGL, sonst HTMLNodes
//
//    cube.on("click", function () {
//        alert("you clicked the cube");
//    });
//    cube.addEventListener("onClick", function () {
//        alert("you clicked the cube");
//    });

    var render = function () {
        requestAnimationFrame(render);

        // Update lighting position
        lighting.position.set(camera.position.x, camera.position.y, camera.position.z);

//        cube.rotation.x += 0.005;
//        cube.rotation.y += 0.001;

        // Test with css3d
//        object.rotation.y += 0.01;

        renderer.render(scene, camera);
    };



    $("#id_cube").append(renderer.domElement);
    $("#id_cube").append("<br>");


    // Start rendering
    resizeVizualisation(); // initially
    render();

    //<--



});

// Resize the cube visualization
function resizeVizualisation() {
    var maxHeight = $(window).height() - 235; // = nav + title + footer
    var maxWidth = $("#id_cube").width();
    var aspectRatio = maxWidth / maxHeight;
    camera.aspect = aspectRatio;
    camera.updateProjectionMatrix();
    renderer.setSize(maxWidth, maxHeight);
}
window.addEventListener('resize', resizeVizualisation, false);





// Inits the interface and adds listeners
function init() {

    // TODO add listener for ID/Hash or login...

}

function loadCubeList() {
    var url = CUBE_URL.replace("__id__", ID);
    url = url.replace("__hash__", HASH);
    var request = $.ajax({
        url: url,
        headers: {
            accept: "application/sparql-results+json"
        }
    });

    // Recreate dropdown list for cubes

    request.done(function (content) {
        var obj = $.parseJSON(content);
        var results = obj.results.bindings; // array


        // Clear old cube list
        $("#id_cubeList").empty();

        // Iterate through available cubes
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

        // Clear old dimension list
        $("#id_dimensionList").empty(); // TODO: dimension list 1,2,3

        // Iterate through available dimensions
        $.each(results, function (index, element) {
            var dimensionName = element.DIMENSION_NAME.value;
            var label = element.LABEL.value;

            // Create Dropdown entries
            var itemLink = $("<a href='#'></a>");
            itemLink.text(label);
            var item = $("<li></li>");
            item.append(itemLink);
            $("#id_dimensionList").append(item); // TODO: dimension list 1,2,3

            // Add on-click handler for chosen dimension
            itemLink.on("click", function (e) {
                e.preventDefault();

                // TODO: Add the dimension to the chosen list
                // ...

            });
        });
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

        // Iterate through available dimensions
        $.each(results, function (index, element) {
            var measureName = element.MEASURE_NAME.value;
            var label = element.LABEL.value;

            // Create Dropdown entries
            var itemLink = $("<a href='#'></a>");
            itemLink.text(label);
            var item = $("<li></li>");
            item.append(itemLink);
            $("#id_measureList").append(item);

            // Add on-click handler for chosen measure
            itemLink.on("click", function (e) {
                e.preventDefault();

                // TODO Add the measure to the chosen list
                // ...

            });
        });
    });


    // TODO...

}

// ...for filtering in advance...
function loadEntityList(cubeName, dimensionName) {

    // TODO...

}


// String extension
if (typeof String.prototype.contains === 'undefined') {
    String.prototype.contains = function (str) {
        return this.indexOf(str) > -1;
    };
}
if (typeof String.prototype.startsWith === 'undefined') {
    String.prototype.startsWith = function (str) {
        return this.lastIndexOf(str, 0) === 0
    };
}
if (typeof String.prototype.endsWith === 'undefined') {
    String.prototype.endsWith = function (str) {
        return this.indexOf(str, this.length - str.length) !== -1;
    };
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



// TODO: NON RATATING LABEL
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

// (>'.')>