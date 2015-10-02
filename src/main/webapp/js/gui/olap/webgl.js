/* global THREE, INTERFACE, Infinity, MAIN */

// Namespace for Three.js and WebGL code for visualization

var WEBGL = new function () {

    // Constants
    this.MAX_LABEL_LENGTH = 20;
//    this.SPRITE_LENGTH = 6;
    this.SPRITE_LENGTH = 4.7;
    this.SPRITE_HEIGHT_DIMENSION = 1.2;
    this.COLOR_SELECTION = 0x505050;
    this.COLOR_LOWEST = 0xe0e0e0; // Almost white
    this.COLOR_WHITE = new THREE.Color(0xffffff);
    this.COLOR_HIGHLIGHT = new THREE.Color(0xd8d8d8);

    // Properties
    this.scene;
    this.camera;
    this.renderer;
    this.controls;
    this.lighting;
    this.ambientLight;

    // WebGL status (in case of wanting to pause)
    this.animationRequest;
    this.isPaused = false;

    // Mouse interaction
    this.raycaster = new THREE.Raycaster();
    this.mousePosition = new THREE.Vector2(-999, 999); // 2D position on canvas
    this.intersected;

    // Total cube size
    this.totalSize = [0, 0, 0];


    // Sets up three.js
    this.initThreeJs = function () {
        WEBGL.scene = new THREE.Scene();
        WEBGL.camera = new THREE.PerspectiveCamera(30, 2 / 1, 0.1, 2000);
//        WEBGL.camera = new THREE.OrthographicCamera(-(2 / 1) * viewsize / 2, (2 / 1) * viewsize / 2, viewsize / 2, -viewsize / 2, -100, 100);

        // Create the renderer and add its canvas to the page
        WEBGL.renderer = new THREE.WebGLRenderer({antialias: true});
//        WEBGL.renderer = new THREE.CanvasRenderer();
//        WEBGL.renderer = new THREE.CSS2DRenderer();
//        WEBGL.renderer = new THREE.CSS3DRenderer();
//        WEBGL.renderer = new THREE.SVGRenderer();
        WEBGL.renderer.setClearColor(0xffffff, 1);
        $("#id_cube").append(WEBGL.renderer.domElement);

        WEBGL.controls = new THREE.OrbitControls(WEBGL.camera, WEBGL.renderer.domElement);
        WEBGL.lighting = new THREE.PointLight(0x202020, 1, 0);
        WEBGL.ambientLight = new THREE.AmbientLight(0xffffff);
        WEBGL.scene.add(WEBGL.lighting);
        WEBGL.scene.add(WEBGL.ambientLight);

        // Orbit controls
        WEBGL.controls.noKeys = true;
//        WEBGL.controls.noPan = true;
        WEBGL.controls.minDistance = 15;
//        WEBGL.controls.maxDistance = Infinity;
        WEBGL.controls.rotateSpeed = 0.75;
//        WEBGL.controls.zoomSpeed = 0.5;
        WEBGL.controls.addEventListener('change', WEBGL.onControlMoved, false);

        // Raycast for mouse events
        $(WEBGL.renderer.domElement).on("mousemove", INTERFACE.onCanvasMouseMove);
        $(WEBGL.renderer.domElement).on("click", INTERFACE.onCanvasMouseClick);
        $(WEBGL.renderer.domElement).on("mousedown", INTERFACE.onCanvasMouseDown);
        $(WEBGL.renderer.domElement).on("mouseout", INTERFACE.onCanvasMouseLeave);

        // Start rendering
        WEBGL.resizeVizualisation(); // initially
        WEBGL.animationRequest = requestAnimationFrame(WEBGL.render);
    };

    // Starts the rendering process of three.js, goes infinitly. Call only once!
    this.render = function () {
        WEBGL.animationRequest = requestAnimationFrame(WEBGL.render);
        WEBGL.renderer.render(WEBGL.scene, WEBGL.camera);
        WEBGL.controls.update();

        // for fun: make cubes shiver randomly
//        $.each(WEBGL.scene.children, function (i, obj) {
//            obj.translateX((Math.random() - 0.5) * 0.01);
//            obj.translateY((Math.random() - 0.5) * 0.01);
//            obj.translateZ((Math.random() - 0.5) * 0.01);
//        });

        // check for hover events
        WEBGL.handleHover(); // TEMP better performance if only done when rendered
    };

    /**
     * Stops rendering completely.
     */
    this.stopRendering = function () {
        if (!WEBGL.isPaused && WEBGL.animationRequest) {
            cancelAnimationFrame(WEBGL.animationRequest);
            WEBGL.isPaused = true;
        }
    };

    // Resumes rendering
    this.resumeRendering = function () {
        if (WEBGL.isPaused) {
            WEBGL.animationRequest = requestAnimationFrame(WEBGL.render);
            WEBGL.isPaused = false;
        }
    };

    // Update when the orbit control was moved
    this.onControlMoved = function () {
        // Update lighting position to follow the camera
        WEBGL.lighting.position.copy(WEBGL.camera.position);
    };

    // Resizes the WebGL visualization (on browser window resize).
    this.resizeVizualisation = function () {
        var maxHeight = $(window).height() - 235; // = nav + title + footer
        var maxWidth = $("#id_cube").innerWidth();
        var aspectRatio = maxWidth / maxHeight;
        WEBGL.camera.aspect = aspectRatio;
        WEBGL.camera.updateProjectionMatrix();
        WEBGL.renderer.setSize(maxWidth, maxHeight);
    };

    // Hilights a given cube mesh
    this.highlightCube = function (cube) {
        // Show lines around the cube
        cube.material.color = WEBGL.COLOR_HIGHLIGHT;
        cube.outline = new THREE.EdgesHelper(cube);
        cube.outline.material.color.set(cube.lineColor);
        cube.outline.material.linewidth = 3;
        cube.outline.material.transparent = true;
        WEBGL.scene.add(cube.outline);

        if (cube.hidden) {
            cube.material.transparent = true;
            cube.material.opacity = 0.6;
            cube.outline.material.opacity = 0.6;
            cube.visible = true; // but still marked as hidden
        }

    };

    // Resets a highlighted cube to its normal state
    this.resetCube = function (cube) {
        cube.material.color = WEBGL.COLOR_WHITE;
        WEBGL.scene.remove(cube.outline);
        cube.visible = !cube.hidden;
        cube.material.transparent = false;
        cube.material.opacity = 1;
    };

    /**
     * Highlights all cubes matching the current tempSelection and hides others
     */
    this.highlightSelectedCubes = function () {
        var checkDimension = function (dimension, cube) {
            var dN = dimension.dimensionName;
            if (MAIN.tempSelection[dN] && MAIN.tempSelection[dN].length > 0) {
                var result = false;
                $.each(MAIN.tempSelection[dN], function (i, entity) {
                    if (cube[dN] === entity.entityName) {
                        result = true;
                        return false; // break
                    }
                });
                return result;
            } else {
                return true; // no restriction in this dimension
            }
        };

        $.each(WEBGL.scene.children, function (i, cube) {
            if (cube.name !== "resultCube") {
                return true; // Skip non cubes
            }
            var selected = true;

            // Check for all given dimensions
            $.each(MAIN.xDimensions, function (i, dimension) {
                selected = selected && checkDimension(dimension, cube);
            });
            $.each(MAIN.yDimensions, function (i, dimension) {
                selected = selected && checkDimension(dimension, cube);
            });
            $.each(MAIN.zDimensions, function (i, dimension) {
                selected = selected && checkDimension(dimension, cube);
            });

            // Apply opacity
            if (selected) {

                // Hide sprite and show cube again
                cube.visible = true;
                cube.hidden = false; // own flag
                if (cube.hiddenSprite) {
                    cube.hiddenSprite.visible = false;
                }
            } else {
                if (!cube.hiddenSprite) {
                    cube.hiddenSprite = WEBGL.createCubeSprite(cube.measureColor);
                    cube.hiddenSprite.position.copy(cube.position);
                    WEBGL.scene.add(cube.hiddenSprite);
                }

                // Hide cube and show sprite
                cube.visible = false;
                cube.hidden = true; // own flag
                cube.hiddenSprite.visible = true;
            }
        });
    };

    // Hilights a given labels's similar labels
    this.highlightLabels = function (label) {
        $.each(label.sprites, function (i, sprite) {
            if (!sprite.toggled) {
                sprite.toBold();
            }
        });
    };

    // Resets a given labels's similar labels
    this.resetLabels = function (label) {
        $.each(label.sprites, function (i, sprite) {
            if (!sprite.toggled) {
                sprite.toNormal();
            }
        });
    };

    // Adds a cube at given coordinates to the scene
    this.addCube = function (coordinates, values, ratios) {

        var ratio = ratios[0]; // TEMP only first ratio is shown for now
        var value = values[0]; // TEMP only first value is shown for now

        // Define the cube
//        var cubeSize = 0.90 + 0.10 * ratio;
        var cubeSize = 0.95;
//        var cubeSize = 1;
        var geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        var texture = WEBGL.createSqareLabelTexture(value, ratio); // TEMP only first value for now
        var material = new THREE.MeshLambertMaterial({map: texture});

        material.shading = THREE.NoShading;
        material.fog = false;

        // Transparency
//        material.transparent = true;
//        material.opacity = 1.0;

        var colorLowest = new THREE.Color(WEBGL.COLOR_LOWEST);
        var colorHighest = new THREE.Color(MAIN.currentColor);
//        var colorHighest = new THREE.Color(WEBGL.COLOR_HIGHEST);

        var resultColor = colorLowest.multiplyScalar(1 - ratio).add(colorHighest.multiplyScalar(ratio));

        var cube = new THREE.Mesh(geometry, material);
        cube.position.set(coordinates[0], coordinates[1], coordinates[2]);

        // Add result to the scene
        WEBGL.scene.add(cube);

        // Add additional information to each result cube
        cube.measureColor = resultColor; // save color to object TEMP first one for now...
        cube.lineColor = resultColor.clone().multiplyScalar(0.8); // save color to object TEMP first one for now...

        // Update the total size of the visualization
        $.each(WEBGL.totalSize, function (i, size) {
            WEBGL.totalSize[i] = (coordinates[i] + 1 > size) ? coordinates[i] + 1 : size;
        });

        // Lines around every cube
//        var cube2 = new THREE.EdgesHelper(cube);
//        cube2.material.color.set(resultColor);
//        cube2.material.linewidth = 2;
//        WEBGL.scene.add(cube2);

        // Add a name to identify these cubes later
        cube.name = "resultCube";

        return cube;

    };

    // Adds a label which is placed depending on the given axis and position
    this.addEntityLabel = function (axis, position, entity, row) {
        var label = WEBGL.createEntityLabel(entity.label);
        var offset = WEBGL.computeLabelOffset(MAIN[axis + "Dimensions"], row); // get offset from largest labels
        label.axis = axis; // Save the axis which it belongs to
        switch (axis) {
            case "x" :
                // Position
                label.position.x = position;
                label.position.y = (WEBGL.totalSize[1] + (label.labelWidth - 1) / 2 + offset);
                label.position.z = -0.5;

                // Rotation
//                label.rotation.x = -degToRad(90);
                label.rotation.z = -degToRad(90);
                break;

            case "y" :
                // Position (needs no rotation)
                label.position.x = -(label.labelWidth + 1) / 2 - offset;
                label.position.y = position;
                label.position.z = -0.5;
                break;

            case "z" :
                // Position
                label.position.x = -(label.labelWidth + 1) / 2 - offset;
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
    this.addDimensionLabel = function (axis, dimension, row) {
        var label = WEBGL.createDimensionLabel(dimension.label, axis);
        var dimensionList = MAIN[axis + "Dimensions"];
        var entitiesOffset = WEBGL.computeLabelOffset(dimensionList, dimensionList.length); // get offset from largest labels
        var labelOffset = entitiesOffset + row * WEBGL.SPRITE_HEIGHT_DIMENSION; // EntityLabels + previous DimensionLabels
        switch (axis) {
            case "x" :
                // Position
//                label.position.x = (WEBGL.totalSize[0] - 1) / 2;
//                label.position.y = -0.5;
//                label.position.z = WEBGL.totalSize[2] + labelOffset;

                label.position.x = (WEBGL.totalSize[0] - 1) / 2;
                label.position.y = WEBGL.totalSize[1] + labelOffset + WEBGL.SPRITE_HEIGHT_DIMENSION - 1;
                label.position.z = -0.5;

                // Rotation
//                label.rotation.x = -degToRad(90);
                break;

            case "y" :
                // Position
                label.position.x = -WEBGL.SPRITE_HEIGHT_DIMENSION - labelOffset;
                label.position.y = Math.max((label.labelWidth - 1) / 2, (WEBGL.totalSize[1] - 1) / 2); // to not overlap with Z labels
                label.position.z = -0.5;

                // Rotation
                label.rotation.z = -degToRad(90);
                break;

            case "z" :
                // Position
                label.position.x = -WEBGL.SPRITE_HEIGHT_DIMENSION - labelOffset;
                label.position.y = -0.5;
                label.position.z = Math.max((label.labelWidth - 1) / 2, (WEBGL.totalSize[2] - 1) / 2); // to not overlap with Y labels

                // Rotation
                label.rotation.x = -degToRad(90);
                label.rotation.z = -degToRad(90);
                break;
        }
        WEBGL.scene.add(label);
        return label;
    };

    // Adds three grids to each ground of the visualization with the known total size
    this.addGrid = function () {

        var hasX = MAIN.xDimensions.length > 0;
        var hasY = MAIN.yDimensions.length > 0;
        var hasZ = MAIN.zDimensions.length > 0;

        var sizeX = WEBGL.totalSize[0];
        var sizeY = WEBGL.totalSize[1];
        var sizeZ = WEBGL.totalSize[2];

        // New line geometry containing multiple lines
        var gridGeometry = new THREE.Geometry();
        var material = new THREE.LineBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.15
        });

        // Back grid (X,Y)
        if (hasX && hasY && (sizeX > 1 && sizeY > 1)) {
            for (var x = 0; x <= sizeX; x++) {
                gridGeometry.vertices.push(new THREE.Vector3(x, 0, 0), new THREE.Vector3(x, sizeY, 0));
            }
            for (var y = 0; y <= sizeY; y++) {
                gridGeometry.vertices.push(new THREE.Vector3(0, y, 0), new THREE.Vector3(sizeX, y, 0));
            }
        }

        // Bottom grid (X,Z)
        if (hasX && hasZ && (sizeX > 1 && sizeZ > 1)) {
            for (var x = 0; x <= sizeX; x++) {
                gridGeometry.vertices.push(new THREE.Vector3(x, 0, 0), new THREE.Vector3(x, 0, sizeZ));
            }
            for (var z = 0; z <= sizeZ; z++) {
                gridGeometry.vertices.push(new THREE.Vector3(0, 0, z), new THREE.Vector3(sizeX, 0, z));
            }
        }

        // Side grid (Y,Z)
        if (hasY && hasZ && (sizeY > 1 && sizeZ > 1)) {
            for (var y = 0; y <= sizeY; y++) {
                gridGeometry.vertices.push(new THREE.Vector3(sizeX, y, 0), new THREE.Vector3(sizeX, y, sizeZ));
            }
            for (var z = 0; z <= sizeZ; z++) {
                gridGeometry.vertices.push(new THREE.Vector3(sizeX, 0, z), new THREE.Vector3(sizeX, sizeY, z));
            }
        }

        var lines = new THREE.Line(gridGeometry, material, THREE.LinePieces);
        lines.position.x -= 0.5;
        lines.position.y -= 0.5;
        lines.position.z -= 0.5;
        WEBGL.scene.add(lines);
    };

    // Shows a surrounding transparent cube of a selected label
    this.addSelectionCube = function (label) {
        var x, y, z, width, height, depth;
        switch (label.axis) {
            case "x" :
                x = label.position.x;
                y = (WEBGL.totalSize[1] - 1) / 2;
                z = (WEBGL.totalSize[2] - 1) / 2;
                width = label.selectionSize;
                height = WEBGL.totalSize[1];
                depth = WEBGL.totalSize[2];
                break;
            case "y" :
                x = (WEBGL.totalSize[0] - 1) / 2;
                y = label.position.y;
                z = (WEBGL.totalSize[2] - 1) / 2;
                width = WEBGL.totalSize[0];
                height = label.selectionSize;
                depth = WEBGL.totalSize[2];
                break;
            case "z" :
                x = (WEBGL.totalSize[0] - 1) / 2;
                y = (WEBGL.totalSize[1] - 1) / 2;
                z = label.position.z;
                width = WEBGL.totalSize[0];
                height = WEBGL.totalSize[1];
                depth = label.selectionSize;
                break;
        }
        var geometry = new THREE.BoxGeometry(width, height, depth);
        var material = new THREE.MeshLambertMaterial({color: WEBGL.COLOR_SELECTION});
//        var material = new THREE.MeshLambertMaterial({color: MAIN.currentColor});
//        var material = new THREE.MeshBasicMaterial({color: WEBGL.COLOR_SELECTION});
        material.transparent = true;
        material.opacity = 0.15;

        // Fix for graphical bugs (overlapping planes)
        material.depthTest = true;
        material.depthWrite = false;

        label.selectionCube = new THREE.Mesh(geometry, material);
        label.selectionCube.position.set(x, y, z);

//        label.selectionCube.scale.set(scale,scale,scale);
        label.selectionCubeOutline = new THREE.BoxHelper(label.selectionCube);
        label.selectionCubeOutline.material.color.set(WEBGL.COLOR_SELECTION);
//        label.selectionCubeOutline.material.color.set(MAIN.currentColor);
        label.selectionCubeOutline.material.linewidth = 2;
        label.selectionCubeOutline.material.opacity = 0.15;
        label.selectionCubeOutline.material.transparent = true;

        // Fix for graphical bugs (overlapping planes)
        label.selectionCubeOutline.material.depthTest = true;
        label.selectionCubeOutline.material.depthWrite = false;

        WEBGL.scene.add(label.selectionCube);
        WEBGL.scene.add(label.selectionCubeOutline);
    };

    // Hides / Removes the selection cube of a given label
    this.removeSelectionCube = function (label) {
        WEBGL.scene.remove(label.selectionCube);
        WEBGL.scene.remove(label.selectionCubeOutline);
        label.selectionCube = null;
        label.selectionCubeOutline = null;
    };


    // Updates the center point of the cube for the orbit-camera to move around
    this.resetCameraView = function () {
        console.log("totalSize: ", WEBGL.totalSize);

        var x = WEBGL.totalSize[0];
        var y = WEBGL.totalSize[1];
        var z = WEBGL.totalSize[2];

        // Compute min/max position of scene
        var minX = 0;
        var maxX = 0;
        var minY = 0;
        var maxY = 0;
        var minZ = 0;
        var maxZ = 0;
        $.each(WEBGL.scene.children, function (i, obj) {
            // Skip non mesh objects
            if (obj.type !== "Mesh") {
                return true; // Skip
            }
            minX = Math.min(minX, obj.position.x);
            maxX = Math.max(maxX, obj.position.x);
            minY = Math.min(minY, obj.position.y);
            maxY = Math.max(maxY, obj.position.y);
            minZ = Math.min(minZ, obj.position.z);
            maxZ = Math.max(maxZ, obj.position.z);
        });

        // Determine view
        var centerPos;
        if (MAIN.zDimensions.length === 0) {
            // Front view for 2D data,
            centerPos = new THREE.Vector3(
                    (maxX + minX) / 2,
                    (maxY + minY) / 2,
                    (maxZ + minZ) / 2);
            WEBGL.camera.position.copy(centerPos);
            WEBGL.camera.position.add(new THREE.Vector3(0, 0, 1));
            WEBGL.controls.noRotate = true; // Disable rotation
        } else {
            // Diagonal view for 3D (other) data
            centerPos = new THREE.Vector3(
                    (maxX + minX + x) / 4,
                    (maxY + minY + y) / 4,
                    (maxZ + minZ + z) / 4);

            // Compute good angle ratio
            var vec = new THREE.Vector3(-(maxZ - minZ), 1, maxX - minX);
            vec.normalize();
            vec.setX(Math.min(vec.x, -0.5));
            vec.setY(0.5);
            vec.setZ(Math.max(vec.z, 0.5));

            WEBGL.camera.position.copy(centerPos);
            WEBGL.camera.position.add(vec);
            WEBGL.controls.noRotate = false; // Enable rotation
        }
        WEBGL.controls.target = centerPos;
        WEBGL.controls.update();

        // Zoom out untill all objects are visible
        var frustum = new THREE.Frustum();
        var cameraViewProjectionMatrix = new THREE.Matrix4();
        WEBGL.camera.updateMatrixWorld(); // make sure the camera matrix is updated
        WEBGL.camera.matrixWorldInverse.getInverse(WEBGL.camera.matrixWorld);
        cameraViewProjectionMatrix.multiplyMatrices(WEBGL.camera.projectionMatrix, WEBGL.camera.matrixWorldInverse);
        frustum.setFromMatrix(cameraViewProjectionMatrix);
        var existsHidden = true;
        while (existsHidden) {
            existsHidden = false;
            $.each(WEBGL.scene.children, function (i, obj) {
                // Skip non mesh objects
                if (obj.type !== "Mesh") {
                    return true; // Skip
                }
                if (!frustum.containsPoint(obj.position)) {
                    // Not far enough, zoom out and repeat
                    existsHidden = true;
//                    console.log("zooming out");

                    WEBGL.controls.dollyOut(1.05);
                    WEBGL.controls.update();

                    // Update frusum for next check
                    var cameraViewProjectionMatrix = new THREE.Matrix4();
                    WEBGL.camera.updateMatrixWorld(); // make sure the camera matrix is updated
                    WEBGL.camera.matrixWorldInverse.getInverse(WEBGL.camera.matrixWorld);
                    cameraViewProjectionMatrix.multiplyMatrices(WEBGL.camera.projectionMatrix, WEBGL.camera.matrixWorldInverse);
                    frustum.setFromMatrix(cameraViewProjectionMatrix);
                    return false;
                }
            });
        }

        // Zoom out a bit more
        WEBGL.controls.dollyOut(1.10);
        WEBGL.controls.update();

    };

    /**
     * Sets the limits of zooming (min, max) according to the size of the visualization.
     */
    this.updateControlLimits = function () {
        var x = WEBGL.totalSize[0];
        var y = WEBGL.totalSize[1];
        var z = WEBGL.totalSize[2];
        var centerPos = new THREE.Vector3(x / 2, y / 2, z / 2);
        var distance = WEBGL.camera.position.distanceTo(centerPos);
        WEBGL.controls.maxDistance = distance * 1.4; // 40% zoom out max
    };

    // Creates an entity label with different drawing modes (bold, normal, ...)
    this.createEntityLabel = function (text) { // TODO split: number of entities + label
        var size = 30;
        var abbrSign = '\u2026'; // a single char "..." sign

        text = String(text);
        if (text.length > WEBGL.MAX_LABEL_LENGTH) {
            text = text.substring(0, WEBGL.MAX_LABEL_LENGTH - abbrSign.length);
            text = text + abbrSign;
        }

        var backgroundMargin = size / 1;
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        context.font = size + "px monospace";
        var textWidth = context.measureText(text).width;

        canvas.width = textWidth + backgroundMargin * 2; // more horizontal space
        canvas.height = size + backgroundMargin * 2;
        context.font = size + "px monospace"; // important (2. after setting size)

        context.textAlign = "center";
        context.textBaseline = "middle";

//        // DEBUG BORDERS
//        context.strokeStyle = "rgba(0,128,255,0.5)";
//        context.strokeRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = "rgba(0,0,0,0.6)";
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
//        texture.anisotropy = WEBGL.renderer.getMaxAnisotropy();

        var material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            useScreenCoordinates: false
        });

        var finalWidth = canvas.width / canvas.height;
        var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(finalWidth, 1), material);
        mesh.labelWidth = finalWidth;
        mesh.doubleSided = true;

        var selectedColor = MAIN.hexToRGBA(MAIN.currentColor, 1);

        // To change between bold and normal font
        mesh.toBold = function () {
            context.font = "bold " + size + "px monospace";
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = "rgba(0,0,0,1.0)";
            context.fillText(text, canvas.width / 2, canvas.height / 2);
            texture.needsUpdate = true;
        };
        mesh.toNormal = function () {
            context.font = size + "px monospace";
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = "rgba(0,0,0,0.6)";
            context.fillText(text, canvas.width / 2, canvas.height / 2);
            texture.needsUpdate = true;
        };
        mesh.toSelected = function () {
            context.font = "bold " + size + "px monospace";
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = selectedColor;

            // Fill rounded rectangle
            var radius = 10;
            var x = backgroundMargin / 2;
            var y = backgroundMargin / 2;
            var width = canvas.width - backgroundMargin;
            var height = canvas.height - backgroundMargin;
            context.beginPath();
            context.moveTo(x + radius, y);
            context.lineTo(x + width - radius, y);
            context.quadraticCurveTo(x + width, y, x + width, y + radius);
            context.lineTo(x + width, y + height - radius);
            context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            context.lineTo(x + radius, y + height);
            context.quadraticCurveTo(x, y + height, x, y + height - radius);
            context.lineTo(x, y + radius);
            context.quadraticCurveTo(x, y, x + radius, y);
            context.closePath();
            context.fill();

//            context.fillRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = "white";
            context.fillText(text, canvas.width / 2, canvas.height / 2);
            texture.needsUpdate = true;
        };

        return mesh;
    };



    // Creates an entity label with different drawing modes (bold, normal, ...)
    this.createDimensionLabel = function (text, axis) {

        var size = 30;
        var abbrSign = '\u2026'; // a single char "..." sign

//        var finalText = String(axis.toUpperCase() + ": " + text); // with Axis label
        var finalText = text.toUpperCase();
        if (finalText.length > WEBGL.MAX_LABEL_LENGTH) {
            finalText = finalText.substring(0, WEBGL.MAX_LABEL_LENGTH - abbrSign.length);
            finalText = finalText + abbrSign;
        }

        var backgroundMargin = size / 2;
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        context.font = size + "px monospace";
        var textWidth = context.measureText(finalText).width;

        canvas.width = textWidth + backgroundMargin * 2; // more horizontal space
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

        var finalWidth = (canvas.width / canvas.height) * WEBGL.SPRITE_HEIGHT_DIMENSION;
        var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(finalWidth, WEBGL.SPRITE_HEIGHT_DIMENSION), material);
        mesh.labelWidth = finalWidth;
        mesh.doubleSided = true;

        var selectedColor = MAIN.hexToRGBA(MAIN.currentColor, 1);

        // To change between bold and normal font
        mesh.toBold = function () {
            context.font = "bold " + size + "px monospace";
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = "rgba(0,0,0,0.4)";
            context.fillText(finalText, canvas.width / 2, canvas.height / 2);
            texture.needsUpdate = true;
        };
        mesh.toNormal = function () {
            context.font = size + "px monospace";
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = "rgba(0,0,0,0.25)";
            context.fillText(finalText, canvas.width / 2, canvas.height / 2);
            texture.needsUpdate = true;
        };
        mesh.toSelected = function () {
            context.font = "bold " + size + "px monospace";
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = selectedColor;
            context.fillText(finalText, canvas.width / 2, canvas.height / 2);
            texture.needsUpdate = true;
        };

        return mesh;
    };

    /**
     * Creates a sprite to show instead of hidden cubes.
     *
     * @param {type} color the color of the sprite
     * @returns {WEBGL.createCubeSprite.mesh}
     */
    this.createCubeSprite = function (color) {
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");

        var hsl = color.getHSL();
        hsl.l = (hsl.l * 3 + 1) / 4;
        var darkColor = color.clone().getHexString();
        var brightColor = color.clone().setHSL(hsl.h, hsl.s, hsl.l).getHexString();

        canvas.width = 32;
        canvas.height = 32;
        context.fillStyle = "#" + brightColor;
        context.strokeStyle = "#" + darkColor;
        context.lineWidth = 4;
        context.beginPath();
        context.arc(canvas.width / 2, canvas.height / 2, canvas.height / 2 - context.lineWidth / 2, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
        context.stroke();

        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        texture.minFilter = THREE.LinearFilter;

        var material = new THREE.SpriteMaterial({
            map: texture
        });

        var sprite = new THREE.Sprite(material);
        sprite.scale.multiplyScalar(0.25);
        sprite.material.opacity = 0.8;
        return sprite;
    };

    /**
     * Create a texture for a result cube
     *
     * @param {type} text the measure value to display
     * @param {type} ratio the ratio of the value for color encoding
     * @returns {THREE.Texture} the texture
     */
    this.createSqareLabelTexture = function (text, ratio) {

        // round numbers to 2 digits
        if ($.isNumeric(text)) {
            text = MAIN.formatNumber(text, 1);
        }

        // Compute a background color
        var colorLowest = new THREE.Color(WEBGL.COLOR_LOWEST);
        var colorHighest = new THREE.Color(MAIN.currentColor);
//        var colorHighest = new THREE.Color(WEBGL.COLOR_HIGHEST);
        var backgroundColor = colorLowest.multiplyScalar(1 - ratio).add(colorHighest.multiplyScalar(ratio));

        var fontSize = 20;
        var backgroundMargin = fontSize / 2;
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        context.font = fontSize + "px sans-serif";
        var textWidth = context.measureText(text).width;

        textWidth = Math.max(textWidth, 40); // Raise min font size
        canvas.width = textWidth + backgroundMargin * 2;
        canvas.height = textWidth + backgroundMargin * 2;
        context.font = fontSize + "px sans-serif"; // important (2. after setting size)

        context.textAlign = "center";
        context.textBaseline = "middle";

        context.fillStyle = "#" + backgroundColor.getHexString();
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Take white font if background too dark
        var lightness = backgroundColor.getHSL().l;
        if (lightness < 0.5) {
            var opacity = 0.25 + lightness;
            context.fillStyle = "rgba(255,255,255," + opacity + ")";
        } else {
            var opacity = 0.25 + (1 - lightness);
            context.fillStyle = "rgba(0,0,0," + opacity + ")";
        }

        context.fillText(text, canvas.width / 2, canvas.height / 2);

        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        texture.minFilter = THREE.LinearFilter;

        return texture;
    };

    // Shows a WebGL loading screen, containing a rotating cube with a given message for demonstration.
    this.showLoadingScreen = function (loadingMessage) {

        // Remove old vislualization first
        WEBGL.unloadVisualization();

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
        WEBGL.scene.add(cube);
        WEBGL.scene.add(lines);

        // Set up camera
        WEBGL.camera.position.x = 50;
        WEBGL.camera.position.y = 30;
        WEBGL.camera.position.z = 50;

        WEBGL.controls.target = new THREE.Vector3(0, 0, 0);
        WEBGL.controls.autoRotate = true;
        WEBGL.controls.autoRotateSpeed = 5;
        WEBGL.controls.noPan = true;
        WEBGL.controls.update();
        WEBGL.controls.minDistance = 50;
        WEBGL.controls.maxDistance = 200;

        // Resume if webGL was paused
        WEBGL.resumeRendering();

    };

    // Empty the current scene
    this.unloadVisualization = function () {
        // Clear old scene
        var obj, i;
        for (i = WEBGL.scene.children.length - 1; i >= 0; i--) {
            obj = WEBGL.scene.children[i];
            WEBGL.scene.remove(obj);
        }
        WEBGL.scene.add(WEBGL.lighting); // Add light again
        WEBGL.scene.add(WEBGL.ambientLight);

        // Reset the total size
        WEBGL.totalSize = [0, 0, 0];

        // Reset controls
        WEBGL.controls.autoRotate = false;
        WEBGL.controls.noPan = false;
        WEBGL.controls.minDistance = 15;
        WEBGL.controls.maxDistance = Infinity;
    };

    // Executes hover events on threejs objects
    this.handleHover = function () {

        // only highlight results if no mouse buttons pressed
        if (INTERFACE.mousePressed) {
            return;
        }

        // project mouse to 3d scene
        WEBGL.raycaster.setFromCamera(WEBGL.mousePosition, WEBGL.camera);
        var intersections = WEBGL.raycaster.intersectObjects(WEBGL.scene.children);
        var hitSomething = false;
        if (intersections.length > 0) {

            // Hover through objects without hover events
            $.each(intersections, function (index, obj) {
                if (obj.object.onmouseover !== undefined) {

                    // only hover the same object once
                    if (obj.object === WEBGL.intersected) {
                        hitSomething = true;
                        return false;
                    }

                    // leave previous object
                    if (WEBGL.intersected && WEBGL.intersected.onmouseout !== undefined) {
                        WEBGL.intersected.onmouseout();
                    }

                    // hover the new object
                    obj.object.onmouseover();
                    WEBGL.renderer.domElement.style.cursor = 'pointer'; // Set cursor to hand
                    WEBGL.intersected = obj.object; // Grab new intersection object
                    hitSomething = true;
                    return false;
                }
            });

            // no object with hover event -> leave object
            if (!hitSomething && WEBGL.intersected && WEBGL.intersected.onmouseout !== undefined) {
                WEBGL.intersected.onmouseout();
                WEBGL.renderer.domElement.style.cursor = 'auto'; // Set cursor to normal
            }
        } else if (WEBGL.intersected) {
            // Not hovering above anything anymore
            if (WEBGL.intersected.onmouseout !== undefined) {
                WEBGL.intersected.onmouseout();
            }

            // Forget last intersection
            WEBGL.intersected = undefined;
            WEBGL.renderer.domElement.style.cursor = 'auto'; // Set cursor to normal
        }
    };

    // Executes click events on threejs objects
    this.handleClick = function () {

        // project mouse to 3d scene
        WEBGL.raycaster.setFromCamera(WEBGL.mousePosition, WEBGL.camera);
        var intersections = WEBGL.raycaster.intersectObjects(WEBGL.scene.children);
        if (intersections.length > 0) {
            $.each(intersections, function (index, obj) {
                if (obj.object.onclick !== undefined) {
                    obj.object.onclick();
                    return false;
                }
            });
        }
    };

    /**
     * Executed when the cursor leaves the canvas
     */
    this.handleLeave = function () {
        if (WEBGL.intersected) {
            // Not hovering above anything anymore
            if (WEBGL.intersected.onmouseout !== undefined) {
                WEBGL.intersected.onmouseout();
            }

            // Forget last intersection
            WEBGL.intersected = undefined;
            WEBGL.renderer.domElement.style.cursor = 'auto'; // Set cursor to normal
        }
    };

    /**
     * ...
     * @param {type} dimensionList
     * @param {type} row
     * @returns the computed total offset for the given row
     */
    this.computeLabelOffset = function (dimensionList, row) {
        var offset = 0;
        var lastIndex = dimensionList.length - 1;
        for (var i = lastIndex; i > lastIndex - row; i--) {
            var dimName = dimensionList[i].dimensionName;
            if (MAIN.labelMap[dimName].maxWidth) {
                offset += MAIN.labelMap[dimName].maxWidth;
            }
        }
        return offset;
    };

    // HELP FUNCTIONS ==========================================================

    this.toScreenPosition = function (obj) {
        var canvasPosition = $(WEBGL.renderer.domElement).offset();
        var vector = new THREE.Vector3();
        var widthHalf = 0.5 * WEBGL.renderer.context.canvas.width;
        var heightHalf = 0.5 * WEBGL.renderer.context.canvas.height;
        obj.updateMatrixWorld();
        vector.setFromMatrixPosition(obj.matrixWorld);
        vector.project(WEBGL.camera);
        vector.x = (vector.x * widthHalf) + widthHalf;
        vector.y = -(vector.y * heightHalf) + heightHalf;
        var pos = {
            x: canvasPosition.left + vector.x,
            y: canvasPosition.top + vector.y
        };
        return pos;
    };

    var degToRad = function (deg) {
        return deg * Math.PI / 180;
    };

};