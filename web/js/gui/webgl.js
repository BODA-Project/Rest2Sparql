/* global THREE, INTERFACE, Infinity */

// Namespace for Three.js and WebGL code for visualization

var WEBGL = new function () {

    // Constants
    this.MAX_LABEL_LENGTH = 20;
    this.SPRITE_LENGTH = 6;
    this.SPRITE_HEIGHT_DIMENSION = 1.2;
    this.COLOR_LOWEST = 0xdadada; // Almost white
    this.COLOR_HIGHEST = 0x3484CF; // Dark blue TODO custom color?
    this.COLOR_WHITE = new THREE.Color(0xffffff);
    this.COLOR_HIGHLIGHT = new THREE.Color(0xd8d8d8);

    // Properties
    this.scene;
    this.camera;
    this.renderer;
    this.controls;
    this.lighting;
    this.ambientLight;
    this.animationRequest; // in case of wanting to stop

    // Mouse interaction
    this.raycaster = new THREE.Raycaster();
    this.mousePosition = new THREE.Vector2(); // 2D position on canvas
    this.intersected;

    this.totalSize = [0, 0, 0];

    // Starts the rendering process of three.js, goes infinitly. Call only once!
    this.render = function () {
        this.animationRequest = requestAnimationFrame(this.render.bind(this));
        this.renderer.render(this.scene, this.camera);
        this.controls.update();

        // TEST: make cubes shiver randomly
//        $.each(this.scene.children, function (i, obj) {
//            obj.translateX((Math.random() - 0.5) * 0.01);
//            obj.translateY((Math.random() - 0.5) * 0.01);
//            obj.translateZ((Math.random() - 0.5) * 0.01);
//        });

        // check for hover events
        this.handleHover(); // TEMP better performance if only done when rendered
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
        cube.material.color = this.COLOR_HIGHLIGHT;

        // Show lines around the cube

        // TODO: sind jetzt scheinbar klickbar -> flackern

//        cube.outline = new THREE.EdgesHelper(cube);
//        cube.outline.material.color.set(cube.material.color);
//        cube.outline.material.linewidth = 3;
//        this.scene.add(cube.outline);
    };

    // Resets a highlighted cube to its normal state
    this.resetCube = function (cube) {
        cube.material.color = this.COLOR_WHITE;
//        this.scene.remove(cube.outline);
    };

    // Adds a cube at given coordinates to the scene
    this.addCube = function (coordinates, values, ratios) {

        var ratio = ratios[0]; // TEMP only first ratio is shown for now
        var value = values[0]; // TEMP only first value is shown for now

        // Define the cube
        var cubeSize = 0.80 + 0.20 * ratio;
//        var cubeSize = 0.95;
        var geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize); // TODO nicht würfel sonder etwas flacherer quader -> ca 3x3x2
        var texture = this.createSqareLabelTexture(value, ratio); // TEMP only first value for now ( or: "1st \n 2nd")
        var material = new THREE.MeshLambertMaterial({map: texture});

        material.shading = THREE.NoShading;
        material.fog = false;

        // TODO custom color per measure -> ~ multiply/overlay/opacity effect RGB? "multiply(color);"
        var colorLowest = new THREE.Color(this.COLOR_LOWEST);
        var colorHighest = new THREE.Color(this.COLOR_HIGHEST);

        var resultColor = colorLowest.multiplyScalar(1 - ratio).add(colorHighest.multiplyScalar(ratio));
//        material.emissive = resultColor;

        var cube = new THREE.Mesh(geometry, material);
        cube.position.set(coordinates[0], coordinates[1], coordinates[2]);

        // Add result to the scene
        this.scene.add(cube);

        // Add additional information to each result cube
        cube.measureColor = resultColor; // save color to object TEMP first one for now...

        // Update the total size of the visualization
        $.each(this.totalSize, function (i, size) {
            this.totalSize[i] = (coordinates[i] + 1 > size) ? coordinates[i] + 1 : size;
        }.bind(this));

        // TEST: Lines around every cube
//        var cube2 = new THREE.EdgesHelper(cube);
//        cube2.material.color.set(resultColor);
//        cube2.material.linewidth = 1;
//        this.scene.add(cube2);

        return cube;

    };

    // Adds a label which is placed depending on the given axis and position
    // TODO know highest sprite length of a dimension (to not waste space)
    // TODO bei 2D darstellung -> rotation nach unten bei X-labels
    this.addEntityLabel = function (axis, position, entity, row) {
        var label = this.createEntityLabel(entity.label);
        switch (axis) {
            case "x" :
                // Position
                label.position.x = position;
                label.position.y = -0.5;
                label.position.z = (this.totalSize[2] + (label.labelWidth - 1) / 2 + row * this.SPRITE_LENGTH);

                // Rotation
                label.rotation.x = -degToRad(90);
                label.rotation.z = degToRad(90);
                break;

            case "y" :
                // Position (needs no rotation)
                label.position.x = (this.totalSize[0] + (label.labelWidth - 1) / 2 + row * this.SPRITE_LENGTH);
                label.position.y = position;
                label.position.z = -0.5;
                break;

            case "z" :
                // Position
                label.position.x = (this.totalSize[0] + (label.labelWidth - 1) / 2 + row * this.SPRITE_LENGTH);
                label.position.y = -0.5;
                label.position.z = position;

                // Rotation
                label.rotation.x = -degToRad(90);
                break;
        }
        WEBGL.scene.add(label);
        return label;
    };

    // Adds a dimension label which is placed depending on the given axis
    // TODO bei 2D darstellung -> rotation nach unten bei X-labels
    this.addDimensionLabel = function (axis, dimension, row, numDimensions) {
        var label = this.createDimensionLabel(dimension.label, axis);
        var labelOffset = numDimensions * this.SPRITE_LENGTH + 0.5 + row * this.SPRITE_HEIGHT_DIMENSION; // EntityLabels + previous DimensionLabels
        switch (axis) {
            case "x" :
                // Position
                label.position.x = (this.totalSize[0] - 1) / 2;
                label.position.y = -0.5;
                label.position.z = this.totalSize[2] + labelOffset;

                // Rotation
                label.rotation.x = -degToRad(90);
                break;

            case "y" :
                // Position
                label.position.x = this.totalSize[0] + labelOffset;
                label.position.y = Math.max((label.labelWidth - 1) / 2, (this.totalSize[1] - 1) / 2); // to not overlap with Z labels
                label.position.z = -0.5;

                // Rotation
                label.rotation.z = degToRad(90);
                break;

            case "z" :
                // Position
                label.position.x = this.totalSize[0] + labelOffset;
                label.position.y = -0.5;
                label.position.z = Math.max((label.labelWidth - 1) / 2, (this.totalSize[2] - 1) / 2); // to not overlap with Y labels

                // Rotation
                label.rotation.x = -degToRad(90);
                label.rotation.z = degToRad(90);
                break;
        }
        WEBGL.scene.add(label);
        return label;
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
    this.createEntityLabel = function (text) {
        var size = 30;
        var abbrSign = '\u2026'; // a single char "..." sign

        text = String(text);
        if (text.length > this.MAX_LABEL_LENGTH) {
            text = text.substring(0, this.MAX_LABEL_LENGTH - abbrSign.length);
            text = text + abbrSign;
        }

        var backgroundMargin = size / 1.5;
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        context.font = size + "px monospace";
        var textWidth = context.measureText(text).width;

        canvas.width = textWidth + backgroundMargin * 3; // more horizontal space
        canvas.height = size + backgroundMargin * 2;
        context.font = size + "px monospace"; // important (2. after setting size)

        context.textAlign = "center";
        context.textBaseline = "middle";

//        // DEBUG BORDERS
//        context.strokeStyle = "rgba(0,128,255,0.5)";
//        context.strokeRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = "rgba(0,0,0,0.7)";
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        texture.minFilter = THREE.LinearFilter;

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



    // Creates an entity label with different drawing modes (bold, normal, ...)
    this.createDimensionLabel = function (text, axis) {



        // TODO: code von entityLabel:


        var size = 30;
        var abbrSign = '\u2026'; // a single char "..." sign

        var finalText = String(axis.toUpperCase() + ": " + text);
        if (finalText.length > this.MAX_LABEL_LENGTH) {
            finalText = finalText.substring(0, this.MAX_LABEL_LENGTH - abbrSign.length);
            finalText = finalText + abbrSign;
        }

        var backgroundMargin = size / 4;
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        context.font = size + "px monospace";
        var textWidth = context.measureText(finalText).width;

        canvas.width = textWidth + backgroundMargin * 3; // more horizontal space
        canvas.height = size + backgroundMargin * 2;
        context.font = size + "px monospace"; // important (2. after setting size)

        context.textAlign = "center";
        context.textBaseline = "middle";

//        // DEBUG BORDERS
//        context.strokeStyle = "rgba(0,128,255,0.5)";
//        context.strokeRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = "rgba(0,0,0,0.25)";
        context.fillText(finalText, canvas.width / 2, canvas.height / 2);

        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        texture.minFilter = THREE.LinearFilter;

        var material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            useScreenCoordinates: false
        });

        var finalWidth = (canvas.width / canvas.height) * this.SPRITE_HEIGHT_DIMENSION;
        var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(finalWidth, this.SPRITE_HEIGHT_DIMENSION), material);
        mesh.labelWidth = finalWidth;
        mesh.doubleSided = true;

        // To change between bold and normal font
        mesh.toBold = function () {
            context.font = "bold " + size + "px monospace"; // important (2. after setting size)
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = "rgba(0,0,0,1.0)";
            context.fillText(finalText, canvas.width / 2, canvas.height / 2);
            texture.needsUpdate = true;
        };
        mesh.toNormal = function () {
            context.font = size + "px monospace"; // important (2. after setting size)
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = "rgba(0,0,0,0.25)";
            context.fillText(finalText, canvas.width / 2, canvas.height / 2);
            texture.needsUpdate = true;
        };
        mesh.toSelected = function () {
            context.font = "bold " + size + "px monospace"; // important (2. after setting size)
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = "rgba(50,200,50,1.0)";
            context.fillText(finalText, canvas.width / 2, canvas.height / 2);
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

        // Compute a background color
        var colorLowest = new THREE.Color(this.COLOR_LOWEST);
        var colorHighest = new THREE.Color(this.COLOR_HIGHEST);
        var backgroundColor = colorLowest.multiplyScalar(1 - ratio).add(colorHighest.multiplyScalar(ratio)).getHexString();

        // TODO (evtl) method to change background color to a given value

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

        context.fillStyle = "#" + backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "rgba(0,0,0," + ratio + ")"; // TODO if brightness below 50% -> white font und 1-ratio
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        texture.minFilter = THREE.LinearFilter;

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
        this.ambientLight = new THREE.AmbientLight(0xffffff);
        this.scene.add(this.lighting);
        this.scene.add(this.ambientLight);

        // Orbit controls
        this.controls.noKeys = true;
//        this.controls.noPan = true;
        this.controls.minDistance = 15;
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
        var material = new THREE.MeshLambertMaterial({color: 0xe4e4e4});
        material.shading = THREE.NoShading;
        material.fog = false;
        var cube = new THREE.Mesh(geometry, material);
        var lines = new THREE.BoxHelper(cube);
        lines.material.color.set(0xe0e0e0);
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
        this.scene.add(this.ambientLight);

        // Reset the total size
        this.totalSize = [0, 0, 0];

        // Reset controls
        this.controls.autoRotate = false;
    };

    // Executes hover events on threejs objects
    this.handleHover = function () {

        // only highlight results if no mouse buttons pressed
        if (INTERFACE.mousePressed) {
            return;
        }

        // project mouse to 3d scene
        this.raycaster.setFromCamera(this.mousePosition, this.camera);
        var intersections = this.raycaster.intersectObjects(this.scene.children); // TODO erstmal so, inperformant aber geht
        if (intersections.length > 0) {

            // Only call once while hovering one object
            if (this.intersected !== intersections[0].object) {
//            console.log(intersections[0])

                if (this.intersected && this.intersected.onmouseout !== undefined) {
//                console.log(intersected)
                    this.intersected.onmouseout();
                }

                // Grab new intersection object
                this.intersected = intersections[0].object;
                if (this.intersected.onmouseover !== undefined) {
                    this.intersected.onmouseover();
                }
            }
            this.renderer.domElement.style.cursor = 'pointer'; // Set cursor to hand TODO only certain types (resut cubes, labels, ...)
        } else if (this.intersected) {
            // Not hovering above anything anymore
            if (this.intersected.onmouseout !== undefined) {
                this.intersected.onmouseout();
            }

            // Forget last intersection
            this.intersected = null;
            this.renderer.domElement.style.cursor = 'auto'; // Set cursor to normal
        }
    };

    // Executes click events on threejs objects
    this.handleClick = function () {

        // project mouse to 3d scene
        this.raycaster.setFromCamera(this.mousePosition, this.camera);
        var intersections = this.raycaster.intersectObjects(this.scene.children); // TODO erstmal so, inperformant aber geht
        if (intersections.length > 0) {
            // TODO: only if no disabled flag set (?)
            if (intersections[0].object.onclick !== undefined) {
                intersections[0].object.onclick();
            }
        }
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