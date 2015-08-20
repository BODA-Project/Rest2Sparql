/* global TEMPLATES, MERGE_MAIN, bootbox, d3 */

// Namespace for events and html interface code

var MERGE_INTERFACE = new function () {

    this.clickedTab; // bugfix for wizard

    /**
     * Adds listeners to the gui
     */
    this.addInterfaceListeners = function () {

        // ...
        $("#id_changeUserButton").on('click', function (e) {
            e.preventDefault();
            MERGE_MAIN.logoutUser();
        });

        // Wizard navigarion
        $("#id_wizardNext").on("click", function (e) {
            e.preventDefault();
        });
        $("#id_wizardPrev").on("click", function (e) {
            e.preventDefault();
        });

        // Tabs bugfix
        var tabs = $("a[href^='#id_tab']");
        tabs.on("click", function (e) {
            e.preventDefault();
            MERGE_INTERFACE.clickedTab = $(this); // bugfix to detect which tab was clicked last
        });

        // Resize visualization on browser resize
//        $(window).on('resize', WEBGL.resizeVizualisation);
//        $(window).on('resize', INTERFACE.onScreenResize);

    };

    /**
     * Disable the wizard buttons in the beginning.
     */
    this.disableWizardInitially = function () {

        // Prev / Next buttons
        $("#id_wizardNext").parent().addClass("disabled");
        $("#id_wizardPrev").parent().addClass("disabled");

        // Tabs on top
        var tab2 = $("a[href=#id_tab2]").parent();
        var tab3 = $("a[href=#id_tab3]").parent();
        var tab4 = $("a[href=#id_tab4]").parent();
        tab2.addClass("disabled");
        tab3.addClass("disabled");
        tab4.addClass("disabled");

    };


    /**
     * Queries all observations and shows the visualization.
     */
    this.showVisualization = function () {

        // Query only once
        var obs1 = MERGE_MAIN.observations[MERGE_MAIN.cube1.cubeName];
        var obs2 = MERGE_MAIN.observations[MERGE_MAIN.cube2.cubeName];
        var rawObs1 = MERGE_MAIN.rawObservations[MERGE_MAIN.cube1.cubeName];
        var rawObs2 = MERGE_MAIN.rawObservations[MERGE_MAIN.cube2.cubeName];
        if (!obs1 || !obs2) {

            // Start the querying for all observations (and modify them according to configuration)
            MERGE_MAIN.loadObservations(MERGE_MAIN.cube1.cubeName);
            MERGE_MAIN.loadObservations(MERGE_MAIN.cube2.cubeName);

            var callback = function () {
                $('#id_loadingModal').modal("hide"); // Close the loading screen
                MERGE_INTERFACE.visualize(); // visualize
            };

            // Popup blocking loading screen
            MERGE_INTERFACE.popupLoadingScreen("Processing...");

            // Check if observations need to be downloaded (1st time)
            if (!rawObs1 || !rawObs2) {

                // Wait until both cubes have finished loading
                MERGE_MAIN.waitForAjax(callback);
            } else {
                callback(); // Visualize right away
            }
        }
    };

    /**
     * Show the tab that asks the user for a merged cube name and whether cube 1
     * or cube 2 should be preferred in case of overlaps.
     */
    this.showStorage = function () {

        // TODO show total overlap again?
        // TODO radio button for cube preference
        // TODO name input for new generated cube

        var nameInput = $("#id_mergedCubeNameInput");
        var saveButton = $("#id_acceptMergeButton");

    };

    /**
     * Shows the overview of dimensions and measures.
     */
    this.showStructureOverview = function () {

        // Show the dimension Table
        MERGE_INTERFACE.showDimensionStructure();

        // Show the measure Table
        MERGE_INTERFACE.showMeasureStructure();

        // Update wizard buttons (enable / disable next buttons depending on validity of config)
        MERGE_INTERFACE.updateWizardButtons(1);
    };

    /**
     * Show the dimension part of the overview
     */
    this.showDimensionStructure = function () {
        var cube1 = MERGE_MAIN.cube1;
        var cube2 = MERGE_MAIN.cube2;

        var cube1Dimensions = MERGE_MAIN.availableDimensions[cube1.cubeName];
        var cube2Dimensions = MERGE_MAIN.availableDimensions[cube2.cubeName];

        // Empty table (previous matchings)
        var dimensionTable = $("#id_dimensionTable");
        dimensionTable.empty();

        var tableHead = TEMPLATES.MERGE_TABLE_HEAD
                .replace("__cube1__", "Cube 1: " + MERGE_MAIN.cube1.label)
                .replace("__cube2__", "Cube 2: " + MERGE_MAIN.cube2.label);

        // Get total sorted lists of all dimensions (without duplicates from both cubes)
        var allDimensions = cube1Dimensions.concat(cube2Dimensions);
        allDimensions.sort(function (a, b) {
            return alphanumCase(a.label, b.label); // sort by label
        });
        var temp = {};
        for (var i = allDimensions.length - 1; i >= 0; i--) {
            var dim = allDimensions[i];
            if (temp[dim.dimensionName]) {
                allDimensions.splice(i, 1); // no duplicates
            }
            temp[dim.dimensionName] = true;
        }

        // Get list of possible match partners for each cube (dimensions that are only on one cube)
        var cube1MissingList = MERGE_MAIN.computeMissingDimensions(cube1Dimensions, cube2Dimensions);
        var cube2MissingList = MERGE_MAIN.computeMissingDimensions(cube2Dimensions, cube1Dimensions);


        // Build dimension table
        dimensionTable.append($(tableHead));
        $.each(allDimensions, function (i, dimension) {

            var row = $("<tr>").appendTo(dimensionTable);
            var dimNameCell = $("<td>").appendTo(row);
            var cube1Cell = $("<td>").appendTo(row);
            var cube2Cell = $("<td>").appendTo(row);
            var buttonCell = $("<td>").appendTo(row);

            // Set label
            dimNameCell.text(dimension.label);

            // Some quick infos
            var isInCube1 = MERGE_MAIN.containsDimension(cube1Dimensions, dimension.dimensionName);
            var isInCube2 = MERGE_MAIN.containsDimension(cube2Dimensions, dimension.dimensionName);
            var isAdded = MERGE_MAIN.isAddedDimension(dimension.dimensionName);
            var isMatched = MERGE_MAIN.isMatchedDimension(dimension.dimensionName);

            if (MERGE_MAIN.dimensionMatching[dimension.dimensionName]) {
                // Dimension will be replaced, gray out row, no button
                var replacement = MERGE_MAIN.getMatchedDimension(dimension.dimensionName);
                row.addClass("replaced"); // Gray out

                // Check if dimension is in cube 1
                if (isInCube1) {
                    cube1Cell.append('<span class="glyphicon glyphicon-ok"></span>');
                } else {
                    cube1Cell.append('<span class="glyphicon glyphicon-link"></span> <b>' + replacement.label + '</b>');
                }

                // Check if dimension is in cube 2
                if (isInCube2) {
                    cube2Cell.append('<span class="glyphicon glyphicon-ok"></span>');
                } else {
                    cube2Cell.append('<span class="glyphicon glyphicon-link"></span> <b>' + replacement.label + '</b>');
                }
            } else if (isMatched) {
                // Dimension is a replacement for another
                var replacedDimension = MERGE_MAIN.getMatchingDimension(dimension.dimensionName);

                // Check if dimension is in cube 1
                cube1Cell.addClass("success");
                if (isInCube1) {
                    cube1Cell.append('<span class="glyphicon glyphicon-ok"></span>');
                } else {
                    cube1Cell.append('<span class="glyphicon glyphicon-link"></span> <b>' + replacedDimension.label + '</b>');
                }

                // Check if dimension is in cube 2
                cube2Cell.addClass("success");
                if (isInCube2) {
                    cube2Cell.append('<span class="glyphicon glyphicon-ok"></span>');
                } else {
                    cube2Cell.append('<span class="glyphicon glyphicon-link"></span> <b>' + replacedDimension.label + '</b>');
                }

            } else if (isAdded) {
                // Dimension + Default entity is added
                var addedEntity = MERGE_MAIN.getAddedEntity(dimension.dimensionName);

                // Check if dimension is in cube 1
                if (isInCube1) {
                    cube1Cell.addClass("success");
                    cube1Cell.append('<span class="glyphicon glyphicon-ok"></span>');
                } else {
                    cube1Cell.addClass("success");
                    cube1Cell.append('<span class="glyphicon glyphicon-plus"></span> <b>' + addedEntity.label + '</b>');
                }

                // Check if dimension is in cube 2
                if (isInCube2) {
                    cube2Cell.addClass("success");
                    cube2Cell.append('<span class="glyphicon glyphicon-ok"></span>');
                } else {
                    cube2Cell.addClass("success");
                    cube2Cell.append('<span class="glyphicon glyphicon-plus"></span> <b>' + addedEntity.label + '</b>');
                }
            } else {
                // Normal unaltered cells

                // Check if dimension is in cube 1
                if (isInCube1) {
                    cube1Cell.addClass("success");
                    cube1Cell.append('<span class="glyphicon glyphicon-ok"></span>');
                } else {
                    cube1Cell.addClass("danger");
                    cube1Cell.append('<span class="glyphicon glyphicon-remove"></span>');
                }

                // Check if dimension is in cube 2
                if (isInCube2) {
                    cube2Cell.addClass("success");
                    cube2Cell.append('<span class="glyphicon glyphicon-ok"></span>');
                } else {
                    cube2Cell.addClass("danger");
                    cube2Cell.append('<span class="glyphicon glyphicon-remove"></span>');
                }
            }

            // Show button if dimension is missing in one cube
            if (!isInCube1 || !isInCube2) {

                // Determine which cube has it and which needs it
                var cubeOk;
                var cubeMissing;
                var missingDimensions;
                if (isInCube1) {
                    cubeOk = cube1;
                    cubeMissing = cube2;
                    missingDimensions = cube1MissingList;
                } else {
                    cubeOk = cube2;
                    cubeMissing = cube1;
                    missingDimensions = cube2MissingList;
                }

                var buttonGroup = $('<div class="btn-group"></div>');
                var button = $('<button class="btn btn-sm btn-default dropdown-toggle" type="button" data-toggle="dropdown"><span class="glyphicon glyphicon-wrench"></span></button>');
                buttonGroup.append(button);
                buttonCell.append(buttonGroup);

                // Add menu to match or add dimension
                var dropdownMenu = $('<ul class="dropdown-menu dropdown-menu-right" role="menu">').appendTo(buttonGroup);

                // Add menu items depending on the dimension's state
                if (isAdded) {
                    // Add item to undo adding dimension
                    var undoItem = $("<li role='presentation'></li>").appendTo(dropdownMenu);
                    var undoItemLink = $("<a role='menuitem' tabindex='-1' href='#'>Undo Adding Dimension</a>").appendTo(undoItem);
                    undoItemLink.on("click", function (e) {
                        e.preventDefault();

                        // Undo the adding (+ default entity)
                        MERGE_MAIN.undoDimensionAdding(dimension.dimensionName);

                        // Discard useless observation (if already queried)
                        MERGE_MAIN.observations = {};
                        $("#id_visualization").empty();

                        // Update whole overview (rebuild)
                        MERGE_INTERFACE.showStructureOverview();
                    });
                } else if (isMatched) {
                    // Add item to undo matching dimension
                    var replacedDimension = MERGE_MAIN.getMatchingDimension(dimension.dimensionName);
                    var undoItem = $("<li role='presentation'></li>").appendTo(dropdownMenu);
                    var undoItemLink = $("<a role='menuitem' tabindex='-1' href='#'>Undo Matching <b>" + replacedDimension.label + "</b></a>").appendTo(undoItem);
                    undoItemLink.on("click", function (e) {
                        e.preventDefault();

                        // Undo the matching
                        MERGE_MAIN.undoDimensionMatching(replacedDimension.dimensionName);

                        // Discard useless observation (if already queried)
                        MERGE_MAIN.observations = {};
                        $("#id_visualization").empty();

                        // Update whole overview (rebuild)
                        MERGE_INTERFACE.showStructureOverview();
                    });
                } else if (MERGE_MAIN.dimensionMatching[dimension.dimensionName]) {
                    // Add item to undo matching (for the grayed-out line)
                    var replacingDimension = MERGE_MAIN.getMatchedDimension(dimension.dimensionName);
                    var undoItem = $("<li role='presentation'></li>").appendTo(dropdownMenu);
                    var undoItemLink = $("<a role='menuitem' tabindex='-1' href='#'>Undo Matching <b>" + replacingDimension.label + "</b></a>").appendTo(undoItem);
                    undoItemLink.on("click", function (e) {
                        e.preventDefault();

                        // Undo the matching
                        MERGE_MAIN.undoDimensionMatching(dimension.dimensionName);

                        // Discard useless observation (if already queried)
                        MERGE_MAIN.observations = {};
                        $("#id_visualization").empty();

                        // Update whole overview (rebuild)
                        MERGE_INTERFACE.showStructureOverview();
                    });
                } else {
                    // No action so far
                    var addItem = $("<li role='presentation'></li>").appendTo(dropdownMenu);
                    var addItemLink = $("<a role='menuitem' tabindex='-1' href='#'>Add Dimension...</a>").appendTo(addItem);
                    addItemLink.on("click", function (e) {
                        e.preventDefault();

                        // Popup dialog to type an entity (label) for the new dimension or choose an existing one
                        // As callback onSuccess: Update whole overview (rebuild)
                        MERGE_INTERFACE.popupDimensionAdding(dimension, cubeMissing, function () {

                            // Discard useless observation (if already queried)
                            MERGE_MAIN.observations = {};
                            $("#id_visualization").empty();

                            // Update whole overview (rebuild)
                            MERGE_INTERFACE.showStructureOverview();
                        });
                    });

                    // Add possible matching dimensions
                    if (missingDimensions.length > 0) {
                        $("<li class='divider' role='presentation'></li>").appendTo(dropdownMenu); // Add divider
                    }
                    $.each(missingDimensions, function (i, missingDimension) {
                        var label = missingDimension.label;
                        var matchItem = $("<li role='presentation'></li>").appendTo(dropdownMenu);
                        var matchItemLink = $("<a role='menuitem' tabindex='-1' href='#'>Match <b>" + label + "</b></a>").appendTo(matchItem);
                        matchItem.attr("data-match-dimension", missingDimension.dimensionName);
                        matchItem.attr("title", 'Dimension "' + dimension.label + '" will be replaced by "' + label + '"');
                        matchItem.tooltip();
                        matchItemLink.on("click", function (e) {
                            e.preventDefault();

                            // Do nothing if already matched or added
                            if (MERGE_MAIN.isMatchedDimension(missingDimension.dimensionName) ||
                                    MERGE_MAIN.dimensionMatching[missingDimension.dimensionName] ||
                                    MERGE_MAIN.isAddedDimension(missingDimension.dimensionName)) {
                                return;
                            }

                            // Add to matching list
                            MERGE_MAIN.dimensionMatching[dimension.dimensionName] = missingDimension.dimensionName; // dim will be replaced by missing dim

                            // Discard useless observation (if already queried)
                            MERGE_MAIN.observations = {};
                            $("#id_visualization").empty();

                            // Update whole overview (rebuild)
                            MERGE_INTERFACE.showStructureOverview();
                        });
                    });
                }


            } else if (isInCube1 && isInCube2) {
                // Nothing to do, both cubes have the dimension
            }

        });

        // Disable all menu items according to current dimension matching (both ways).
        $.each(MERGE_MAIN.dimensionMatching, function (key, value) {
            $("li[data-match-dimension='" + value + "']").addClass("disabled");
            $("li[data-match-dimension='" + key + "']").addClass("disabled");
        });
        // Disable all menu items for added dimensions (with default entity).
        $.each(MERGE_MAIN.addedDimensions, function (key, dimensionList) {
            $.each(dimensionList, function (i, dimension) {
                $("li[data-match-dimension='" + dimension.dimensionName + "']").addClass("disabled");
            });
        });
    };

    /**
     * Show the measure part of the overview
     */
    this.showMeasureStructure = function () {
        var cube1 = MERGE_MAIN.cube1;
        var cube2 = MERGE_MAIN.cube2;

        var cube1Measures = MERGE_MAIN.availableMeasures[cube1.cubeName];
        var cube2Measures = MERGE_MAIN.availableMeasures[cube2.cubeName];

        // Empty table (possible previous matchings)
        var measureTable = $("#id_measureTable");
        measureTable.empty();

        var tableHead = TEMPLATES.MERGE_TABLE_HEAD
                .replace("__cube1__", "Cube 1: " + MERGE_MAIN.cube1.label)
                .replace("__cube2__", "Cube 2: " + MERGE_MAIN.cube2.label);

        // Get total sorted lists of all measures (without duplicates from both cubes)
        var allMeasures = cube1Measures.concat(cube2Measures);
        allMeasures.sort(function (a, b) {
            return alphanumCase(a.label, b.label); // sort by label
        });
        var temp = {};
        for (var i = allMeasures.length - 1; i >= 0; i--) {
            var measure = allMeasures[i];
            if (temp[measure.measureName]) {
                allMeasures.splice(i, 1); // no duplicates
            }
            temp[measure.measureName] = true;
        }

        // Get list of possible match partners for each cube (measures that are only on one cube)
        var cube1MissingList = MERGE_MAIN.computeMissingMeasures(cube1Measures, cube2Measures);
        var cube2MissingList = MERGE_MAIN.computeMissingMeasures(cube2Measures, cube1Measures);

        // Build measure table
        measureTable.append($(tableHead));

        $.each(allMeasures, function (i, measure) {

            var row = $("<tr>").appendTo(measureTable);
            var measureNameCell = $("<td>").appendTo(row);
            var cube1Cell = $("<td>").appendTo(row);
            var cube2Cell = $("<td>").appendTo(row);
            var buttonCell = $("<td>").appendTo(row);

            // Set label
            measureNameCell.text(measure.label);

            // Some quick infos
            var isInCube1 = MERGE_MAIN.containsMeasure(cube1Measures, measure.measureName);
            var isInCube2 = MERGE_MAIN.containsMeasure(cube2Measures, measure.measureName);
            var isMatched = MERGE_MAIN.isMatchedMeasure(measure.measureName);

            if (MERGE_MAIN.measureMatching[measure.measureName]) {
                // Measure will be replaced, gray out row, no button
                var replacement = MERGE_MAIN.getMatchedMeasure(measure.measureName);
                row.addClass("replaced"); // Gray out

                // Check if measure is in cube 1
                if (isInCube1) {
                    cube1Cell.append('<span class="glyphicon glyphicon-ok"></span>');
                } else {
                    cube1Cell.append('<span class="glyphicon glyphicon-link"></span> <b>' + replacement.label + '</b>');
                }

                // Check if measure is in cube 2
                if (isInCube2) {
                    cube2Cell.append('<span class="glyphicon glyphicon-ok"></span>');
                } else {
                    cube2Cell.append('<span class="glyphicon glyphicon-link"></span> <b>' + replacement.label + '</b>');
                }
            } else if (isMatched) {
                // Measure is a replacement for another
                var replacedMeasure = MERGE_MAIN.getMatchingMeasure(measure.measureName);

                // Check if measure is in cube 1
                cube1Cell.addClass("success");
                if (isInCube1) {
                    cube1Cell.append('<span class="glyphicon glyphicon-ok"></span>');
                } else {
                    cube1Cell.append('<span class="glyphicon glyphicon-link"></span> <b>' + replacedMeasure.label + '</b>');
                }

                // Check if measure is in cube 2
                cube2Cell.addClass("success");
                if (isInCube2) {
                    cube2Cell.append('<span class="glyphicon glyphicon-ok"></span>');
                } else {
                    cube2Cell.append('<span class="glyphicon glyphicon-link"></span> <b>' + replacedMeasure.label + '</b>');
                }

            } else {
                // No matching, draw normal cells

                // Check if measure is in cube 1
                if (isInCube1) {
                    cube1Cell.addClass("success");
                    cube1Cell.append('<span class="glyphicon glyphicon-ok"></span>');
                } else {
                    cube1Cell.append('<span class="glyphicon glyphicon-remove"></span>');
                }

                // Check if measure is in cube 2
                if (isInCube2) {
                    cube2Cell.addClass("success");
                    cube2Cell.append('<span class="glyphicon glyphicon-ok"></span>');
                } else {
                    cube2Cell.append('<span class="glyphicon glyphicon-remove"></span>');
                }
            }

            // Show button if measure is missing in one cube
            if (!isInCube1 || !isInCube2) {

                // Determine which cube has it and which needs it
                var cubeOk;
                var cubeMissing;
                var missingMeasures;
                if (isInCube1) {
                    cubeOk = cube1;
                    cubeMissing = cube2;
                    missingMeasures = cube1MissingList;
                } else {
                    cubeOk = cube2;
                    cubeMissing = cube1;
                    missingMeasures = cube2MissingList;
                }

                var buttonGroup = $('<div class="btn-group"></div>');
                var button = $('<button class="btn btn-sm btn-default dropdown-toggle" type="button" data-toggle="dropdown"><span class="glyphicon glyphicon-wrench"></span></button>');
                buttonGroup.append(button);
                buttonCell.append(buttonGroup);

                // Add menu to match measures
                var dropdownMenu = $('<ul class="dropdown-menu dropdown-menu-right" role="menu">').appendTo(buttonGroup);

                // Add menu items depending on the measure's state
                if (isMatched) {
                    // Add item to undo matching measures
                    var replacedMeasure = MERGE_MAIN.getMatchingMeasure(measure.measureName);
                    var undoItem = $("<li role='presentation'></li>").appendTo(dropdownMenu);
                    var undoItemLink = $("<a role='menuitem' tabindex='-1' href='#'>Undo Matching <b>" + replacedMeasure.label + "</b></a>").appendTo(undoItem);
                    undoItemLink.on("click", function (e) {
                        e.preventDefault();

                        // Undo the matching
                        MERGE_MAIN.undoMeasureMatching(replacedMeasure.measureName);

                        // Discard useless observation (if already queried)
                        MERGE_MAIN.observations = {};
                        $("#id_visualization").empty();

                        // Update whole overview (rebuild)
                        MERGE_INTERFACE.showStructureOverview();
                    });
                } else if (MERGE_MAIN.measureMatching[measure.measureName]) {
                    // Add item to undo matching (for the grayed-out line)
                    var replacingMeasure = MERGE_MAIN.getMatchedMeasure(measure.measureName);
                    var undoItem = $("<li role='presentation'></li>").appendTo(dropdownMenu);
                    var undoItemLink = $("<a role='menuitem' tabindex='-1' href='#'>Undo Matching <b>" + replacingMeasure.label + "</b></a>").appendTo(undoItem);
                    undoItemLink.on("click", function (e) {
                        e.preventDefault();

                        // Undo the matching
                        MERGE_MAIN.undoMeasureMatching(measure.measureName);

                        // Discard useless observation (if already queried)
                        MERGE_MAIN.observations = {};
                        $("#id_visualization").empty();

                        // Update whole overview (rebuild)
                        MERGE_INTERFACE.showStructureOverview();
                    });
                } else {
                    // No action so far

                    // Add possible matching measures, if zero remove whole button
                    if (missingMeasures.length === 0) {
                        buttonCell.empty();
                    }
                    $.each(missingMeasures, function (i, missingMeasure) {
                        var label = missingMeasure.label;
                        var matchItem = $("<li role='presentation'></li>").appendTo(dropdownMenu);
                        var matchItemLink = $("<a role='menuitem' tabindex='-1' href='#'>Match <b>" + label + "</b></a>").appendTo(matchItem);
                        matchItem.attr("data-match-measure", missingMeasure.measureName);
                        matchItem.attr("title", 'Measure "' + measure.label + '" will be replaced by "' + label + '"');
                        matchItem.tooltip();
                        matchItemLink.on("click", function (e) {
                            e.preventDefault();

                            // Do nothing if already matched
                            if (MERGE_MAIN.isMatchedMeasure(missingMeasure.measureName) ||
                                    MERGE_MAIN.measureMatching[missingMeasure.measureName]) {
                                return;
                            }

                            // Add to matching list
                            MERGE_MAIN.measureMatching[measure.measureName] = missingMeasure.measureName; // dim will be replaced by missing dim

                            // Discard useless observation (if already queried)
                            MERGE_MAIN.observations = {};
                            $("#id_visualization").empty();

                            // Update whole overview (rebuild)
                            MERGE_INTERFACE.showStructureOverview();
                        });
                    });
                }


            } else if (isInCube1 && isInCube2) {
                // Nothing to do, both cubes have the measure
            }

        });

        // Disable all menu items according to current measure matching (both ways).
        $.each(MERGE_MAIN.measureMatching, function (key, value) {
            $("li[data-match-measure='" + value + "']").addClass("disabled");
            $("li[data-match-measure='" + key + "']").addClass("disabled");
        });
    };



    /**
     * Inits the cube dropdown lists and its listeners.
     */
    this.initCubeLists = function () {

        // Clear old cube lists
        $("#id_cubeList1").empty();
        $("#id_cubeList2").empty();

        // Iterate through available cubes and fill the list
        $.each(MERGE_MAIN.availableCubes, function (index, cube) {
            var cubeName = cube.cubeName;
            var comment = cube.comment;
            var label = cube.label;

            // Create Dropdown entries
            var itemLink = $("<a role='menuitem' tabindex='-1' href='#'></a>");
            itemLink.text(label);
            itemLink.attr("title", label + ":\n\n" + comment); // tooltip

            var item1 = $("<li role='presentation' data-cube-name='" + cubeName + "'></li>");
            item1.append(itemLink);
            var item2 = item1.clone();
            $("#id_cubeList1").append(item1);
            $("#id_cubeList2").append(item2);

            // Enable tooltips
            itemLink.tooltip();
            item2.children("a[role=menuitem]").tooltip();

            // Add on-click handler for chosen cubes
            itemLink.on("click", function (e) {
                e.preventDefault();
                MERGE_INTERFACE.selectCube(1, cube);
            });
            item2.children("a[role=menuitem]").on("click", function (e) {
                e.preventDefault();
                MERGE_INTERFACE.selectCube(2, cube);
            });

        });

    };

    /**
     * Select a given cube
     *
     * @param {type} cubeNr
     * @param {type} cube
     * @param {type} callback
     */
    this.selectCube = function (cubeNr, cube, callback) {
        var cubeName = cube.cubeName;
        var comment = cube.comment;
        var label = cube.label;

        // Is the same cube already selected as cube 1 or 2?
        if (MERGE_MAIN.cube1 && MERGE_MAIN.cube1.cubeName === cubeName
                || MERGE_MAIN.cube2 && MERGE_MAIN.cube2.cubeName === cubeName) {
            return;
        }

        // Set current cube's URI
        var prevCube;
        if (cubeNr === 1) {
            prevCube = MERGE_MAIN.cube1;
            MERGE_MAIN.cube1 = cube;
        } else if (cubeNr === 2) {
            prevCube = MERGE_MAIN.cube2;
            MERGE_MAIN.cube2 = cube;
        }

        // Clear available lists of previously selected cubes
        if (prevCube) {
            delete MERGE_MAIN.availableDimensions[prevCube.cubeName];
            delete MERGE_MAIN.availableMeasures[prevCube.cubeName];
        }

        MERGE_MAIN.entityList[cubeName] = {}; // reset entity list

        // reset matching / adding configuration
        MERGE_MAIN.dimensionMatching = {};
        MERGE_MAIN.addedDimensions = {};
        MERGE_MAIN.measureMatching = {};
        MERGE_MAIN.observations = {};

        // Query available dimensions and measures and fill the lists
        MERGE_MAIN.loadDimensionList(cubeName);
        MERGE_MAIN.loadMeasureList(cubeName);

        // Enable forward button after all ajax is done (and 2 cubes were selected)
        MERGE_MAIN.waitForAjax(function () {
            MERGE_INTERFACE.updateWizardButtons(0);
        });

        // Set button and cube title and tooltip
        $("#id_cubeButton" + cubeNr).empty();
        $("#id_cubeButton" + cubeNr).append("<span class=button-text>" + label + "</span>");
        $("#id_cubeButton" + cubeNr).append(" <span class='caret'></span>");
        $("#id_cubeButton" + cubeNr).attr("title", label + ":\n\n" + comment); // tooltip
        $("#id_cubeButton" + cubeNr).tooltip();

        // Disable the selected cube from list (and re-enable previous one)
        if (prevCube) {
            $('[data-cube-name="' + prevCube.cubeName + '"]').removeClass("disabled");
        }
        $('[data-cube-name="' + cubeName + '"]').addClass("disabled");
    };

    /**
     * Updates the wizards forward / backward buttons according to the current page and configuration
     * @param {int} wizardIndex the new Wizard page index
     */
    this.updateWizardButtons = function (wizardIndex) {

        // Tabs on top
        var tab2 = $("a[href=#id_tab2]").parent();
        var tab3 = $("a[href=#id_tab3]").parent();
        var tab4 = $("a[href=#id_tab4]").parent();

        // Prev / Next buttons
        switch (wizardIndex) {
            case 0: // Cube selection
                // Allow forward if both cubes were selected
                if (MERGE_MAIN.cube1 && MERGE_MAIN.cube2) {
                    $("#id_wizardNext").parent().removeClass("disabled");
                    tab2.removeClass("disabled");
                    tab3.removeClass("disabled");
                    if (MERGE_MAIN.isValidConfiguration()) {
                        tab4.removeClass("disabled");
                    } else {
                        tab4.addClass("disabled");
                    }
                } else {
                    $("#id_wizardNext").parent().addClass("disabled");
                    tab2.addClass("disabled");
                    tab3.addClass("disabled");
                }
                break;
            case 1: // Structure matching
                // Allow forwarding
                if (MERGE_MAIN.isValidConfiguration()) {
                    tab4.removeClass("disabled");
                } else {
                    tab4.addClass("disabled");
                }
                // You may always advance to visualization (but not to storage)
                $("#id_wizardNext").parent().removeClass("disabled");
                break;
            case 2: // Visualization
                if (MERGE_MAIN.isValidConfiguration()) {
                    $("#id_wizardNext").parent().removeClass("disabled");
                    tab4.removeClass("disabled");
                } else {
                    $("#id_wizardNext").parent().addClass("disabled");
                    tab4.addClass("disabled");
                }
                break;
            case 3: // Storage
                // Nothing to do. This is the end.
                break;
        }

    };

    /**
     * Updates the wizards current page, e.g. rebuild overview table
     * @param {int} wizardIndex the new Wizard page index
     */
    this.updateWizardPage = function (wizardIndex) {
        switch (wizardIndex) {
            case 0: // Cube selection
                // Nothing to do here
                break;
            case 1: // Structure matching
                MERGE_INTERFACE.showStructureOverview();
                break;
            case 2: // Visualization
                MERGE_INTERFACE.showVisualization();
                break;
            case 3: // Storage
                MERGE_INTERFACE.showStorage();
                break;
        }
    };

    // Shows a login popup to enter a user ID.
    this.popupLogin = function () {

        // Add popup to the body
        var modal = $(TEMPLATES.MODAL_LOGIN_TEMPLATE);
        $("body").append(modal);

        // Accept action of popup
        var submitLogin = function (e) {
            e.preventDefault();
            // Try to login the user with the given ID
            var id = $("#id_loginModalID").val();
            MERGE_MAIN.loginUser(id);
        };
        $("#id_loginModalOkay").on("click", submitLogin);
        $('#id_loginModal form').on("submit", submitLogin);

        // Show the popup
        $('#id_loginModal').modal({
            backdrop: 'static',
            keyboard: false
        });

        // Focus input field
        modal.on('shown.bs.modal', function (e) {
            $('#id_loginModalID').focus();
        });

        // Remove when finished
        modal.on('hidden.bs.modal', function (e) {
            modal.remove();
        });
    };

    /**
     * Show a popup for adding a dimension's entity.
     * @param dimension
     * @param missingCube
     * @param callback
     */
    this.popupDimensionAdding = function (dimension, missingCube, callback) {

        // Add popup to the body
        var modal = $("#id_addDimensionModal");
        $("body").append(modal);

        var title = $("#id_addDimensionModal h4");
        var form = $("#id_addDimensionModal form");
        var input = $("#id_addDimensionModalInput");
        var acceptButton = $("#id_addDimensionModalOkay");
        var dropdownButton = $("#id_addDimensionModalDropdown > button");
        var dropdownList = $("#id_addDimensionModalDropdown > ul");

        var selectedEntity = undefined; // For selection from existing entities

        // Set title
        title.text('Add Dimension "' + dimension.label + '"');

        // Clear initial input
        input.val("");

        // Set button text
        dropdownButton.empty();
        var text = $('<span class="button-text"> Select Entity </span>');
        var caret = $('<span class="caret"></span>');
        dropdownButton.append(text);
        dropdownButton.append(caret);

        // Build dropdownlist for dimension
        var entities;
        $.each(MERGE_MAIN.entityList, function (key, obj) {
            if (obj[dimension.dimensionName]) {
                entities = obj[dimension.dimensionName].list;
                return false; // break
            }
        });
        dropdownList.empty(); // clear first
        $.each(entities, function (i, entity) {
            var item = $("<li role='presentation'></li>").appendTo(dropdownList);
            var itemLink = $("<a role='menuitem' tabindex='-1' href='#'></a>").appendTo(item);
            itemLink.text(entity.label);
            itemLink.on("click", function (e) {
                e.preventDefault();

                // Select entity
                selectedEntity = entity;

                // Update button text
                dropdownButton.children(".button-text").text(entity.label + " ");

                // Clear previously typed Label
                input.val("");
            });
        });

        // Add input actions
        input.off("change");
        input.on("change", function (e) {

            // Reset selection from list
            selectedEntity = undefined;

            // Reset selection button
            dropdownButton.children(".button-text").text(" Select Entity ");

        });

        // Accept action of popup
        var accept = function (e) {
            e.preventDefault();

            // Add dimension, check input field and dropdown list

            if (input.val() !== "") {
                // Selection from input
                var label = input.val();
                alert("ENTERED: " + label + ", TODO: disambiguation service");
                // TODO: disambiguation service for label?

            } else if (selectedEntity) {
                // Selection from dropdown

                // Apply new dimension + entity
                if (!MERGE_MAIN.addedDimensions[missingCube.cubeName]) {
                    MERGE_MAIN.addedDimensions[missingCube.cubeName] = [];
                }
                // selected entity as only element in the list
                var addedDimension = new Dimension(dimension.dimensionName, dimension.label, [selectedEntity]);
                MERGE_MAIN.addedDimensions[missingCube.cubeName].push(addedDimension);
            } else {
                return; // Do nothing if no user interaction
            }

            // Execute callback function (usually refresh overview)
            if (callback) {
                callback();
            }

            // Hide the modal
            modal.modal("hide");
        };

        // Clear previous listeners
        acceptButton.off("click");
        form.off("submit");

        // Add listeners
        acceptButton.on("click", accept);
        form.on("submit", accept);

        // Show the popup
        modal.modal();

        // Focus input field
        modal.off('shown.bs.modal');
        modal.on('shown.bs.modal', function (e) {
            input.focus();
        });
    };

    /**
     * Shows a blocking loading screen with a given text.
     *
     * @param {String} text
     */
    this.popupLoadingScreen = function (text) {

        // Add popup to the body
        var modal = $(TEMPLATES.MODAL_LOADING_TEMPLATE.replace("__title__", text));
        $("body").append(modal);

        // Show the popup
        $('#id_loadingModal').modal({
            backdrop: 'static',
            keyboard: false
        });

        // Remove when finished
        modal.on('hidden.bs.modal', function (e) {
            modal.remove();
        });
    };

    /**
     * Visualizes the difference of both cubes. The user can toggle to show all
     * data, only data about cube1, cube2 or only overlaps of both.
     */
    this.visualize = function () {
        var cube1 = MERGE_MAIN.cube1;
        var cube2 = MERGE_MAIN.cube2;
        var cube1Dimensions = MERGE_MAIN.availableDimensions[cube1.cubeName];
        var cube2Dimensions = MERGE_MAIN.availableDimensions[cube2.cubeName];
        var cube1Measures = MERGE_MAIN.availableMeasures[cube1.cubeName];
        var cube2Measures = MERGE_MAIN.availableMeasures[cube2.cubeName];
        var cube1Observations = MERGE_MAIN.observations[cube1.cubeName];
        var cube2Observations = MERGE_MAIN.observations[cube2.cubeName];

        var cube1ObsMap = {}; // e.g. map[uri+uri+uri+...] = true
        var cube2ObsMap = {};

        /*
         * TODO:
         *
         *   ? bundling? maybe by measures
         *
         *   ? label color according to c1,c2,overlap
         *
         *   ? types...  (measure must be number), dimension can be strings (OR number? -> e.g. Year)
         *
         *   + hover for lines (or list below)
         *   + if numerical entities (e.g. Year) set graph tick to show every label
         *   + short label / small font -> longer label for tooltip (maybe fill with spaces)
         *
         *   ? order of dimensions (maybe C1 then C2 then measures C1 + C2) (for distinct dimensions)
         *
         *   ? how to count overlap -> 2 obs = 1 or 2 overlap
         *
         *   ? maybe restore dimension order after filtering / resizing
         *
         */


        console.log("OBS CUBE1", MERGE_MAIN.observations[cube1.cubeName][0]);
        console.log("OBS CUBE2", MERGE_MAIN.observations[cube2.cubeName][0]);


        // Create sorted list of all dimensions of both cubes (without replaced ones)
        var allDimensions = cube1Dimensions.concat(cube2Dimensions); // may be fully or partially matched
        allDimensions.sort(function (a, b) {
            return alphanumCase(a.label, b.label); // sort by label
        });
        for (var i = allDimensions.length - 1; i >= 0; i--) {
            var dim = allDimensions[i];
            if (allDimensions[dim.dimensionName]) {
                allDimensions.splice(i, 1); // no duplicates
            } else if (MERGE_MAIN.dimensionMatching[dim.dimensionName] !== undefined) {
                allDimensions.splice(i, 1); // dimension is replaced by another
            } else {
                allDimensions[dim.dimensionName] = dim; // for quick access
            }
        }

        // Create sorted list of all measures of both cubes (without replaced ones)
        var allMeasures = cube1Measures.concat(cube2Measures); // may be fully or partially matched
        allMeasures.sort(function (a, b) {
            return alphanumCase(a.label, b.label); // sort by label
        });
        for (var i = allMeasures.length - 1; i >= 0; i--) {
            var meas = allMeasures[i];
            if (allMeasures[meas.measureName]) {
                allMeasures.splice(i, 1); // no duplicates
            } else if (MERGE_MAIN.measureMatching[meas.measureName] !== undefined) {
                allMeasures.splice(i, 1); // dimension is replaced by another
            } else {
                allMeasures[meas.measureName] = meas; // for quick access
            }
        }

        // Create a list of dimensions that both cubes have, for overlap determination. Compare 1st observations of both cubes.
        var sharedDimensions = [];
        var obsC1 = cube1Observations[0];
        var obsC2 = cube2Observations[0];
        $.each(obsC1.dimensions, function (key, dimension) {
            if (obsC2.dimensions[key]) {
                sharedDimensions.push(allDimensions[key]); // shared, add to list
            }
        });

        // Create separate lists for observations of overlaps, cube1, cube2 (distinct, All = with overlaps)
        var cube1Obs = []; // cube 1 observations WITHOUT overlaps
        var cube2Obs = []; // cube 2 observations WITHOUT overlaps
        var overlapObs = [];
        var cube1ObsAll = []; // cube 1 observations overlaps INCLUSIVE
        var cube2ObsAll = []; // cube 2 observations overlaps INCLUSIVE

        // Fill the observation maps for fast overlap detection and observation access
        var insertIntoObsMap = function (map, obs) {
            var key = "";
            $.each(sharedDimensions, function (k, dimension) {
//                key += obs.dimensions[dimension.dimensionName].entityName;
                key += obs.dimensions[dimension.dimensionName].label; // TODO replace label with isDefinedBy #############################################################
            });
            map[key] = obs;
        };
        $.each(cube1Observations, function (i, obs) {
            insertIntoObsMap(cube1ObsMap, obs);
        });
        $.each(cube2Observations, function (i, obs) {
            insertIntoObsMap(cube2ObsMap, obs);
        });


        /**
         * Computes overlap and fills the lists of data for the graph.
         *
         * @param observations the list of observations to add
         */
        var computeOverlap = function (observations) {
            var obsList = (observations === MERGE_MAIN.observations[cube1.cubeName]) ? cube1Obs : cube2Obs;
            var obsMap = (observations === MERGE_MAIN.observations[cube1.cubeName]) ? cube2ObsMap : cube1ObsMap;

            $.each(observations, function (i, obs) {
                var overlap = false; // Initially
                var data = [];

                // Fill the data cell
                $.each(allDimensions, function (j, dimension) {
                    if (obs.dimensions[dimension.dimensionName] === undefined) {
                        data.push("?"); // TODO empty entity? "not yet defined" / Dimension can be numerical too -> "0"
                    } else {
                        var label = obs.dimensions[dimension.dimensionName].label;
                        if (label.length > 20) {
                            label = label.substr(0, 19) + "\u2026";
                            // TODO: tooltip
                        }
                        data.push(label); // Add entity label
                    }
                });
                $.each(allMeasures, function (j, measure) {
                    if (obs.measures[measure.measureName] === undefined) {
                        data.push(0); // TODO: missing measure? "not yet defined" ? or: 0
                    } else {
                        data.push(obs.measures[measure.measureName]); // Add measure value
                    }
                });

                // Remember which cube the data belongs to
                if (observations === MERGE_MAIN.observations[cube1.cubeName]) {
                    cube1ObsAll.push(data);
                } else {
                    cube2ObsAll.push(data);
                }

                // Check for overlap
                var key = "";
                $.each(sharedDimensions, function (k, dimension) {
//                    key += obs.dimensions[dimension.dimensionName].entityName;
                    key += obs.dimensions[dimension.dimensionName].label; // TODO replace label with isDefinedBy #############################################################
                });

                var overlappingObs = obsMap[key];
                var overlap;
                if (overlappingObs) {
                    // Check if the measures differ
                    var sameMeasures = true;
                    $.each(allMeasures, function (k, measure) {
                        var valueA = obs.measures[measure.measureName];
                        var valueB = overlappingObs.measures[measure.measureName];
                        if (valueA !== valueB) {
                            sameMeasures = false;
                            return false; // break
                        }
                    });
                    overlap = !sameMeasures;
                } else {
                    overlap = false;
                }

                // Put the data in the respective list
                if (overlap) {
                    overlapObs.push(data); // Add to overlapping list
                } else {
                    obsList.push(data);// Add to cube list
                }

            });
        };

        // Add results from both cubes
        computeOverlap(cube1Observations);
        computeOverlap(cube2Observations);

        // Gather the graph config
        var config = {
            allDimensions: allDimensions,
            allMeasures: allMeasures,
            cube1Obs: cube1Obs,
            cube2Obs: cube2Obs,
            overlapObs: overlapObs,
            cube1ObsAll: cube1ObsAll,
            cube2ObsAll: cube2ObsAll,
            fullSize: false,
            showCube1: true,
            showCube2: true,
            showOverlaps: true
        };

        // Configure resize button to show compact or full height
        $("#id_sizeButton").text("Full Size");
        $("#id_sizeButton").off("click");
        $("#id_sizeButton").on("click", function (e) {
            e.preventDefault();

            config.fullSize = !config.fullSize;
            var newText = config.fullSize ? "Compact Size" : "Full Size";
            $("#id_sizeButton").text(newText);

            // Repaint the graph
            MERGE_INTERFACE.drawGraph(config);
        });

        // Render the graph with the calculated data
        MERGE_INTERFACE.drawGraph(config);

        // Show info table
        MERGE_INTERFACE.showInfoLines(config);
    };

    /**
     * Draw the parallel coordinates raph with a given data config.
     *
     * @param {Object} config
     */
    this.drawGraph = function (config) {

        // Clear previous graph
        $("#id_visualization").empty();

        // Extract config
        var allDimensions = config.allDimensions;
        var allMeasures = config.allMeasures;
        var cube1Obs = config.cube1Obs;
        var cube2Obs = config.cube2Obs;
        var overlapObs = config.overlapObs;
        var cube1ObsAll = config.cube1ObsAll;
        var cube2ObsAll = config.cube2ObsAll;
        var fullSize = config.fullSize;

        var showCube1 = config.showCube1;
        var showCube2 = config.showCube2;
        var showOverlaps = config.showOverlaps;

        // Create a list of axis titles for the graph
        var dimTitles = {};
        $.each(allDimensions, function (i, dimension) {
            var label = dimension.label;
            if (label.length > 20) {
                label = label.substr(0, 29) + "\u2026";
                // TODO: tooltip
            }
            dimTitles[i] = label;
        });
        $.each(allMeasures, function (i, measure) {
            var label = measure.label;
            if (label.length > 20) {
                label = label.substr(0, 29) + "\u2026";
                // TODO: tooltip
            }
            dimTitles[allDimensions.length + i] = label;
        });

        // Color the lines according to the overlap
        var setColor = function (data, i) {
            if (overlapObs.indexOf(data) >= 0 && $("#id_overlapCheckbox").prop("checked")) {
                if (MERGE_MAIN.isValidConfiguration()) {
                    return "rgba(255,0,0,0.6)"; // Red
                } else {
                    return "rgba(240,140,0,0.6)"; // Orange
                }
            } else if (cube1ObsAll.indexOf(data) >= 0) {
                return "rgba(150,220,128,0.3)"; // Light green
            } else if (cube2ObsAll.indexOf(data) >= 0) {
                return "rgba(128,192,255,0.3)"; // Light blue
            } else {
                return "rgba(128,128,128,0.3)"; // Gray, should never happen :)
            }
        };

        // Graph height (min 500px)
        var graphHeight = fullSize ? 0 : Math.max(500, $(window).height() - 100); // If fullsize-mode, height depends on number of entities

        // Show data with or whithout overlaps?
        var c1obs = showOverlaps ? cube1Obs : cube1ObsAll;
        var c2obs = showOverlaps ? cube2Obs : cube2ObsAll;

        // Concatinate the result lists
        var totalData = cube1ObsAll.concat(cube2ObsAll);
        var data = [];
        data = showCube1 ? data.concat(c1obs) : data;
        data = showCube2 ? data.concat(c2obs) : data;
        data = showOverlaps ? data.concat(overlapObs) : data;

        // Create the graph
        var parcoords = d3.parcoords({dimensionTitles: dimTitles});
        parcoords("#id_visualization");

        // Set all data first so all entity labels are shown
        parcoords.data(totalData);

        // Set coloring
        parcoords.color(setColor);

        // TODO style

//        parcoords.alpha(1);
//        var types = {};
//        $.each(dimTitles, function (i, title) {
//            types[title] = "number";
//        });
//        parcoords.types(types);

//        parcoords.bundlingStrength(0.1)
//        parcoords.smoothness(0.2)
//        parcoords.bundleDimension("Random");

        parcoords.render();
        parcoords.createAxes();

        // DEBUG
        console.log("TYPES", parcoords.types())

        // Render continuously
        parcoords.mode("queue");
        parcoords.rate(100); // TODO

        // Set the graph size
        if (fullSize) {
            fontSize = 10;

            // Compute total height according to fixed font size
            var axes = $(parcoords.svg.selectAll("g.dimension > g.axis")[0]);
            $.each(axes, function (i, element) {
                var textLabels = $(element).find("g.tick > text");
                var numEntities = textLabels.length;
                graphHeight = Math.max(graphHeight, (numEntities * fontSize + 50));
            });
        }
        parcoords.height(graphHeight); // TODO
        $("#id_visualization").css("height", graphHeight);
        parcoords.margin({
            top: 30,
            left: 50,
            right: 0,
            bottom: 30
        });

        // Set the actual needed data
        parcoords.data(data);

        // Enable brushing and reordering
        parcoords.brushMode("1D-axes");
        parcoords.reorderable();


        parcoords.render(); // Fix

        // Set the font size of the labels
        var fontSize;
        if (fullSize) {
            fontSize = 10;
            parcoords.svg.selectAll("g.tick > text").style("font", fontSize + "px sans-serif");
        } else {

            // Compute font size according to fixed height
            var axes = $(parcoords.svg.selectAll("g.dimension > g.axis")[0]);
            parcoords.svg.selectAll("g.tick > text").style("cursor", "none");
            $.each(axes, function (i, element) {

                var textLabels = $(element).find("g.tick > text");
                var numEntities = textLabels.length;

                // Compute best fontSize for this axis
                var fontSize = Math.min(parseInt((graphHeight * 0.9) / numEntities), 10); // Max 10px font
                $.each(textLabels, function (j, label) {
                    $(label).css("font", fontSize + "px sans-serif");
                });

            });
        }
        parcoords.svg.selectAll("g.tick > text").style("fill", "rgba(0,0,0,0.75)");

        // Dimension titles
        parcoords.svg.selectAll("g.axis > text").style("font", "bold 10px sans-serif");

        // Add tooltips for small labels
        var labels = $(parcoords.svg.selectAll("g.tick > text")[0]); // TODO only nominal axis' labels
        $.each(labels, function (i, element) {

            // TODO: full name without "..."
            // TODO: if overlap: red font

            var labelFontSize = parseInt($(element).css("font-size").replace("px", ""));
            if (labelFontSize >= 10) {
                return true; // Skip label
                // TODO: falls eine dimension klein -> alle tooltip (ausser measure)
            }

            element.onmouseenter = function (e) {
                var rect = element.getBoundingClientRect();
                var pos = $(element).offset();
                var x = pos.left;
                var y = pos.top;
                var height = rect.height;
                var width = rect.width;

                // Create hidden tooltip element for best position
                if (!element.tooltip) {
                    element.tooltip = $("<div class='secretTooltip'></div>");
                    element.tooltip.attr("data-placement", "left");
                    element.tooltip.attr("data-html", true);
                    element.tooltip.attr("pointer-events", "none");
                    element.tooltip.appendTo("body");

                    var ele1 = $(element).parent().next().next().children("text").text(); // TODO full name from observation
                    var ele2 = $(element).parent().next().children("text").text();
                    var ele3 = $(element).parent().prev().children("text").text();
                    var ele4 = $(element).parent().prev().prev().children("text").text();
                    // TODO red color when overlap (in tooltip)
                    ele1 = ele1 + "<br>";
                    ele2 = ele2 + "<br>";
                    ele3 = "<br>" + ele3;
                    ele4 = "<br>" + ele4 + "<br>";
                    var tooltipContent = ele1 + ele2 + "<span style='color: white; font-weight: bold; font-size: 14px'>" + $(element).text() + "</span>" + ele3 + ele4;
                    element.tooltip.attr("title", "<span style='color: #a0a0a0; font-size: 10px'>" + tooltipContent + "</span>");
                }

                element.tooltip.css("left", x + width + 6);
                element.tooltip.css("top", y + height / 2 - 1);
                element.tooltip.tooltip("show");
            };
            element.onmouseleave = function (e) {
//                $(".secretTooltip").tooltip("hide"); // hide all tooltips
                element.tooltip.tooltip("hide"); // hide this tooltip
                element.tooltip.css("left", -10);
                element.tooltip.css("top", -10);
            };
        });
    };

    /**
     * Shows checkboxes and information about both cubes and the total overlap.
     *
     * @param {Object} config
     */
    this.showInfoLines = function (config) {
        var cube1 = MERGE_MAIN.cube1;
        var cube2 = MERGE_MAIN.cube2;
        var cube1Observations = MERGE_MAIN.observations[cube1.cubeName];
        var cube2Observations = MERGE_MAIN.observations[cube2.cubeName];

        // Extract config
        var overlapObs = config.overlapObs;
        var showCube1 = config.showCube1;
        var showCube2 = config.showCube2;
        var showOverlaps = config.showOverlaps;

        // Clear previous info
        $("#id_visInfo").empty();

        // Add info lines below chart
        var overlapPercent = MERGE_MAIN.formatNumber((overlapObs.length / (cube1Observations.length + cube1Observations.length)) * 100, 2);
        var info = TEMPLATES.MERGE_TABLE_VIS_INFO
                .replace("__cube1__", cube1.label)
                .replace("__cube2__", cube2.label)
                .replace("__cube1obs__", cube1Observations.length)
                .replace("__cube2obs__", cube2Observations.length)
                .replace("__overlapTitle__", MERGE_MAIN.isValidConfiguration() ? "Overlap" : "Potential Overlap")
                .replace("__overlap__", overlapObs.length + " Observations (" + overlapPercent + "%)");
        $("#id_visInfo").html(info);

        // Add checkboxes to view certain parts of the visualization
        var checkboxC1 = $("<input type='checkbox' " + (showCube1 ? "checked='checked'> " : "> "));
        var checkboxC2 = $("<input type='checkbox' " + (showCube2 ? "checked='checked'> " : "> "));
        var checkboxOverlap = $("<input id='id_overlapCheckbox' type='checkbox' " + (showOverlaps ? "checked='checked'> " : "> "));
        $("#id_visInfo td.cube1obs").prepend(checkboxC1);
        $("#id_visInfo td.cube2obs").prepend(checkboxC2);
        $("#id_visInfo td.overlap").prepend(checkboxOverlap);

        // No red color and no checkbox if no overlap
        if (overlapObs.length === 0) {
            $("#id_visInfo").find("td.overlap").removeClass("overlap");
            checkboxOverlap.remove();
        } else if (!MERGE_MAIN.isValidConfiguration()) {
            $("#id_visInfo").find("td.overlap").addClass("incomplete"); // Orange if dimensions are not matched yet
        }

        // Add listeners to checkboxes
        var updateShownData = function () {

            // Check which data sets should be seen
            config.showCube1 = checkboxC1.prop('checked');
            config.showCube2 = checkboxC2.prop('checked');
            config.showOverlaps = checkboxOverlap.prop('checked');

            // Redraw graph
            MERGE_INTERFACE.drawGraph(config);
        };

        checkboxC1.on("change", updateShownData);
        checkboxC2.on("change", updateShownData);
        checkboxOverlap.on("change", updateShownData);
    };

};