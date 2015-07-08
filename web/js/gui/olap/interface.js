/* global TEMPLATES, THREE, MAIN, WEBGL, bootbox, d3 */

// Namespace for events and html interface code

var INTERFACE = new function () {

    this.NUM_ENTITIES = 10; // Number of entities shown per dimension initially

    // For interaction with 3D objects
    this.mouseDown = {};
    this.mousePressed = false;
    this.mousePosition = {}; // absolute mouse position

    // ...
    this.disableInputInitially = function () {

        // Disable navigation input initially and set conditions of usage
        $("#id_cubeButton").attr("disabled", "disabled");
        $("#id_dimensionPanel button").attr("disabled", "disabled");
        $("#id_measurePanel button").attr("disabled", "disabled");
        $("#id_filterPanel button").attr("disabled", "disabled");
        $("#id_cancelButton").attr("disabled", "disabled");
        $("#id_applyButton").attr("disabled", "disabled");
        $("#id_undoButton").attr("disabled", "disabled");
        $("#id_redoButton").attr("disabled", "disabled");
        $("#id_optionsButton").attr("disabled", "disabled");
        $("#id_bookmarkButton").attr("disabled", "disabled");
        $("#id_mergeButton").attr("disabled", "disabled");

        // Hide info icons initially
        $("#id_infoDimension").css("display", "none");
        $("#id_infoMeasure").css("display", "none");
        $("#id_infoFilter").css("display", "none");

        // Hide reset view and chart button initially
        $("#id_resetViewButton").css("display", "none");
        $("#id_chartButton").css("display", "none");

        // Remove custom tooltip of cube button
        $('#id_cubeButton').tooltip('destroy');
    };

    // ...
    this.addInterfaceListeners = function () {

        // Top bar
        $("#id_changeUserButton").on('click', MAIN.logoutUser);

        // Undo / Redo
        $("#id_redoButton").on('click', MAIN.redo);
        $("#id_undoButton").on('click', MAIN.undo);

        // Save bookmark
        $("#id_bookmarkButton").on('click', function (e) {
            e.preventDefault();
            INTERFACE.popupBookmark();
        });

        // Options / Settings
        $("#id_aggItem").on('click', function (e) {
            e.preventDefault();
            INTERFACE.popupMeasureAgg();
        });
        $("#id_colorItem").on('click', function (e) {
            e.preventDefault();
            INTERFACE.popupAccentColor();
        });
        $("#id_scaleItem").on('click', function (e) {
            e.preventDefault();
            INTERFACE.toggleScale();
        });

        // Merge button
//        $("#id_mergeButton").on('click', TODO);

        // Help button
        $("#id_helpButton").on("click", function (e) {
            e.preventDefault();
            INTERFACE.popupHelp(true);
        });

        // Cancel and Apply
        $("#id_cancelButton").on('click', function (e) {
            e.preventDefault();
            MAIN.cancelOLAP();
        });
        $("#id_applyButton").on('click', function (e) {
            e.preventDefault();
            MAIN.applyTempSelection(); // apply on-screen selection if given
            MAIN.applyOLAP(); // apply and visualize
        });

        // Filter area
        $("#id_filterPlus").on('click', function (e) {
            e.preventDefault();
            INTERFACE.popupMeasureFilter();
        });

        // Reset View button
        $("#id_resetViewButton").on('click', function (e) {
            e.preventDefault();
            WEBGL.resetCameraView();
        });

        // Chart button
        $("#id_chartButton").on('click', function (e) {
            e.preventDefault();
            INTERFACE.popupChart();
        });

        // Resize visualization on browser resize
        $(window).on('resize', WEBGL.resizeVizualisation);
        $(window).on('resize', INTERFACE.onScreenResize);

    };

    // Inits the cube dropdown lists and its listeners
    this.initCubeList = function () {

        // highloght cube node
        flashHTMLNode($("#id_cubePanel"));

        // enable cube selection
        $("#id_cubeButton").removeAttr("disabled");

        // still disable other actions
        $("#id_cancelButton").attr("disabled", "disabled");
        $("#id_applyButton").attr("disabled", "disabled");

        $("#id_undoButton").attr("disabled", "disabled");
        $("#id_redoButton").attr("disabled", "disabled");
        $("#id_optionsButton").attr("disabled", "disabled");
        $("#id_bookmarkButton").attr("disabled", "disabled");
        $("#id_mergeButton").attr("disabled", "disabled");

        // Clear old cube list
        $("#id_cubeList").empty();

        // Iterate through available cubes and fill the list
        $.each(MAIN.availableCubes, function (index, cube) {
            var cubeName = cube.cubeName;
            var comment = cube.comment;
            var label = cube.label;

            // Create Dropdown entries
            var itemLink = $("<a role='menuitem' tabindex='-1' href='#'></a>");
            itemLink.text(label);
            itemLink.attr("title", label + ":\n\n" + comment); // tooltip
            itemLink.attr("data-placement", "auto top");
            itemLink.tooltip();

            var item = $("<li role='presentation' data-cube-name='" + cubeName + "'></li>");
            item.append(itemLink);
            $("#id_cubeList").append(item);

            // Add on-click handler for chosen cubes
            itemLink.on("click", function (e) {
                e.preventDefault();
                INTERFACE.selectCube(cube);
            });

        });

    };

    /**
     * Select a given cub
     * @param {type} cubeName
     * @param {type} label
     * @param {type} comment
     */
    this.selectCube = function (cube, callback) {
        var cubeName = cube.cubeName;
        var comment = cube.comment;
        var label = cube.label;

        // Is the same cube already selected?
        if (MAIN.currentCube && MAIN.currentCube.cubeName === cubeName) {
            return;
        }

        // Set current cube's URI
        MAIN.currentCube = cube;

        // Query available dimensions and measures and fill the lists
        MAIN.loadDimensionList();
        MAIN.loadMeasureList();

        // Reset filters
        MAIN.filters = [];
        INTERFACE.clearFilters();

        // Reset temp selection and other
        MAIN.tempSelection = {};
        MAIN.availableDimensions = [];
        MAIN.availableMeasures = [];
        MAIN.currentURL = "";

        // Clear undo / redo stacks
        MAIN.undoStack = [];
        MAIN.redoStack = [];
        MAIN.currentState = undefined;
        MAIN.resultCache = {};

        // Set button and cube title and tooltip
        $("#id_cubeButton").empty();
        $("#id_cubeButton").append("<span class=cube-button-text>" + label + "</span>");
        $("#id_cubeButton").append(" <span class='caret'></span>");
        $("#id_cubeButton").attr("title", label + ":\n\n" + comment); // tooltip
        $("#id_cubeButton").attr("data-placement", "auto top");
        $("#id_cubeButton").tooltip();
        $("#id_pageTitle").text(label); // set page title

        // Show a loading screen while ajax infos are loading (dimensions + entities and measures)
        // Pre-select up to 3 dimensions per default to begin with after the ajax calls are done
        if (callback) {
            INTERFACE.popupWhileAjax(callback); // If given (from bookmark loading)
        } else {
            INTERFACE.popupWhileAjax(showSomeData);
        }

        // Enable info icons
        $("#id_infoDimension").css("display", "");
        $("#id_infoMeasure").css("display", "");
        $("#id_infoFilter").css("display", "");

        // Enable dimension, measure and filter input
        $("#id_dimensionPanel").addClass("in");
        $("#id_dimensionPanel button").removeAttr("disabled");
        $("#id_measurePanel").addClass("in");
        $("#id_measurePanel button").removeAttr("disabled");
        $("#id_filterPanel").addClass("in");
        $("#id_filterPanel button").removeAttr("disabled");
        $("#id_acceptArea").addClass("in");

        $("#id_resetViewButton").css("display", "");
        $("#id_resetViewButton").addClass("in");
        $("#id_chartButton").css("display", "");
        $("#id_chartButton").addClass("in");

        $("#id_cancelButton").removeAttr("disabled");
        $("#id_applyButton").removeAttr("disabled");

        $("#id_undoButton").removeAttr("disabled");
        $("#id_redoButton").removeAttr("disabled");
        $("#id_optionsButton").removeAttr("disabled");
        $("#id_bookmarkButton").removeAttr("disabled");
        $("#id_mergeButton").removeAttr("disabled");

        // Disable the selected cube from list (and re-enable all others)
        $('[data-cube-name]').removeClass("disabled");
        $('[data-cube-name="' + cubeName + '"]').addClass("disabled");
    };

    // Inits the measure dropdown list and its listeners
    this.initMeasureList = function () {

        // Clear old measure list
        $("#id_measureList").empty();

        var measureList = $("#id_measureList");

        // Iterate through available measures
        $.each(MAIN.availableMeasures, function (index, measure) {
            var measureName = measure.measureName;
            var label = measure.label;

            // Create Dropdown entries
            var itemLink = $("<a role='menuitem' tabindex='-1' href='#'></a>");
            itemLink.text(label);
            var item = $("<li role='presentation' data-measure-name='" + measureName + "'></li>");
            item.append(itemLink);
            measureList.append(item);

            // Add on-click handler for chosen measure
            itemLink.on("click", function (e) {
                e.preventDefault();

                // Only add once, disable menu item
                if (isSelectedMeasure(measureName)) {
                    return;
                }
                $('[data-measure-name="' + measureName + '"]').addClass("disabled");

                // Add measure to selected list
                var addedMeasure = new Measure(measureName, label, MAIN.currentAGG);
                MAIN.measures = []; // TEMP only one measure?
                MAIN.measures.push(addedMeasure);

                // Update visualization and interface right away (if user clicked manually)
                if (e.originalEvent) {
                    MAIN.applyOLAP();
                }

            });

        });

        // Include other measure options like color and aggregation
        var filterItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Add Filter...</a></li>');
        var aggItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Change Aggregation...</a></li>');
        var colorItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Change Accent Color...</a></li>');
        measureList.append('<li role="presentation" class="divider"></li>');
        measureList.append(filterItem);
        measureList.append(aggItem);
        measureList.append(colorItem);

        // Add item listeners
        filterItem.on("click", function (e) {
            e.preventDefault();
            // INFO: Only works with one measure
            INTERFACE.popupMeasureFilter(MAIN.measures[0]);
        });

        aggItem.on("click", function (e) {
            e.preventDefault();
            INTERFACE.popupMeasureAgg();
        });

        colorItem.on("click", function (e) {
            e.preventDefault();
            INTERFACE.popupAccentColor();
        });


    };

    // BUG: "addMeasureButton" not used, bug (?) in API, only 1 measure possible
    // Adds a measure button and its menu after the measure was selected.
    this.addMeasureButton = function (measure) {
        var plusButton = $("#id_measurePlus");
        var buttonArea = $("#id_measureButtonArea");

        var agg = measure.agg.toUpperCase();

        // Rebuild a measure button and its menu
        var btnGroup = $('<div class="btn-group"></div>');
        var button = $('<button class="btn dropdown-toggle btn-default btn-sm" type="button" data-toggle="dropdown"></button>');
        var text = $('<span class=button-text>' + measure.label + '</span>');
        var badge = $('<span class="badge"></span>');
        var menu = $('<ul class="dropdown-menu" role="menu"></ul>');
        var aggItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Change Aggregation...</a></li>');
        var colorItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Change Color...</a></li>');
        var dividerItem = $('<li role="presentation" class="divider"></li>');
        var removeItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Remove</a></li>');

        // Combine button and list
        btnGroup.append(button);
        button.append(text);
        button.append(badge);
        badge.addClass("ms-1"); // old color mode
        badge.text(agg);
        menu.append(aggItem);
        menu.append(colorItem);
        menu.append(dividerItem);
        menu.append(removeItem);
        btnGroup.append(menu);

        buttonArea.append(btnGroup);
        buttonArea.append(" ");
        buttonArea.append(plusButton); // Move plus to end

        aggItem.on("click", function (e) {
            e.preventDefault();
            //...
        });

        colorItem.on("click", function (e) {
            e.preventDefault();
            //...
        });

        // Add event for removing the measure
        removeItem.on("click", function (e) {
            e.preventDefault();
            // Delete from selected list
            $.each(MAIN.measures, function (index, measure1) {
                if (measure1.measureName === measure.measureName) {
                    MAIN.measures.splice(index, 1);
                    return false;
                }
            });

            // Remove HTML button and list
            btnGroup.remove();

            // Re-enable the menu item
            $('[data-measure-name="' + measure.measureName + '"]').removeClass("disabled");

            // Update visualization and interface right away
            MAIN.applyOLAP();

        });
    };


    // Inits the dimension dropdown lists and its listeners
    this.initDimensionLists = function () {

        // Empty selected dimensions lists
        MAIN.xDimensions = [];
        MAIN.yDimensions = [];
        MAIN.zDimensions = [];

        // Clear old dimension lists and selected dimensions first
        INTERFACE.clearDimensions();

        // Load the list of available entities for each dimension
        $.each(MAIN.availableDimensions, function (index, dimension) {
            var dimensionName = dimension.dimensionName;
            MAIN.entityList[dimensionName] = {};
            MAIN.entityList[dimensionName].list = MAIN.queryEntityList(dimensionName); // Previous AJAX problem, now blocking popup
        });
        INTERFACE.fillDimensionList("x", MAIN.xDimensions);
        INTERFACE.fillDimensionList("y", MAIN.yDimensions);
        INTERFACE.fillDimensionList("z", MAIN.zDimensions);

        // Init dropzones for dimensions
        INTERFACE.updateDropZones();
    };

    // Adds a dimension button and its menu after the measure was selected.
    this.addDimensionButton = function (dimension, axis, dimensions) {
        var dimensionList = $("#id_" + axis + "DimensionList");
        var plusButton = $("#id_" + axis + "Plus");
        var buttonArea = $("#id_" + axis + "ButtonArea");

        // Rebuild a dimension button and its menu
        var btnGroup = $('<div class="btn-group" data-dimension-name="' + dimension.dimensionName + '"></div>');
        var button = $('<a class="btn dropdown-toggle btn-default btn-sm" type="button" data-toggle="dropdown"></a>');
        var text = $('<span class="dimension-button-text">' + dimension.label + '</span>');
        var caret = $('<span class="caret"></span>');
        var badge = $('<span class="badge"></span>');
        var menu = INTERFACE.createDimensionMenu(dimension, dimensions);

        // Combine button and list
        btnGroup.append(button);
        button.append(text);
        button.append(caret);
        button.append(badge);

        // Set badge color to show grouping (rollup) and prepare tooltip
        var tooltip;
        if (dimension.rollup) {
            badge.css("background-color", MAIN.currentColor);

            tooltip = "";
            $.each(dimension.entities, function (i, entity) {
                tooltip += ", " + entity.label;
            });
            tooltip = tooltip.substring(2); // remove first ", "
        }

        // Reuse already configured dimension entities
        var badgeNum;
        if (dimension.entities) {
            badgeNum = dimension.entities.length;
        } else {
            badgeNum = Math.min(INTERFACE.NUM_ENTITIES, numEntities);
        }
        var numEntities = MAIN.entityList[dimension.dimensionName].list.length;
        badge.text(badgeNum + " / " + numEntities);

        btnGroup.append(menu);
        buttonArea.append(btnGroup);
        buttonArea.append(" ");
        buttonArea.append(plusButton); // Move plus to end

        // Tooltip for long named dimensions
        if (text.innerWidth() >= 140 || dimension.rollup) {
            button.attr("title", tooltip ? dimension.label + ": \n\n" + tooltip : dimension.label); // tooltip
            button.attr("data-placement", "auto top");
            button.tooltip();

            // close tooltip on click
            button.on("click", function (e) {
                e.preventDefault();
                button.tooltip("hide");
            });
        }

        // Set max width after setting badge
        text.css("max-width", (185 - badge.outerWidth() - caret.outerWidth()));

        // Save dimension and dimensionList to the button
        btnGroup.data("dimension", dimension);
        btnGroup.data("dimensionList", dimensions);

        // Add drag and drop functionality
        // Make button dragable
        btnGroup.draggable({
            axis: "y",
            distance: 5,
            revert: true,
            zIndex: 9999,
//            cursor: "move",
            containment: "#id_dimensionPanel .panel-body",
            stop: function (event, ui) {
                var draggedButton = ui.helper;
                draggedButton.css("width", ""); // bugfix
            }
        });

        // Make the button also a droparea
        btnGroup.droppable({
            drop: function (event, ui) {
                event.preventDefault();
                event.stopPropagation();

                var draggedButton = ui.draggable;
                var originalDimensionList = draggedButton.data("dimensionList");
                var droppedDimension = draggedButton.data("dimension");

                // Remove dimension from the original list
                var oldIndex = originalDimensionList.indexOf(droppedDimension);
                originalDimensionList.splice(oldIndex, 1);

                // Moved up or down?
                if (draggedButton[0] !== btnGroup.prev()[0]) {
                    // Insert dimension right before the button's dimension
                    var index = dimensions.indexOf(dimension);
                    dimensions.splice(index, 0, droppedDimension);
                } else {
                    // Drag down one step - Swap buttons
                    // Insert dimension right after the button's dimension
                    var index = dimensions.indexOf(dimension);
                    dimensions.splice(index + 1, 0, droppedDimension);
                }

                // Apply and visualize right away
                MAIN.applyOLAP();
            },
            accept: 'div.btn-group[data-dimension-name]',
            hoverClass: 'hovered'
        });
    };

    /**
     * Update the plus buttons drop zones for drag & drop
     */
    this.updateDropZones = function () {
        $.each(["x", "y", "z"], function (i, axis) {
            var plusButton = $("#id_" + axis + "Plus");

            // Get according dimensionlist
            var dimensionList;
            switch (axis) {
                case "x":
                    dimensionList = MAIN.xDimensions;
                    break;
                case "y":
                    dimensionList = MAIN.yDimensions;
                    break;
                case "z":
                    dimensionList = MAIN.zDimensions;
                    break;
            }

            // Make the plus button a droparea / Refresh target dimensionlists
            plusButton.droppable({
                drop: function (event, ui) {
                    event.preventDefault();
                    event.stopPropagation();

                    var draggedButton = ui.draggable;
                    var originalDimensionList = draggedButton.data("dimensionList");
                    var droppedDimension = draggedButton.data("dimension");

                    if (draggedButton[0] !== plusButton.prev()[0]) {

                        // Remove dimension from the original list
                        var oldIndex = originalDimensionList.indexOf(droppedDimension);
                        originalDimensionList.splice(oldIndex, 1);

                        // and insert dimension at the end of the list
                        dimensionList.push(droppedDimension);

                        // Apply and visualize right away
                        MAIN.applyOLAP();
                    }
                },
                accept: 'div.btn-group[data-dimension-name]',
                hoverClass: 'hovered'
            });
        });

    };

    /**
     * Creates and returns a dropdown menu for a given dimension.
     *
     * @param {Dimension} dimension
     * @param {Array} dimensionList
     * @returns the dropdown menu (bootstrap)
     */
    this.createDimensionMenu = function (dimension, dimensionList) {
        var rollupIcon = dimension.rollup ? "glyphicon glyphicon-check" : "glyphicon glyphicon-unchecked";

        var menu = $('<ul class="dropdown-menu" role="menu"></ul>');
        var filterItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Select Entities...</a></li>');
        var drillItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#"><span class="' + rollupIcon + '"></span> Combine Entities</a></li>');
        var dividerItem = $('<li role="presentation" class="divider"></li>');
        var moveUpItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Move Up</a></li>');
        var moveDownItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Move Down</a></li>');
        var dividerItem2 = $('<li role="presentation" class="divider"></li>');
        var removeItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Remove</a></li>');

        menu.append(filterItem);
        menu.append(drillItem);
        menu.append(dividerItem);
        menu.append(moveUpItem);
        menu.append(moveDownItem);
        menu.append(dividerItem2);
        menu.append(removeItem);

        // Popup a modal for entity selection
        filterItem.on("click", function (e) {
            e.preventDefault();
            INTERFACE.popupEntitySelection(dimension);
        });

        // Add event for removing the dimension
        removeItem.on("click", function (e) {
            e.preventDefault();

            // Delete from selected list
            $.each(dimensionList, function (index1, dimension1) {
                if (dimension1.dimensionName === dimension.dimensionName) {
                    dimensionList.splice(index1, 1);
                    return false;
                }
            });

            // Re-enable all axis dropdown items of this dimension
            $('li[data-dimension-name="' + dimension.dimensionName + '"]').removeClass("disabled");

            // Update visualization and interface right away
            MAIN.applyOLAP();
        });

        // Add rollup / grouping event
        drillItem.on("click", function (e) {
            e.preventDefault();
            dimension.rollup = !dimension.rollup;

            // Apply on-screen selection if given
            MAIN.applyTempSelection();

            // Update visualization and interface right away
            MAIN.applyOLAP();
        });

        // Enable disable items according to status
        var isFirstDimension = dimensionList.indexOf(dimension) === 0;
        var isLastDimension = dimensionList.indexOf(dimension) === dimensionList.length - 1;
        if (isFirstDimension) {
            moveUpItem.addClass("disabled");
        }
        if (isLastDimension) {
            moveDownItem.addClass("disabled");
        }

        // Move Up / Down items
        moveUpItem.on("click", function (e) {
            e.preventDefault();
            if (isFirstDimension) {
                return; // Already first item
            }
            // See drag drop code to move buttons (not needed, instant apply)

            // Swap dimension with the one above
            var index = dimensionList.indexOf(dimension);
            dimensionList.splice(index, 1);
            dimensionList.splice(index - 1, 0, dimension);

            // Apply and visualize right away
            MAIN.applyOLAP();
        });
        moveDownItem.on("click", function (e) {
            e.preventDefault();
            if (isLastDimension) {
                return; // Already last item
            }
            // See drag drop code to move buttons (not needed, instant apply)

            // Swap dimension with the one below
            var index = dimensionList.indexOf(dimension);
            dimensionList.splice(index, 1);
            dimensionList.splice(index + 1, 0, dimension);

            // Apply and visualize right away
            MAIN.applyOLAP();
        });

        return menu;
    };


    // Adds mouse events to a given result cube
    this.addCubeListeners = function (cube) {

        /*
         * Properties:
         *
         * cube.result;
         */

        // Add click and hover events
        cube.onclick = function () {
            INTERFACE.popupResult(cube.result);
        };
        cube.onmouseover = function () {
            WEBGL.highlightCube(cube);
            WEBGL.highlightLabels(cube);
        };
        cube.onmouseout = function () {
            WEBGL.resetCube(cube);
            WEBGL.resetLabels(cube);
        };

    };

    // Adds mouse events to the given label
    this.addEntityLabelListeners = function (label) {

        /*
         * Properties:
         *
         * label.entity;
         * label.selectionSize;
         */
        var dimensionName = label.entity.dimensionName;
        label.toggled = false;

        // Show accent color of rolled up entity by default
        if (label.entity.rollupLabels) {
            label.toSelected();
            label.toggled = true;
        }


        label.onmouseover = function () {

            // TODO only if distance to camera >= 10 (?) or if label.entity.rollupLabels
//            var distance = WEBGL.computeDistance(label);
//            if (distance > 10 || label.entity.rollupLabels) {
            INTERFACE.showTooltip(label);
//            }

            $.each(label.sprites, function (i, sprite) {
                sprite.showRow(); // Show surrounding cube
            });
        };
        label.onmouseout = function () {

            // Hide tooltips if given
            INTERFACE.hideTooltip(label);

            $.each(label.sprites, function (i, sprite) {
                sprite.hideRow();
            });
        };
        label.onclick = function () {
            if (label.entity.rollupLabels) {

                // Nothing to do for rollup labels?

            } else {
                if (!label.toggled) {

                    $.each(label.sprites, function (i, sprite) {
                        sprite.toggled = true;
                    });

                    // Create selection list if first entity
                    if (!MAIN.tempSelection[dimensionName]) {
                        MAIN.tempSelection[dimensionName] = [];
                    }

                    // Add entity to temp selected list (only once)
                    var index = getIndexOfEntity(MAIN.tempSelection[dimensionName], label.entity);
                    if (index === -1) {
                        MAIN.tempSelection[dimensionName].push(label.entity);
                    }

                    // Update hilighting of selected cubes
                    WEBGL.highlightSelectedCubes();

                } else {
                    $.each(label.sprites, function (i, sprite) {
                        sprite.toggled = false;
                    });

                    // Delete entity from temp selected list
                    var index = getIndexOfEntity(MAIN.tempSelection[dimensionName], label.entity);
                    if (index !== -1) {
                        MAIN.tempSelection[dimensionName].splice(index, 1);
                    }

                    // Update hilighting of selected cubes
                    WEBGL.highlightSelectedCubes();

                }
            }

            // Update the navigation
            INTERFACE.updateNavigation();

        };

        label.showRow = function () {
            if (!label.toggled) {
                label.toSelected(); // highlight color
            }
            WEBGL.addSelectionCube(label);
        };

        label.hideRow = function () {
            if (!label.toggled) {
                label.toNormal();
            }
            WEBGL.removeSelectionCube(label);
        };

        // help function
        var getIndexOfEntity = function (list, entity) {
            var index = -1;
            $.each(list, function (i, e) {
                if (e.entityName === entity.entityName) {
                    index = i;
                    return false; // break
                }
            });
            return index;
        };

    };

    // Adds mouse events to the given dimension label
    this.addDimensionLabelListener = function (label, dimension) {

        // Show accent color of rolled up entity by default
        if (dimension.rollup) {
            label.toSelected();
        }

        label.onmouseover = function () {
            if (!dimension.rollup) {
                label.toBold();
            }
        };

        label.onmouseout = function () {
            if (!dimension.rollup) {
                label.toNormal();
            }
        };

        label.onclick = function () {

            // Show a drop down menu (same as the left panel menu)

            var pos = WEBGL.toScreenPosition(label);
            var buttonGroup = $("div.btn-group[data-dimension-name='" + dimension.dimensionName + "']");
            var dimensionList = buttonGroup.data("dimensionList");

            var container = $("<div class='dropdown'></div>");
            var toggle = $("<div class='dropdown-toggle' type='button' data-toggle='dropdown'></div>");
            var menu = INTERFACE.createDimensionMenu(dimension, dimensionList);

            container.css("position", "absolute");
            container.css("top", pos.y);
            container.css("left", pos.x);

            container.append(toggle);
            container.append(menu);
            $("body").append(container);

            toggle.dropdown('toggle');

            // Remove on hide
            container.on('hidden.bs.dropdown', function () {
                toggle.dropdown('toggle');
                container.off('hidden.bs.dropdown');
                container.on('hidden.bs.dropdown', function () {
                    container.remove(); // Remove finally
                });
            });

        };

    };

    // Toggles the measure scale between linear to logarithmic
    this.toggleScale = function () {
        if (MAIN.currentScale === MAIN.SCALE_LINEAR) {
            MAIN.currentScale = MAIN.SCALE_LOG;
            $("#id_scaleItem span").removeClass("glyphicon-unchecked");
            $("#id_scaleItem span").addClass("glyphicon-check");
        } else {
            MAIN.currentScale = MAIN.SCALE_LINEAR;
            $("#id_scaleItem span").removeClass("glyphicon-check");
            $("#id_scaleItem span").addClass("glyphicon-unchecked");
        }

        // Visualize without an undo step or camera movement
        MAIN.applyOLAP(true, true);
    };


    // Enables tooltips and popovers for certain panels
    this.initTooltips = function () {

        // add the tooltip / popover content
        $("#id_infoCube").attr('data-content', TEMPLATES.HINT_CUBE);
        $("#id_infoDimension").attr('data-content', TEMPLATES.HINT_DIMENSION);
        $("#id_infoMeasure").attr('data-content', TEMPLATES.HINT_MEASURE);
        $("#id_infoFilter").attr('data-content', TEMPLATES.HINT_FILTER);
        $("#id_chartInfoButton").attr('data-content', TEMPLATES.HINT_CHART);

        // add tooltips
        $('[data-toggle="tooltip"]').tooltip();

        // add popovers
        $("#id_chartInfoButton").popover({container: 'body', placement: "bottom"});
        $('[data-toggle="popover"]').popover({container: 'body', placement: "auto right"});
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
            MAIN.loginUser(id, true);
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

            // Stop background rendering (rotating demo-cube is ok)
            // WEBGL.stopRendering();

        });

        // Remove when finished
        modal.on('hidden.bs.modal', function (e) {
            modal.remove();

            // Resume background rendering
            WEBGL.resumeRendering();
        });
    };

    // Shows a blocking loading screen with a given text.
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

    // Pops up a blocking loading screen that is removed when all ajax calls are done
    this.popupWhileAjax = function (callback) {
        WEBGL.stopRendering();
        INTERFACE.popupLoadingScreen("Processing...");
        $(document).ajaxStop(function () {
            console.log("All ajax done");
            $(document).off('ajaxStop'); // remove handler

            // Remove loading screen
            $('#id_loadingModal').modal('hide');

            // Execute given callback function
            if (callback) {
                callback();
            }
        });
    };

    /**
     * Shows a popup for changing the measure aggregation
     * @param {Measure} measure currently not used since only 1 measure is possible
     */
    this.popupMeasureAgg = function (measure) {
        var modal = $("#id_aggModal");
        $("body").append(modal);
        var modalAggBody = $("#id_aggModalBody");

        // Create a button for each aggregation type
        modalAggBody.empty();
        var buttonGroup = $('<div class="btn-group">');
        $.each(MAIN.AGGREGATIONS, function (i, aggregation) {
            var button = $('<button class="btn btn-default" type="button"></button>');
            button.text(aggregation.label);
            buttonGroup.append(button);
            if (MAIN.currentAGG === aggregation.type) {
                button.addClass("active");
            }
            button.on("click", function (e) {
                e.preventDefault();

                // Apply the new aggregation
                MAIN.currentAGG = aggregation.type;
                if (measure) {
                    measure.agg = aggregation.type; // Possible if multiple measures
                }

                // Hide the popup
                modal.modal("hide");

                // Update visualization and interface right away
                MAIN.applyOLAP();
            });
        });
        modalAggBody.append(buttonGroup);

        // Pause rendering in background
        WEBGL.stopRendering();

        // Show the popup
        modal.modal();

        // Resume visualization when finished
        modal.off('hidden.bs.modal');
        modal.on('hidden.bs.modal', function (e) {
            // Resume rendering again
            WEBGL.resumeRendering();
        });
    };

    /**
     * Shows a popup containing some help about interaction.
     *
     * @param {Boolean} manually whether the help is shown initially after login or manually
     */
    this.popupHelp = function (manually) {
        var modal = $("#id_helpModal");
        var modalTitle = $("#id_helpModalTitle");
        $("body").append(modal);

        // Help after login or manually clicked help?
        if (!manually) {
            modalTitle.text("Welcome");
            $("#id_helpInfo").css("display", "");

            // Change backdrop a little
            $("body").addClass("lightModal");
        } else {
            modalTitle.text("Help");
            $("#id_helpInfo").css("display", "none");

            // Pause rendering in background
            WEBGL.stopRendering();
        }

        // Resume visualization when finished
        modal.off('hidden.bs.modal');
        modal.on('hidden.bs.modal', function (e) {
            if (!manually) {
                // Remove css tweak
                $("body").removeClass("lightModal");
            } else {
                // Resume rendering again
                WEBGL.resumeRendering();
            }
        });

        // Show the popup
        var backdrop = manually ? true : "static";
        modal.removeData('bs.modal'); // initialize again
        modal.modal({
            backdrop: backdrop
        });
    };

    /**
     * Shows a popup for bookmarking or sharing the current state as a link.
     *
     */
    this.popupBookmark = function () {

        var url = MAIN.saveBookmark();
        var modal = $("#id_bookmarkModal");
        $("body").append(modal);
        var modalBookmarkLink = $("#id_bookmarkLink");

        // Apply the url to the link
        modalBookmarkLink.text(url);
        modalBookmarkLink.attr("href", url);

        // Pause rendering in background
        WEBGL.stopRendering();

        // Show the popup
        modal.modal();

        // Resume visualization when finished
        modal.off('hidden.bs.modal');
        modal.on('hidden.bs.modal', function (e) {
            // Resume rendering again
            WEBGL.resumeRendering();
        });
    };

    // Shows a popup for changing the measure aggregation
    this.popupAccentColor = function () {
        var modal = $("#id_colorModal");
        $("body").append(modal);
        var modalAggBody = $("#id_colorModalBody");

        var shadeColor = function (hex, lum) {
            hex = String(hex).replace(/[^0-9a-f]/gi, '');
            if (hex.length < 6) {
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            }
            lum = lum || 0;
            var rgb = "#", c, i;
            for (i = 0; i < 3; i++) {
                c = parseInt(hex.substr(i * 2, 2), 16);
                c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
                rgb += ("00" + c).substr(c.length);
            }
            return rgb;
        };

        // Create a button for each color type
        modalAggBody.empty();
        var buttonGroup = $('<div class="btn-group">');
        $.each(MAIN.COLORS, function (i, color) {
            var button = $('<button class="btn btn-default" type="button"></button>');
            button.html("&nbsp;");

            var borderColor = shadeColor(color, -0.25);
            var brightColor = shadeColor(color, 0.15);

            button.css("background", "linear-gradient(" + brightColor + "," + color + ")");
            button.css("border-color", borderColor);
            button.css("width", "60px");
            buttonGroup.append(button);
            if (MAIN.currentColor === color) {
                button.css("color", "white");
                button.css("text-shadow", "0px 1px 0px rgba(0, 0, 0, 0.5)");
                button.html("<span class='glyphicon glyphicon-ok'></span>");
            }
            button.on("click", function (e) {
                e.preventDefault();

                // Apply the new aggregation
                MAIN.currentColor = color;

                // Hide the popup
                modal.modal("hide");

                // Visualize without an undo step or camera movement
                MAIN.applyOLAP(true, true);
            });
        });
        modalAggBody.append(buttonGroup);

        // Pause rendering in background
        WEBGL.stopRendering();

        // Show the popup
        modal.modal();

        // Resume visualization when finished
        modal.off('hidden.bs.modal');
        modal.on('hidden.bs.modal', function (e) {
            // Resume rendering again
            WEBGL.resumeRendering();
        });
    };


    // Shows a popup of a result
    this.popupResult = function (result) {

        // Gather dimension details from all axis
        var dimensions = [];
        var collectDimensions = function (dimensionList) {
            $.each(dimensionList, function (i, dimension) {
                if (dimension.rollup) {
                    var entities = [];
                    $.each(dimension.entities, function (i, entity) {
                        entities.push(entity.label);
                    });
                    dimensions.push({
                        dimension: dimension.label,
                        entities: entities
                    });
                } else {
                    var entity = MAIN.getEntityFromJson(result, dimension);
                    dimensions.push({
                        dimension: dimension.label,
                        entity: entity.label
                    });
                }
            });
        };
        collectDimensions(MAIN.xDimensions);
        collectDimensions(MAIN.yDimensions);
        collectDimensions(MAIN.zDimensions);

        // Gather measure informations
        var measures = [];
        var collectMeasures = function (measureList) {
            $.each(measureList, function (i, measure) {
                var value = MAIN.getMeasureValueFromJson(result, measure);
                measures.push({
                    measure: measure.label,
                    value: value
                });
            });
        };
        collectMeasures(MAIN.measures);

        // Build the modal
        var modal = $(TEMPLATES.MODAL_RESULT_TEMPLATE);
        $("body").append(modal);
        var modalBody = $("#id_resultModalBody");

        // Add the dimension data
        modalBody.append("<h4>Dimensions</h4>");
        var table = $("<table>");
        table.addClass("table table-bordered table-striped");
        $.each(dimensions, function (i, dimension) {
            var row = $("<tr>");
            row.append("<td>" + dimension.dimension + "</td>");

            // Collect all entities when rollup
            if (dimension.entities) {
                var cell = $("<td><b></b></td>");
                $.each(dimension.entities, function (i, entity) {
                    cell.children("b").append(entity);
                    if (i < dimension.entities.length - 1) {
                        cell.children("b").append(", ");
                    }
                });
                row.append(cell);
            } else {
                row.append("<td><b>" + dimension.entity + "</b></td>");
            }
            table.append(row);
        });
        modalBody.append(table);

        // Add the measure data
        modalBody.append("<h4>Measures</h4>");
        var table = $("<table>");
        table.addClass("table table-bordered table-striped");
        $.each(measures, function (i, measure) {
            var row = $("<tr>");
            row.append("<td>" + measure.measure + " <span style='font-weight:bold;color:" + MAIN.currentColor + ";'>(" + getAggregationLabel(MAIN.currentAGG) + ")</span></td>");
            row.append("<td><b>" + MAIN.formatNumber(measure.value, 2) + "</b></td>");
            table.append(row);
        });
        modalBody.append(table);

        // Add the filter data
        if (MAIN.filters.length > 0) {
            modalBody.append("<h4>Filters</h4>");
            var table = $("<table>");
            table.addClass("table table-bordered table-striped");
            $.each(MAIN.filters, function (i, filter) {
                var row = $("<tr>");
                row.append("<td>" + filter.measure.label + "</td>");
                row.append("<td><b>" + getRelationLabel(filter.relation) + " " + MAIN.formatNumber(filter.value, 2) + "</b></td>");
                table.append(row);
            });
        }
        modalBody.append(table);

        // Pause rendering in background
        WEBGL.stopRendering();

        // Show the popup
        $('#id_resultModal').modal();

        // Remove when finished
        modal.on('hidden.bs.modal', function (e) {
            modal.remove();

            // Resume rendering again
            WEBGL.resumeRendering();
        });
    };

    /**
     * Shows a (bar) chart popup using C3.
     */
    this.popupChart = function () {
        var content = MAIN.resultCache[MAIN.currentURL];
        if (!content) {
            return;
        }
        var obj;
        try {
            obj = $.parseJSON(content);
        } catch (e) {
            bootbox.alert("<b>Error:</b><br><br>" + content);
            return;
        }
        var results = obj.results.bindings;

        // Stop if no results
        if (results.length === 0) {
            return;
        }

        // Clear previous info area
        $("#id_chartInfos").empty();

        // Gather data
        var allDimensions = MAIN.xDimensions.concat(MAIN.yDimensions, MAIN.zDimensions);
        var firstDimension = allDimensions[0];
        var lastDimension = allDimensions[allDimensions.length - 1];
        var lastDimEntities = []; // Grouped items
        var categories = [];
        var cleanResults = [];

        // Look for slices and rollup labels and show them on top of the chart
        var subtitle = "";
        $.each(allDimensions, function (i, dimension) {
            if (dimension.entities.length === 1) {
                // Slicing detected -> add info in subtitle
                subtitle += "<span>" + dimension.label + ": <b>" + dimension.entities[0].label + "</b></span>";
            } else if (dimension.rollup) {
                // Rollup dimension detected -> -> add info in subtitle
                var tooltip = "";
                $.each(dimension.entities, function (i, entity) {
                    tooltip += ", " + entity.label;
                });
                tooltip = tooltip.substring(2); // remove first ", "
                subtitle += "<span data-toggle='tooltip' title='" + tooltip + "'>" + dimension.label + " <b>(" + dimension.entities.length + ")</b></span>";
            }
        });
        subtitle += "<span>Measure: " + MAIN.measures[0].label + "<span style='font-weight:bold;color:" + MAIN.currentColor + ";'> (" + getAggregationLabel(MAIN.currentAGG) + ")</span></span>";

        $("#id_chartInfos").html(subtitle);
        $('#id_chartInfos [data-toggle="tooltip"]').tooltip(); // enable tooltips

        $.each(results, function (i, result) {

            var category = "";
            var measure = MAIN.getMeasureValueFromJson(result, MAIN.measures[0]); // Only 1 measure
            var label = MAIN.getEntityFromJson(result, lastDimension).label;

            if (label === MAIN.getEntityFromJson(result, firstDimension).label) {
                category = undefined; // only 1 dimension selected
            }

            // Rows of chart data
            if (lastDimEntities.indexOf(label) === -1) {
                lastDimEntities.push(label);
            }

            for (var i = 0; i < allDimensions.length - 1; i++) {
                var dimension = allDimensions[i];
                if (dimension.entities.length === 1 || dimension.rollup) {
                    continue; // Slicing or rollup detected -> skip as category
                }
                var entityLabel = MAIN.getEntityFromJson(result, dimension).label;
                category += " > " + entityLabel;

            }
            if (category) {
                category = category.substring(3); // remove first " > "
            }

            // Multiple dimensions -> category label
            if (category && category !== label && categories.indexOf(category) === -1) {
                categories.push(category);
            }
            cleanResults.push({
                category: category,
                label: label,
                measure: measure
            });
        });

        // Sort the results and labels
        cleanResults.sort(function (a, b) {
            return alphanumCase(a.category + a.label, b.category + b.label);
        });
        categories.sort(function (a, b) {
            return alphanumCase(a, b);
        });
        lastDimEntities.sort(function (a, b) {
            return alphanumCase(a, b);
        });

        // Group as row data for C3
        var rows = [];
        rows.push(lastDimEntities); // First line with labels of last dimension
        var group = [];
        var prevCategory = cleanResults[0].category;
        $.each(cleanResults, function (i, result) {
            if (group.length > 0 && prevCategory !== result.category) {
                // New group, fill empty fields and push last one,
                $.each(lastDimEntities, function (i, label) {
                    group[i] = (group[i] || group[i] === 0) ? group[i] : null; // Fill up empty slots with "null"
                });
                rows.push(group);
                group = [];
            }
            var index = lastDimEntities.indexOf(result.label);
            group[index] = result.measure;
            prevCategory = result.category;
        });

        // Also push last row
        $.each(lastDimEntities, function (i, label) {
            group[i] = (group[i] || group[i] === 0) ? group[i] : null; // Fill up empty slots with "null"
        });
        rows.push(group);

        // Determine the chart type
        var type;
        if ($("#id_chartLineButton").prop("checked")) {
            $("#id_chartLineButton").click();
            type = "line";
        } else if ($("#id_chartAreaButton").prop("checked")) {
            $("#id_chartAreaButton").click();
            type = "area";
        } else if ($("#id_chartPieButton").prop("checked")) {
            $("#id_chartPieButton").click();
            type = "pie";
        } else {
            $("#id_chartBarButton").click();
            type = "bar";
        }

        // Determine if stacked
        var groups = [];
        if ($("#id_chartStackingButton").prop("checked")) {
            $("#id_chartStackingButton").parent().addClass("active");
            groups = [lastDimEntities];
        } else {
            $("#id_chartStackingButton").parent().removeClass("active");
        }

        var modal = $('#id_chartModal');

        // Set title and slice information
        modal.find(".modal-title").text(MAIN.currentCube.label);

        // Create the chart
        var chart = c3.generate({
            bindto: '#id_chart',
            data: {
                rows: rows,
                type: type,
                groups: groups,
//                order: null
            },
            transition: {
                duration: 300
            },
            bar: {
                width: {
                    ratio: 0.75
                }
            },
            axis: {
                rotated: true,
                x: {
                    type: 'category',
                    categories: categories[0] ? categories : [""],
                    tick: {
                        multiline: false,
                    }
                },
                y: {
                    label: {
                        text: MAIN.measures[0].label,
                        position: "outer-center"
                    },
                    tick: {
                        format: function (x) {
                            return MAIN.formatNumber(x, 2);
                        }
                    }
                }
            },
            grid: {
                x: {
                    show: true
                },
                y: {
                    show: true
                }
            },
            tooltip: {
                format: {
                    title: function (i) {
                        var title = categories[i] ? categories[i] : MAIN.measures[0].label;
                        return  title;
                    },
                    value: function (value, ratio, id) {
                        return MAIN.formatNumber(value, 2);
                    }
                }
            }
        });

        // Add/Refresh button listeners

        // Bar button listeners
        $("#id_chartBarButton").off("change");
        $("#id_chartBarButton").on("change", function (e) {
            if ($("#id_chartBarButton").prop("checked")) {
                type = "bar";
                chart.transform(type);

                if (groups.length === 0) {
                    // No Stacking -> larger chart
                    setTimeout(function () {
                        chart.resize({height: 100 + Math.max(categories.length, 1) * 10 * lastDimEntities.length + lastDimEntities.length * 5});
                    }, 400);
                } else {
                    setTimeout(function () {
                        chart.resize({height: 100 + categories.length * 25 + lastDimEntities.length * 5});
                    }, 400);
                }
            }
        });

        // Line button listeners
        $("#id_chartLineButton").off("change");
        $("#id_chartLineButton").on("change", function (e) {
            if ($("#id_chartLineButton").prop("checked")) {
                type = "line";
                chart.transform(type);

                // Smaller chart (line and area)
                setTimeout(function () {
                    chart.resize({height: 100 + categories.length * 25 + lastDimEntities.length * 5});
                }, 400);
            }
        });

        // Area button listeners
        $("#id_chartAreaButton").off("change");
        $("#id_chartAreaButton").on("change", function (e) {
            if ($("#id_chartAreaButton").prop("checked")) {
                type = "area";
                chart.transform(type);

                // Smaller chart (line and area)
                setTimeout(function () {
                    chart.resize({height: 100 + categories.length * 25 + lastDimEntities.length * 5});
                }, 400);
            }
        });

        // Pie button listeners
        $("#id_chartPieButton").off("change");
        $("#id_chartPieButton").on("change", function (e) {
            if ($("#id_chartPieButton").prop("checked")) {
                type = "pie";
                chart.transform(type);

                // Fixed height for pie chart
                setTimeout(function () {
                    chart.resize({height: 100 + 300 + lastDimEntities.length * 5});
                }, 400);
            }
        });

        // Stacking button listeners
        $("#id_chartStackingButton").off("change");
        $("#id_chartStackingButton").on("change", function (e) {
            if ($("#id_chartStackingButton").prop("checked")) {
                // Stacking
                groups = [lastDimEntities];
                chart.groups(groups);

                // Only resize if bar chart
                if (type === "bar") {
                    setTimeout(function () {
                        chart.resize({height: 100 + categories.length * 25 + lastDimEntities.length * 5});
                    }, 400);
                }
            } else {
                // No stacking
                groups = [];
                chart.groups(groups);

                // Only resize if bar chart
                if (type === "bar") {
                    setTimeout(function () {
                        chart.resize({height: 100 + Math.max(categories.length, 1) * 10 * lastDimEntities.length + lastDimEntities.length * 5});
                    }, 400);
                }
            }
        });

        // Pause rendering in background
        WEBGL.stopRendering();

        // Show the popup
        modal.modal();

        // Configure the help message
        $("#id_chartInfoButton").attr('data-content', TEMPLATES.HINT_CHART.replace("__dimension__", lastDimension.label));

        // Resize chart when the modal is finished (fixes chart)
        modal.off('hown.bs.modal');
        modal.on('shown.bs.modal', function (e) {

            if (type === "pie") {
                chart.resize({height: 100 + 300 + lastDimEntities.length * 5});
            } else if (type === "line" || type === "area") {
                chart.resize({height: 100 + categories.length * 25 + lastDimEntities.length * 5});
            } else if (groups.length === 0) { // bar chart
                // No stacking
                chart.resize({height: 100 + Math.max(categories.length, 1) * 10 * lastDimEntities.length + lastDimEntities.length * 5});
            } else {
                // Stacking
                chart.resize({height: 100 + categories.length * 25 + lastDimEntities.length * 5});
            }
        });

        // Resume rendering again when modal is closed
        modal.off('hidden.bs.modal');
        modal.on('hidden.bs.modal', function (e) {
            WEBGL.resumeRendering();
        });
    };

    /**
     * Shows a modal for entitySelection of a given dimension
     * @param {Dimension} dimension the dimension containing the entities
     */
    this.popupEntitySelection = function (dimension) {
        // Add popup to the body
        var modal = $(TEMPLATES.MODAL_DIMENSION_TEMPLATE
                .replace("__label__", dimension.label)
                .replace("__uri__", dimension.dimensionName));
        $("body").append(modal);

        var buttonArea = $("#id_entityModalNavigation");

        // Add easy access buttons
        var SelectAllButton = $('<button class="btn btn-default btn-sm">All</button>');
        var SelectNoneButton = $('<button class="btn btn-default btn-sm">None</button>');
        var SelectInvertButton = $('<button class="btn btn-default btn-sm">Invert</button>');
        var SelectDefaultButton = $('<button class="btn btn-default btn-sm">Default</button>');
        var SelectPrevButton = $('<button class="btn btn-default btn-sm"><span class="glyphicon glyphicon-menu-up"></span> Previous ' + INTERFACE.NUM_ENTITIES + '</button>');
        var SelectNextButton = $('<button class="btn btn-default btn-sm"><span class="glyphicon glyphicon-menu-down"></span> Next ' + INTERFACE.NUM_ENTITIES + '</button>');
        buttonArea.append(SelectAllButton);
        buttonArea.append(SelectNoneButton);
        buttonArea.append(SelectInvertButton);
        buttonArea.append(SelectDefaultButton);
        buttonArea.append(SelectPrevButton);
        buttonArea.append(SelectNextButton);

        // Add all entities to the popup body
        $.each(MAIN.entityList[dimension.dimensionName].list, function (index, entity) {
            var btnGroup = $('<div class="btn-group col-md-4 col-xs-12 entity-button" data-toggle="buttons"></div> '); // missinb bootstrap row
            var label = $('<label class="btn btn-default btn-xs ' + (MAIN.entityList[dimension.dimensionName][entity.entityName] ? 'active' : '') + '" title="' + entity.label + '"></label>');
            var button = $('<input type="checkbox" autocomplete="off"' + (MAIN.entityList[dimension.dimensionName][entity.entityName] ? 'checked' : '') + ' data-entity-name="' + entity.entityName + '" data-entity-label="' + entity.label + '">');

            // Combine the checkbox and add
            label.append(button);
            label.append(document.createTextNode(entity.label)); // escaping
            btnGroup.append(label);
            $("#id_entityModalBody").append(btnGroup);
            $("#id_entityModalBody").append(" ");

            // Add change listeners to enable or disable the accept button
            button.on("change", function (e) {
                $("input[data-entity-name]").each(function (i, elem) {
                    $("#id_entityModalOkay").addClass("disabled");
                    if ($(elem).prop("checked")) {
                        $("#id_entityModalOkay").removeClass("disabled");
                        return false; // break
                    }
                });
            });
        });

        // Set max modal height
        $("#id_entityModalBody").css("max-height", $(window).height() - 230 + "px");
        $("#id_entityModalBody").css("overflow-y", "scroll");

        // Accept action of popup
        $("#id_entityModalOkay").on("click", function (e) {
            e.preventDefault();

            // Apply selected entities
            var newEntities = [];
            $("input[data-entity-name]").each(function () {
                var entityName = $(this).data('entity-name');
                var label = $(this).data('entity-label');
                if ($(this).prop("checked")) {
                    MAIN.entityList[dimension.dimensionName][entityName] = true;
                    newEntities.push(new Entity(dimension.dimensionName, entityName, label));
                } else {
                    MAIN.entityList[dimension.dimensionName][entityName] = false;
                }
            });

            // Set new entity list
            dimension.entities = newEntities;

            // Update visualization and interface right away
            MAIN.applyOLAP();
        });

        // Select all entities
        SelectAllButton.on("click", function (e) {
            e.preventDefault();

            $("input[data-entity-name]").each(function (i, element) {
                $(element).prop("checked", true);
                $(element).parent().addClass("active");
            });

            // Enable apply button
            $("#id_entityModalOkay").removeClass("disabled");
        });

        // Deselect all entities
        SelectNoneButton.on("click", function (e) {
            e.preventDefault();

            $("input[data-entity-name]").each(function (i, element) {
                $(element).prop("checked", false);
                $(element).parent().removeClass("active");
            });

            // Disable apply button
            $("#id_entityModalOkay").addClass("disabled");
        });

        // Invert selection of all entities
        SelectInvertButton.on("click", function (e) {
            e.preventDefault();

            $("input[data-entity-name]").each(function (i, element) {
                if ($(element).prop("checked")) {
                    $(element).prop("checked", false);
                    $(element).parent().removeClass("active");
                } else {
                    $(element).prop("checked", true);
                    $(element).parent().addClass("active");
                }
            });

            // Check if at least 1 entity selected
            $("input[data-entity-name]").each(function (i, elem) {
                $("#id_entityModalOkay").addClass("disabled");
                if ($(elem).prop("checked")) {
                    $("#id_entityModalOkay").removeClass("disabled");
                    return false; // break
                }
            });
        });

        // Select previous 10 entities (before first selected)
        SelectPrevButton.on("click", function (e) {
            e.preventDefault();

            var lowestIndex = 0;
            $("input[data-entity-name]").each(function (i, element) {
                if ($(element).prop("checked")) {
                    lowestIndex = i;
                    return false;
                }
            });
            var start = Math.max(0, lowestIndex - INTERFACE.NUM_ENTITIES);
            var end = Math.min(start + INTERFACE.NUM_ENTITIES, $("input[data-entity-name]").length);
            $("input[data-entity-name]").each(function (i, element) {
                $(element).prop("checked", false);
                $(element).parent().removeClass("active");
            });
            $("input[data-entity-name]").slice(start, end).each(function (i, element) {
                $(element).prop("checked", true);
                $(element).parent().addClass("active");
            });

            // Enable apply button
            $("#id_entityModalOkay").removeClass("disabled");
        });

        // Select next 10 entities (after last selected)
        SelectNextButton.on("click", function (e) {
            e.preventDefault();

            var highestIndex = 0;
            $("input[data-entity-name]").each(function (i, element) {
                if ($(element).prop("checked")) {
                    highestIndex = i + 1;
                }
            });
            var start = Math.max(0, Math.min($("input[data-entity-name]").length - INTERFACE.NUM_ENTITIES, highestIndex));
            var end = start + INTERFACE.NUM_ENTITIES;
            $("input[data-entity-name]").each(function (i, element) {
                $(element).prop("checked", false);
                $(element).parent().removeClass("active");
            });
            $("input[data-entity-name]").slice(start, end).each(function (i, element) {
                $(element).prop("checked", true);
                $(element).parent().addClass("active");
            });

            // Enable apply button
            $("#id_entityModalOkay").removeClass("disabled");
        });

        // Select the first 10 entities again
        SelectDefaultButton.on("click", function (e) {
            e.preventDefault();

            $("input[data-entity-name]").each(function (i, element) {
                if (i < INTERFACE.NUM_ENTITIES) {
                    $(element).prop("checked", true);
                    $(element).parent().addClass("active");
                } else {
                    $(element).prop("checked", false);
                    $(element).parent().removeClass("active");
                }
            });

            // Enable apply button
            $("#id_entityModalOkay").removeClass("disabled");
        });

        // Disable prev, next buttons if not enough entities
        if (MAIN.entityList[dimension.dimensionName].list.length <= INTERFACE.NUM_ENTITIES) {
            SelectPrevButton.prop("disabled", true);
            SelectNextButton.prop("disabled", true);
        }

        // Disable apply button initially
        $("#id_entityModalOkay").addClass("disabled");

        // Pause rendering in background
        WEBGL.stopRendering();

        // Show the popup
        $("#id_entityModal").modal();

        // Remove when finished
        modal.on('hidden.bs.modal', function (e) {
            modal.remove();

            // Resume rendering again
            WEBGL.resumeRendering();
        });
    };

    // Shows a popup for adding a measure filter
    this.popupMeasureFilter = function (measure, filter, buttonGroup) {

        /* measure, filter and buttonGroup are optional */

        var modal = $("#id_filterModal");
        $("body").append(modal);

        var modalBody = $("#id_filterModalBody");
        var modalMeasureButton = $("#id_filterMeasureButton");
        var modalMeasureList = $("#id_filterMeasureList");
        var modalRelationButton = $("#id_filterRelationButton");
        var modalRelationList = $("#id_filterRelationList");
        var modalInput = $("#id_filterValue");
        var modalAcceptButton = $("#id_filterModalOkay");

        // Filter variables
        var filterMeasure = MAIN.availableMeasures[0];
        var filterRelation = MAIN.RELATIONS[0].type;
        var filterValue = 0; // Default input value: 0

        // read optional parameters as default values (e.g. to edit a given filter)
        if (filter !== undefined) {
            filterMeasure = filter.measure;
            filterRelation = filter.relation;
            filterValue = filter.value;
            modal.find(".modal-title").text("Change Filter");
        } else if (measure !== undefined) {
            var filterMeasure = measure; // Set first measure by default
        }
        modalInput.val(filterValue);

        // Set button text initially
        modalMeasureButton.empty();
        modalMeasureButton.text(filterMeasure.label + " ");
        modalMeasureButton.append(" <span class='caret'></span>");

        // Create entry for each measure
        modalMeasureList.empty();
        $.each(MAIN.availableMeasures, function (i, measure) {

            // Create Dropdown entries
            var itemLink = $("<a role='menuitem' tabindex='-1' href='#'></a>");
            itemLink.text(measure.label);
            var item = $("<li role='presentation'></li>");
            item.append(itemLink);
            modalMeasureList.append(item);

            // Add on-click handler for chosen measure
            itemLink.on("click", function (e) {
                e.preventDefault();

                filterMeasure = measure;

                // Change the measure (dropdown) button of the modal
                modalMeasureButton.empty();
                modalMeasureButton.text(measure.label + " ");
                modalMeasureButton.append(" <span class='caret'></span>");

            });
        });

        // Create entry for each relation type
        modalRelationList.empty();
        $.each(MAIN.RELATIONS, function (i, relation) {

            // Create Dropdown entries
            var itemLink = $("<a role='menuitem' tabindex='-1' href='#'></a>");
            itemLink.text(relation.label);
            var item = $("<li role='presentation'></li>");
            item.append(itemLink);
            modalRelationList.append(item);

            // Add on-click handler for chosen relation
            itemLink.on("click", function (e) {
                e.preventDefault();

                filterRelation = relation.type;

                // Change the measure (dropdown) button of the modal
                modalRelationButton.empty();
                modalRelationButton.text(relation.label + " ");
                modalRelationButton.append(" <span class='caret'></span>");

            });
        });

        // Set relation
        modalRelationButton.empty();
        if (filter !== undefined) {
            modalRelationButton.text(getRelationLabel(filter.relation));
        } else {
            modalRelationButton.text(" < "); // Default relation: smaller
        }
        modalRelationButton.append(" <span class='caret'></span>");

        // Validates input and shows error sign for wrong input
        var validateFilterInput = function () {
            if (!$.isNumeric(modalInput.val())) {
                // Add error sign
                if ($("#id_filterInputLine > span").length === 0) {
                    $("#id_filterInputLine").append('<span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>');
                    $("#id_filterInputLine").addClass('has-error');
                }
                return false;
            } else {
                // Remove error sign
                $("#id_filterInputLine > span").detach();
                $("#id_filterInputLine").removeClass('has-error');
                filterValue = modalInput.val();
                return true;
            }
        };

        // Validate the numerical input
        modalInput.off("change");
        modalInput.on("change", validateFilterInput);

        // Validate and accept
        modalAcceptButton.off("click");
        modalAcceptButton.removeAttr("disabled");
        modalAcceptButton.on("click", function (e) {
            e.preventDefault();

            if (validateFilterInput()) {

                // Disable button to avoid multiple adding (by fast clicking)
                modalAcceptButton.attr("disabled", "disabled");

                // Change given filter or create new one
                if (filter !== undefined) {
                    filter.measure = filterMeasure;
                    filter.relation = filterRelation;
                    filter.value = filterValue;
                } else {
                    filter = new Filter(filterMeasure, filterRelation, filterValue);
                    MAIN.filters.push(filter);
                }

                // Hide the popup
                modal.modal("hide");

                // Update visualization and interface right away
                MAIN.applyOLAP();
            }
        });

        // Pause rendering in background
        WEBGL.stopRendering();

        // Show the popup
        modal.modal();

        // Resume visualization when finished
        modal.off('hidden.bs.modal');
        modal.on('hidden.bs.modal', function (e) {
            // Resume rendering again
            WEBGL.resumeRendering();
        });
    };

    // Add a filter button that shows a filter status
    this.addFilterButton = function (filter) {
        var plusButton = $("#id_filterPlus");
        var buttonArea = $("#id_filterButtonArea");

        // Get label from relation type (e.g. "smaller": "<")
        var relationLabel = getRelationLabel(filter.relation);

        // Rebuild a filter button and its menu
        var btnGroup = $('<div class="btn-group"></div>');
        var button = $('<button class="btn dropdown-toggle btn-default btn-sm" type="button" data-toggle="dropdown"></button>');
        var text = $('<span class=filter-button-text>' + filter.measure.label + '</span>');
        var badge = $('<span class="badge"></span>');
        var menu = $('<ul class="dropdown-menu" role="menu"></ul>');
        var changeItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Change...</a></li>');
        var dividerItem = $('<li role="presentation" class="divider"></li>');
        var removeItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Remove</a></li>');

        // Combine button and list
        btnGroup.append(button);
        button.append(text);
        button.append(badge);
        badge.text(relationLabel + " " + filter.value);
        menu.append(changeItem);
        menu.append(dividerItem);
        menu.append(removeItem);
        btnGroup.append(menu);

        buttonArea.append(btnGroup);
        buttonArea.append(" ");
        buttonArea.append(plusButton); // Move plus to end

        // Change existing filter
        changeItem.on("click", function (e) {
            e.preventDefault();
            INTERFACE.popupMeasureFilter(null, filter, btnGroup);
        });

        // Add event for removing the measure
        removeItem.on("click", function (e) {
            e.preventDefault();

            // Delete from selected list
            var index = MAIN.filters.indexOf(filter);
            MAIN.filters.splice(index, 1);

            // Remove HTML button and list
            btnGroup.remove();

            // Update visualization and interface right away
            MAIN.applyOLAP();
        });
    };

    /**
     * Re-add the dimension buttons according to the current state
     */
    this.reinsertDimensionButtons = function () {

        // Re-create the dropdown menu for adding dimensions with the "+" button
        INTERFACE.fillDimensionList("x", MAIN.xDimensions);
        INTERFACE.fillDimensionList("y", MAIN.yDimensions);
        INTERFACE.fillDimensionList("z", MAIN.zDimensions);

        // Update dropzones
        INTERFACE.updateDropZones();

        $.each(MAIN.xDimensions, function (i, dimension) {
            INTERFACE.addDimensionButton(dimension, "x", MAIN.xDimensions);
            $('li[data-dimension-name="' + dimension.dimensionName + '"]').addClass("disabled");
        });
        $.each(MAIN.yDimensions, function (i, dimension) {
            INTERFACE.addDimensionButton(dimension, "y", MAIN.yDimensions);
            $('li[data-dimension-name="' + dimension.dimensionName + '"]').addClass("disabled");
        });
        $.each(MAIN.zDimensions, function (i, dimension) {
            INTERFACE.addDimensionButton(dimension, "z", MAIN.zDimensions);
            $('li[data-dimension-name="' + dimension.dimensionName + '"]').addClass("disabled");
        });
    };

    /**
     * Re-add the measure button(s) according to the current state (only update 1 dropdown button)
     */
    this.reinsertMeasureButtons = function () {
        var measure = MAIN.measures[0];
        var agg = measure.agg.toUpperCase(); // Possible if multiple measures
        agg = MAIN.currentAGG.toUpperCase();

//        $.each(MAIN.measures, function (i, measure) {
//            INTERFACE.addMeasureButton(measure);
//        });

        // Change the measure (dropdown) button
        $("#id_measureButton").empty();
        $("#id_measureButton").append("<span class='measure-button-text'>" + measure.label + "</span>");
        var badge = $('<span class="badge"></span>');
        badge.css("background-color", MAIN.currentColor);
        badge.text(agg);

        $("#id_measureButton").append(" <span class='caret'></span>");
        $("#id_measureButton").append(badge);

        // Disable the selected measure from list (and re-enable all others)
        $('[data-measure-name]').removeClass("disabled");
        $('[data-measure-name="' + measure.measureName + '"]').addClass("disabled");
    };

    /**
     * Re-add the filter buttons according to the current state
     */
    this.reinsertFilterButtons = function () {
        $.each(MAIN.filters, function (i, filter) {
            INTERFACE.addFilterButton(filter);
        });
    };

    /**
     * Re-add dimension, measure and filter buttons after an operation, undo or redo.
     */
    this.updateConfigButtons = function () {

        // Clear old buttons
        INTERFACE.clearDimensions();
        INTERFACE.clearFilters();

        // Add updated buttons
        INTERFACE.reinsertDimensionButtons();
        INTERFACE.reinsertMeasureButtons();
        INTERFACE.reinsertFilterButtons();
    };

    /**
     * Disable or enable the status of the navigation buttons according to the current state
     * Includes: Cancel, Apply, Undo, Redo, Options, Merge
     */
    this.updateNavigation = function () {

        // Status of apply and accept button (for temp selection)
        if ($.isEmptyObject(MAIN.tempSelection)) {
            $("#id_applyButton").prop("disabled", true);
            $("#id_cancelButton").prop("disabled", true);
        } else {
            $("#id_applyButton").prop("disabled", false);
            $("#id_cancelButton").prop("disabled", false);
        }

        // Undo / Redo stack
        if (MAIN.undoStack.length === 0) {
            $("#id_undoButton").prop("disabled", true);
        } else {
            $("#id_undoButton").prop("disabled", false);
        }
        if (MAIN.redoStack.length === 0) {
            $("#id_redoButton").prop("disabled", true);
        } else {
            $("#id_redoButton").prop("disabled", false);
        }
    };

    /**
     * Shows a custom tooltip with a given text
     *
     * @param {type} label the webgl label
     */
    this.showTooltip = function (label) {
        var pos = WEBGL.toScreenPosition(label);

        // Init tooltip for 1st time
        if (!label.tooltip) {
            var text = "";
            if (label.entity.rollupLabels) {
                $.each(label.entity.rollupLabels, function (i, label) {
                    text += label + ", ";
                });
                text = text.substring(0, text.length - 2); // remove last comma
            } else {
                text = label.entity.label;
            }
            label.tooltip = $("<div class='hiddenTooltip'></div>");
            label.tooltip.attr("title", text);

            // Place top label tooltips on the left side
            if (label.position.x >= 0) {
                label.tooltip.attr("data-placement", "left");
            }
            $("body").append(label.tooltip);
        }

        label.tooltip.css("left", pos.x);
        label.tooltip.css("top", pos.y);

        label.tooltip.tooltip('show');
//        label.tooltip.css("display", "none"); // hide secret element
    };

    /**
     * Hide a given custom tooltip
     *
     * @param {type} label the text to display
     */
    this.hideTooltip = function (label) {
        if (!label.tooltip) {
            return;
        }
        label.tooltip.css("left", 0);
        label.tooltip.css("top", 0);
        label.tooltip.tooltip('hide');
//        label.tooltip.remove();
    };

    // Updates the mouse position for webGL event handling
    this.onCanvasMouseMove = function (event) {
        event.preventDefault();

        // only highlight results if no mouse buttons pressed
        var button = event.buttons === undefined ? event.which || event.button : event.buttons; // TODO check IE10+
//        console.log("MOVE", event.buttons, event.which, event.button);
        if (button !== 0) {
            INTERFACE.mousePressed = true;
        } else {
            INTERFACE.mousePressed = false;
        }

        var node = $(WEBGL.renderer.domElement);
        var x = event.pageX - node.position().left;
        var y = event.pageY - node.position().top;
//        INTERFACE.mousePosition.x = event.pageX;
//        INTERFACE.mousePosition.y = event.pageY;
        WEBGL.mousePosition.x = (x / node.width()) * 2 - 1;
        WEBGL.mousePosition.y = -(y / node.height()) * 2 + 1;
    };

    // Executes click events on the WebGL canvas
    this.onCanvasMouseClick = function (event) {
        event.preventDefault();

        // only highlight results if no mouse buttons pressed

        var node = $(WEBGL.renderer.domElement);
        var x = event.pageX - node.position().left;
        var y = event.pageY - node.position().top;

        // cancel if dragged a certain min distance
        var distance = 6; // TODO: no ratation below
        if (Math.abs(x - INTERFACE.mouseDown.x) > distance || Math.abs(y - INTERFACE.mouseDown.y) > distance) {
            return;
        }

        WEBGL.mousePosition.x = (x / node.width()) * 2 - 1;
        WEBGL.mousePosition.y = -(y / node.height()) * 2 + 1;

        // execute click events
        WEBGL.handleClick();
    };

    // Executes hover out events when the mouse leaves the canvas
    this.onCanvasMouseLeave = function (event) {
        event.preventDefault();

        var node = $(WEBGL.renderer.domElement);
//        INTERFACE.mousePosition.x = event.pageX;
//        INTERFACE.mousePosition.y = event.pageY;
        WEBGL.mousePosition.x = -999;
        WEBGL.mousePosition.y = 999;

        // execute hover-out on webgl objects
        WEBGL.handleLeave();
    };

    // For distance limit of clicking
    this.onCanvasMouseDown = function (event) {
        event.preventDefault();

        var node = $(WEBGL.renderer.domElement);
        INTERFACE.mouseDown.x = event.pageX - node.position().left;
        INTERFACE.mouseDown.y = event.pageY - node.position().top;
    };

    // Handle screen resizing
    this.onScreenResize = function (event) {
//        if ($(window).width() < 768) {
//            // Code here
//        }
    };

    // HELP FUNCTIONS ==========================================================


    // Add html list for X, Y, or Z axis
    this.fillDimensionList = function (axis, dimensions) {
        var dimensionList = $("#id_" + axis + "DimensionList");
        var plusButton = $("#id_" + axis + "Plus");
        var buttonArea = $("#id_" + axis + "ButtonArea");

        // Iterate through available dimensions
        $.each(MAIN.availableDimensions, function (index, dim) {
            var dimensionName = dim.dimensionName;
            var label = dim.label;

            // Create Dropdown entries
            var itemLink = $("<a role='menuitem' tabindex='-1' href='#'></a>");
            itemLink.text(label);
            var item = $("<li role='presentation' data-dimension-name='" + dimensionName + "'></li>");
            item.append(itemLink);
            dimensionList.append(item);

            // Add on-click handler for chosen dimension
            itemLink.on("click", function (e) {
                e.preventDefault();

                // Only add once, disable menu item
                if (isSelectedDimension(dimensionName)) {
                    return;
                }

                // Get some pre-selected entities (first 10)
                var entities = MAIN.getFirstEntities(dimensionName, INTERFACE.NUM_ENTITIES); // ...
                var dimension = new Dimension(dimensionName, label, entities);
                dimensions.push(dimension); // add it to the list of selected dimensions

                // Update visualization and interface right away (if user clicked manually)
                if (e.originalEvent) {
                    MAIN.applyOLAP();
                }
            });
        });
    };

    // Clears the cube dropdown list
    this.clearCubes = function () {

        // Reset cube selection button
        $("#id_cubeButton").empty();
        $("#id_cubeButton").append("<span class='cube-button-text'> Select Cube </span>");
        $("#id_cubeButton").append("<span class='caret'></span>");
        $("#id_cubeButton").attr("title", ""); // tooltip

        // Reset dropdown list
        $("#id_cubeList").empty();
    };

    // Clears selected dimension buttons and dropdown lists
    this.clearDimensions = function () {
        $.each(["x", "y", "z"], function (i, axis) {

            // Clear lists
            $("#id_" + axis + "DimensionList").empty();

            // Clear previous added dimension Buttons
            var plus = $("#id_" + axis + "Plus");
            $("#id_" + axis + "ButtonArea > *").detach();
            $("#id_" + axis + "ButtonArea").append(plus); // Re-attach adding button
        });
    };

    // Clears selected filter buttons
    this.clearFilters = function () {
        var plus = $("#id_filterPlus");
        $("#id_filterButtonArea > *").detach();
        $("#id_filterButtonArea").append(plus); // Re-attach adding button
    };


    // Select some dimensions initially and a measure and visualize them right away
    var showSomeData = function () {

        // Dimensions
        $("#id_xDimensionList > li:nth-child(1) > a").click(); // Preselect X
        $("#id_yDimensionList > li:nth-child(2) > a").click(); // Preselect Y
        $("#id_zDimensionList > li:nth-child(3) > a").click(); // Preselect Z

        // Measures
        $("#id_measureList > li:nth-child(1) > a").click(); // Preselect measure

        // Visualize!
        MAIN.applyOLAP();
    };

    // Gets the label version of a relation (e.g. "smaller": "<")
    var getRelationLabel = function (relationType) {
        var relationLabel;
        $.each(MAIN.RELATIONS, function (i, relation) {
            if (relation.type === relationType) {
                relationLabel = relation.label;
                return false;
            }
        });
        return relationLabel;
    };

    // Gets the label version of a aggregation (e.g. "avg": "Average")
    var getAggregationLabel = function (aggType) {
        var aggLabel;
        $.each(MAIN.AGGREGATIONS, function (i, aggregation) {
            if (aggregation.type === aggType) {
                aggLabel = aggregation.label;
                return false;
            }
        });
        return aggLabel;
    };

    // Help function...
    var isSelectedDimension = function (dimensionName) {
        var result = false;
        function checkDimension(index, dimension) {
            result = dimension.dimensionName === dimensionName ? true : result;
        }
        $.each(MAIN.xDimensions, checkDimension);
        $.each(MAIN.yDimensions, checkDimension);
        $.each(MAIN.zDimensions, checkDimension);
        return result;
    };

    // Help function...
    var isSelectedMeasure = function (measureName) {
        var result = false;
        function checkMeasure(index, measure) {
            result = measure.measureName === measureName ? true : result;
        }
        $.each(MAIN.measures, checkMeasure);
        return result;
    };

    // Make a html note flash for users attention
    var flashHTMLNode = function (node) {
        var setting = "scale(1.05)";
        var blinkDuration = 0.5;
        node.css("transition", blinkDuration + "s all ease");
        node.css("transform", setting);
        setTimeout(function () {
            node.css("transform", "");
            setTimeout(function () {
                node.css("transition", "");
            }, blinkDuration * 1000);
        }, blinkDuration * 1000);
    };

    // Creates a random unique ID for HTML elements
    var createUniqueID = function (length) {
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var result = '';
        for (var i = length; i > 0; --i) {
            result += chars[Math.round(Math.random() * (chars.length - 1))];
        }
        return "id_" + result;
    };

};