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
    this.rollup;                        // to be set later
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

// Filter class, either for dimension or measures
function Filter(dimension, measure) {

}


//function Result(dimensions, )

// Main namespace

var MAIN = new function () {

    // Globas vars
    this.ID = "";
    this.HASH = "";
    this.currentCube = "";
    this.entityList = []; // Contains all entities of all dimensions (and their selected status)

    // Selected objects for creating a query uri later
    this.xDimensions = [];   // Type: Dimension
    this.yDimensions = [];   // -
    this.zDimensions = [];   // -
    this.measures = [];      // Type: Measure
    this.filters = [];       // Type: Filter

    this.tempSelection = {}; // Temprary selection of dimensions' entities (to be accepted on button click)
    // TEMP: z.b.: tempSelection[dimensionName][entityName] = true;

    // For visual selection of labels / entities
    this.labelMap = {};

    // List of actually used entities (for the visualization) with stacked dimensions in every entity (if more than one dimension / axis)
    this.entityMap = {};


    // Initialization
    $(document).ready(function () {
        this.init();
    }.bind(this));

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
                    // TODO: schöner
                    alert("There are no Cubes belonging to User ID <" + id + ">.");

                    // Bring up modal if not shown
                    if ($("#id_loginModal").length !== 1) {
                        INTERFACE.popupLogin();
                    }
                    return;
                } else {
                    // Accept and save ID + Hash and let the user continue...
                    this.ID = id;
                    this.HASH = hash;
                    $.cookie('ID', id, {expires: 7}); // Keep cookie 7 days

                    // Close the login popup
                    $('#id_loginModal').modal('hide');

                    // Load users cubes...
                    this.loadCubeList();

                }

            }.bind(this));

        }.bind(this));

    };


    // Removes user id vars and cookies and prompts a new login
    this.logoutUser = function () {
        this.ID = "";
        $.removeCookie('ID');
        INTERFACE.popupLogin();

        // TODO: reset rest of the UI...

    };

    // Inits the whole interface
    this.init = function () {

        // Check if session is open already and login
        if ($.cookie("ID") === undefined) {
            INTERFACE.popupLogin(); // Show login prompt
        } else {
            this.loginUser($.cookie("ID"));
        }

        // Setup THREE.JS components
        WEBGL.initThreeJs();
        WEBGL.showLoadingScreen("");

        // Add listeners to the gui
        INTERFACE.addInterfaceListeners();

        // Disable certain input to begin with
        INTERFACE.disableInputInitially();
        INTERFACE.enableTooltips();
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
                return;
            }

            // Reset the entity map
            this.entityMap = {};

            // Look for actually used entities (saved in entityMap)
            $.each(results, function (index, result) {
                addToEntityMap(this.xDimensions, result);
                addToEntityMap(this.yDimensions, result);
                addToEntityMap(this.zDimensions, result);
            }.bind(this));

            // Help function to sort one (stacked) axis of the entityMap
            var sortEntities = function (map, dimensionList, depth) {
                if (dimensionList.length > depth) {
                    var dimension = dimensionList[depth];
                    var dimensionName = dimension.dimensionName;
                    if (map === null) {
                        map = this.entityMap; // Start with the axis root
                    }
                    map[dimensionName].sort(labelCompare); // Sort by labels
                    $.each(map[dimensionName], function (j, entity) {
                        sortEntities(entity, dimensionList, depth + 1); // Recursion
                    });
                }
            }.bind(this);

            // Sort the whole entityMap recursively
            sortEntities(null, this.xDimensions, 0);
            sortEntities(null, this.yDimensions, 0);
            sortEntities(null, this.zDimensions, 0);

            // Assign coordinates to entities
            assignCoordinates(this.xDimensions);
            assignCoordinates(this.yDimensions);
            assignCoordinates(this.zDimensions);

            // Find the hightest and lowest measures for a colored ratio
            var highestMeasures = {};
            var lowestMeasures = {};
            $.each(results, function (index1, result) {
                $.each(this.measures, function (index2, measure) {
                    var measureName = measure.measureName;
                    var value = this.getMeasureValueFromJson(result, measure); // TODO: fehlende zahlen im json bei AGG???
                    var currentHighest = highestMeasures[measureName];
                    var currentLowest = lowestMeasures[measureName];
                    highestMeasures[measureName] = (currentHighest === undefined || currentHighest < value) ? value : currentHighest;
                    lowestMeasures[measureName] = (currentLowest === undefined || currentLowest > value) ? value : currentLowest;
                }.bind(this));
            }.bind(this));


            // Remove the current loading screen and reset the scene
            WEBGL.unloadVisualization();

            // Add the actual results to the scene as small colored cubes (with text)
            $.each(results, function (index1, result) {

                // Get the value and relative ratio of each measure
                var ratios = [];
                var values = [];
                $.each(this.measures, function (index2, measure) {
                    var highestMeasure = highestMeasures[measure.measureName];
                    var lowestMeasure = lowestMeasures[measure.measureName];
                    var measureValue = this.getMeasureValueFromJson(result, measure);
                    ratios[index2] = Math.max(1, (measureValue - lowestMeasure)) / Math.max(1, (highestMeasure - lowestMeasure));
                    values[index2] = measureValue;

                    // TEST Logarithmic value (log10)
                    ratios[index2] = Math.log((ratios[index2] * 9) + 1) / Math.log(10);
                }.bind(this));

                // Get the coordinates based on the result's dimension-entities
                var coordinates = getCoordinates(result);

                // Create and add a new result-cube
                var cube = WEBGL.addCube(coordinates, values, ratios); // TODO custom colors?
                INTERFACE.addCubeListeners(cube, result); // add click and hover events
            }.bind(this));


            // Draw (stacked) labels around the result-cubes
            insertLabels(this.xDimensions, "x");
            insertLabels(this.yDimensions, "y");
            insertLabels(this.zDimensions, "z");


            // TODO: draw (stacked) labels

            // TODO iterate through xyzDimensions + entityMap
            // TODO dimension labels too!
            // TODO INTERFACE.js -> labels onclick und co.


            // Update the camera and center point of the visualization
            WEBGL.updateCenterPoint(); // TODO auch labels dazuzählen!!! #######################

            // TODO Draw a grid for better orientation on the ground
            WEBGL.addGrid();

            // DEBUG:
            console.log("sorted entityMap: ", this.entityMap);
            console.log("lowest measure: ", lowestMeasures, ", highest: ", highestMeasures, ", #results: ", results.length);

        }.bind(this));

    };


    // TODO Select a given entity for the <fix> part of the next query
    this.toggleSelectEntity = function (entity) {

        // TODO find entities dimension in the x,y,z lists and add new entity object / remove old one

        console.log(entityList);

        // TEST only X for now
        $.each(this.xDimensions, function (index, dimension) {

            if (dimension.dimensionName === entity.dimensionName) {

                if (entityList[dimension.dimensionName][entity.entityName]) {
                    $.each(dimension.entities, function (index1, entity1) {
                        if (entity.entityName === entity1.entityName) {
                            dimension.entities.splice(index1, 1); // TODO anders rum (hier wird ein bestimmtes ja rausgelöscht) daher -> in separate liste und bei accept diese bevorzugen
                            return false; // break each
                        }
                    });
                } else {
                    // add entity to <fix> selection
                    dimension.entities.push(entity); // drin is es eh schon, lieber erst bei accept die xyzDimensions ändern + request senden
//                dimension.entities.
                }
            }

            // Switch selection (boolean)
            // TODO Cancel funtion bedenken! -> remember for undo

            console.log(dimension);

            entityList[dimension.dimensionName][entity.entityName] = !entityList[dimension.dimensionName][entity.entityName];

//            console.log(element);
        });

        console.log(xDimensions);

    };




    // TODO: guided forward to next panel + info panels below ->>> Bootstrap POPOVER-BOTTOM entfernen mit ".popover('destroy')"
    this.loadCubeList = function () {

        // Make the request
        var url = TEMPLATES.CUBE_URL.replace("__id__", this.ID);
        url = url.replace("__hash__", this.HASH);
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
            var results = obj.results.bindings; // array
            if (results.length === 0) {
                return;
            }
            INTERFACE.initCubeList(results);
        });

    };

    // Loads the list of dimensions for a given cube
    this.loadDimensionList = function () {
        var url = TEMPLATES.DIMENSION_URL.replace("__cube__", this.currentCube);
        url = url.replace("__id__", this.ID);
        url = url.replace("__hash__", this.HASH);

        var request = $.ajax({
            url: url,
            headers: {
                accept: "application/sparql-results+json"
            }
        });

        request.done(function (content) {
            var obj = $.parseJSON(content);
            var results = obj.results.bindings;
            INTERFACE.initDimensionLists(results);
        });

    };


    // Loads the list of measures for a given cube
    this.loadMeasureList = function () {
        var url = TEMPLATES.MEASURE_URL.replace("__cube__", this.currentCube);
        url = url.replace("__id__", this.ID);
        url = url.replace("__hash__", this.HASH);

        var request = $.ajax({
            url: url,
            headers: {
                accept: "application/sparql-results+json"
            }
        });

        request.done(function (content) {
            var obj = $.parseJSON(content);
            var results = obj.results.bindings;
            INTERFACE.initMeasureList(results);
        });

    };

    // Loads the list of possible entities for a given dimension (dimension URI).
    this.queryEntityList = function (dimensionName) {
        var url = TEMPLATES.ENTITY_URL.replace("__cube__", this.currentCube);
        url = url.replace("__id__", this.ID);
        url = url.replace("__hash__", this.HASH);
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
    this.getFirstEntities = function (entitiyList, dimensionName, maxCount) {
        var list = [];
        for (var i = 0; i < maxCount; i++) {
            var entity = entitiyList[dimensionName][i];
            if (entity === undefined) {
                break;
            }
            list.push(entity);
            entitiyList[dimensionName][entity.entityName] = true; // TODO: boolean to see if checked
        }
        return list;
    };



    // ...
    this.selectEntity = function (entity) {
        // TODO: zur FIX liste hinzufügen, sidebar -> badge updaten (x / y), entsprechende threejs-objecte highlighten!
    };

    // ...
    this.applyOLAP = function () {

        // TODO apply button enabled only on change -> listener for all buttons...

        // TODO update whole UI (labels of buttons, button states...)

        var url = this.createRequestURL();
        this.visualize(url);

        // DEBUG url
        console.log("REQUEST:", url);
    };



    // Generates a request URL of the current data selection for the rest2sparql API.
    this.createRequestURL = function () {

        var url = TEMPLATES.EXECUTE_URL;
        url = url.replace("__id__", this.ID);
        url = url.replace("__hash__", this.HASH);
        url = url.replace("__cube__", this.currentCube);

        // Add dimensions
        function addDim(index, dimension) {

            // TODO: if rollup: DIMENSION_ROLLUP_PART_URL
            if (dimension.rollup) {
                // TODO: "TEMPLATES.DIMENSION_ROLLUP_PART_URL"
            }

            var tmp = TEMPLATES.DIMENSION_PART_URL.replace("__dimension__", dimension.dimensionName);

            // Add fix option if entities were selected
            if (dimension.entities.length > 0) {
                var tmp2 = "";
                $.each(dimension.entities, function (index, entity) {
                    tmp2 += entity.entityName + ",";
                });
                tmp2 = tmp2.substring(0, tmp2.length - 1); // remove last comma
                tmp += TEMPLATES.DIMENSION_FIX_PART_URL.replace("__fix__", tmp2);
            }
            url += tmp;
        }
        $.each(this.xDimensions, addDim);
        $.each(this.yDimensions, addDim);
        $.each(this.zDimensions, addDim);

        // Add measures
        $.each(this.measures, function (index, measure) {
            var tmp = TEMPLATES.MEASURE_PART_URL.replace("__measure__", measure.measureName);
            tmp = tmp.replace("__agg__", measure.agg);
            url += tmp;
//        url += ",filterR=<bigger>,filterV=<999999999>"; // TEST
        });

        // Add filters
        $.each(this.filters, function (index, filter) {
            // TODO: unterscheiden: dimension / measure!
        });

        return url;
    };

    // Returns the numerical value of a given measure of a json result
    this.getMeasureValueFromJson = function (result, measure) {
        return parseFloat(result["V_NAME_AGG"].value); // TODO so stehts im json von rest2sparql, was wenn mehrere measures?
    };

    // Returns a generated entity of a given dimension from a json result
    this.getEntityFromJson = function (result, dimension) {

        // TODO was bei rollup machen? -> z.b. "D_NAME_1_AGG" : "http://code-research.eu/resource/Species", dann in xyzDimensions nach entities schauen

        // Generate a custom Entity from multiple ones
        if (dimension.rollup) {
            // TODO: dimension.entities + tooltip
            // return new Entity(...)
        }

        var entityName = "";
        var label = "";
        $.each(result, function (key, val) {
            if (val.value === dimension.dimensionName) {
                entityName = result[key.replace("_AGG", "")].value;
                label = result[key.replace("E_NAME", "L_NAME")].value;
                return false;
            }
        });
        return new Entity(dimension.dimensionName, entityName, label);
    };

    // HELP FUNCTIONS ==========================================================

    /**
     * Compare function for sorting by an objects label property.
     *
     * @param a first entity
     * @param b second entity
     */
    var labelCompare = function (a, b) {
        if (a.label > b.label) {
            return 1;
        } else if (a.label < b.label) {
            return -1;
        } else {
            return 0;
        }
    };

    // Iterates through entities of a given dimension and adds labels
    var insertLabels = function (dimensionList, axis) {
        if (dimensionList.length === 0) {
            return; // No dimension in this axis
        }
        var dimensionName = dimensionList[0].dimensionName;
        var entityList = this.entityMap[dimensionName];

        // Count only entities of the last dimension (recursively)
        var iterateEntities = function (entityList, depth) {
            if (depth === dimensionList.length - 1) {
                // Last dimension, get label positions and add them
                $.each(entityList, function (index, entity) {
                    var position = entity.position;
                    var label = WEBGL.addLabel(axis, position, entity, 0);
                    INTERFACE.addLabelListeners(label, entity); // TODO #########
                });

                // Compute middle position
                entityList.avgPosition = (entityList[0].position + entityList[entityList.length - 1].position) / 2;

            } else {
                // Go deeper and add labels in the Nth row
                var nextDimension = dimensionList[depth + 1];
                $.each(entityList, function (index, entity) {
                    var nextList = entity[nextDimension.dimensionName];
                    iterateEntities(nextList, depth + 1); // recursion

                    var row = dimensionList.length - 1 - depth;
                    var label = WEBGL.addLabel(axis, nextList.avgPosition, entity, row);
                    INTERFACE.addLabelListeners(label, entity); // TODO #########
                });

                // Compute middle position for above label
                var firstAvg = entityList[0][nextDimension.dimensionName].avgPosition;
                var lastAvg = entityList[entityList.length - 1][nextDimension.dimensionName].avgPosition;
                entityList.avgPosition = (firstAvg + lastAvg) / 2;
            }
        };
        iterateEntities(entityList, 0);
    }.bind(this);

    // Assign positions to last entities in the entityMap
    var assignCoordinates = function (dimensionList) {
        if (dimensionList.length === 0) {
            return; // No dimension in this axis
        }
        var counter = 0;
        var dimensionName = dimensionList[0].dimensionName;
        var entityList = this.entityMap[dimensionName];

        // Count only entities of the last dimension (recursively)
        var countLast = function (entityList, depth) {
            if (depth === dimensionList.length - 1) {
                // Last dimension, set entity position
                $.each(entityList, function (index, entity) {
                    entity.position = counter;
                    counter++;
                });
                counter++; // 1 field to separate groups
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
    }.bind(this);


    // Calculates coordinates for a given result by using the entityMap (for stacked dimensions)
    var getCoordinates = function (result) {

        // Help function for one axis
        var getAxisPos = function (dimensionList, result) {
            if (dimensionList.length === 0) {
                return 0; // No dimension in this axis
            }
            var dimension = dimensionList[0];
            var entityName = this.getEntityFromJson(result, dimension).entityName;
            var currentEntity = this.entityMap[dimension.dimensionName][entityName]; // Entity from tree
            for (var i = 1; i < dimensionList.length; i++) {
                var nextDimension = dimensionList[i];
                var nextEntityName = this.getEntityFromJson(result, nextDimension).entityName;
                currentEntity = currentEntity[nextDimension.dimensionName][nextEntityName];
            }
            return currentEntity.position;
        }.bind(this);

        // Fill xyz coordinates
        var coordinates = [];
        coordinates[0] = getAxisPos(this.xDimensions, result);
        coordinates[1] = getAxisPos(this.yDimensions, result);
        coordinates[2] = getAxisPos(this.zDimensions, result);

        return coordinates;

    }.bind(this);

    // Help function to build the entityMap (with a tree of entities)
    var addToEntityMap = function (dimensionList, result) {
        if (dimensionList.length > 0) {
            var dimension = dimensionList[0]; // start at first dimension
            var entity = this.getEntityFromJson(result, dimension);
            if (!this.entityMap[dimension.dimensionName]) {
                this.entityMap[dimension.dimensionName] = []; // Init a list for this dimension
            }

            // Only add same entity once at the same object
            if (this.entityMap[dimension.dimensionName][entity.entityName] === undefined) {
                this.entityMap[dimension.dimensionName][entity.entityName] = entity; // for fast access
                this.entityMap[dimension.dimensionName].push(entity); // for sorting
            }

            // Stack following dimensions of the same axis on each entity
            var currentEntity = this.entityMap[dimension.dimensionName][entity.entityName];
            for (var i = 1; i < dimensionList.length; i++) {
                var nextDimension = dimensionList[i];
                var nextEntity = this.getEntityFromJson(result, nextDimension);
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
    }.bind(this);



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

    // Returns a string like 71.003.345 (adds points and comma)
    this.formatNumber = function (num) {
        // TODO
        return num;
    };

};

// (>'.')>