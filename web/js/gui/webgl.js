/* global THREE, INTERFACE, Infinity */

// Namespace for Three.js and WebGL code for visualization

var WEBGL = new function () {

    // Constants
    this.MAX_LABEL_LENGTH = 20;
    this.COLOR_LOWEST = 0xd8d8d8; // Almost white
    this.COLOR_HIGHEST = 0xff8921; // Dark blue TODO custom color?

    // Properties
    this.scene;
    this.camera;
    this.renderer;
    this.controls;
    this.lighting;
    this.animationRequest; // in case of wanting to stop

    this.totalSize = [0, 0, 0];

    // Starts the rendering process of three.js, goes infinitly. Call only once!
    this.render = function () {
        this.renderer.render(this.scene, this.camera);
        this.controls.update();
        this.animationRequest = requestAnimationFrame(this.render.bind(this));
    };

    // Stops rendering completely
    this.stopRendering = function () {
        cancelAnimationFrame(this.animationRequest);
    };

    // Resumes rendering
    this.resumeRendering = function () {
        this.animationRequest = requestAnimationFrame(this.render.bind(this));
    };

    // Update when the orbit control was moved
    this.onControlMoved = function () {
        // Update lighting position to follow the camera
        this.lighting.position.copy(this.camera.position);
    };

    // Resizes the WebGL visualization (on browser window resize).
    this.resizeVizualisation = function () {
        var maxHeight = $(window).height() - 235; // = nav + title + footer
        var maxWidth = $("#id_cube").width();
        var aspectRatio = maxWidth / maxHeight;
        this.camera.aspect = aspectRatio;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(maxWidth, maxHeight);
    };

    // Hilights a given cube mesh
    this.highlightCube = function (cube) {
        cube.material.emissive = cube.measureColor.clone().multiplyScalar(0.9);

        // Show lines around the cube
        cube.outline = new THREE.EdgesHelper(cube);
        cube.outline.material.color.set(cube.material.emissive);
        cube.outline.material.linewidth = 3;
        this.scene.add(cube.outline);
    };

    // Resets a highlighted cube to its normal state
    this.resetCube = function (cube) {
        cube.material.emissive = cube.measureColor;
        this.scene.remove(cube.outline);
    };

    // Adds a cube at given coordinates to the scene
    this.addCube = function (coordinates, values, ratios) {

        var ratio = ratios[0]; // TEMP only first ratio is shown for now
        var value = values[0]; // TEMP only first value is shown for now
        var cubeSize = 0.80 + 0.20 * ratio;

        var geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize); // TODO nicht würfel sonder etwas flacherer quader -> ca 3x3x2
        var material = new THREE.MeshLambertMaterial();

        var texture = this.createSqareLabelTexture(value, ratio); // TEMP only first value for now ( or: "1st \n 2nd")
        var material = new THREE.MeshLambertMaterial({map: texture});

        material.shading = THREE.NoShading;
        material.fog = false;

        // TODO custom color per measure -> ~ multiply/overlay/opacity effect RGB? "multiply(color);"
        var colorLowest = new THREE.Color(this.COLOR_LOWEST);
        var colorHighest = new THREE.Color(this.COLOR_HIGHEST);

        var resultColor = colorLowest.multiplyScalar(1 - ratio).add(colorHighest.multiplyScalar(ratio));
        material.emissive = resultColor;

        var cube = new THREE.Mesh(geometry, material);
        cube.position.set(coordinates[0], coordinates[1], coordinates[2]);

        // Add result to the scene
        this.scene.add(cube);

        // Add additional information to each result cube
        cube.measureColor = resultColor; // save color to object TEMP first one for now...

        // Update the total size of the visualization
        $.each(this.totalSize, function (i, size) {
            this.totalSize[i] = (coordinates[i] > size) ? coordinates[i] : size;
        }.bind(this));

        // TEST: Lines around every cube
//        var cube2 = new THREE.EdgesHelper(cube);
//        cube2.material.color.set(resultColor);
//        cube2.material.linewidth = 1;
//        this.scene.add(cube2);

        return cube;

    };

    // Adds three grids to each ground of the visualization with the known total size
    this.addGrid = function () {
        // TODO

//        var size = 20;
//        var step = 1;
//        var gridHelper = new THREE.GridHelper(size, step);
//        gridHelper.setColors(new THREE.Color(0xd8d8d8), new THREE.Color(0xf0f0f0));
//        gridHelper.position.set(centerPoint[0], -0.5, centerPoint[2]);
//        scene.add(gridHelper);

    };


    // Updates the center point of the cube for the orbit-camera to move around
    this.updateCenterPoint = function () {
        console.log("totalSize: ", this.totalSize);

        // TODO better view / distance / panning view?

        var distance = Math.max(this.totalSize[0], this.totalSize[1], this.totalSize[2]);
        this.camera.position.x = this.totalSize[0] + 5;
        this.camera.position.y = this.totalSize[1] + 5;
        this.camera.position.z = this.totalSize[2] + distance * 2; // TODO how far away?
        this.controls.target = new THREE.Vector3(this.totalSize[0] / 2, this.totalSize[1] / 2, this.totalSize[2] / 2);
        this.controls.update();
    };



    // Creates an entity label with different drawing modes (bold, normal, ...)
    this.createLabel = function (text) {
        var size = 30;
        var abbrSign = '\u2026'; // a single char "..." sign

        text = String(text);
        if (text.length > MAX_LABEL_LENGTH) {
            text = text.substring(0, MAX_LABEL_LENGTH - abbrSign.length);
            text = text + abbrSign;
        }

        var backgroundMargin = size / 1.5;
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        context.font = size + "px monospace";
        var textWidth = context.measureText(text).width;

        canvas.width = textWidth + backgroundMargin * 2;
        canvas.height = size + backgroundMargin * 2;
        context.font = size + "px monospace"; // important (2. after setting size)

        context.textAlign = "center";
        context.textBaseline = "middle";

        context.fillStyle = "rgba(0,0,0,0.7)";
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

        // To change between bold and normal font
        mesh.toBold = function () {
            context.font = "bold " + size + "px monospace"; // important (2. after setting size)
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = "rgba(0,0,0,1.0)";
            context.fillText(text, canvas.width / 2, canvas.height / 2);
            texture.needsUpdate = true;
        };
        mesh.toNormal = function () {
            context.font = size + "px monospace"; // important (2. after setting size)
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = "rgba(0,0,0,0.7)";
            context.fillText(text, canvas.width / 2, canvas.height / 2);
            texture.needsUpdate = true;
        };
        mesh.toSelected = function () {
            context.font = "bold " + size + "px monospace"; // important (2. after setting size)
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = "rgba(50,200,50,1.0)";
            context.fillText(text, canvas.width / 2, canvas.height / 2);
            texture.needsUpdate = true;
        };

        mesh.tooltip = text;
//        console.log(mesh)

        return mesh;
    };



    // TEST measure as cube label (TODO better wrapping, 6 different sides)
    this.createSqareLabelTexture = function (text, ratio) {

        // round numbers to 2 digits
        if ($.isNumeric(text)) {
            text = Math.round(text * 100) / 100;
        }

        ratio = Math.max(ratio, 0.25);
        var fontSize = 20;
        var backgroundMargin = fontSize / 2;
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        context.font = fontSize + "px sans-serif";
        var textWidth = context.measureText(text).width;

        canvas.width = textWidth + backgroundMargin * 2;
        canvas.height = textWidth + backgroundMargin * 2;
        context.font = fontSize + "px sans-serif"; // important (2. after setting size)

        context.textAlign = "center";
        context.textBaseline = "middle";

        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.width);
        context.fillStyle = "rgba(0,0,0," + ratio + ")";
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;

        return texture;
    };

    // Sets up three.js
    this.initThreeJs = function () {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(30, 2 / 1, 0.1, 2000);
        this.renderer = new THREE.WebGLRenderer({antialias: true}); // TODO AA as option?
//        this.renderer = new THREE.CanvasRenderer();
//        this.renderer = new THREE.CSS2DRenderer();
//        this.renderer = new THREE.CSS3DRenderer();
//        this.renderer = new THREE.SVGRenderer();
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.lighting = new THREE.PointLight(0x202020, 1, 0);
        this.scene.add(this.lighting);

        // Orbit controls
        this.controls.noKeys = true;
//        this.controls.noPan = true;
        this.controls.minDistance = 20;
//        this.controls.maxDistance = 40;
        this.controls.rotateSpeed = 0.75;
//        this.controls.zoomSpeed = 0.5;
        this.controls.addEventListener('change', WEBGL.onControlMoved.bind(this), false);

        this.renderer.setClearColor(0xffffff, 1);

        // Add the canvas to the page
        $("#id_cube").append(this.renderer.domElement);

        // Raycast for mouse events
        $(this.renderer.domElement).on("mousemove", INTERFACE.onCanvasMouseMove.bind(INTERFACE));
        $(this.renderer.domElement).on("click", INTERFACE.onCanvasMouseClick.bind(INTERFACE));
        $(this.renderer.domElement).on("mousedown", INTERFACE.onCanvasMouseDown.bind(INTERFACE));

        // Start rendering TODO: für "loading-screen" ok -> rotierender cube
        WEBGL.resizeVizualisation(); // initially
        this.animationRequest = requestAnimationFrame(this.render.bind(this));

    };


    // Shows a WebGL loading screen, containing a rotating cube with a given message for demonstration.
    // TODO: fade-in / fade out
    this.showLoadingScreen = function (loadingMessage) {

        // Remove old vislualization first
        this.unloadVisualization();

        var cubeSize = 20;

        // Show loading sign as texture
        if (loadingMessage !== undefined) {

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
        this.scene.add(cube);
        this.scene.add(lines);

        // Set up camera
        this.camera.position.x = 50;
        this.camera.position.y = 30;
        this.camera.position.z = 50;

        this.controls.target = new THREE.Vector3(0, 0, 0);
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 5;
        this.controls.update();

    };

    this.unloadVisualization = function () {
        // TODO: hide/empty current scene, and show loading screen

        // Clear old scene
        this.scene.children = []; // TODO better way?
        this.scene.add(this.lighting); // Add light again

        // Reset the total size
        this.totalSize = [0, 0, 0];

        // Reset controls
        this.controls.autoRotate = false;
    };


    // HELP FUNCTIONS ==========================================================


    var degToRad = function (deg) {
        return deg * Math.PI / 180;
    };

    // Returns a string like 71.003.345 (adds points and comma)
    var formatNumber = function (num) {
        // TODO
        return num;
    };
};