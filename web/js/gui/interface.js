/* global TEMPLATES, THREE, MAIN, WEBGL */

// Namespace for events and html interface code

var INTERFACE = new function () {

    this.NUM_ENTITIES = 15; // TODO: which ones? how many?

    // For interaction with 3D objects
    this.mouseDown = {};
    this.mousePressed = false;

    // ...
    this.disableInputInitially = function () {

        // Disable navigation input initially and set conditions of usage
        $("#id_cubePanel button").attr("disabled", "disabled");
        $("#id_dimensionPanel button").attr("disabled", "disabled");
        $("#id_measurePanel button").attr("disabled", "disabled");
        $("#id_filterPanel button").attr("disabled", "disabled");
        $("#id_cancelButton").attr("disabled", "disabled");
        $("#id_applyButton").attr("disabled", "disabled");
        $("#id_undoButton").attr("disabled", "disabled");
        $("#id_redoButton").attr("disabled", "disabled");
        $("#id_mergeButton").attr("disabled", "disabled");
    };

    // ...
    this.addInterfaceListeners = function () {

        // Top bar
        $("#id_changeUserButton").on('click', MAIN.logoutUser);

        // TODO disable / enable -> undo / redo
        $("#id_redoButton").on('click', MAIN.redo);
        $("#id_undoButton").on('click', MAIN.undo);

        // ...TODO

        // Options / Settings
        $("#id_aggItem").on('click', INTERFACE.popupMeasureAgg);
        $("#id_colorItem").on('click', INTERFACE.popupMeasureColor);
        $("#id_scaleItem").on('click', INTERFACE.toggleScale);

        // Merge button
//        $("#id_mergeButton").on('click', TODO);

        // Side bar TODO: cancel-button, + onchange -> update -> disable/enable
        $("#id_cancelButton").on('click', function (e) {
            e.preventDefault();
            alert("TODO: Cancel");
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

        // Info icon tooltips



        // Resize visualization on browser resize
        $(window).on('resize', WEBGL.resizeVizualisation.bind(WEBGL));

    };

    // Inits the cube dropdown lists and its listeners
    this.initCubeList = function () {

        // TEST HIGHLIGHT CUBE LIST
        flashHTMLNode($("#id_cubePanel"));

        // enable cube selection
        $("#id_cubePanel button").removeAttr("disabled");

        // still disable other actions
        $("#id_cancelButton").attr("disabled", "disabled");
        $("#id_applyButton").attr("disabled", "disabled");

        $("#id_undoButton").attr("disabled", "disabled");
        $("#id_redoButton").attr("disabled", "disabled");
        $("#id_mergeButton").attr("disabled", "disabled");

        // TODO info icons sind unsichtbar ABER klickbar

        // Clear old cube list
        $("#id_cubeList").empty();

        // Iterate through available cubes and fill the list
        $.each(MAIN.availableCubes, function (index, cube) {
            var cubeName = cube.cubeName;
            var comment = cube.comment; // TODO as tooltip? / "information area"
            var label = cube.label;

            // Create Dropdown entries
            var itemLink = $("<a role='menuitem' tabindex='-1' href='#'></a>");
            itemLink.text(label);
            itemLink.attr("title", label + ":\n\n" + comment); // tooltip
            var item = $("<li role='presentation' data-cube-name='" + cubeName + "'></li>");
            item.append(itemLink);
            $("#id_cubeList").append(item);

            // Add on-click handler for chosen cubes
            itemLink.on("click", function (e) {
                e.preventDefault();

                // Is the same cube already selected?
                if (MAIN.currentCube === cubeName) {
                    return;
                }

                // Set current cube's URI
                MAIN.currentCube = cubeName;

                // Query available dimensions and measures and fill the lists
                MAIN.loadDimensionList();
                MAIN.loadMeasureList();

                // TODO evtl "MAIN.clearState()" methode

                // Reset filters
                MAIN.filters = [];
                INTERFACE.clearFilters();

                // Reset temp selection and other
                MAIN.tempSelection = {};
                MAIN.availableDimensions = [];
                MAIN.availableMeasures = [];

                // Clear undo / redo stacks TODO warnung vorher
                MAIN.undoStack = [];
                MAIN.redoStack = [];
                MAIN.currentState = undefined;

                // Set button and cube title and tooltip
                $("#id_cubeButton").empty();
                $("#id_cubeButton").append("<span class=cube-button-text>" + label + "</span>");
                $("#id_cubeButton").append(" <span class='caret'></span>");
                $("#id_cubeButton").attr("title", label + ":\n\n" + comment); // tooltip
                $("#id_pageTitle").text(label); // set page title

                // Show a loading screen while ajax infos are loading (dimensions + entities and measures)
                // Pre-select up to 3 dimensions per default to begin with after the ajax calls are done
                INTERFACE.popupWhileAjax(showSomeData);

                // Enable dimension, measure and filter input
                $("#id_dimensionPanel").addClass("in");
                $("#id_dimensionPanel button").removeAttr("disabled");
                $("#id_measurePanel").addClass("in");
                $("#id_measurePanel button").removeAttr("disabled");
                $("#id_filterPanel").addClass("in");
                $("#id_filterPanel button").removeAttr("disabled");
                $("#id_acceptArea").addClass("in");

                // TODO immer prüfen, nur enabled wenn vorher action war
                $("#id_cancelButton").removeAttr("disabled");
                $("#id_applyButton").removeAttr("disabled");

                $("#id_undoButton").removeAttr("disabled"); // TODO erst wenn undo stack nicht leer -> immer prüfen!
                $("#id_redoButton").removeAttr("disabled");
                $("#id_mergeButton").removeAttr("disabled");

                // Disable the selected cube from list (and re-enable all others)
                $('[data-cube-name]').removeClass("disabled");
                $('[data-cube-name="' + cubeName + '"]').addClass("disabled");

            });

        });

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
        var colorItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Change Color...</a></li>');
        measureList.append('<li role="presentation" class="divider"></li>');
        measureList.append(filterItem);
        measureList.append(aggItem);
        measureList.append(colorItem);

        // Add item listeners
        filterItem.on("click", function (e) {
            // INFO: Only works with one measure
            INTERFACE.popupMeasureFilter(MAIN.measures[0]);
        });

        aggItem.on("click", function (e) {
            INTERFACE.popupMeasureAgg();
        });

        colorItem.on("click", function (e) {
            INTERFACE.popupMeasureColor();
        });


    };

    // TODO "addMeasureButton" erstmal nicht benutzt, da bug (?) in API und nur 1 measure möglich
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
        badge.addClass("ms-1"); // TODO different badge colors
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
//            TODO
            alert("TODO");
        });

        colorItem.on("click", function (e) {
//            TODO color picker?
            alert("TODO");
        });

        // Add event for removing the measure
        removeItem.on("click", function (e) {
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
            MAIN.entityList[dimensionName].list = MAIN.queryEntityList(dimensionName); // TODO hier ajax problem -> solved, aber blockierendes popup unschön
        });
        INTERFACE.fillDimensionList("x", MAIN.xDimensions);
        INTERFACE.fillDimensionList("y", MAIN.yDimensions);
        INTERFACE.fillDimensionList("z", MAIN.zDimensions);
    };

    // Adds a dimension button and its menu after the measure was selected.
    this.addDimensionButton = function (dimension, axis, dimensions) {
        var dimensionList = $("#id_" + axis + "DimensionList");
        var plusButton = $("#id_" + axis + "Plus");
        var buttonArea = $("#id_" + axis + "ButtonArea");

        var rollupIcon = dimension.rollup ? "glyphicon glyphicon-check" : "glyphicon glyphicon-unchecked";

        // Rebuild a dimension button and its menu
        var btnGroup = $('<div class="btn-group" data-dimension-name="' + dimension.dimensionName + '"></div>');
        var button = $('<a class="btn dropdown-toggle btn-default btn-sm" type="button" data-toggle="dropdown"></a>');
        var text = $('<span class=button-text>' + dimension.label + '</span>');
        var badge = $('<span class="badge"></span>');
        var menu = $('<ul class="dropdown-menu" role="menu"></ul>');
        var filterItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Select Entities...</a></li>');
        var drillItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#"><span class="' + rollupIcon + '"></span> Combine Entities</a></li>');

        var dividerItem = $('<li role="presentation" class="divider"></li>');
        var removeItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Remove</a></li>');

        // Combine button and list
        btnGroup.append(button);
        button.append(text);
        button.append(badge);

        // Set badge color to show grouping (rollup)
        if (dimension.rollup) {
            badge.css("background-color", MAIN.currentColor);
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

        menu.append(filterItem);
        menu.append(drillItem);
        menu.append(dividerItem);
        menu.append(removeItem);
        btnGroup.append(menu);

        buttonArea.append(btnGroup);
        buttonArea.append(" ");
        buttonArea.append(plusButton); // Move plus to end

        // Popup a modal for entity selection
        filterItem.on("click", function (e) {
            INTERFACE.popupEntitySelection(dimension);
        });

        // Add event for removing the dimension
        removeItem.on("click", function (e) {

            // TODO disable if last remaining dimension!

            // Delete from selected list
            $.each(dimensions, function (index1, dimension1) {
                if (dimension1.dimensionName === dimension.dimensionName) {
                    dimensions.splice(index1, 1);
                    return false;
                }
            });

            // Remove HTML button and list
            btnGroup.remove();

            // Re-enable all axis dropdown items of this dimension
            $('li[data-dimension-name="' + dimension.dimensionName + '"]').removeClass("disabled");

            // Update visualization and interface right away
            MAIN.applyOLAP();

            // TODO: update UI and disable/enable accept+cancel button

        });


        // TEMP for rollup test
        drillItem.on("click", function (e) {

            if (dimension.rollup) {
                drillItem.find(".glyphicon").removeClass("glyphicon-check");
                drillItem.find(".glyphicon").addClass("glyphicon-unchecked");
                badge.removeClass("ms-1");
                console.log("DRILLED DOWN", dimension);
            } else {
                drillItem.find(".glyphicon").removeClass("glyphicon-unchecked");
                drillItem.find(".glyphicon").addClass("glyphicon-check");
                badge.addClass("ms-1");
                console.log("ROLLED UP", dimension);
            }
            dimension.rollup = !dimension.rollup;

            // Update visualization and interface right away
            MAIN.applyOLAP();

        });





        // TODO Add drag and rop functionality to the button#####################


        // TODO button = dropzone + .insertAfter()


        button.attr("draggable", "true");
        button.on("dragstart", function (e) {
            console.log("EVENT:", e);
        });

        buttonArea.on("drop", function (e) {
            console.log("EVENT:", e);
            alert("DROP! " + e);
            e.preventDefault();

            // TODO  jquery -> .insertAfter()

        });

        buttonArea.on("dragover", function (e) {
            console.log("EVENT:", e);
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });





    };

    // Adds mouse events to a given result cube
    this.addCubeListeners = function (cube) {

        /*
         * Properties:
         *
         * cube.result;
         */

        var collectDimensions = function (dimensionList) {
            $.each(dimensionList, function (i, dimension) {
                var entity = MAIN.getEntityFromJson(cube.result, dimension);
                dimensions.push({
                    dimension: dimension.label,
                    entity: entity.label // TODO rollupLabels
                });
            });
        };
        var collectMeasures = function (measureList) {
            $.each(measureList, function (i, measure) {
                var value = MAIN.getMeasureValueFromJson(cube.result, measure);
                measures.push({
                    measure: measure.label,
                    value: value
                });
            });
        };

        // Gather dimension details from all axis
        var dimensions = [];
        collectDimensions(MAIN.xDimensions);
        collectDimensions(MAIN.yDimensions);
        collectDimensions(MAIN.zDimensions);

        // Gather measure informations
        var measures = [];
        collectMeasures(MAIN.measures);

        // Add click and hover events
        cube.onclick = function () {
            INTERFACE.popupResult(dimensions, measures);
        };
        cube.onmouseover = function () {
            WEBGL.highlightCube(cube);
            WEBGL.highlightLabels(cube);
        };
        cube.onmouseout = function () {
            WEBGL.resetCube(cube);
            WEBGL.resetLabels(cube);

            // TODO: reset matching labels (use normal font; -> standard texture)

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

        // TODO: if label.entity.rollupLabels -> kein / anderes onclick


        label.onmouseover = function () {
            // TODO show tooltip if too long label string or if zoomed out far
//            TODO: WEBGL.showTooltip(label.tooltip) // bzw label.entity.rollupLabels?

            $.each(label.sprites, function (i, sprite) {
//                sprite.showSelection();
                sprite.showRow(); // Show surrounding cube
            });


        };
        label.onmouseout = function () {
            $.each(label.sprites, function (i, sprite) {
                sprite.hideRow();
            });
        };
        label.onclick = function () {

            // TODO rollup-label darf nicht selektiert werden (oder stattdessen dimension-menu zeigen?)

//            if (label.entity.rollupLabels) {
//            } else {
//            }

            if (!label.toggled) {

                $.each(label.sprites, function (i, sprite) {
                    label.toSelected(); // highlight color
                    sprite.toggled = true;
                });

                // Create selection list if first entity
                if (!MAIN.tempSelection[dimensionName]) {
                    MAIN.tempSelection[dimensionName] = [];
                }

                // Add entity to temp selected list (only once)
                var index = MAIN.tempSelection[dimensionName].indexOf(label.entity);
                if (index === -1) {
                    MAIN.tempSelection[dimensionName].push(label.entity);
                }

                // Update hilighting of selected cubes
                WEBGL.highlightSelectedCubes();

            } else {
                $.each(label.sprites, function (i, sprite) {
                    label.toNormal();
                    sprite.toggled = false;
                });

                // Delete entity from temp selected list
                var index = MAIN.tempSelection[dimensionName].indexOf(label.entity);
                if (index !== -1) {
                    MAIN.tempSelection[dimensionName].splice(index, 1);
                }

                // Update hilighting of selected cubes
                WEBGL.highlightSelectedCubes();

            }
//            console.log("TempSelection", MAIN.tempSelection)
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

    };

    // Adds mouse events to the given dimension label
    this.addDimensionLabelListener = function (label, dimension) {

        // TODO

//        label.toggled = false;
//
//        label.onmouseover = function () {
//
//        };
//
//        label.onmouseout = function () {
//
//        };
//
//        label.onclick = function () {
//
//        };

    };

    // Toggles the measure scale between linear to logarithmic
    this.toggleScale = function (e) {
        if (MAIN.currentScale === MAIN.SCALE_LINEAR) {
            MAIN.currentScale = MAIN.SCALE_LOG;
            $("#id_scaleItem span").removeClass("glyphicon-unchecked");
            $("#id_scaleItem span").addClass("glyphicon-check");
        } else {
            MAIN.currentScale = MAIN.SCALE_LINEAR;
            $("#id_scaleItem span").removeClass("glyphicon-check");
            $("#id_scaleItem span").addClass("glyphicon-unchecked");
        }
        // TODO update viz (cubes / D3) without an olap step (so no undo redo) or (olap as undo)
        MAIN.applyOLAP(true);
    };


    // Enables tooltips and popovers for certain panels
    this.initTooltips = function () {

        // add the tooltip / popover content
        $("#id_infoCube").attr('data-content', "TODO CUBE TEXT");
        $("#id_infoDimension").attr('data-content', "TODO DIMENSION TEXT");
        $("#id_infoMeasure").attr('data-content', "TODO MEASURE TEXT");
        $("#id_infoFilter").attr('data-content', "TODO FILTER TEXT");

        // add tooltips
        $('[data-toggle="tooltip"]').tooltip();

        // add popovers
        $('[data-toggle="popover"]').popover();
    };

    // Shows a login popup to enter a user ID.
    this.popupLogin = function () {

        // Add popup to the body
        var modal = $(TEMPLATES.MODAL_LOGIN_TEMPLATE);
        $("body").append(modal);

        // Accept action of popup
        var submitLogin = function (e) {
            // Try to login the user with the given ID
            var id = $("#id_loginModalID").val();
            MAIN.loginUser(id);
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
        INTERFACE.popupLoadingScreen("Processing...");
        $(document).ajaxStop(function () { // TODO problematisch: nach ajax fehler cube wechseln -> kaputt
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
        var modal = $("#id_aggModal"); // TODO template instead...
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

    // Shows a popup for changing the measure aggregation
    this.popupMeasureColor = function () {
        var modal = $("#id_colorModal"); // TODO template instead...
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

                // TODO update viz (cubes / D3) without an olap step (so no undo redo) or (olap as undo)
                MAIN.applyOLAP(true);
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
    this.popupResult = function (dimensions, measures) {

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
            row.append("<td><b>" + dimension.entity + "</b></td>");
            table.append(row);
        });
        modalBody.append(table);

        // Add the measure data
        modalBody.append("<h4>Measures</h4>");
        var table = $("<table>");
        table.addClass("table table-bordered table-striped");
        $.each(measures, function (i, measure) {
            var row = $("<tr>");
            row.append("<td>" + measure.measure + "</td>");
            row.append("<td><b>" + INTERFACE.formatNumber(measure.value, 4) + "</b></td>");
            table.append(row);
        });
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
     * Shows a modal for entitySelection of a given dimension
     * @param {Dimension} dimension the dimension containing the entities
     */
    this.popupEntitySelection = function (dimension) {
        // Add popup to the body
        var modal = $(TEMPLATES.MODAL_DIMENSION_TEMPLATE.replace("__label__", dimension.label));
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

            // TODO nicht ganz bootstrap konform (row missing)
            var btnGroup = $('<div class="btn-group col-md-4 col-xs-12 entity-button" data-toggle="buttons"></div> ');
            var label = $('<label class="btn btn-default btn-xs ' + (MAIN.entityList[dimension.dimensionName][entity.entityName] ? 'active' : '') + '" title="' + entity.label + '"></label>');
            var button = $('<input type="checkbox" autocomplete="off"' + (MAIN.entityList[dimension.dimensionName][entity.entityName] ? 'checked' : '') + ' data-entity-name="' + entity.entityName + '" data-entity-label="' + entity.label + '">');

            // Combine the checkbox and add
            label.append(button);
            label.append(document.createTextNode(entity.label)); // escaping TODO überall
            btnGroup.append(label);
            $("#id_entityModalBody").append(btnGroup);
            $("#id_entityModalBody").append(" ");
        });

        // Set max modal height
        $("#id_entityModalBody").css("max-height", $(window).height() - 230 + "px");
        $("#id_entityModalBody").css("overflow-y", "scroll");

        // Accept action of popup
        $("#id_entityModalOkay").on("click", function (e) {

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
            $("input[data-entity-name]").each(function (i, element) {
                $(element).prop("checked", true);
                $(element).parent().addClass("active");
            });
            // TODO much warning, many entity
        });

        // Deselect all entities
        SelectNoneButton.on("click", function (e) {
            $("input[data-entity-name]").each(function (i, element) {
                $(element).prop("checked", false);
                $(element).parent().removeClass("active");
            });
            // TODO disable apply
        });

        // Select all entities
        SelectInvertButton.on("click", function (e) {
            $("input[data-entity-name]").each(function (i, element) {
                if ($(element).prop("checked")) {
                    $(element).prop("checked", false);
                    $(element).parent().removeClass("active");
                } else {
                    $(element).prop("checked", true);
                    $(element).parent().addClass("active");
                }
            });
        });

        // Select previous 10 entities (before first selected)
        SelectPrevButton.on("click", function (e) {
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
        });

        // Select next 10 entities (after last selected)
        SelectNextButton.on("click", function (e) {
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
        });

        // Select the first 10 entities again
        SelectDefaultButton.on("click", function (e) {
            $("input[data-entity-name]").each(function (i, element) {
                if (i < INTERFACE.NUM_ENTITIES) {
                    $(element).prop("checked", true);
                    $(element).parent().addClass("active");
                } else {
                    $(element).prop("checked", false);
                    $(element).parent().removeClass("active");
                }
            });
        });

        // Disable prev, next buttons if not enough entities
        if (MAIN.entityList[dimension.dimensionName].list.length <= INTERFACE.NUM_ENTITIES) {
            SelectPrevButton.prop("disabled", true);
            SelectNextButton.prop("disabled", true);
        }

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

        var modal = $("#id_filterModal"); // TODO template instead...
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
//            modalAcceptButton.text("Change Filter");
            modal.find(".modal-title").text("Change Filter");
        } else if (measure !== undefined) {
            var filterMeasure = measure; // Set first measure by default
        } else {
//            modalAcceptButton.text("Add Filter");
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

//                console.log("FILTERS:", MAIN.filters); // DEBUG
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

    // enables / disables the Apply button according to selected items
    this.refreshApplyButton = function () {
        // TODO: needed?
    };

    // Updates the whole interface (buttons, menus) according to the model data
    this.updateInterface = function () {

        // TODO

        // TODO enable / disable: Undo, Redo, Accept, Cancel, (cubes dimensions, measures, filters, + menus ?)

    };

    // Undo all selected labels and disable Accept button
    this.deselectAll = function () {
        // TODO cancel?
    };

    /**
     * Re-add the dimension buttons according to the current state
     */
    this.reinsertDimensionButtons = function () {

        // Re-create the dropdown menu for adding dimensions with the "+" button
        INTERFACE.fillDimensionList("x", MAIN.xDimensions);
        INTERFACE.fillDimensionList("y", MAIN.yDimensions);
        INTERFACE.fillDimensionList("z", MAIN.zDimensions);

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

        // TODO nur 1 measure, keine buttons
//        $.each(MAIN.measures, function (i, measure) {
//            INTERFACE.addMeasureButton(measure);
//        });

        // Change the measure (dropdown) button
        $("#id_measureButton").empty();
        $("#id_measureButton").append("<span class=cube-button-text>" + measure.label + "</span>");
        var badge = $('<span class="badge"></span>');
        badge.css("background-color", MAIN.currentColor);
//        badge.addClass("ms-1"); // TODO different badge colors

        // TODO auslesen von MAIN.currentAGG? #######################################
        badge.text(agg);

        $("#id_measureButton").append(badge);
        $("#id_measureButton").append(" <span class='caret'></span>");

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

        // TODO

    };

    // Updates the mouse position for webGL event handling
    // TODO: für mobile geräte: auch/nur bei click-event?
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
        var distance = 6; // TODO as CONSTANT! + darunter keine drehung
        if (Math.abs(x - INTERFACE.mouseDown.x) > distance || Math.abs(y - INTERFACE.mouseDown.y) > distance) {
            return;
        }

        WEBGL.mousePosition.x = (x / node.width()) * 2 - 1;
        WEBGL.mousePosition.y = -(y / node.height()) * 2 + 1;

        // execute click events
        WEBGL.handleClick();
    };

    // For distance limit of clicking
    this.onCanvasMouseDown = function (event) {
        event.preventDefault();

        var node = $(WEBGL.renderer.domElement);
        this.mouseDown.x = event.pageX - node.position().left;
        this.mouseDown.y = event.pageY - node.position().top;
    };

    // Shows an error message popup
    this.popupErrorMessage = function (text) {

        // TODO modal (template) with error sign

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
                $('li[data-dimension-name="' + dimensionName + '"]').addClass("disabled");

                // Get some pre-selected entities (first 10)
                var entities = MAIN.getFirstEntities(dimensionName, INTERFACE.NUM_ENTITIES); // ...
                var dimension = new Dimension(dimensionName, label, entities);
                dimensions.push(dimension); // add it to the list of selected dimensions

                // Add the dimension button with its menu and listeners
                INTERFACE.addDimensionButton(dimension, axis, dimensions);

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
        $("#id_cubeButton").append("<span class=cube-button-text> Select Cube </span>");
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
        var boxShadow = "0px 0px 8px rgba(102, 175, 233, 0.75)";
        var blinkDuration = 0.5;
        node.css("transition", blinkDuration + "s all ease");
        node.css("box-shadow", boxShadow);
        setTimeout(function () {
            node.css("box-shadow", "");
            setTimeout(function () {
                node.css("box-shadow", boxShadow);
                setTimeout(function () {
                    node.css("box-shadow", "");
                    setTimeout(function () {
                        node.css("transition", "");
                    }, blinkDuration * 1000);
                }, blinkDuration * 1000);
            }, blinkDuration * 1000);
        }, blinkDuration * 1000);
    };


    // Returns a string like 71.003.345 (adds points and comma)
    this.formatNumber = function (num, nrDigits) {
        // round numbers to 2 digits
        // TODO oft "x.66666666667"
        num = Math.round(num * nrDigits * 10) / (nrDigits * 10);
        // TODO add dots for thousand-steps
        return num;
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