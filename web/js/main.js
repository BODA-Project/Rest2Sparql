// Custom script for the Rest2Sparql GUI

var cubeList = {};
var dimensionList = {};
var measureList = {};


// Globas vars
var ID = "";
var HASH = "";
var currentCube = "";



// Templates
var CUBE_URL = "./backend?func=<getCubes>&id=<__id__>&hash=<__hash__>";
var DIMENSION_URL = "./backend?func=<getDimensions>&c=<__cube__>&id=<__id__>&hash=<__hash__>";
var MEASURE_URL = "./backend?func=<getMeasures>&c=<__cube__>&id=<__id__>&hash=<__hash__>";
var ENTITY_URL = "./backend?func=<getEntities>&c=<__cube__>&d=<__dimension__>&id=<__id__>&hash=<__hash__>";



var TEST_ID = "8023903";
var TEST_HASH = "7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc";

// Cube class (getCubes)
function Cube(name, comment, label) {
    this.name = name;                   // e.g. http://code-research.eu/resource/Dataset-173bbc55-68ca-4398-bd28-232415f7db4d
    this.comment = comment;             // e.g. fish_ld_be.xlsx  +  fish_ld_bg.xlsx  +  ...
    this.label = label;                 // e.g. headlessMergedCube
}

// Dimension class (getDimensions)
function Dimension(cubeName, dimensionName, label, entities) {
    this.cubeName = cubeName;           // ...
    this.dimensionName = dimensionName; // e.g. http://code-research.eu/resource/Country
    this.label = label;                 // e.g. Country
    this.entities = entities;           // list of entities belonging to the dimension
}

// Measure class (getMeasures)
function Measure(cubeName, measureName, label) {
    this.cubeName = cubeName;           // ...
    this.measureName = measureName;     // e.g. http://code-research.eu/resource/Euro
    this.label = label;                 // e.g. Euro
}

// Entity class (getEntities)
function Entity(cubeName, dimensionName, entityName, label) {
    this.cubeName = cubeName;           // ...
    this.dimensionName = dimensionName; // e.g. http://code-research.eu/resource/Country
    this.entityName = entityName;       // e.g. http://code-research.eu/resource/Entity-1b7500d2-6e12-42f0-a006-f38ae763418f
    this.label = label;                 // e.g. Netherlands
}




// AJAX TESTS
var testQuery1 = "http://localhost:8080/rest2sparql/backend?func=<getCubes>&id=<8023903>&hash=<7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc>";
var testQuery2 = "http://localhost:8080/rest2sparql/backend?func=<execute>&id=<8023903>&hash=<7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc>&m=<http://code-research.eu/resource/Euro>,select=<true>,group=<false>,order=<-1>&d=<http://code-research.eu/resource/Country>,select=<true>,group=<false>,order=<-1>&d=<http://code-research.eu/resource/Species>,select=<false>,group=<false>,order=<-1>,fix=<http://code-research.eu/resource/Entity-279a95fa-ecb7-4ed3-9a1d-c250c6d1acd9>&d=<http://code-research.eu/resource/Year>,select=<true>,group=<false>,order=<-1>&c=<http://code-research.eu/resource/Dataset-173bbc55-68ca-4398-bd28-232415f7db4d>,select=<true>";
var testQuery3 = "http://localhost:8080/rest2sparql/backend?func=%3CgetDimensions%3E&c=%3Chttp://code-research.eu/resource/Dataset-173bbc55-68ca-4398-bd28-232415f7db4d%3E&id=%3C8023903%3E&hash=%3C7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc%3E";
var testQuery4 = "http://localhost:8080/rest2sparql/backend?func=%3Cexecute%3E&id=%3C8023903%3E&hash=%3C7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc%3E&m=%3Chttp://code-research.eu/resource/Euro%3E,select=%3Ctrue%3E,group=%3Cfalse%3E,order=%3C-1%3E,agg=%3Csum%3E&d=%3Chttp://code-research.eu/resource/Country%3E,select=%3Ctrue%3E,group=%3Ctrue%3E,order=%3C-1%3E&d=%3Chttp://code-research.eu/resource/Species%3E,select=%3Cfalse%3E,group=%3Cfalse%3E,order=%3C-1%3E,agg=%3Csum%3E&d=%3Chttp://code-research.eu/resource/Year%3E,select=%3Ctrue%3E,group=%3Ctrue%3E,order=%3C-1%3E&c=%3Chttp://code-research.eu/resource/Dataset-173bbc55-68ca-4398-bd28-232415f7db4d%3E,select=%3Cfalse%3E"
var request = $.ajax({
    url: testQuery4,
    headers: {
        accept: "application/sparql-results+json"
    }
});
request.done(function (content) {
    $("#OUTPUT").append(content);
});


// Initialization
$(document).ready(function () {
    init();

    // TODO for DEBUG
    ID = "8023903";
    HASH = "7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc";
    loadCubeList();

    // TEST of three.js -->

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, 6 / 4, 0.1, 1000);
    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xffffff, 1);
    renderer.setSize(600, 400);

    var geometry = new THREE.BoxGeometry(4, 4, 4);
    var material = new THREE.MeshLambertMaterial({
        color: 'white'
    });
    var cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Lines

    var cube2 = new THREE.BoxHelper(cube);
    cube2.material.color.set(0xa0a0a0);
    cube2.material.linewidth = 3;
    scene.add(cube2);


    var ambientLight = new THREE.AmbientLight(0xe0e0e0);
    scene.add(ambientLight);

    // directional lighting
    var directionalLight = new THREE.DirectionalLight(0x606060);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    camera.position.z = 10;

    var render = function () {
        requestAnimationFrame(render);
        cube.rotation.x += 0.005;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    };
    render();

    $("#id_cube").append(renderer.domElement);
    $("#id_cube").append("<br>");

    // Opacity
    renderer.domElement.style = "opacity:0.5";


    //<--




});





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

// ...for filtering in avance...
function loadEntityList(cubeName, dimensionName) {

    // TODO...

}
