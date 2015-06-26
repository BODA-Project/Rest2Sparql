/* global TEMPLATES, MERGE_MAIN, bootbox, d3 */

// Namespace for events and html interface code

var MERGE_INTERFACE = new function () {

    this.clickedTab;

    // For interaction with 3D objects
//    this.mouseDown = {};
//    this.mousePressed = false;
//    this.mousePosition = {}; // absolute mouse position

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
     * Shows the overview of dimensions and measures.
     */
    this.showStructureOverview = function () {

        // Show the dimension Table
        MERGE_INTERFACE.showDimensionStructure();

        // Show the measure Table
        MERGE_INTERFACE.showMeasureStructure();

        // TODO: reset button?

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
                    cube1Cell.append('<span class="glyphicon glyphicon-link"></span> <b>' + replacement.label + ')</b');
                }

                // Check if dimension is in cube 2
                if (isInCube2) {
                    cube2Cell.append('<span class="glyphicon glyphicon-ok"></span>');
                } else {
                    cube2Cell.append('<span class="glyphicon glyphicon-link"></span> <b>' + replacement.label + ')</b');
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
                        MERGE_MAIN.undoDimensionAdding(dimension.dimensionName); // TODO: test when adding works

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
                        MERGE_INTERFACE.popupDimensionAdding(dimension, cubeMissing, MERGE_INTERFACE.showStructureOverview);
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
                        matchItem.attr("title", 'Dimension "' + dimension.label + '" will be replaced by <' + label + '>');
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
                    cube1Cell.append('<span class="glyphicon glyphicon-link"></span> <b>' + replacement.label + '</b');
                }

                // Check if measure is in cube 2
                if (isInCube2) {
                    cube2Cell.append('<span class="glyphicon glyphicon-ok"></span>');
                } else {
                    cube2Cell.append('<span class="glyphicon glyphicon-link"></span> <b>' + replacement.label + '</b');
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
                        matchItem.attr("title", 'Measure "' + measure.label + '" will be replaced by <' + label + '>');
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
     * @param {type} cubeName
     * @param {type} label
     * @param {type} comment
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

        // TODO: enable disable tabs according to configuration!
        //
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
                } else {
                    $("#id_wizardNext").parent().addClass("disabled");
                    tab2.addClass("disabled");
                }
                break;
            case 1: // Structure matching
                // TODO: if all dimensions matched or added: ok
//                if (ok) {
//                    $("#id_wizardNext").parent().removeClass("disabled");
//                } else {
//                    $("#id_wizardNext").parent().addClass("disabled");
//                }

                break;
            case 2: // Visualization
                // You may always advance from visualization.
                $("#id_wizardNext").parent().removeClass("disabled");
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
                // TODO
                break;
            case 3: // Storage
                // TODO
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

            // TEMP for testing purpose ##############################################
            $('#id_loginModalID').val("https://github.com/bayerls");
//            $('#id_loginModalID').val("8023903");
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
};