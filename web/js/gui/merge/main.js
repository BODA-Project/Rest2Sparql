/* global d3, TEMPLATES, bootbox, MERGE_INTERFACE */
// Custom script for the Rest2Sparql Merger GUI

// Main namespace of merger

var MERGE_MAIN = new function () {

    // Constants
    this.COLOR_OVERLAP = "#ea5f5f";

    // Globas vars
    this.ID = "";
    this.HASH = "";
    this.cube1;
    this.cube2;

    // All possible cubes of the current user
    this.availableCubes = [];
    this.entityList = {}; // Contains all entities of all dimensions for both cubes (entityList[cubeName][dimensionName].list)

    // Cube #1
    this.availableDimensions = {}; // availableDimensions[cubeName] = []
    this.availableMeasures = {}; // availableMeasures[cubeName] = []


    this.dimensionMatching = {}; // dimensionMatching[dimensionName1] = dimensionName2, meaning dim 1 will be replaced by dim 2
    this.measureMatching = {}; // ...

    this.addedDimensions = {}; // addedDimensions[cubeName] = [], list of dimensions with 1 (new default) entity

    // Dimension -> label list
//    this.labelMap = {};

    // List of actually used entities (for the visualization only) with stacked dimensions in every entity (if more than one dimension / axis))
//    this.entityMap = {};

    // Cache olap results
//    this.resultCache = {}; // Map (url: content)

    // Initialization
    $(document).ready(function () {
        MERGE_MAIN.init();
    });


    // Inits the whole interface
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

        // TODO ...

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
                if (results.length < 1) { // TODO min 2 cubes ##############################################################################
                    bootbox.alert("There are no two Cubes belonging to User ID &lt;" + id + "&gt;", function () {

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

        // TODO: add dummy ajax call?

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
     * Compute a list of dimensions that are missing in cube A, but present in cube B.
     *
     * @param dimensionListA list A
     * @param dimensionListB list B
     * @returns {Array} list of dimensions
     */
    this.computeMissingList = function (dimensionListA, dimensionListB) {
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
     * Get the dimension that replaces the given dimension.
     *
     * @param dimensionName
     * @returns {Dimension} the dimension that will replace the given dimension
     */
    this.getMatchedDimension = function (dimensionName) {
        var dimensionName;
        $.each(MERGE_MAIN.dimensionMatching, function (key, value) {
            if (key === dimensionName) {
                dimensionName = value;
                return false; // break
            }
        });

        // Get the dimension object with this name
        var result;
        $.each(MERGE_MAIN.availableDimensions, function (key, dimensionList) {
            $.each(dimensionList, function (i, dimension) {
                if (dimensionName === dimension.dimensionName) {
                    result = dimension;
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
        var dimensionName;
        $.each(MERGE_MAIN.dimensionMatching, function (key, value) {
            if (value === dimensionName) {
                dimensionName = key;
                return false; // break
            }
        });

        // Get the dimension object with this name
        var result;
        $.each(MERGE_MAIN.availableDimensions, function (key, dimensionList) {
            $.each(dimensionList, function (i, dimension) {
                if (dimensionName === dimension.dimensionName) {
                    result = dimension;
                    return false; // break
                }
            });
        });
        return result;
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
        delete MERGE_MAIN.dimensionMatching[dimensionName]; // delete to avoid errors when iterating
    };



    /**
     * Check if the current configuration of matching and adding dimensions is
     * complete and visualization or storage can be done.
     *
     * @returns {Boolean} true if the config is ok
     */
    this.isValidConfiguration = function () {
        // TODO!
        return false;
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