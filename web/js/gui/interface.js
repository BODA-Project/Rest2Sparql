/* global TEMPLATES, THREE, MAIN, WEBGL */

// Namespace for events and html interface code

var INTERFACE = new function () {

    // For interaction with 3D objects
    this.intersected;
    this.mouseDown = {};

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

        // Side bar
        $("#id_applyButton").on('click', MAIN.applyOLAP.bind(MAIN));

        // ...TODO

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

                // Set button title and current cube URI
                $("#id_cubeButton").text(label);
                $("#id_pageTitle").text("Cube: " + label); // set page title
                $("#id_cubeButton").attr("title", label + ":\n\n" + comment); // tooltip
                $("#id_cubeButton").append(" <span class='caret'></span>");
                MAIN.currentCube = cubeName; // TODO Cube object?

                // Show a loading screen while ajax infos are loading (dimensions + entities and measures)
                INTERFACE.popupWhileAjax();

                // Query available dimensions and measures and fill the lists
                MAIN.loadDimensionList();
                MAIN.loadMeasureList();

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
                MAIN.measures.push(addedMeasure);

                // Add a measure button and its listeners
                this.addMeasureButton(addedMeasure);

            }.bind(this));

        }.bind(this));
    };

    // Adds a measure button and its menu after the measure was selected.
    // TODO: measure kann manipuliert werden (agg setzen)!!!
    this.addMeasureButton = function (measure) {
        var plusButton = $("#id_measurePlus");
        var buttonArea = $("#id_measureButtonArea");
        var buttonID = createUniqueID(10); // ID for the HTML element

        // Rebuild a measure button and its menu
        var btnGroup = $('<div class="btn-group" id="' + buttonID + '"></div>');
        var button = $('<button class="btn dropdown-toggle btn-default" type="button" data-toggle="dropdown"></button>');
        var badge = $('<span class="badge"></span>');
        var menu = $('<ul class="dropdown-menu" role="menu"></ul>');
        var aggItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Change Aggregation...</a></li>');
        var colorItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Change Color...</a></li>');
        var hideItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Hide</a></li>');
        var dividerItem = $('<li role="presentation" class="divider"></li>');
        var removeItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Remove</a></li>');

        // Combine button and list
        btnGroup.append(button);
        button.text(measure.label + " ");
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

        // Clear old dimension lists first
        $("#id_xDimensionList").empty();
        $("#id_yDimensionList").empty();
        $("#id_zDimensionList").empty();

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

        var num = 20; // number of preselected entities, TODO: variable? constant? and which ones?

        var dimensionList = $("#id_" + axis + "DimensionList");
        var plusButton = $("#id_" + axis + "Plus");
        var buttonArea = $("#id_" + axis + "ButtonArea");


        // IDs for the HTML elements
        var buttonID = createUniqueID(10);
        var badgeID = createUniqueID(10);

        // TODO: count entities to be displayed as selected in badge

        // Rebuild a dimension button and its menu
        var btnGroup = $('<div class="btn-group" id="' + buttonID + '"></div>');
        var button = $('<button class="btn dropdown-toggle btn-default" type="button" data-toggle="dropdown"></button>');
        var badge = $('<span class="badge" id="' + badgeID + '"></span>');
        var menu = $('<ul class="dropdown-menu" role="menu"></ul>');
        var filterItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Filter Entities...</a></li>');
        var dividerItem = $('<li role="presentation" class="divider"></li>');
        var removeItem = $('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Remove</a></li>');

        // Combine button and list
        btnGroup.append(button);
        button.text(dimension.label + " ");
        button.append(badge);

        var numEntities = MAIN.entityList[dimension.dimensionName].length;
        var badgeNum = Math.min(num, numEntities);
        badge.text(badgeNum + " / " + numEntities);

        menu.append(filterItem);
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
                $("#" + badgeID).text(newEntities.length + " / " + MAIN.entityList[dimension.dimensionName].length);
            });

            // Show the popup
            $("#id_modal").modal();

            // Remove when finished
            modal.on('hidden.bs.modal', function (e) {
                modal.remove();
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


    };

    // Adds mouse events to a given result cube TODO sauberes result model!!!!!!!!
    this.addCubeListeners = function (cube, result) {

        cube.onclick = function () {

            // TODO show clear popup with correct labels ...
            // TODO iterate through xyzDimensions, MAIN.getEntityFromJson, get labels, ...

//            foreach... dimension -> +=str
//            MAIN.getEntityFromJson(result, dimension);

            var str = "TODO";
//            $.each(dimensionNumbers, function (key, number) {
//                str += "Dim #" + key + ": ";
//                str += result["L_NAME_" + number + "_AGG"].value;
//                str += "\n";
//            });
//            $.each(measureNumbers, function (key, number) {
////                        str += result["M_NAME_" + number + "_AGG"].value; // TODO
//                str += "Euro"; // TODO: measure label fehlt immer :C also von anfrage nehmen, oder in api ändern
//                str += ": ";
//                str += measureVals[key]; // TODO format nicely
//                str += "\n";
//            });
            alert(str); // TEMP
            //
//            INTERFACE.popupResult(str);
        };

        cube.onmouseover = function () {
            WEBGL.highlightCube(cube);

            // TODO: TOOLTIP schon bei hover? oder erst bei click?
            // TODO: highlight matching labels (use bold font; -> alternative texture)

//            WEBGL.highlightLabels(result); // TODO labelMap -> to bold font

        };

        cube.onmouseout = function () {
            WEBGL.resetCube(cube);

            // TODO: reset matching labels (use normal font; -> standard texture)
//            WEBGL.resetLabels(result); // TODO labelMap -> to normal font

        };

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
        $("#id_loginModalOkay").on("click", function (e) {

            // Try to login the user with the given ID
            var id = $("#id_loginModalID").val(); // TODO ungültige werte...
            MAIN.loginUser(id);
        });

        // Show the popup
        $('#id_loginModal').modal({
            backdrop: 'static',
            keyboard: false
        });

        // Focus input field
        modal.on('shown.bs.modal', function (e) {
            $('#id_loginModalID').focus(); // TODO geht nicht :C

            // TEMP for testing purpose ########################################
            $('#id_loginModalID').val("8023903");


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
    this.popupWhileAjax = function () {
        this.popupLoadingScreen("Processing...");
        $(document).ajaxStop(function () {
            console.log("DEBUG: all ajax done");
            $(document).off('ajaxStop'); // remove handler

            // Remove loading screen
            $('#id_loadingModal').modal('hide');
        });
    };

    // enables / disables the Apply button according to selected items
    this.refreshApplyButton = function () {
        // TODO: needed?
    };

    // Undo all selected labels and disable Accept button
    this.deselectAll = function () {
        // TODO
    };


    // Executes movement events on the WebGL canvas. Tries to execute objects <onmouseover> and <onmouseout> events.
    //
    // TODO: für mobile geräte: auch/nur bei click-event?
    this.onCanvasMouseMove = function (event) {
        event.preventDefault();

        // only highlight results if no mouse buttons pressed
        var button = event.buttons === undefined ? event.which || event.button : event.buttons; // TODO check IE10+
//        console.log("MOVE", event.buttons, event.which, event.button);
        if (button !== 0) {
            return;
        }

        var node = $(WEBGL.renderer.domElement);
        var x = event.pageX - node.position().left;
        var y = event.pageY - node.position().top;

        var mousePosition = new THREE.Vector3();
        mousePosition.x = (x / node.width()) * 2 - 1;
        mousePosition.y = -(y / node.height()) * 2 + 1;
        mousePosition.z = 0.5;

        // project mouse to 3d scene
        var vect = mousePosition.unproject(WEBGL.camera);
        var direction = vect.sub(WEBGL.camera.position).normalize();
        var rayCaster = new THREE.Raycaster(WEBGL.camera.position, direction);
        var intersections = rayCaster.intersectObjects(WEBGL.scene.children); // TODO erstmal so, inperformant aber geht
        if (intersections.length > 0) {

            // Only call once while hovering one object
            if (this.intersected !== intersections[0].object) {
//            console.log(intersections[0])

                if (this.intersected && this.intersected.onmouseout !== undefined) {
//                console.log(intersected)
                    this.intersected.onmouseout();
                }

                // Grab new intersection object
                this.intersected = intersections[0].object;
                if (this.intersected.onmouseover !== undefined) {
                    this.intersected.onmouseover();
                }
            }
            WEBGL.renderer.domElement.style.cursor = 'pointer'; // Set cursor to hand
        } else if (this.intersected) {
            // Not hovering above anything anymore
            if (this.intersected.onmouseout !== undefined) {
                this.intersected.onmouseout();
            }

            // Forget last intersection
            this.intersected = null;
            WEBGL.renderer.domElement.style.cursor = 'auto'; // Set cursor to normal
        }

    };

    // Executes click events on the WebGL canvas
    this.onCanvasMouseClick = function (event) {
        event.preventDefault();

        // only highlight results if no mouse buttons pressed

        var node = $(WEBGL.renderer.domElement);
        var x = event.pageX - node.position().left;
        var y = event.pageY - node.position().top;

        // cancel if dragged a certain min distance
        var distance = 6; // TODO as CONSTANT!
        if (Math.abs(x - this.mouseDown.x) > distance || Math.abs(y - this.mouseDown.y) > distance) {
            return;
        }

        var mousePosition = new THREE.Vector3();
        mousePosition.x = (x / node.width()) * 2 - 1;
        mousePosition.y = -(y / node.height()) * 2 + 1;
        mousePosition.z = 0.5;

        // project mouse to 3d scene
        var vect = mousePosition.unproject(WEBGL.camera);
        var direction = vect.sub(WEBGL.camera.position).normalize();
        var rayCaster = new THREE.Raycaster(WEBGL.camera.position, direction);
        var intersections = rayCaster.intersectObjects(WEBGL.scene.children);
        if (intersections.length > 0) {
            // TODO: only if no disabled flag set (?)
            if (intersections[0].object.onclick !== undefined) {
                intersections[0].object.onclick();
            }
        }
    };

    // For distance limit of clicking
    this.onCanvasMouseDown = function (event) {
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

                // TODO: enable MEASURE input, hide dimension popover, show measure popover (first time only)
                // TODO correct placement below panel (after adding dimension field)
                $("#id_dimensionPanel").popover("hide");
//                $("#id_measurePanel").popover("show"); // TEMP disabled

                // Only add once, disable menu item
                if (isSelectedDimension(dimensionName)) {
                    return;
                }
                $('[data-dimension-name="' + dimensionName + '"]').addClass("disabled"); // TODO enough?

                var num = 20; // number of preselected entities, TODO: variable? constant? which ones?

                // TODO mark in entitiyList[dimensionName][entityName] as checked

                var entities = MAIN.getFirstEntities(MAIN.entityList, dimensionName, num); // ...
                var dimension = new Dimension(dimensionName, label, entities);
                dimensions.push(dimension);

                // Add the dimension button with its menu and listeners
                this.addDimensionButton(dimension, axis, dimensions);

            }.bind(this));
        }.bind(this));
    }.bind(this);

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