/* global THREE, WEBGL, INTERFACE, TEMPLATES, bootbox, d3 */
// Custom script for the Rest2Sparql GUI

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
        {type: "sum", label: "Sum"},
        {type: "min", label: "Minimum"},
        {type: "max", label: "Maximum"},
        {type: "avg", label: "Average"},
        {type: "sample", label: "Random Sample"}
    ];
    this.COLORS = [
        "#ea5f5f",
        "#ddac42",
        "#59C543",
        "#46CCC1",
        "#6098d8",
        "#8a7dd9",
        "#d871b5",
        "#aaaaaa"
    ];
    this.BOOKMARK_SIGN = "#bookmark=";
    this.SCALE_LOG = 0;
    this.SCALE_LINEAR = 1;

    // Globas vars
    this.ID = "";
    this.HASH = "";
    this.currentCube;
    this.currentColor = this.COLORS[4];
    this.currentAGG = "sum";
    this.currentScale = this.SCALE_LINEAR; // log or linear
    this.currentURL = "";
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
    this.currentState; // JSON string

    this.tempSelection = {}; // Temprary selection of dimensions' entities (to be accepted on button click)

    // Dimension -> label list
    this.labelMap = {};

    // List of actually used entities (for the visualization only) with stacked dimensions in every entity (if more than one dimension / axis))
    this.entityMap = {};

    // Cache olap results
    this.resultCache = {}; // Map (url: content)


    // TODO: max-size of Undo / Redo / resultCache


    // Initialization
    $(document).ready(function () {
        MAIN.init();
    });

    // Tries to log in a given ID

    /**
     * Try to log a user with given id in. the given callback function (optional) is executed after the user's cubes have been loaded.
     *
     * @param {type} id user id
     * @param {type} callback function to execute after cubes have been loaded
     */
    this.loginUser = function (id, callback) {
        var urlHash = TEMPLATES.GET_HASH_URL.replace("__id__", id);
        var requestHash = $.ajax({
            url: urlHash
        });

        requestHash.done(function (hash) {
            console.log(id + ", HASH = " + hash); // DEBUG id + hash

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
                    bootbox.alert("<b>Error:</b><br><br>" + content);
                    return;
                }
                var results = obj.results.bindings;
                if (results.length === 0) {
                    bootbox.alert("There are no Cubes belonging to User ID &lt;" + id + "&gt;", function () {

                        // Bring up modal if not shown
                        if ($("#id_loginModal").length !== 1) {
                            INTERFACE.popupLogin();
                        }
                    });
                    return;
                } else {
                    // Accept and save ID + Hash and let the user continue...
                    MAIN.ID = id;
                    MAIN.HASH = hash;
                    $.cookie('ID', id, {expires: 7}); // Keep cookie 7 days

                    // Close the login popup
                    $('#id_loginModal').modal('hide');

                    // Load users cubes...
                    MAIN.loadCubeList(callback);
                }

            });
            requestCubes.fail(function (jqXHR, textStatus) {
                bootbox.alert("Error: " + textStatus);
            });
        });
        requestHash.fail(function (jqXHR, textStatus) {
            bootbox.alert("Error: " + textStatus);
        });

    };

    // Drops current configuration and prompts a new login
    this.logoutUser = function () {
        bootbox.confirm("Really log out?", function (result) {
            if (result) {
                /*
                 * Configuration is reset, otherwise a user could hit "back"
                 * in browser after a logout and continue working on the data.
                 */

                // Remove cookie
                $.removeCookie('ID');

                // Reset configuration
                MAIN.availableCubes = [];
                MAIN.availableDimensions = [];
                MAIN.availableMeasures = [];
                MAIN.currentCube = undefined;
                MAIN.currentURL = "";
                MAIN.xDimensions = [];
                MAIN.yDimensions = [];
                MAIN.zDimensions = [];
                MAIN.measures = [];
                MAIN.filters = [];
                MAIN.undoStack = [];
                MAIN.redoStack = [];
                MAIN.currentState = undefined;
                MAIN.entityList = {};
                MAIN.tempSelection = {};
                MAIN.entityMap = {};
                MAIN.resultCache = {};

                // Reset buttons to initial behaviour
                INTERFACE.disableInputInitially();

                // Reset interface
                INTERFACE.clearCubes();
                INTERFACE.clearDimensions();
                INTERFACE.clearFilters();
//                INTERFACE.clearMeasures(); // only 1 measure

                // Fade out panels
                $("#id_dimensionPanel").removeClass("in");
                $("#id_measurePanel").removeClass("in");
                $("#id_filterPanel").removeClass("in");
                $("#id_acceptArea").removeClass("in");
                $("#id_resetViewButton").removeClass("in");
                $("#id_chartButton").removeClass("in");
                $("#id_pageTitle").text("Rest2Sparql");

                // Show default visualization
                WEBGL.showLoadingScreen();

                // Refresh page
                window.location = "./";
            }
        });
    };

    // Inits the whole interface
    this.init = function () {

        // Setup THREE.JS components
        WEBGL.initThreeJs();
        WEBGL.showLoadingScreen("");

        // Add listeners to the gui
        INTERFACE.addInterfaceListeners();

        // Disable certain input to begin with
        INTERFACE.disableInputInitially();
        INTERFACE.initTooltips();

        // Load a given bookmark / shared url
        if (window.location.href.contains(MAIN.BOOKMARK_SIGN)) {
            MAIN.loadURL(window.location.href);
        } else {
            // Check if session is open already and login
            if ($.cookie("ID") === undefined) {
                INTERFACE.popupLogin(); // Show login prompt
            } else {
                MAIN.loginUser($.cookie("ID"));
            }
        }
    };

    /**
     * Load a given url bookmark as a model and visualize it right away.
     *
     * @param {string} url
     */
    this.loadURL = function (url) {
        var decodedURL = decodeURIComponent(url); // cross browser compatible
        var urlParts = decodedURL.split("&");

        var cubeName;
        var id;
        $.each(urlParts, function (i, part) {

            // First get userID and cubeName
            if (part.startsWith("c=<")) {
                // Cube name
                var temp = part.replace("c=<", "");
                cubeName = temp.substring(0, temp.indexOf('>'));
            } else if (part.startsWith("id=<")) {
                // User ID
                var temp = part.replace("id=<", "");
                id = temp.substring(0, temp.indexOf('>'));
            }
        });

        // Login with callback function
        MAIN.loginUser(id, function () {

            // look for cube in available list by cubeName
            var cube;
            $.each(MAIN.availableCubes, function (index, availableCube) {
                if (availableCube.cubeName === cubeName) {
                    cube = availableCube;
                }
            });

            // Select the cube and continue to parse data after it finished loading
            INTERFACE.selectCube(cube, function () {

                $.each(urlParts, function (i, part) {

                    // Parse dimensions and measures (and filters)
                    if (part.startsWith("d=<")) {
                        // A dimension
                        var temp = part.replace("d=<", "");
                        var dimensionName = temp.substring(0, temp.indexOf('>'));
                        var rollup = temp.substring(temp.indexOf(",group=<") + 8, temp.length).startsWith("false");
                        var axis = temp.substring(temp.indexOf(",axis=<") + 7, temp.length).split(">")[0];

                        var entities = [];
                        if (temp.contains(",fix=<")) {
                            var fix = temp.substring(temp.indexOf(",fix=<") + 6, temp.length).split(">")[0];
                            var entityNames = fix.split(",");
                            $.each(entityNames, function (j, entityName) {
                                MAIN.entityList[dimensionName][entityName] = true; // Mark as selected
                                $.each(MAIN.entityList[dimensionName].list, function (k, entity) {
                                    if (entity.entityName === entityName) {
                                        entities.push(new Entity(entity.dimensionName, entity.entityName, entity.label));
                                    }
                                });

                            });
                        } else {
                            // no slicing, add all entities
                            $.each(MAIN.entityList[dimensionName].list, function (k, entity) {
                                MAIN.entityList[dimensionName][entity.entityName] = true; // Mark as selected
                                entities.push(new Entity(entity.dimensionName, entity.entityName, entity.label));
                            });
                        }

                        // look for dimension in available list by dimensionName
                        var dimension;
                        $.each(MAIN.availableDimensions, function (index, availableDimension) {
                            if (availableDimension.dimensionName === dimensionName) {
                                dimension = new Dimension(dimensionName, availableDimension.label, entities);
                                dimension.rollup = rollup;
                                return false; // break
                            }
                        });
                        MAIN[axis + "Dimensions"].push(dimension); // Add dimension to the list

                    } else if (part.startsWith("m=<")) {
                        // The measure
                        var temp = part.replace("m=<", "");
                        var measureName = temp.substring(0, temp.indexOf('>'));
                        var agg = temp.substring(temp.indexOf(",agg=<") + 6, temp.length).split(">")[0];

                        // look for measure in available list by measureName
                        var measure;
                        $.each(MAIN.availableMeasures, function (index, availableMeasure) {
                            if (availableMeasure.measureName === measureName) {
                                measure = new Measure(measureName, availableMeasure.label, agg);
                            }
                        });

                        // Check if measure or filter statement
                        var select = temp.substring(temp.indexOf(",select=<") + 9, temp.length).startsWith("true");
                        if (select) {
                            // Measure

                            MAIN.measures.push(measure); // Add measure to the list
                            MAIN.currentAGG = agg;
                        } else {
                            // Filter

                            var rel = temp.substring(temp.indexOf(",filterR=<") + 10, temp.length).split(">")[0];
                            var val = parseFloat(temp.substring(temp.indexOf(",filterV=<") + 10, temp.length).split(">")[0]);
                            var filter = new Filter(measure, rel, val);
                            MAIN.filters.push(filter);
                        }
                    }

                }); // url parts loop end

                MAIN.applyOLAP(); // Build interface from model and visualize

            }); // select cube callback end

        }); // login callback end

    };

    /**
     * Save the current state as a url bookmark. Infos about axis allocation are saved too.
     *
     * @returns {String} the generated url to bookmark or share
     */
    this.saveURL = function () {
        var origin = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '') + window.location.pathname;
        var urlParts = MAIN.currentURL.split("&");
        var finalURL = "";
        $.each(urlParts, function (i, part) {
            if (part.startsWith("d=<")) {
                // A dimension, see in which axis it is
                var temp = part.replace("d=<", "");
                var dimensionName = temp.substring(0, temp.indexOf('>'));
                var axis;
                $.each(["x", "y", "z"], function (i, listAxis) {
                    $.each(MAIN[listAxis + "Dimensions"], function (j, dimension) {
                        if (dimension.dimensionName === dimensionName) {
                            axis = listAxis;
                            return false;
                        }
                    });
                });
                finalURL += part;
                finalURL += ",axis=<";
                finalURL += axis;
                finalURL += ">&";
            } else {
                finalURL += part + "&";
            }
        });
        finalURL = origin + MAIN.BOOKMARK_SIGN + finalURL.substring(2, finalURL.length - 1); // remove first "./" and last "&"
        return finalURL;
    };

    // TODO: loading screen text for visualizetion

    /**
     * Visualize the given url
     *
     * @param {type} url the url to be requested at the rest2sparql backend
     * @param {type} stopCamera whether the camera should be reset
     */
    this.visualize = function (url, stopCamera) {

        // Help function
        var handleContent = function (content, stopCamera) {
            var obj;
            try {
                obj = $.parseJSON(content);
            } catch (e) {
                bootbox.alert("<b>Error:</b><br><br>" + content); // should never happen
                return;
            }

            var results = obj.results.bindings;

            // Stop and notify if no results
            if (results.length === 0) {

                // TODO texture for rotating cube "0 Results" instead of popup
                WEBGL.showLoadingScreen("No Results for the given query.");

                // Disable chart and reset view button
                $("#id_chartButton").addClass("disabled");
                $("#id_resetViewButton").addClass("disabled");

                bootbox.alert("No results for the given query.");
                return;
            }

            // Enable chart and reset view button
            $("#id_chartButton").removeClass("disabled");
            $("#id_resetViewButton").removeClass("disabled");

            // Reset the entity map
            MAIN.entityMap = {};
            MAIN.labelMap = {};

            // Clean old hidden tooltips
            $(".hiddenTooltip").remove();

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

                    // TEMP Fix for API error
                    if (measureValue === null) {
                        return true; // skip this result
                    }

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
                var cube = WEBGL.addCube(coordinates, values, ratios);
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

            // Update the camera and center point of the visualization
            if (!stopCamera) {
                WEBGL.resetCameraView();
            }

            // Draw a grid for better orientation
            WEBGL.addGrid();

//            console.log("lowest measure: ", lowestMeasures, ", highest: ", highestMeasures, ", #results: ", results.length); // DEBUG

        };

        // Prefer the already cached result if no "random sample" aggregation wanted
        if (MAIN.resultCache[url] && !String(url).contains(",agg=<sample>")) {

            // no loadingscreen for already cached results
            handleContent(MAIN.resultCache[url], stopCamera);
        } else {

            // Show a loading screen while waiting
            WEBGL.showLoadingScreen("Loading...");

            // Dont do anything for empty request
            if (url === null) {
                return;
            }

            // Make a new ajax call
            var request = $.ajax({
                url: url,
                headers: {
                    accept: "application/sparql-results+json"
                }
            });
            request.done(function (content) {
                // Save content to cache and visualize
                MAIN.resultCache[url] = content;
                handleContent(content, false);
            });
            request.fail(function (jqXHR, textStatus) {
                // too many entities in bigdata -> "error"
                if (textStatus === "error") {
                    bootbox.alert("<b>Error:</b><br><br>Too many entities selected. Please select fewer (or all) entities of a dimension.");
                } else {
                    bootbox.alert("<b>Error:</b><br><br>" + textStatus);
                }
            });
        }
    };


    /**
     * Load the list of available cubes and fill the lists accordingly
     */
    this.loadCubeList = function (callback) {

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
                bootbox.alert(content);
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
            INTERFACE.initCubeList(); // create HTML list

            // Execute callback function if given (bookmark loading -> clicks a certain cube button)
            if (callback) {
                callback();
            }
        });
        request.fail(function (jqXHR, textStatus) {
            bootbox.alert("Error: " + textStatus);
        });


    };

    /**
     * Load the list of available dimensions for a cube and fill the lists accordingly
     */
    this.loadDimensionList = function () {
        var url = TEMPLATES.DIMENSION_URL.replace("__cube__", MAIN.currentCube.cubeName);
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
        request.fail(function (jqXHR, textStatus) {
            bootbox.alert("Error: " + textStatus);
        });
    };


    /**
     * Load the list of available measures for a cube and fill the lists accordingly
     */
    this.loadMeasureList = function () {
        var url = TEMPLATES.MEASURE_URL.replace("__cube__", MAIN.currentCube.cubeName);
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
        request.fail(function (jqXHR, textStatus) {
            bootbox.alert("Error: " + textStatus);
        });
    };

    // Loads the list of possible entities for a given dimension (dimension URI).
    this.queryEntityList = function (dimensionName) {
        var url = TEMPLATES.ENTITY_URL.replace("__cube__", MAIN.currentCube.cubeName);
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
        request.fail(function (jqXHR, textStatus) {
            bootbox.alert("Error: " + textStatus);
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
     * @param {boolean} stopCamera if true, the camera stays at its current position
     */
    this.applyOLAP = function (isUndo, stopCamera) {

        // Save undo step
        if (!isUndo) {
            MAIN.saveUndoState();
        }

        // Visualize the cube
        MAIN.currentURL = MAIN.createRequestURL();
        MAIN.visualize(MAIN.currentURL, stopCamera);

        // Update the configuration buttons (Dimensions, Measures, ...)
        INTERFACE.updateConfigButtons();

        // Update the rest of the interface (Apply, Cancel, Undo, ...)
        INTERFACE.updateNavigation();

        // DEBUG url, undo stack
//        console.log("REQUEST URL", MAIN.currentURL);
//        console.log("UNDO STACK:", MAIN.undoStack);
//        console.log("REDO STACK:", MAIN.redoStack);

        // Set temp selection to be empty again for following OLAP steps
        MAIN.tempSelection = {};
    };

    /**
     * Cancel current on screen selection of entities.
     */
    this.cancelOLAP = function () {

        // Reload current state
        MAIN.loadState(MAIN.currentState);

        // Discard on screen selection
        MAIN.tempSelection = {};

        // Visualize the cube (again)
        MAIN.currentURL = MAIN.createRequestURL();
        MAIN.visualize(MAIN.currentURL, true);

        // Update the configuration buttons (Dimensions, Measures, ...)
        INTERFACE.updateConfigButtons();

        // Update the rest of the interface (Apply, Cancel, Undo, ...)
        INTERFACE.updateNavigation();
    };



    // Generates a request URL of the current data selection for the rest2sparql API.
    this.createRequestURL = function () {

        // Check if at least one dimension is selected
        if (MAIN.xDimensions.length === 0 && MAIN.yDimensions.length === 0 && MAIN.zDimensions.length === 0) {
            return null;
        }

        var url = TEMPLATES.EXECUTE_URL;
        url = url.replace("__id__", MAIN.ID);
        url = url.replace("__hash__", MAIN.HASH);
        url = url.replace("__cube__", MAIN.currentCube.cubeName);

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

        // rest2sparql BUG: only 1 measure possible, no "V_NAME_X_AGG" in results
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

                    var entityName = ""; // empty uri for grouped entity
                    var label = "(" + dimension.entities.length + ") " + dimension.label; // TODO: (x) trennen für verschiedene Farben
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
        state.currentAGG = MAIN.currentAGG;
        return JSON.stringify(state); // deep clone
    };

    /**
     * Load a saved undo or redo state
     */
    this.loadState = function (state) {
        var stateCopy = JSON.parse(state);
        MAIN.xDimensions = stateCopy.xDimensions;
        MAIN.yDimensions = stateCopy.yDimensions;
        MAIN.zDimensions = stateCopy.zDimensions;
        MAIN.measures = stateCopy.measures;
        MAIN.filters = stateCopy.filters;
        MAIN.entityList = stateCopy.entityList;
        MAIN.currentAGG = stateCopy.currentAGG;
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
        MAIN.currentState = MAIN.createState();
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

                // Init labelMap
                if (MAIN.labelMap[entityList[0].dimensionName] === undefined) {
                    MAIN.labelMap[entityList[0].dimensionName] = [];
                    MAIN.labelMap[entityList[0].dimensionName].maxWidth = 0;
                }

                // Last dimension, get label positions and add them
                $.each(entityList, function (index, entity) {
                    var position = entity.position;
                    var label = WEBGL.addEntityLabel(axis, position, entity, 0);
                    entity.sprite = label; // Save label to entity
                    label.selectionSize = 1;
                    label.entity = entity; // Save entity to label
                    MAIN.labelMap[entity.dimensionName].push(label);
                    MAIN.labelMap[entity.dimensionName].maxWidth = Math.max(label.labelWidth, MAIN.labelMap[entity.dimensionName].maxWidth);
                    INTERFACE.addEntityLabelListeners(label);
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

                // Init labelMap
                if (MAIN.labelMap[entityList[0].dimensionName] === undefined) {
                    MAIN.labelMap[entityList[0].dimensionName] = [];
                    MAIN.labelMap[entityList[0].dimensionName].maxWidth = 0;
                }

                // and add labels in the current row
                $.each(entityList, function (index, entity) {
                    var nextList = entity[nextDimension.dimensionName];
                    var row = dimensionList.length - 1 - depth;
                    var label = WEBGL.addEntityLabel(axis, nextList.avgPosition, entity, row);
                    entity.sprite = label; // Save label to entity
                    label.selectionSize = nextList.rightMost - nextList.leftMost + 1;
                    label.entity = entity; // Save entity to label
                    MAIN.labelMap[entity.dimensionName].push(label);
                    MAIN.labelMap[entity.dimensionName].maxWidth = Math.max(label.labelWidth, MAIN.labelMap[entity.dimensionName].maxWidth);
                    INTERFACE.addEntityLabelListeners(label);
                });
            }
        };
        iterateEntities(MAIN.entityMap[dimensionName], 0);
    };


    // Iterates through dimension of a given axis and adds labels
    var insertDimensionLabels = function (dimensionList, axis) {
        $.each(dimensionList, function (index, dimension) {
            var row = dimensionList.length - index - 1;
            var label = WEBGL.addDimensionLabel(axis, dimension, row);
            INTERFACE.addDimensionLabelListener(label, dimension);
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