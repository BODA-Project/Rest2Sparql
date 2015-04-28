/* global TEMPLATES, THREE, MAIN, WEBGL */

// Namespace for events and html interface code

var INTERFACE = new function () {

    this.NUM_ENTITIES = 10; // TODO: which ones? how many?

    // For interaction with 3D objects
    this.mouseDown = {};
    this.mousePressed = false;

    // ...
    this.disableInputInitially = function () {

        // Disable navigation input initially and set conditions of usage
        var opacity = 0.35;
        $("#id_cubePanel").css("opacity", opacity);
        $("#id_dimensionPanel").css("opacity", opacity);
        $("#id_measurePanel").css("opacity", opacity);
        $("#id_filterPanel").css("opacity", opacity);
        $("#id_applyButton").css("opacity", opacity);

//        $("#id_cubePanel").css("display", "none");
//        $("#id_dimensionPanel").css("display", "none");
//        $("#id_measurePanel").css("display", "none");
//        $("#id_filterPanel").css("display", "none");
//        $("#id_filterPanel").css("display", "none");
//        $("#id_applyButton").css("display", "none");

        $("#id_cubePanel button").attr("disabled", "disabled");
        $("#id_dimensionPanel button").attr("disabled", "disabled");
        $("#id_measurePanel button").attr("disabled", "disabled");
        $("#id_filterPanel button").attr("disabled", "disabled");
        $("#id_cancelButton").attr("disabled", "disabled");
        $("#id_applyButton").attr("disabled", "disabled");

        $("#id_undoButton").css("opacity", opacity);
        $("#id_redoButton").css("opacity", opacity);
        $("#id_undoButton").attr("disabled", "disabled");
        $("#id_redoButton").attr("disabled", "disabled");

        // TODO: ganz verstecken, nach und nach zeigen, popover hinzufügen

    };

    // ...
    this.addInterfaceListeners = function () {

        // Top bar
        $("#id_changeUserButton").on('click', MAIN.logoutUser.bind(MAIN));

        // Side bar TODO: cancel-button, + onchange -> update -> disable/enable
        $("#id_applyButton").on('click', MAIN.applyOLAP.bind(MAIN));

        // ...TODO

        // Filter area
        $("#id_filterPlus").on('click', function () {
            INTERFACE.popupMeasureFilter();
        });

        // Resize visualization on browser resize
        $(window).on('resize', WEBGL.resizeVizualisation.bind(WEBGL));

    };

    // Inits the cube dropdown lists and its listeners
    this.initCubeList = function (results) {

        // enable cube selection
        $("#id_cubePanel").css("opacity", "");
        $("#id_cubePanel button").removeAttr("disabled");

        // but disable the rest TODO: nacheinander fade-in + popover ODER default werte (dimensions) besetzen
        var opacity = 0.35;
        $("#id_dimensionPanel").css("opacity", opacity);
        $("#id_measurePanel").css("opacity", opacity);
        $("#id_filterPanel").css("opacity", opacity);
        $("#id_applyButton").css("opacity", opacity);

        $("#id_undoButton").css("opacity", opacity);
        $("#id_redoButton").css("opacity", opacity);

        $("#id_dimensionPanel button").attr("disabled", "disabled");
        $("#id_measurePanel button").attr("disabled", "disabled");
        $("#id_filterPanel button").attr("disabled", "disabled");
        $("#id_applyButton").attr("disabled", "disabled");

        $("#id_undoButton").attr("disabled", "disabled");
        $("#id_redoButton").attr("disabled", "disabled");


        // Iterate through available cubes and fill the list
        $.each(results, function (index, element) {
            var cubeName = element.CUBE_NAME.value;
            var comment = element.COMMENT.value; // TODO as tooltip? / "information area"
            var label = element.LABEL.value;

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

                // Set button title and current cube URI
                $("#id_cubeButton").empty();
                $("#id_cubeButton").append("<span class=cube-button-text>" + label + "</span>");
                $("#id_cubeButton").append(" <span class='caret'></span>");
                $("#id_cubeButton").attr("title", label + ":\n\n" + comment); // tooltip
                $("#id_pageTitle").text("Cube: " + label); // set page title        TODO needed? smaller??
                MAIN.currentCube = cubeName; // TODO Cube object?

                // Query available dimensions and measures and fill the lists
                MAIN.loadDimensionList();
                MAIN.loadMeasureList();

                // Reset filters
                MAIN.filters = [];
                INTERFACE.clearFilters();

                // Show a loading screen while ajax infos are loading (dimensions + entities and measures)
                // Pre-select up to 3 dimensions per default to begin with after the ajax calls are done
                INTERFACE.popupWhileAjax(showSomeData);

                // TODO: nacheinander + popover anzeigen / verstecken!
                // TDOD: oder: einfach alles mit default werten befüllen (dimensionen, measures) -> welche? wieviele?

                // TEST: popover of dimension panel
                $("#id_dimensionPanel").popover("show");

                // Enable dimension, measure and filter input
                // TODO nacheinander, oder: siehe oben...
                $("#id_dimensionPanel").css("opacity", "");
                $("#id_dimensionPanel button").removeAttr("disabled");
                $("#id_measurePanel").css("opacity", "");
                $("#id_measurePanel button").removeAttr("disabled");
                $("#id_filterPanel").css("opacity", "");
                $("#id_filterPanel button").removeAttr("disabled");

                $("#id_applyButton").css("opacity", "");
                $("#id_applyButton").removeAttr("disabled");

                $("#id_undoButton").css("opacity", "");
                $("#id_redoButton").css("opacity", "");
                $("#id_undoButton").removeAttr("disabled"); // TODO erst wenn undo stack nicht leer -> immer prüfen!
                $("#id_redoButton").removeAttr("disabled");

                // Disable the selected cube from list (and re-enable all others)
                $('[data-cube-name]').removeClass("disabled");
                $('[data-cube-name="' + cubeName + '"]').addClass("disabled");

            });


            // Initially select 1st cube in list
//            if (results.length > 0) {
//                var cubeName = results[0].CUBE_NAME.value;
//                var label = results[0].LABEL.value;
//                $("#id_cubeButton").text(label);
//                $("#id_cubeButton").append(" <span class='caret'></span>");
//                currentCube = cubeName;
//            }

        });

    };

    // Inits the measure dropdown list and its listeners
    this.initMeasureList = function (results) {

        // Clear old measure list
        $("#id_measureList").empty();

        var measureList = $("#id_measureList");

        // Iterate through available measures
        $.each(results, function (index, element) {
            var measureName = element.MEASURE_NAME.value;
            var label = element.LABEL.value;

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
                $('[data-measure-name="' + measureName + '"]').addClass("disabled"); // TODO enough?

                // TODO: if only 1 measure -> autoselect it!

                // Add measure to selected list
                var addedMeasure = new Measure(measureName, label, "sum");
                MAIN.measures = []; // TEMP only one measure? #####
                MAIN.measures.push(addedMeasure);

                // Change the measure (dropdown) button
                $("#id_measureButton").empty();
                $("#id_measureButton").append("<span class=cube-button-text>" + label + "</span>");
                var badge = $('<span class="badge"></span>');
                badge.addClass("ms-1"); // TODO different badge colors

                // TODO auslesen von MAIN.currentAGG? #######################################
                badge.text("SUM"); // TODO badge ID -> später agg ändern + toUppercase

                $("#id_measureButton").append(badge);
                $("#id_measureButton").append(" <span class='caret'></span>");

                // Disable the selected measure from list (and re-enable all others)
                $('[data-measure-name]').removeClass("disabled");
                $('[data-measure-name="' + measureName + '"]').addClass("disabled");

                // Add a measure button and its listeners
//                this.addMeasureButton(addedMeasure); // TEMP nicht nötig bei nur 1 measure

            }.bind(this));

        }.bind(this));



        // Include other measure options like color and aggregation
        var filterItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Add Filter...</a></li>');
        var aggItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Change Aggregation...</a></li>');
        var colorItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Change Color...</a></li>');
        measureList.append('<li role="presentation" class="divider"></li>');
        measureList.append(filterItem);
        measureList.append(aggItem);
        measureList.append(colorItem);

        // Add item listeners
        aggItem.on("click", function (e) {
//            TODO
            alert("TODO");
        });

        colorItem.on("click", function (e) {
//            TODO color picker?
            alert("TODO");
        });



    };

    // TODO "addMeasureButton" erstmal nicht benutzt, da bug (?) in API und nur 1 measure möglich

    // Adds a measure button and its menu after the measure was selected.
    // TODO: measure kann manipuliert werden (agg setzen)!!!
    this.addMeasureButton = function (measure) {
        var plusButton = $("#id_measurePlus");
        var buttonArea = $("#id_measureButtonArea");
        var buttonID = createUniqueID(10); // ID for the HTML element

        // Rebuild a measure button and its menu
        var btnGroup = $('<div class="btn-group" id="' + buttonID + '"></div>');
        var button = $('<button class="btn dropdown-toggle btn-default" type="button" data-toggle="dropdown"></button>');
        var text = $('<span class=button-text>' + measure.label + '</span>');
        var badge = $('<span class="badge"></span>');
        var menu = $('<ul class="dropdown-menu" role="menu"></ul>');
        var aggItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Change Aggregation...</a></li>');
        var colorItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Change Color...</a></li>');
        var hideItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Hide</a></li>');
        var dividerItem = $('<li role="presentation" class="divider"></li>');
        var removeItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Remove</a></li>');

        // Combine button and list
        btnGroup.append(button);
        button.append(text);
        button.append(badge);
        badge.addClass("ms-1"); // TODO different badge colors
        badge.text("SUM"); // TODO badge ID -> später agg ändern + toUppercase
        menu.append(aggItem);
        menu.append(colorItem);
        menu.append(hideItem);
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

        // TODO: needed?
        hideItem.on("click", function (e) {
//            TODO
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
            $("#" + buttonID).remove();

            // Re-enable the menu item
            $('[data-measure-name="' + measure.measureName + '"]').removeClass("disabled"); // TODO enough?

            // TODO: update UI and disable/enable accept+cancel button

        });
    };


    // Inits the dimension dropdown lists and its listeners
    this.initDimensionLists = function (results) {

        // Empty selected dimensions lists
        MAIN.xDimensions = [];
        MAIN.yDimensions = [];
        MAIN.zDimensions = [];

        // Clear old dimension lists and selected dimensions first
        INTERFACE.clearDimensions();

        // Load the list of available entities for each dimension
        $.each(results, function (index, dimension) {
            var dimensionName = dimension.DIMENSION_NAME.value;
            MAIN.entityList[dimensionName] = MAIN.queryEntityList(dimensionName); // TODO hier ajax problem -> solved, aber blockierendes popup unschön
        });
        fillDimensionList("x", MAIN.xDimensions, results);
        fillDimensionList("y", MAIN.yDimensions, results);
        fillDimensionList("z", MAIN.zDimensions, results);
    };

    // Adds a dimension button and its menu after the measure was selected.
    this.addDimensionButton = function (dimension, axis, dimensions) {

        var dimensionList = $("#id_" + axis + "DimensionList");
        var plusButton = $("#id_" + axis + "Plus");
        var buttonArea = $("#id_" + axis + "ButtonArea");


        // IDs for the HTML elements
        var buttonID = createUniqueID(10);
        var badgeID = createUniqueID(10);

        // TODO: count entities to be displayed as selected in badge

        // Rebuild a dimension button and its menu
        var btnGroup = $('<div class="btn-group" id="' + buttonID + '"></div>');
        var button = $('<a class="btn dropdown-toggle btn-default" type="button" data-toggle="dropdown"></a>');
        var text = $('<span class=button-text>' + dimension.label + '</span>');
        var badge = $('<span class="badge" id="' + badgeID + '"></span>');
        var menu = $('<ul class="dropdown-menu" role="menu"></ul>');
        var filterItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Filter Entities...</a></li>');
        var drillItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#"><span class="glyphicon glyphicon-unchecked"></span> Group Entities</a></li>');

//        <span class="glyphicon glyphicon-check"></span>
//        <span class="glyphicon glyphicon-unchecked"></span>
//
//        var drillItem = $('<li role="presentation"><label role="menuitem"><input type="checkbox" autocomplete="off"> Rollup </label></li>');


        var dividerItem = $('<li role="presentation" class="divider"></li>');
        var removeItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Remove</a></li>');

        // Combine button and list
        btnGroup.append(button);
        button.append(text);
        button.append(badge);

        var numEntities = MAIN.entityList[dimension.dimensionName].length;
        var badgeNum = Math.min(INTERFACE.NUM_ENTITIES, numEntities);
        badge.text(badgeNum + " / " + numEntities);

        menu.append(filterItem);
        menu.append(drillItem);
        menu.append(dividerItem);
        menu.append(removeItem);
        btnGroup.append(menu);

        buttonArea.append(btnGroup);
        buttonArea.append(" ");
        buttonArea.append(plusButton); // Move plus to end


        // TODO CLEANUP!!!
        // TODO keep filter in sync with other slicing/dicing on canvas!
        filterItem.on("click", function (e) {

            // Add popup to the body
            var modal = $(TEMPLATES.MODAL_DIMENSION_TEMPLATE.replace("__label__", dimension.label));
            $("body").append(modal);

//                        console.log(dimensionName, entitiyList[dimensionName])

            // Add all entities to the popup body
            $.each(MAIN.entityList[dimension.dimensionName], function (index, entity) {

                // TODO nicht ganz bootstrap konform (row missing)
                var btnGroup = $('<div class="btn-group col-md-4 col-xs-12 entity-button" data-toggle="buttons"></div> ');
                var label = $('<label class="btn btn-default btn-xs ' + (MAIN.entityList[dimension.dimensionName][entity.entityName] ? 'active' : '') + '" title="' + entity.label + '"></label>');
                var button = $('<input type="checkbox" autocomplete="off"' + (MAIN.entityList[dimension.dimensionName][entity.entityName] ? 'checked' : '') + ' data-entity-name="' + entity.entityName + '" data-entity-label="' + entity.label + '">');

                // Combine the checkbox and add
                label.append(button);
                label.append(document.createTextNode(entity.label));
                btnGroup.append(label);
                $("#id_modalBody").append(btnGroup);
                $("#id_modalBody").append(" ");
            });

            // Set max modal height
            $("#id_modalBody").css("max-height", $(window).height() - 210 + "px");
            $("#id_modalBody").css("overflow-y", "scroll");

            // Accept action of popup
            $("#id_modalOkay").on("click", function (e) {

                // TODO diverse sonderfälle...

                // TODO apply selected entities
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

                // Update the badge and set request entity list
                if (newEntities.length === MAIN.entityList[dimension.dimensionName].length) {
                    dimension.entities = []; // causes no fix at all, all entities are included
                } else {
                    dimension.entities = newEntities; // TEMP unschön aber geht
                }
                $("#" + badgeID).text(newEntities.length + " / " + MAIN.entityList[dimension.dimensionName].length); // TODO (0 / X)
            });

            // Pause rendering in background
            WEBGL.stopRendering();

            // Show the popup
            $("#id_modal").modal();

            // Remove when finished
            modal.on('hidden.bs.modal', function (e) {
                modal.remove();

                // Resume rendering again
                WEBGL.resumeRendering();
            });

        });

        // Add event for removing the dimension
        removeItem.on("click", function (e) {

            // Delete from selected list
            $.each(dimensions, function (index1, dimension1) {
                if (dimension1.dimensionName === dimension.dimensionName) {
                    dimensions.splice(index1, 1);
                    return false;
                }
            });

            // Remove HTML button and list
            $("#" + buttonID).remove();

            // Re-enable all axis dropdown items of this dimension
            $('[data-dimension-name="' + dimension.dimensionName + '"]').removeClass("disabled");

            // TODO: update UI and disable/enable accept+cancel button

        });




        // TEMP for rollup test
        drillItem.on("click", function (e) {

            if (dimension.rollup) {
                drillItem.find(".glyphicon").removeClass("glyphicon-check");
                drillItem.find(".glyphicon").addClass("glyphicon-unchecked");
                console.log("DRILLED DOWN", dimension);
            } else {
                drillItem.find(".glyphicon").removeClass("glyphicon-unchecked");
                drillItem.find(".glyphicon").addClass("glyphicon-check");
                console.log("ROLLED UP", dimension);
            }
            dimension.rollup = !dimension.rollup;

        });





        // TODO Add drag and rop functionality to the button#####################


        // TODO


        button.attr("draggable", "true");
        button.on("dragstart", function (e) {
            console.log("EVENT:", e);
        });

        buttonArea.on("drop", function (e) {
            console.log("EVENT:", e);
            alert("DROP! " + e);
            e.preventDefault();

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
                    entity: entity.label
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

        label.toggled = false;

        label.onmouseover = function () {
            if (!label.toggled) {
                label.toBold();
            }
            // TODO show tooltip if too long label string
            // TODO show pre-selected cubes matching the label for later selection (or a big slice around them)

        };
        label.onmouseout = function () {
            if (!label.toggled) {
                label.toNormal();
            }
            // TODO hide ...
        };


        label.onclick = function () {

            // TEST: hier immer nur 1 dimension
//            toggleSelectEntity(entity); // TODO andersrum! man will ja NUR die ausgewählten haben! -> zweite auswalhmenge, die bevorzugen

//            console.log("ENTITY ", label.entity, "LABEL", label)

            if (!label.toggled) {

                $.each(label.sprites, function (i, sprite) {
                    sprite.showSelection();
                    sprite.toggled = true;
                });

                // TODO: add entity to temp selection + SYNC with panel config

                MAIN.entityList[label.entity.dimensionName][label.entity.entityName] = true;

                // TODO: MAIN.xyzDimensions[i].entities = [...]


            } else {
                $.each(label.sprites, function (i, sprite) {
                    sprite.hideSelection();
                    sprite.toggled = false;
                });

                MAIN.entityList[label.entity.dimensionName][label.entity.entityName] = false;


                // TODO remove from temp selection

            }
        };

        label.showSelection = function () {
            label.toSelected(); // highlight color
            WEBGL.addSelectionCube(label);

            // TEST (X) Transparency

//            $.each(WEBGL.scene.children, function (i,obj){
//               if(obj.position.x === label.position.x && obj.material){
//                   obj.material.transparent = true;
//                   obj.material.opacity = 0.25;
//               }
//            });



        };

        label.hideSelection = function () {
            label.toNormal(); // highlight color // TODO: to previous?
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

    // Enables tooltips and popovers for certain panels
    this.enableTooltips = function () {
        // add tooltips
//        $('[data-toggle="tooltip"]').tooltip();

        // add popovers
        $(function () {
            $('[data-toggle="popover"]').popover();
        });
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

            // TEMP for testing purpose ########################################
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
        this.popupLoadingScreen("Processing...");
        $(document).ajaxStop(function () {
            console.log("DEBUG: all ajax done");
            $(document).off('ajaxStop'); // remove handler

            // Remove loading screen
            $('#id_loadingModal').modal('hide');

            // Execute given callback function
            if (callback) {
                callback();
            }
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
            row.append("<td><b>" + measure.value + "</b></td>");
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

    // Shows a popup for adding a measure filter
    this.popupMeasureFilter = function (measure, filter, buttonGroup) {

        /* measure, filter and badge are optional */

        var modal = $("#id_filterModal"); // TODO template instead...
        $("body").append(modal);

        var modalBody = $("#id_filterModalBody");
        var modalMeasureButton = $("#id_filterMeasureButton");
        var modalMeasureList = $("#id_filterMeasureList");
        var modalRelationButton = $("#id_filterRelationButton");
        var modalRelationList = $("#id_filterRelationList");
        var modalInput = $("#id_filterValue");
        var modalAcceptButton = $("#id_filterOkay");

        // Filter variables
        var filterMeasure = MAIN.availableMeasures[0];
        var filterRelation = MAIN.RELATIONS[0].type;
        var filterValue = 0; // Default input value: 0

        // read optional parameters as default values (e.g. to edit a given filter)
        if (filter !== undefined) {
            filterMeasure = filter.measure;
            filterRelation = filter.relation;
            filterValue = filter.value;
            modalAcceptButton.text("Change Filter");
        } else if (measure !== undefined) {
            var filterMeasure = measure; // Set first measure by default
        } else {
            modalAcceptButton.text("Add Filter");
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

                // Change the measure (dropdown) button
                modalMeasureButton.empty();
                modalMeasureButton.text(measure.label + " ");
                modalMeasureButton.append(" <span class='caret'></span>");

            }.bind(this));
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

                // Change the measure (dropdown) button
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

                // Disable button to avoid multiple adding
                modalAcceptButton.attr("disabled", "disabled");

                // Change given filter or create new one
                if (filter !== undefined) {
                    filter.measure = filterMeasure;
                    filter.relation = filterRelation;
                    filter.value = filterValue;

                    // Change old button text
                    var relationLabel = getRelationLabel(filter.relation);
                    var textField = buttonGroup.find(".filter-button-text");
                    var badge = buttonGroup.find(".badge");
                    textField.text(filterMeasure.label);
                    badge.text(relationLabel + " " + filterValue);
                } else {
                    filter = new Filter(filterMeasure, filterRelation, filterValue);
                    MAIN.filters.push(filter);
                    INTERFACE.addFilterButton(filter);
                }


                console.log("FILTER:", filter); // DEBUG



                modal.modal("hide");

                // add a filter button

            }
        });

        // Pause rendering in background
        WEBGL.stopRendering();

        // Show the popup
        modal.modal();

        // Remove when finished
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
        var button = $('<button class="btn dropdown-toggle btn-default" type="button" data-toggle="dropdown"></button>');
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
            this.mousePressed = true;
        } else {
            this.mousePressed = false;
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
        if (Math.abs(x - this.mouseDown.x) > distance || Math.abs(y - this.mouseDown.y) > distance) {
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

        // TODO modal with error sign

    };


    // HELP FUNCTIONS ==========================================================


    // Add list for X, Y, Z axis
    var fillDimensionList = function (axis, dimensions, results) {
        var dimensionList = $("#id_" + axis + "DimensionList");
        var plusButton = $("#id_" + axis + "Plus");
        var buttonArea = $("#id_" + axis + "ButtonArea");

        // Iterate through available dimensions
        $.each(results, function (index, element) {
            var dimensionName = element.DIMENSION_NAME.value;
            var label = element.LABEL.value;

            // Create Dropdown entries
            var itemLink = $("<a role='menuitem' tabindex='-1' href='#'></a>");
            itemLink.text(label);
            var item = $("<li role='presentation' data-dimension-name='" + dimensionName + "'></li>");
            item.append(itemLink);
            dimensionList.append(item);

            // Add on-click handler for chosen dimension
            itemLink.on("click", function (e) {
                e.preventDefault();

                // TODO: hide dimension popover / ganz weg? -> keine popover mehr, info-signs
                $("#id_dimensionPanel").popover("hide");
//                $("#id_measurePanel").popover("show"); // TEMP disabled

                // Only add once, disable menu item
                if (isSelectedDimension(dimensionName)) {
                    return;
                }
                $('[data-dimension-name="' + dimensionName + '"]').addClass("disabled"); // TODO enough?

                // TODO mark in entitiyList[dimensionName][entityName] as checked

                var entities = MAIN.getFirstEntities(MAIN.entityList, dimensionName, INTERFACE.NUM_ENTITIES); // ...
                var dimension = new Dimension(dimensionName, label, entities);
                dimensions.push(dimension); // add it to the list of selected dimensions

                // Add the dimension button with its menu and listeners
                INTERFACE.addDimensionButton(dimension, axis, dimensions);

            });
        });
    };

    // Clears selected dimensions and dropdown lists
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

    // Clears selected filters
    this.clearFilters = function () {
        var plus = $("#id_filterPlus");
        $("#id_filterButtonArea > *").detach();
        $("#id_filterButtonArea").append(plus); // Re-attach adding button
    };


    // Select some dimensions and a measure and visualize them right away
    var showSomeData = function () {

        // Dimensions
        $("#id_xDimensionList > li:nth-child(1) > a").click(); // Preselect X
        $("#id_yDimensionList > li:nth-child(2) > a").click(); // Preselect Y
        $("#id_zDimensionList > li:nth-child(3) > a").click(); // Preselect Z

        // Measures
        $("#id_measureList > li:nth-child(1) > a").click(); // Preselect measure

        // Visualize!
        MAIN.applyOLAP();

        // TODO: updateUI() // check states for undo/redo/cancel/apply/...

    }.bind(this);

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

    // Creates a pseudo random unique ID for HTML elements
    var createUniqueID = function (length) {
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var result = '';
        for (var i = length; i > 0; --i) {
            result += chars[Math.round(Math.random() * (chars.length - 1))];
        }
        return "id_" + result;
    };

};