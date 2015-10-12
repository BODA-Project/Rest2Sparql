/* global d3, TEMPLATES, bootbox, MERGE_INTERFACE */
// Custom script for the Rest2Sparql Merger GUI

// Main namespace of merger

var MERGE_MAIN = new function () {

    // Globas vars
    this.ID = "";
    this.HASH = "";
    this.cube1;
    this.cube2;

    // All possible cubes of the current user
    this.availableCubes = [];
    this.entityList = {}; // Contains all entities of all dimensions for both cubes (entityList[cubeName][dimensionName].list)

    // Available dimensions and measures for each cube
    this.availableDimensions = {}; // availableDimensions[cubeName] = []
    this.availableMeasures = {}; // availableMeasures[cubeName] = []

    // Current matching of dimensions and measures (replacement relations)
    this.dimensionMatching = {}; // dimensionMatching[dimensionName1] = dimensionName2, meaning dim 1 will be replaced by dim 2
    this.measureMatching = {}; // -

    // Added entities for missing dimensions
    this.addedDimensions = {}; // addedDimensions[cubeName] = [], list of dimensions with 1 (new default) entity

    // To distinguish 2 datasets with an additional dimension with 2 entities for both cubes
    this.distinctionDimension; // TODO avoid adding an EXISTING dimension?

    // In case of overlap this cube is preferred
    this.preferedCube; // reference to cube1 or cube2

    // Information for the merged cube
    this.newCubeLabel;
    this.newCubeComment;

    // Queried results of cubes
    this.observations = {}; // observations[cubeName] = [], list of results
    this.rawObservations = {}; // rawObservations[cubeName] = [], list of raw downloaded results

    // Initialization
    $(document).ready(function () {
        MERGE_MAIN.init();
    });


    /**
     * Init the interface
     */
    this.init = function () {

        // Set listeners for buttons
        MERGE_INTERFACE.addInterfaceListeners(); // must be before wizard setup

        // Disable wizard
        MERGE_INTERFACE.disableWizardInitially();

        // Setup wizard
        $('#id_rootWizard').bootstrapWizard({
            onTabClick: function (tab, navigation, index) {
                // Disable tabbing if button got the disabled class (bugfix, tab is always old tab)
                return !MERGE_INTERFACE.clickedTab.parent().hasClass("disabled");
            },
            onNext: function (tab, navigation, index) {
                // Disable forward if button got the disabled class
                return !$("#id_wizardNext").parent().hasClass("disabled");
            },
            onTabShow: function (tab, navigation, index) {
                MERGE_INTERFACE.updateWizardButtons(index);
                MERGE_INTERFACE.updateWizardPage(index);
            }
        });

        // Check if session is open already and login
        if ($.cookie("ID") === undefined) {
            MERGE_INTERFACE.popupLogin(); // Show login prompt
        } else {
            MERGE_MAIN.loginUser($.cookie("ID"));
        }

    };




    /**
     * Load the list of available cubes and fill the lists accordingly
     */
    this.loadCubeList = function () {

        // Make the request
        var url = TEMPLATES.CUBE_URL.replace("__id__", MERGE_MAIN.ID);
        url = url.replace("__hash__", MERGE_MAIN.HASH);
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
            MERGE_MAIN.parseCubes(results);
            MERGE_INTERFACE.initCubeLists(); // create HTML lists
        });
        request.fail(function (jqXHR, textStatus) {
            bootbox.alert("Error: " + textStatus);
        });
    };

    /**
     * Load the list of available dimensions for a cube and fill the lists accordingly
     *
     * @param {String} cubeName the cube URI
     */
    this.loadDimensionList = function (cubeName) {
        var url = TEMPLATES.DIMENSION_URL.replace("__cube__", cubeName);
        url = url.replace("__id__", MERGE_MAIN.ID);
        url = url.replace("__hash__", MERGE_MAIN.HASH);

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
            MERGE_MAIN.parseDimensions(results, cubeName);
        });
        request.fail(function (jqXHR, textStatus) {
            bootbox.alert("Error: " + textStatus);
        });
    };


    /**
     * Load the list of available measures for a cube and fill the lists accordingly
     *
     * @param {String} cubeName the cube URI
     */
    this.loadMeasureList = function (cubeName) {
        var url = TEMPLATES.MEASURE_URL.replace("__cube__", cubeName);
        url = url.replace("__id__", MERGE_MAIN.ID);
        url = url.replace("__hash__", MERGE_MAIN.HASH);

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
            MERGE_MAIN.parseMeasures(results, cubeName);
        });
        request.fail(function (jqXHR, textStatus) {
            bootbox.alert("Error: " + textStatus);
        });
    };

    /**
     * Loads the list of possible entities for a given dimension (dimension URI).
     *
     * @param {String} cubeName the cube URI
     * @param {String} dimensionName the dimension URI
     */
    this.queryEntityList = function (cubeName, dimensionName) {
        var url = TEMPLATES.ENTITY_URL.replace("__cube__", cubeName);
        url = url.replace("__id__", MERGE_MAIN.ID);
        url = url.replace("__hash__", MERGE_MAIN.HASH);
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
            list.sort(function (a, b) {
                return alphanumCase(a.label, b.label);
            });
            MERGE_MAIN.entityList[cubeName][dimensionName] = {};
            MERGE_MAIN.entityList[cubeName][dimensionName].list = list; // Add it to the list
        });
        request.fail(function (jqXHR, textStatus) {
            bootbox.alert("Error: " + textStatus);
        });
    };

    /**
     * Add results to available cubes
     *
     * @param {json} results json result containing cubes
     */
    this.parseCubes = function (results) {
        MERGE_MAIN.availableCubes = [];

        // Iterate through available measures
        $.each(results, function (index, element) {
            var cubeName = element.CUBE_NAME.value;
            var comment = element.COMMENT.value;
            var label = element.LABEL.value;
            MERGE_MAIN.availableCubes.push(new Cube(cubeName, comment, label));
        });
    };

    /**
     * Add results to available measures
     *
     * @param {json} results json result containing measures
     * @param {String} cubeName the cube URI
     */
    this.parseMeasures = function (results, cubeName) {
        MERGE_MAIN.availableMeasures[cubeName] = [];

        // Iterate through available measures
        $.each(results, function (index, element) {
            var measureName = element.MEASURE_NAME.value;
            var label = element.LABEL.value;
            MERGE_MAIN.availableMeasures[cubeName].push(new Measure(measureName, label));
        });
    };

    /**
     * Add results to available dimensions
     *
     * @param {json} results json result containing dimensions
     * @param {String} cubeName the cube URI
     */
    this.parseDimensions = function (results, cubeName) {
        MERGE_MAIN.availableDimensions[cubeName] = [];

        // Iterate through available dimensions
        $.each(results, function (index, element) {
            var dimensionName = element.DIMENSION_NAME.value;
            var label = element.LABEL.value;
            MERGE_MAIN.availableDimensions[cubeName].push(new Dimension(dimensionName, label));

            // Query the entities for the new dimension
            MERGE_MAIN.queryEntityList(cubeName, dimensionName);
        });
    };

    /**
     * Try to log a user with given id in.
     *
     * @param {type} id user id
     */
    this.loginUser = function (id) {
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
                if (results.length < 2) {
                    bootbox.alert('There are no two Cubes belonging to User ID "' + id + '"', function () {

                        // Bring up modal if not shown
                        if ($("#id_loginModal").length !== 1) {
                            MERGE_INTERFACE.popupLogin();
                        }
                    });
                    return;
                } else {
                    // Accept and save ID + Hash and let the user continue...
                    MERGE_MAIN.ID = id;
                    MERGE_MAIN.HASH = hash;
                    $.cookie('ID', id, {expires: 7}); // Keep cookie 7 days

                    // Close the login popup
                    $('#id_loginModal').modal('hide');

                    // Load users cubes...
                    MERGE_MAIN.loadCubeList();
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

    /**
     * Drops current configuration and prompts a new login
     */
    this.logoutUser = function () {
        bootbox.confirm("Really log out?", function (result) {
            if (result) {
                MERGE_MAIN.ID = "";
                MERGE_MAIN.HASH = "";
                $.removeCookie('ID');

                // Refresh page
                window.location = "./merge";
            }
        });

    };

    /**
     * Executes callback after all ajax is done
     */
    this.waitForAjax = function (callback) {
        $(document).off('ajaxStop'); // remove handler if given
        $(document).ajaxStop(function () {
            console.log("DEBUG: All ajax done");
            $(document).off('ajaxStop'); // remove handler

            // Execute given callback function
            if (callback) {
                callback();
            }
        });
    };


    /**
     * Checks if a dimension with the given name (uri) is in the given list.
     *
     * @param dimensionList the list of dimensions
     * @param dimensionName the dimensions's uri to lock for
     * @returns {Boolean}
     */
    this.containsDimension = function (dimensionList, dimensionName) {
        var result = false;
        $.each(dimensionList, function (i, dimension) {
            if (dimension.dimensionName === dimensionName) {
                result = true;
                return false; // break
            }
        });
        return result;
    };

    /**
     * Checks if a measure with the given name (uri) is in the given list.
     *
     * @param measureList the list of measures
     * @param measureName the measure's uri to lock for
     * @returns {Boolean}
     */
    this.containsMeasure = function (measureList, measureName) {
        var result = false;
        $.each(measureList, function (i, measure) {
            if (measure.measureName === measureName) {
                result = true;
                return false; // break
            }
        });
        return result;
    };

    /**
     * Compute a list of dimensions that are missing in cube A, but present in cube B.
     *
     * @param dimensionListA list A
     * @param dimensionListB list B
     * @returns {Array} list of dimensions
     */
    this.computeMissingDimensions = function (dimensionListA, dimensionListB) {
        var result = [];
        $.each(dimensionListB, function (i, dimensionB) {
            var isInA = false;
            $.each(dimensionListA, function (i, dimensionA) {
                if (dimensionB.dimensionName === dimensionA.dimensionName) {
                    isInA = true; // dimension is in both cubes
                    return false; // break
                }
            });
            if (!isInA) {
                result.push(dimensionB);
            }
        });
        return result;
    };

    /**
     * Compute a list of measures that are missing in cube A, but present in cube B.
     *
     * @param measureListA list A
     * @param measureListB list B
     * @returns {Array} list of measures
     */
    this.computeMissingMeasures = function (measureListA, measureListB) {
        var result = [];
        $.each(measureListB, function (i, measureB) {
            var isInA = false;
            $.each(measureListA, function (i, dimensionA) {
                if (measureB.measureName === dimensionA.measureName) {
                    isInA = true; // dimension is in both cubes
                    return false; // break
                }
            });
            if (!isInA) {
                result.push(measureB);
            }
        });
        return result;
    };

    /**
     * Checks if the given dimension was added (with default entity) in one of the cubes.
     *
     * @param dimensionName
     * @returns {Boolean}
     */
    this.isAddedDimension = function (dimensionName) {
        var result = false;
        $.each(MERGE_MAIN.addedDimensions, function (key, dimensionList) {
            $.each(dimensionList, function (i, dimension) {
                if (dimensionName === dimension.dimensionName) {
                    result = true;
                    return false; // break
                }
            });
        });
        return result;
    };

    /**
     * Checks if the given dimension is a replacement for another dimension.
     *
     * @param dimensionName
     * @returns {Boolean}
     */
    this.isMatchedDimension = function (dimensionName) {
        var result = false;
        $.each(MERGE_MAIN.dimensionMatching, function (key, value) {
            if (value === dimensionName) {
                result = true;
                return false; // break
            }
        });
        return result;
    };

    /**
     * Checks if the given measure is a replacement for another measure.
     *
     * @param measureName
     * @returns {Boolean}
     */
    this.isMatchedMeasure = function (measureName) {
        var result = false;
        $.each(MERGE_MAIN.measureMatching, function (key, value) {
            if (value === measureName) {
                result = true;
                return false; // break
            }
        });
        return result;
    };

    /**
     * Get the dimension that replaces the given dimension.
     *
     * @param dimensionName
     * @returns {Dimension} the dimension that will replace the given dimension
     */
    this.getMatchedDimension = function (dimensionName) {
        var replacementName = MERGE_MAIN.dimensionMatching[dimensionName];

        // Get the dimension object with this name
        var result;
        $.each(MERGE_MAIN.availableDimensions, function (key, dimensionList) {
            $.each(dimensionList, function (i, dimension) {
                if (replacementName === dimension.dimensionName) {
                    result = dimension;
                    return false; // break
                }
            });
        });
        return result;
    };

    /**
     * Get the measure that replaces the given measure.
     *
     * @param measureName
     * @returns {Measure} the measure that will replace the given measure
     */
    this.getMatchedMeasure = function (measureName) {
        var replacementName = MERGE_MAIN.measureMatching[measureName];

        // Get the measure object with this name
        var result;
        $.each(MERGE_MAIN.availableMeasures, function (key, measureList) {
            $.each(measureList, function (i, measure) {
                if (replacementName === measure.measureName) {
                    result = measure;
                    return false; // break
                }
            });
        });
        return result;
    };

    /**
     * Get the dimension that is to be replaced by the given dimension.
     *
     * @param dimensionName
     * @returns {Dimension} the dimension that will be replaced
     */
    this.getMatchingDimension = function (dimensionName) {
        var replacedName;
        $.each(MERGE_MAIN.dimensionMatching, function (key, value) {
            if (value === dimensionName) {
                replacedName = key;
                return false; // break
            }
        });

        // Get the dimension object with this name
        var result;
        $.each(MERGE_MAIN.availableDimensions, function (key, dimensionList) {
            $.each(dimensionList, function (i, dimension) {
                if (replacedName === dimension.dimensionName) {
                    result = dimension;
                    return false; // break
                }
            });
        });
        return result;
    };

    /**
     * Get the measure that is to be replaced by the given measure.
     *
     * @param measureName
     * @returns {Measure} the measure that will be replaced
     */
    this.getMatchingMeasure = function (measureName) {
        var replacedName;
        $.each(MERGE_MAIN.measureMatching, function (key, value) {
            if (value === measureName) {
                replacedName = key;
                return false; // break
            }
        });

        // Get the measure object with this name
        var result;
        $.each(MERGE_MAIN.availableMeasures, function (key, measureList) {
            $.each(measureList, function (i, measure) {
                if (replacedName === measure.measureName) {
                    result = measure;
                    return false; // break
                }
            });
        });
        return result;
    };

    /**
     * Get the added default entity from a given dimensionName.
     *
     * @param cubeName
     * @param dimensionName
     * @returns {Entity} the entity that was added, or undefined if not added
     */
    this.getAddedEntity = function (cubeName, dimensionName) {
        var entity;
        if (MERGE_MAIN.addedDimensions[cubeName]) {
            $.each(MERGE_MAIN.addedDimensions[cubeName], function (i, dimension) {
                if (dimensionName === dimension.dimensionName) {
                    entity = dimension.entities[0];
                    return false; // break
                }
            });
        }
        return entity;
    };

    /**
     * Delete the dimension-matching of the given dimension (uri).
     *
     * @param dimensionName
     */
    this.undoDimensionMatching = function (dimensionName) {
        delete MERGE_MAIN.dimensionMatching[dimensionName]; // delete to avoid errors when iterating
    };

    /**
     * Delete the measure-matching of the given measure (uri).
     *
     * @param measureName
     */
    this.undoMeasureMatching = function (measureName) {
        delete MERGE_MAIN.measureMatching[measureName]; // delete to avoid errors when iterating
    };

    /**
     * Delete the dimension-adding of the given dimension (uri).
     *
     * @param dimensionName
     */
    this.undoDimensionAdding = function (dimensionName) {
        $.each(MERGE_MAIN.addedDimensions, function (key, dimensionList) {
            $.each(dimensionList, function (i, dimension) {
                if (dimensionName === dimension.dimensionName) {
                    dimensionList.splice(i, 1); // remove from list
                    result = dimension;
                    return false; // break
                }
            });
        });
    };


    /**
     * Check if the current configuration of matching and adding dimensions is
     * complete and visualization or storage can be done. Only dimensions are
     * checked, since measure matching is optional.
     *
     * @returns {Boolean} true if the config is ok
     */
    this.isValidConfiguration = function () {
        var cube1 = MERGE_MAIN.cube1;
        var cube2 = MERGE_MAIN.cube2;

        var cube1Dimensions = MERGE_MAIN.availableDimensions[cube1.cubeName];
        var cube2Dimensions = MERGE_MAIN.availableDimensions[cube2.cubeName];

        // Get list of possible match partners for each cube (dimensions / measures that are only on one cube)
        var cube1MissingDimensions = MERGE_MAIN.computeMissingDimensions(cube1Dimensions, cube2Dimensions);
        var cube2MissingDimensions = MERGE_MAIN.computeMissingDimensions(cube2Dimensions, cube1Dimensions);

        // Each missing dimension must either be added or matched (one way)
        var result = true;
        $.each(cube1MissingDimensions, function (i, dimension) {
            var matched = MERGE_MAIN.getMatchedDimension(dimension.dimensionName);
            var matching = MERGE_MAIN.getMatchingDimension(dimension.dimensionName);
            var added = MERGE_MAIN.getAddedEntity(cube1.cubeName, dimension.dimensionName);
            if (!matched && !matching && !added) {
                result = false; // dimension must be fixed first
                return false; // break
            }
        });
        $.each(cube2MissingDimensions, function (i, dimension) {
            var matched = MERGE_MAIN.getMatchedDimension(dimension.dimensionName);
            var matching = MERGE_MAIN.getMatchingDimension(dimension.dimensionName);
            var added = MERGE_MAIN.getAddedEntity(cube2.cubeName, dimension.dimensionName);
            if (!matched && !matching && !added) {
                result = false; // dimension must be fixed first
                return false; // break
            }
        });
        return result;
    };

    /**
     * Query all observations of a given cube, clean them accoring to the
     * configuration and save them.
     *
     * @param {String} cubeName the cube URI
     */
    this.loadObservations = function (cubeName) {
        var url = TEMPLATES.EXECUTE_URL;
        url = url.replace("__id__", MERGE_MAIN.ID);
        url = url.replace("__hash__", MERGE_MAIN.HASH);
        url = url.replace("__cube__", cubeName);

        // Add each dimension
        $.each(MERGE_MAIN.availableDimensions[cubeName], function (i, dimension) {
            url += TEMPLATES.MERGER_DIMENSION_PART_URL.replace("__dimension__", dimension.dimensionName);
        });

        // Add each measure
        $.each(MERGE_MAIN.availableMeasures[cubeName], function (i, measure) {
            url += TEMPLATES.MERGER_MEASURE_PART_URL.replace("__measure__", measure.measureName);
        });

        // manipulate and save downloaded results
        var callback = function (results) {

            console.log("Parsed " + results.length + " observations for cube " + cubeName); // DEBUG

            // Convert to clean result objects
            var cleanResults = [];
            $.each(results, function (i, result) {
                var cleanResult = new Result();

                // Add dimension data
                $.each(MERGE_MAIN.availableDimensions[cubeName], function (j, dimension) {

                    // Note: Implying dimensions are in the same order as requested
                    var index = j + 1;
                    var entityName = result["E_NAME_" + index].value;
                    var entityLabel = result["L_NAME_" + index].value;
                    var entity = new Entity(null, entityName, entityLabel);
                    cleanResult.dimensions[dimension.dimensionName] = entity;
                });

                // Add manually added dimensions
                if (MERGE_MAIN.addedDimensions[cubeName]) {
                    $.each(MERGE_MAIN.addedDimensions[cubeName], function (j, dimension) {
                        cleanResult.dimensions[dimension.dimensionName] = dimension.entities[0];
                    });
                }

                // Add destinction dimension (new dimension for both cubes)
                if (MERGE_MAIN.distinctionDimension) {
                    var dim = MERGE_MAIN.distinctionDimension;
                    var entity1 = dim.entities[0];
                    var entity2 = dim.entities[1];

                    // Cube 1 or 2?
                    if (MERGE_MAIN.cube1.cubeName === cubeName) {
                        cleanResult.dimensions[dim.dimensionName] = entity1;
                    } else if (MERGE_MAIN.cube2.cubeName === cubeName) {
                        cleanResult.dimensions[dim.dimensionName] = entity2;
                    }
                }

                // Replace dimension names according to matching (if given)
                $.each(MERGE_MAIN.dimensionMatching, function (key, value) {
                    if (cleanResult.dimensions[key] !== undefined) {
                        cleanResult.dimensions[value] = cleanResult.dimensions[key];
                        delete cleanResult.dimensions[key]; // delete old reference
                    }
                });

                // Add measure data
                $.each(MERGE_MAIN.availableMeasures[cubeName], function (j, measure) {

                    // Note: Implying measures are in the same order as requested
                    var index = j + 1 + MERGE_MAIN.availableDimensions[cubeName].length; // counting after dimensions
                    var value = result["V_NAME_" + index].value;
                    if (value) {
                        value = parseFloat(value);
                        cleanResult.measures[measure.measureName] = value; // might be 'undefined'
                    }
                });

                // Replace measure names according to matching (if given)
                $.each(MERGE_MAIN.measureMatching, function (key, value) {
                    if (cleanResult.measures[key] !== undefined) {
                        cleanResult.measures[value] = cleanResult.measures[key];
                        delete cleanResult.measures[key]; // delete old reference
                    }
                });

                // Add the result
                cleanResults.push(cleanResult);
            });

            // Save the results
            MERGE_MAIN.observations[cubeName] = cleanResults;
        };

        // Only download once and cache for future access
        if (!MERGE_MAIN.rawObservations[cubeName]) {
            var request = $.ajax({
                url: url,
                headers: {
                    accept: "application/sparql-results+json"
                }
            });
            request.done(function (content) {
                var obj = $.parseJSON(content);
                var results = obj.results.bindings;

                // Cache results for future access
                MERGE_MAIN.rawObservations[cubeName] = results;

                // Process results
                callback(results);
            });
            request.fail(function (jqXHR, textStatus) {
                bootbox.alert("Error: " + textStatus);
            });
        } else {

            // Process results right away
            callback(MERGE_MAIN.rawObservations[cubeName]);
        }
    };

    /**
     * Generate a json config from the given configuration to send to the server for merging.
     *
     * @returns {Object}
     */
    this.createMergeConfig = function () {
        var config = {
            id: MERGE_MAIN.ID,
            hash: MERGE_MAIN.HASH,
            cube1: MERGE_MAIN.cube1.cubeName,
            cube2: MERGE_MAIN.cube2.cubeName,
            preference: MERGE_MAIN.preferedCube.cubeName,
            label: MERGE_MAIN.newCubeLabel,
            comment: MERGE_MAIN.newCubeComment,
            dimensions: [],
            measures: []

        };

        // Add missing dimension to one of the cubes
        $.each(MERGE_MAIN.addedDimensions, function (cubeName, dimensionList) {
            $.each(dimensionList, function (i, dim) {
                var entity = dim.entities[0];

                var dimConfig = {};
                dimConfig.dimension = dim.dimensionName;
                dimConfig.entity = entity.definedBy || entity.entityName;
                dimConfig.entityLabel = entity.label;
                config.dimensions.push(dimConfig);
            });
        });

        // Add additional dimension to both cubes
        if (MERGE_MAIN.distinctionDimension) {
            var dim = MERGE_MAIN.distinctionDimension;
            var entity1 = dim.entities[0];
            var entity2 = dim.entities[1];

            var dimConfig = {};
            dimConfig.dimension = dim.dimensionName;
            dimConfig.label = dim.label;
            dimConfig.entity = entity1.definedBy;
            dimConfig.entityLabel = entity1.label;
            dimConfig.entity2 = entity2.definedBy;
            dimConfig.entity2Label = entity2.label;
            config.dimensions.push(dimConfig);
        }

        // Match (replace) dimensions
        $.each(MERGE_MAIN.dimensionMatching, function (dim1, dim2) {

            var dimConfig = {};
            dimConfig.dimension = dim1;
            dimConfig.dimensionMatch = dim2;
            config.dimensions.push(dimConfig);
        });

        // Match (replace) measures
        $.each(MERGE_MAIN.measureMatching, function (measure1, measure2) {

            var measureConfig = {};
            measureConfig.measure = measure1;
            measureConfig.measureMatch = measure2;
            config.measures.push(measureConfig);
        });

        return config;
    };

    /**
     * Queries the disambiguation server (indirectly) for the given label and
     * returns a disambiguated URI. Note: result is filled on callback
     *
     * @param {String} label
     * @returns {Array} the disambiguated resource URI in first index
     */
    this.disambiguate = function (label) {
        var url = TEMPLATES.MERGER_DISAMBIGUATE_URL.replace("__entity__", label);
        var request = $.ajax({
            url: url
        });
        var result = [];
        request.done(function (content) {
            result.push(content);
        });
        request.fail(function (jqXHR, textStatus) {
            bootbox.alert("Error: " + textStatus);
        });
        return result;
    };

    /**
     * Sends the configuration to the server which merges and stores the new
     * cube accoring to this config.
     */
    this.mergeAndStoreCube = function () {
        var config = MERGE_MAIN.createMergeConfig();
        var request = $.ajax({
            type: "post",
            url: TEMPLATES.MERGER_STORE_URL,
            data: {
                config: JSON.stringify(config)
            }
        });
        request.done(function (data, textStatus, jqXHR) {
            // Show success message and refresh
            bootbox.alert("Your cube was successfully merged and can now be browsed", function () {
                window.location = "./merger"; // Refresh page
            });

        });
        request.fail(function (jqXHR, textStatus, errorThrown) {
            bootbox.alert("Internal Server Error. The database might not be reachable at the moment");
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