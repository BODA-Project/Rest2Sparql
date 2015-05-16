/* global THREE, WEBGL, INTERFACE, TEMPLATES */
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
    this.rollupLabels;                  // to be set later (list of entities' labels)
}

// Filter class, for measures
function Filter(measure, relation, value) {
    this.measure = measure;             // Measure object
    this.relation = relation;           // e.g. bigger
    this.value = value;                 // e.g. 12345
    this.disabled = false;              // to be set later
}

// Main namespace

var MAIN = new function () {

    // Constants
    this.RELATIONS = [
        {type: "smaller", label: "<", tooltip: "Smaller"},
        {type: "smaller_or_eq", label: "<=", tooltip: "Smaller or Equal"},
        {type: "eq", label: "==", tooltip: "Equal"},
        {type: "not_eq", label: "!=", tooltip: "Not Equal"},
        {type: "bigger", label: ">", tooltip: "Bigger"},
        {type: "bigger_or_eq", label: ">=", tooltip: "Bigger or Equal"}
    ];
    this.AGGREGATIONS = [
        {type: "count", label: "Count"},
        {type: "sum", label: "Sum up"},
        {type: "min", label: "Minimum"},
        {type: "max", label: "Maximum"},
        {type: "avg", label: "Average"},
        {type: "sample", label: "Random Sample"}
    ];
    this.COLORS = [
        "#ea5f5f",
        "#ddac42",
        "#42ca45",
        "#4fccc2",
        "#6098d8",
        "#8a7dd9",
        "#d871b5",
        "#aaaaaa"
    ];

    this.SCALE_LOG = 0;
    this.SCALE_LINEAR = 1;

    // Globas vars
    this.ID = "";
    this.HASH = "";
    this.currentCube = "";
    this.currentColor = this.COLORS[4];
    this.currentAGG = "sum";
    this.currentScale = this.SCALE_LINEAR; // log or linear
    this.entityList = {}; // Contains all entities of all dimensions (and their selected status)


    // All possible dimensions and measures
    this.availableCubes = [];
    this.availableDimensions = [];
    this.availableMeasures = [];

    // Selected objects for creating a query uri later
    this.xDimensions = [];   // Type: Dimension
    this.yDimensions = [];   // -
    this.zDimensions = [];   // -
    this.measures = [];      // Type: Measure
    this.filters = [];       // Type: Filter

    // Undo, Redo
    this.undoStack = [];
    this.redoStack = [];
    this.currentState; // TODO kommt nach neuer olap operation in den undo stack

    this.tempSelection = {}; // Temprary selection of dimensions' entities (to be accepted on button click)

    // TODO dann bei ACCEPT: foreach dimension in xyzDimensions -> tempSelection[dim][...]

    // TODO For visual selection of labels / entities (not needed anymore?)
    this.labelMap = {};

    // List of actually used entities (for the visualization only) with stacked dimensions in every entity (if more than one dimension / axis))
    this.entityMap = {};


    // Initialization
    $(document).ready(function () {
        MAIN.init();
    });

    // Tries to log in a given ID
    this.loginUser = function (id) {
        var urlHash = TEMPLATES.GET_HASH_URL.replace("__id__", id);
        var requestHash = $.ajax({
            url: urlHash
        });

        requestHash.done(function (hash) {
            console.log(id + ", HASH = " + hash); // TEST

            // Also check if given user has any cubes
            var urlCubes = TEMPLATES.CUBE_URL.replace("__id__", id);
            urlCubes = urlCubes.replace("__hash__", hash);
            var requestCubes = $.ajax({
                url: urlCubes,
                headers: {
                    accept: "application/sparql-results+json"
                }
            });
            requestCubes.done(function (content) {
                var obj;
                try {
                    obj = $.parseJSON(content);
                } catch (e) {
                    alert("Error: " + content);
                    return;
                }
                var results = obj.results.bindings; // array
                if (results.length === 0) {
                    // TODO: schöner + "wrong ID?"
                    alert("There are no Cubes belonging to User ID <" + id + ">.");

                    // Bring up modal if not shown
                    if ($("#id_loginModal").length !== 1) {
                        INTERFACE.popupLogin();
                    }
                    return;
                } else {
                    // Accept and save ID + Hash and let the user continue...
                    MAIN.ID = id;
                    MAIN.HASH = hash;
                    $.cookie('ID', id, {expires: 7}); // Keep cookie 7 days

                    // Close the login popup
                    $('#id_loginModal').modal('hide');

                    // Load users cubes...
                    MAIN.loadCubeList();

                }

            });

        });

    };

    // Drops current configuration and prompts a new login
    this.logoutUser = function () {

        // TODO nice confirm popup
        if (confirm("Really log out?")) {
            MAIN.ID = "";
            MAIN.HASH = "";
            $.removeCookie('ID');

            // Reset configuration
            MAIN.availableCubes = [];
            MAIN.availableDimensions = [];
            MAIN.availableMeasures = [];
            MAIN.currentCube = "";
            MAIN.xDimensions = [];
            MAIN.xDimensions = [];
            MAIN.xDimensions = [];
            MAIN.measures = [];
            MAIN.filters = [];
            MAIN.undoStack = [];
            MAIN.redoStack = [];
            MAIN.currentState = undefined;
            MAIN.entityList = {};
            MAIN.tempSelection = {};
            MAIN.entityMap = {};

            // Reset buttons to initial behaviour
            INTERFACE.disableInputInitially();

            // Reset interface
            INTERFACE.clearCubes();
            INTERFACE.clearDimensions();
            INTERFACE.clearFilters();
//            INTERFACE.clearMeasures(); // only 1 measure

            // Fade out panels
            $("#id_dimensionPanel").removeClass("in");
            $("#id_measurePanel").removeClass("in");
            $("#id_filterPanel").removeClass("in");
            $("#id_acceptArea").removeClass("in");
            $("#id_pageTitle").text("Rest2Sparql");

            // Show default visualization
            WEBGL.showLoadingScreen();

            // Show login popup again
            INTERFACE.popupLogin();
        }

    };

    // Inits the whole interface
    this.init = function () {

        // Check if session is open already and login
        if ($.cookie("ID") === undefined) {
            INTERFACE.popupLogin(); // Show login prompt
        } else {
            MAIN.loginUser($.cookie("ID"));
        }

        // Setup THREE.JS components
        WEBGL.initThreeJs();
        WEBGL.showLoadingScreen("");

        // Add listeners to the gui
        INTERFACE.addInterfaceListeners();

        // Disable certain input to begin with
        INTERFACE.disableInputInitially();
        INTERFACE.initTooltips();
    };



    // Sends the given url and visualizes the results.
    // TODO: loading screen, error messages
    this.visualize = function (url) {

        // Show a loading screen while waiting
        WEBGL.showLoadingScreen("Loading...");

        var request = $.ajax({
            url: url,
            headers: {
                accept: "application/sparql-results+json"
            }
        });

        request.done(function (content) {
            var obj = $.parseJSON(content);
            var results = obj.results.bindings;


            // TODO bei rollup keine information über die summierten entities -> aus anfrage schließen -> benennen z.b. "2011, 2012, 2014", (pseudo Entity in die liste), evtl als "D_NAME_X_AGG"


            // Stop and notify if no results
            if (results.length === 0) {

                alert("No results for the given query."); // TODO schönes popup? + default loading screen oder letztes ergebnis zeigen (webGL)
                // TODO automatisch undo? -> nein
                return;
            }

            // Reset the entity map
            MAIN.entityMap = {};

            // Look for actually used entities (saved in entityMap)
            $.each(results, function (index, result) {
                addToEntityMap(MAIN.xDimensions, result);
                addToEntityMap(MAIN.yDimensions, result);
                addToEntityMap(MAIN.zDimensions, result);
            });

            // Help function to sort one (stacked) axis of the entityMap
            var sortEntities = function (map, dimensionList, depth) {
                if (dimensionList.length > depth) {
                    var dimension = dimensionList[depth];
                    var dimensionName = dimension.dimensionName;
                    if (map === null) {
                        map = MAIN.entityMap; // Start with the axis root
                    }
                    map[dimensionName].sort(labelCompare); // Sort by labels

                    // Reverse Y entities (top to bottom)
                    if (dimensionList === MAIN.yDimensions) {
                        map[dimensionName].reverse();
                    }

                    $.each(map[dimensionName], function (j, entity) {
                        sortEntities(entity, dimensionList, depth + 1); // Recursion
                    });
                }
            };

            // Sort the whole entityMap recursively
            sortEntities(null, MAIN.xDimensions, 0);
            sortEntities(null, MAIN.yDimensions, 0);
            sortEntities(null, MAIN.zDimensions, 0);

            // Assign coordinates to entities
            assignCoordinates(MAIN.xDimensions);
            assignCoordinates(MAIN.yDimensions);
            assignCoordinates(MAIN.zDimensions);

            // Find the hightest and lowest measures for a colored ratio
            var highestMeasures = {};
            var lowestMeasures = {};
            $.each(results, function (index1, result) {
                $.each(MAIN.measures, function (index2, measure) {
                    var measureName = measure.measureName;
                    var measureValue = MAIN.getMeasureValueFromJson(result, measure);

                    // TEMP fix for API error
                    if (measureValue === null) {
                        return true; // skip this result
                    }

                    // TODO: kann sein, dass gar kein measure im result drin steht... (API problem beim parsen von "-")
                    var currentHighest = highestMeasures[measureName];
                    var currentLowest = lowestMeasures[measureName];
                    highestMeasures[measureName] = (currentHighest === undefined || currentHighest < measureValue) ? measureValue : currentHighest;
                    lowestMeasures[measureName] = (currentLowest === undefined || currentLowest > measureValue) ? measureValue : currentLowest;
                });
            });


            // Remove the current loading screen and reset the scene
            WEBGL.unloadVisualization();

            // Add the actual results to the scene as small colored cubes (with text)
            $.each(results, function (index1, result) {

                // Get the value and relative ratio of each measure
                var ratios = [];
                var values = [];
                $.each(MAIN.measures, function (index2, measure) {
                    var highestMeasure = highestMeasures[measure.measureName];
                    var lowestMeasure = lowestMeasures[measure.measureName];
                    var measureValue = MAIN.getMeasureValueFromJson(result, measure);

                    // TEMP fix for API error
                    if (measureValue === null) {
                        return true; // skip this result
                    }

                    ratios[index2] = Math.max(1, (measureValue - lowestMeasure)) / Math.max(1, (highestMeasure - lowestMeasure));
                    values[index2] = measureValue;

                    // Logarithmic value (log10)
                    if (MAIN.currentScale === MAIN.SCALE_LOG) {
                        ratios[index2] = Math.log((ratios[index2] * 9) + 1) / Math.log(10);
                    }
                });

                // TEMP fix for API error
                if (values.length === 0) {
                    return true; // skip this result
                }

                // Get the coordinates based on the result's dimension-entities
                var coordinates = getCoordinates(result);

                // Create and add a new result-cube
                var cube = WEBGL.addCube(coordinates, values, ratios); // TODO custom colors?
                cube.result = result; // Temporarly save the result to the cube
                MAIN.addCubeData(cube, result);
                INTERFACE.addCubeListeners(cube); // add click and hover events
            });


            // Draw (stacked) entity labels around the result-cubes
            insertEntityLabels(MAIN.xDimensions, "x");
            insertEntityLabels(MAIN.yDimensions, "y");
            insertEntityLabels(MAIN.zDimensions, "z");

            // Draw (stacked) dimension + axis labels
            insertDimensionLabels(MAIN.xDimensions, "x");
            insertDimensionLabels(MAIN.yDimensions, "y");
            insertDimensionLabels(MAIN.zDimensions, "z");

            // Add references to label sprites for each cube
            assignLabelsToCubes();

            // Add references to label sprites of the same entity for each label
            assignLabelsToLabels();


            // TODO iterate through xyzDimensions + entityMap
            // TODO INTERFACE.js -> labels onclick und co.


            // Update the camera and center point of the visualization
            WEBGL.updateCenterPoint(); // TODO auch labels dazuzählen!!! #######################

            // TODO Draw a grid for better orientation on the ground
            WEBGL.addGrid();

            // DEBUG:
            console.log("lowest measure: ", lowestMeasures, ", highest: ", highestMeasures, ", #results: ", results.length);

        });

    };


    /**
     * Load the list of available cubes and fill the lists accordingly
     */
    this.loadCubeList = function () {

        // Make the request
        var url = TEMPLATES.CUBE_URL.replace("__id__", MAIN.ID);
        url = url.replace("__hash__", MAIN.HASH);
        var request = $.ajax({
            url: url,
            headers: {
                accept: "application/sparql-results+json"
            }
        });

        // Recreate dropdown list for cubes
        request.done(function (content) {
            var obj;
            try {
                obj = $.parseJSON(content);
            } catch (e) {
                alert(content); // TODO popupError(...)
                return;
            }
            var results = obj.results.bindings;
            if (results.length === 0) {
                return;
            }

            // Sort cube list
            results.sort(function (a, b) {
                return alphanumCase(a.LABEL.value, b.LABEL.value);
            });
            MAIN.parseCubes(results);
            INTERFACE.initCubeList(results); // create HTML list
        });
    };

    /**
     * Load the list of available dimensions for a cube and fill the lists accordingly
     */
    this.loadDimensionList = function () {
        var url = TEMPLATES.DIMENSION_URL.replace("__cube__", MAIN.currentCube);
        url = url.replace("__id__", MAIN.ID);
        url = url.replace("__hash__", MAIN.HASH);

        var request = $.ajax({
            url: url,
            headers: {
                accept: "application/sparql-results+json"
            }
        });

        request.done(function (content) {
            var obj = $.parseJSON(content);
            var results = obj.results.bindings;

            // Sort dimension list
            results.sort(function (a, b) {
                return alphanumCase(a.LABEL.value, b.LABEL.value);
            });
            MAIN.parseDimensions(results);
            INTERFACE.initDimensionLists(); // create HTML lists
        });
    };


    /**
     * Load the list of available measures for a cube and fill the lists accordingly
     */
    this.loadMeasureList = function () {
        var url = TEMPLATES.MEASURE_URL.replace("__cube__", MAIN.currentCube);
        url = url.replace("__id__", MAIN.ID);
        url = url.replace("__hash__", MAIN.HASH);

        var request = $.ajax({
            url: url,
            headers: {
                accept: "application/sparql-results+json"
            }
        });

        request.done(function (content) {
            var obj = $.parseJSON(content);
            var results = obj.results.bindings;

            // Sort measure list
            results.sort(function (a, b) {
                return alphanumCase(a.LABEL.value, b.LABEL.value);
            });
            MAIN.parseMeasures(results);
            INTERFACE.initMeasureList(); // create HTML list
        });
    };

    // Loads the list of possible entities for a given dimension (dimension URI).
    this.queryEntityList = function (dimensionName) {
        var url = TEMPLATES.ENTITY_URL.replace("__cube__", MAIN.currentCube);
        url = url.replace("__id__", MAIN.ID);
        url = url.replace("__hash__", MAIN.HASH);
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
    };

    // For initial fix to avoid huge results...
    this.getFirstEntities = function (dimensionName, maxCount) {
        var list = [];

        // Reset all entities to unselected
        $.each(MAIN.entityList[dimensionName].list, function (i, entity) {
            MAIN.entityList[dimensionName][entity.entityName] = false;
        });

        // Get the first (10)
        $.each(MAIN.entityList[dimensionName].list, function (i, entity) {
            if (i === maxCount) {
                return false;
            }
            list.push(entity);
            MAIN.entityList[dimensionName][entity.entityName] = true; // mark as selected
        });
        return list;
    };

    // Applies on-screen selection of entities if given
    this.applyTempSelection = function () {

        // Add dimensions
        var setEntities = function (index, dimension) {
            var tempEntityList = MAIN.tempSelection[dimension.dimensionName];
            if (tempEntityList && tempEntityList.length > 0) {

                // Update the list of selected entities
                dimension.entities = tempEntityList;

                // Unselect all entities first
                $.each(MAIN.entityList[dimension.dimensionName].list, function (i, entity) {
                    MAIN.entityList[dimension.dimensionName][entity.entityName] = false;
                });
                // Set all entities from temp list to selected
                $.each(tempEntityList, function (i, entity) {
                    MAIN.entityList[dimension.dimensionName][entity.entityName] = true;
                });
            }

            // Update the badges on the accoring button
//            INTERFACE.updateBadge(dimensionName); // TODO mit selektor $(".btn-group[data-dimension-name='+dimName+'] .badge"); #####

        };
        $.each(MAIN.xDimensions, setEntities);
        $.each(MAIN.yDimensions, setEntities);
        $.each(MAIN.zDimensions, setEntities);

        // Set temp selection to be empty again for following OLAP steps
        MAIN.tempSelection = {};
    };

    /**
     * ...
     * @param {boolean} isUndo if true, no undo state will be saved
     */
    this.applyOLAP = function (isUndo) {

        // Save undo step
        if (!isUndo) {
            MAIN.saveUndoState();
        }

        // Visualize the cube
        var url = MAIN.createRequestURL();
        MAIN.visualize(url);

        // Update the configuration buttons (Dimensions, Measures, ...)
        INTERFACE.updateConfigButtons();

        // TODO Update the rest of the interface (Apply, Cancel, Undo, ...)
        INTERFACE.updateNavigation();

        // DEBUG url
        console.log("REQUEST URL", url);
//        console.log("UNDO STACK:", MAIN.undoStack);
//        console.log("REDO STACK:", MAIN.redoStack);

        // Set temp selection to be empty again for following OLAP steps
        MAIN.tempSelection = {};

    };



    // Generates a request URL of the current data selection for the rest2sparql API.
    this.createRequestURL = function () {

        var url = TEMPLATES.EXECUTE_URL;
        url = url.replace("__id__", MAIN.ID);
        url = url.replace("__hash__", MAIN.HASH);
        url = url.replace("__cube__", MAIN.currentCube);

        // Add dimensions
        function addDim(index, dimension) {
            var tmp;

            // Rollup (group) the dimension entities?
            if (dimension.rollup) {
                tmp = TEMPLATES.DIMENSION_ROLLUP_PART_URL.replace("__dimension__", dimension.dimensionName);
            } else {
                tmp = TEMPLATES.DIMENSION_PART_URL.replace("__dimension__", dimension.dimensionName);
            }

            // Add fix option if entities were explicitly selected
            if (dimension.entities.length !== MAIN.entityList[dimension.dimensionName].list.length) {
                var tmp2 = "";
                $.each(dimension.entities, function (index, entity) {
                    tmp2 += entity.entityName + ",";
                });
                tmp2 = tmp2.substring(0, tmp2.length - 1); // remove last comma
                tmp += TEMPLATES.DIMENSION_FIX_PART_URL.replace("__fix__", tmp2);
            }
            url += tmp;
        }
        $.each(MAIN.xDimensions, addDim);
        $.each(MAIN.yDimensions, addDim);
        $.each(MAIN.zDimensions, addDim);

        // Add measures
        $.each(MAIN.measures, function (index, measure) {
            url += TEMPLATES.MEASURE_PART_URL
                    .replace("__measure__", measure.measureName)
                    .replace("__agg__", MAIN.currentAGG); // Only 1 measure
//                    .replace("__agg__", measure.agg);
        });

        // Add filters
        $.each(MAIN.filters, function (index, filter) {
            if (!filter.disabled) {
                url += TEMPLATES.FILTER_MEASURE_PART_URL
                        .replace("__measure__", filter.measure.measureName)
                        .replace("__filterR__", filter.relation)
                        .replace("__filterV__", filter.value);
            }
        });

        return url;
    };

    // Returns the numerical value of a given measure of a json result
    this.getMeasureValueFromJson = function (result, measure) {

        // TODO nur 1 measure möglich? kein "V_NAME_2_AGG" o.ä.
        if (result["V_NAME_AGG"]) {
            return parseFloat(result["V_NAME_AGG"].value);
        } else {
            return null;
        }
    };

    // Returns a generated entity of a given dimension from a json result
    this.getEntityFromJson = function (result, dimension) {
        var entity;
        var entityName = "";
        var label = "";

        if (dimension.rollup) {
            // Generate a custom Entity from multiple ones since the dimension was grouped (rolled up)
            $.each(result, function (key, val) {
                if (val.value === dimension.dimensionName) {

                    var entityName = "DRILL"; // TODO entity name??? leer lassen?
                    var label = "(" + dimension.entities.length + ") " + dimension.label; // TODO: ok?
                    entity = new Entity(dimension.dimensionName, entityName, label);
                    entity.rollupLabels = [];
                    $.each(dimension.entities, function (i, subEntity) {
                        entity.rollupLabels.push(subEntity.label);
                    });
                    return false; // break
                }
            });
        } else {
            // Normal non-grouped entity
            $.each(result, function (key, val) {
                if (val.value === dimension.dimensionName) {
                    entityName = result[key.replace("_AGG", "")].value;
                    label = result[key.replace("E_NAME", "L_NAME")].value;
                    entity = new Entity(dimension.dimensionName, entityName, label);
                    return false; // break
                }
            });
        }
        return entity;
    };

    /**
     * Adds dimension and entity data to a cube
     *
     * @param {Mesh} cube
     * @param {json} result
     */
    this.addCubeData = function (cube, result) {
        var addData = function (i, dimension) {
            var entity = MAIN.getEntityFromJson(result, dimension);
            cube[entity.dimensionName] = entity.entityName;
        };
        $.each(MAIN.xDimensions, addData);
        $.each(MAIN.yDimensions, addData);
        $.each(MAIN.zDimensions, addData);
    };

    /**
     * Add results to available cubes
     *
     * @param {json} results json result containing cubes
     */
    this.parseCubes = function (results) {
        MAIN.availableCubes = [];

        // Iterate through available measures
        $.each(results, function (index, element) {
            var cubeName = element.CUBE_NAME.value;
            var comment = element.COMMENT.value;
            var label = element.LABEL.value;
            MAIN.availableCubes.push(new Cube(cubeName, comment, label));
        });
    };

    /**
     * Add results to available measures
     * @param {json} results json result containing measures
     */
    this.parseMeasures = function (results) {
        MAIN.availableMeasures = [];

        // Iterate through available measures
        $.each(results, function (index, element) {
            var measureName = element.MEASURE_NAME.value;
            var label = element.LABEL.value;
            MAIN.availableMeasures.push(new Measure(measureName, label));
        });
    };

    /**
     * Add results to available dimensions
     * @param {json} results json result containing dimensions
     */
    this.parseDimensions = function (results) {
        MAIN.availableDimensions = [];

        // Iterate through available dimensions
        $.each(results, function (index, element) {
            var dimensionName = element.DIMENSION_NAME.value;
            var label = element.LABEL.value;
            MAIN.availableDimensions.push(new Dimension(dimensionName, label));
        });
    };



    /**
     * Create a deep copy of the the current state to undo or redo later
     */
    this.createState = function () {
        MAIN.redoStack = []; // New user interaction, clear redo stack
        var state = {};
        state.xDimensions = MAIN.xDimensions;
        state.yDimensions = MAIN.yDimensions;
        state.zDimensions = MAIN.zDimensions;
        state.measures = MAIN.measures;
        state.filters = MAIN.filters;
        state.entityList = MAIN.entityList;
        return JSON.parse(JSON.stringify(state)); // deep clone
    };

    /**
     * Load a saved undo or redo state
     */
    this.loadState = function (state) {
        var stateCopy = JSON.parse(JSON.stringify(state));
        MAIN.xDimensions = stateCopy.xDimensions;
        MAIN.yDimensions = stateCopy.yDimensions;
        MAIN.zDimensions = stateCopy.zDimensions;
        MAIN.measures = stateCopy.measures;
        MAIN.filters = stateCopy.filters;
        MAIN.entityList = stateCopy.entityList;
    };

    /**
     * Create and save a undo state from user interaction
     */
    this.saveUndoState = function () {

        // Save previous state to undo stack
        if (MAIN.currentState) {
            MAIN.undoStack.push(MAIN.currentState);
        }

        // Save new current state
        MAIN.currentState = MAIN.createState(true);
    };

    /**
     * Undo the last operation and update interface
     */
    this.undo = function () {
        if (MAIN.undoStack.length === 0) {
            return;
        }

        // add current state to redo stack
        MAIN.redoStack.push(MAIN.currentState);

        // Load the previous state
        MAIN.currentState = MAIN.undoStack.pop();
        MAIN.loadState(MAIN.currentState);

        // Visualize undone state
        MAIN.applyOLAP(true);
    };

    /**
     * Redo the last undone operation and update interface
     */
    this.redo = function () {
        if (MAIN.redoStack.length === 0) {
            return;
        }

        // add current state to undo stack
        MAIN.undoStack.push(MAIN.currentState);

        // Load the following state
        MAIN.currentState = MAIN.redoStack.pop();
        MAIN.loadState(MAIN.currentState);

        // Visualize redone state
        MAIN.applyOLAP(true);
    };

    // HELP FUNCTIONS ==========================================================

    /**
     * Compare function for sorting by an objects label property.
     *
     * @param a first entity
     * @param b second entity
     */
    var labelCompare = function (a, b) {
        return alphanumCase(a.label, b.label);
    };

    // Iterates through entities of a given dimension and adds labels
    var insertEntityLabels = function (dimensionList, axis) {
        if (dimensionList.length === 0) {
            return; // No dimension in this axis
        }
        var dimensionName = dimensionList[0].dimensionName;

        // Count only entities of the last dimension (recursively)
        var iterateEntities = function (entityList, depth) {
            if (depth === dimensionList.length - 1) {

                // Compute middle position
                entityList.leftMost = entityList[0].position;
                entityList.rightMost = entityList[entityList.length - 1].position;
                entityList.avgPosition = (entityList.leftMost + entityList.rightMost) / 2;

                // Last dimension, get label positions and add them
                $.each(entityList, function (index, entity) {
                    var position = entity.position;
                    var label = WEBGL.addEntityLabel(axis, position, entity, 0);
                    entity.sprite = label; // Save label to entity
                    label.selectionSize = 1;
                    label.entity = entity; // Save entity to label
                    INTERFACE.addEntityLabelListeners(label); // TODO: dimension übergeben für selection?
                });
            } else {
                // Go deeper
                var nextDimension = dimensionList[depth + 1];
                $.each(entityList, function (index, entity) {
                    var nextList = entity[nextDimension.dimensionName];
                    iterateEntities(nextList, depth + 1); // recursion
                });

                // Compute middle position for above label
                entityList.leftMost = entityList[0][nextDimension.dimensionName].leftMost;
                entityList.rightMost = entityList[entityList.length - 1][nextDimension.dimensionName].rightMost;
                entityList.avgPosition = (entityList.leftMost + entityList.rightMost) / 2;

                // and add labels in the current row
                $.each(entityList, function (index, entity) {
                    var nextList = entity[nextDimension.dimensionName];
                    var row = dimensionList.length - 1 - depth;
                    var label = WEBGL.addEntityLabel(axis, nextList.avgPosition, entity, row);
                    entity.sprite = label; // Save label to entity
                    label.selectionSize = nextList.rightMost - nextList.leftMost + 1;
                    label.entity = entity; // Save entity to label
                    INTERFACE.addEntityLabelListeners(label); // TODO: dimension übergeben für selection?
                });
            }
        };
        iterateEntities(MAIN.entityMap[dimensionName], 0);
    };


    // Iterates through dimension of a given axis and adds labels
    var insertDimensionLabels = function (dimensionList, axis) {
        $.each(dimensionList, function (index, dimension) {
            var row = dimensionList.length - index - 1;
            var label = WEBGL.addDimensionLabel(axis, dimension, row, dimensionList.length);
            INTERFACE.addDimensionLabelListener(label, dimension); // TODO #########
        });
    };


    // Assign positions to last entities in the entityMap
    var assignCoordinates = function (dimensionList) {
        if (dimensionList.length === 0) {
            return; // No dimension in this axis
        }
        var counter = 0;
        var dimensionName = dimensionList[0].dimensionName;
        var entityList = MAIN.entityMap[dimensionName];

        // Count only entities of the last dimension (recursively)
        var countLast = function (entityList, depth) {
            if (depth === dimensionList.length - 1) {
                // Last dimension, set entity position
                $.each(entityList, function (index, entity) {
                    entity.position = counter;
                    counter++;
                });
                counter++; // 1 field gap to separate groups
            } else {
                // Go deeper!
                $.each(entityList, function (index, entity) {
                    var nextDimension = dimensionList[depth + 1];
                    var nextList = entity[nextDimension.dimensionName];
                    countLast(nextList, depth + 1);
                });
            }
        };
        countLast(entityList, 0);
    };


    // Calculates coordinates for a given result by using the entityMap (for stacked dimensions)
    var getCoordinates = function (result) {

        // Help function for one axis
        var getAxisPos = function (dimensionList, result) {
            if (dimensionList.length === 0) {
                return 0; // No dimension in this axis
            }
            var dimension = dimensionList[0];
            var entityName = MAIN.getEntityFromJson(result, dimension).entityName;
            var currentEntity = MAIN.entityMap[dimension.dimensionName][entityName]; // Entity from tree
            for (var i = 1; i < dimensionList.length; i++) {
                var nextDimension = dimensionList[i];
                var nextEntityName = MAIN.getEntityFromJson(result, nextDimension).entityName;
                currentEntity = currentEntity[nextDimension.dimensionName][nextEntityName];
            }
            return currentEntity.position;
        };

        // Fill xyz coordinates
        var coordinates = [];
        coordinates[0] = getAxisPos(MAIN.xDimensions, result);
        coordinates[1] = getAxisPos(MAIN.yDimensions, result);
        coordinates[2] = getAxisPos(MAIN.zDimensions, result);

        return coordinates;

    };

    // Help function to build the entityMap (with a tree of entities)
    var addToEntityMap = function (dimensionList, result) {
        if (dimensionList.length > 0) {
            var dimension = dimensionList[0]; // start at first dimension
            var entity = MAIN.getEntityFromJson(result, dimension);
            if (!MAIN.entityMap[dimension.dimensionName]) {
                MAIN.entityMap[dimension.dimensionName] = []; // Init a list for this dimension
            }

            // Only add same entity once at the same object
            if (MAIN.entityMap[dimension.dimensionName][entity.entityName] === undefined) {
                MAIN.entityMap[dimension.dimensionName][entity.entityName] = entity; // for fast access
                MAIN.entityMap[dimension.dimensionName].push(entity); // for sorting
            }

            // Stack following dimensions of the same axis on each entity
            var currentEntity = MAIN.entityMap[dimension.dimensionName][entity.entityName];
            for (var i = 1; i < dimensionList.length; i++) {
                var nextDimension = dimensionList[i];
                var nextEntity = MAIN.getEntityFromJson(result, nextDimension);
                if (!currentEntity[nextDimension.dimensionName]) {
                    currentEntity[nextDimension.dimensionName] = []; // Init a list for this following dimension (directly to the entity)
                }

                // Only add same entity once at the same object
                if (currentEntity[nextDimension.dimensionName][nextEntity.entityName] === undefined) {
                    currentEntity[nextDimension.dimensionName][nextEntity.entityName] = nextEntity; // for fast access
                    currentEntity[nextDimension.dimensionName].push(nextEntity); // for sorting
                }
                currentEntity = currentEntity[nextDimension.dimensionName][nextEntity.entityName];
            }
        }
    };


    // Assigns all matching label sprites to each cube
    var assignLabelsToCubes = function () {

        // Help function for one axis
        var assign = function (dimensionList, cube) {
            if (dimensionList.length === 0) {
                return; // No dimension in this axis
            }
            var dimension = dimensionList[0];
            var entityName = MAIN.getEntityFromJson(cube.result, dimension).entityName;
            var currentEntity = MAIN.entityMap[dimension.dimensionName][entityName]; // Entity from tree
            cube.sprites.push(currentEntity.sprite); // add label to list
            for (var i = 1; i < dimensionList.length; i++) {
                var nextDimension = dimensionList[i];
                var nextEntityName = MAIN.getEntityFromJson(cube.result, nextDimension).entityName;
                ;
                currentEntity = currentEntity[nextDimension.dimensionName][nextEntityName];
                cube.sprites.push(currentEntity.sprite); // add label to list
            }
        };
        $.each(WEBGL.scene.children, function (index, cube) {

            // Skip non-cubes
            if (!cube.geometry || cube.geometry.type !== "BoxGeometry") {
                return true;
            }
            cube.sprites = [];

            // Fill xyz WebGL labels
            assign(MAIN.xDimensions, cube);
            assign(MAIN.yDimensions, cube);
            assign(MAIN.zDimensions, cube);

            // Forget result
            cube.result = undefined;
        });
    };

    // Assigns all matching label sprites to each label sprite
    var assignLabelsToLabels = function () {
        $.each(WEBGL.scene.children, function (index1, labelSprite1) {

            // Skip non-entity-labels
            if (!labelSprite1.entity) {
                return true;
            }
            labelSprite1.sprites = [];
            $.each(WEBGL.scene.children, function (index2, labelSprite2) {
                // Skip non-entity-labels
                if (!labelSprite2.entity) {
                    return true;
                }
                if (labelSprite1.entity.entityName === labelSprite2.entity.entityName) {
                    labelSprite1.sprites.push(labelSprite2); // Add same entity sprite (including itself)
                }
            });
        });
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