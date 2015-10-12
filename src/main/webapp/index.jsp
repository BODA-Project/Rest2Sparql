<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="RDF Datacube Visualization">
        <link rel="shortcut icon" href="img/favicon_3.png">

        <title>REST 2 SPARQL | OLAP</title>

        <!-- CSS -->
        <link href="css/bootstrap/bootstrap.min.css" rel="stylesheet">
        <link href="css/bootstrap/bootstrap-theme.min.css" rel="stylesheet">
        <link href="css/jquery/jquery-ui.css" rel="stylesheet">
        <link href="css/c3/c3.min.css" rel="stylesheet">
        <link href="css/gui/olap/main.css" rel="stylesheet">

    </head>
    <body>

        <!-- Navigation -->
        <nav class="navbar navbar-default navbar-static-top" role="navigation">

            <div class="navbar-header">
                <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand" href="./">Rest2Sparql</a>

            </div>

            <div class="collapse navbar-collapse">
                <div class="navbar-right">
                    <button type="button" class="btn btn-link btn-sm navbar-btn" disabled="disabled" id="id_undoButton">
                        <span class="glyphicon glyphicon-chevron-left"></span> Undo</button>
                    <button type="button" class="btn btn-link btn-sm navbar-btn" disabled="disabled" id="id_redoButton">
                        <span class="glyphicon glyphicon-chevron-right"></span> Redo</button>
                    <button type="button" class="btn btn-link btn-sm navbar-btn" disabled="disabled" id="id_bookmarkButton">
                        <span class="glyphicon glyphicon-floppy-disk"></span> Save</button>

                    <div class="btn-group dropdown">
                        <button type="button" class="btn btn-link btn-sm dropdown-toggle" disabled="disabled" id="id_optionsButton" data-toggle="dropdown">
                            <span class="glyphicon glyphicon glyphicon-cog"></span> Settings <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu" role="menu">
                            <li role="presentation"><a role="menuitem" tabindex="-1" id="id_aggItem" href="#">Aggregation</a></li>
                            <li role="presentation"><a role="menuitem" tabindex="-1" id="id_colorItem" href="#">Accent Color</a></li>
                            <li role="presentation"><a role="menuitem" tabindex="-1" id="id_scaleItem" href="#"><span class="glyphicon glyphicon-unchecked"></span> Logarithmic Scale</a></li>
                        </ul>
                    </div>

                    <button type="button" class="btn btn-link btn-sm navbar-btn" id="id_mergeButton">
                        <span class="glyphicon glyphicon-link"></span> Merge...</button>
                    <button type="button" class="btn btn-link btn-sm navbar-btn" id="id_helpButton">
                        <span class="glyphicon glyphicon-question-sign"></span> Help</button>
                    <button type="button" class="btn btn-link btn-sm navbar-btn" id="id_changeUserButton">
                        <span class="glyphicon glyphicon-log-out"></span> Change User ID...</button>
                </div>
            </div>

            <!-- Sidebar -->
            <div class="navbar-default navbar-collapse collapse sidebar" role="navigation">

                <!-- CUBE -->
                <div class="panel panel-default" id="id_cubePanel">
                    <div class="panel-heading">
                        <h3 class="panel-title">Dataset
                            <a class="side-glyph" id="id_infoCube" tabindex="0" role="button" data-toggle="popover" data-delay="200" data-trigger="hover" title="Dataset Selection"><span class="glyphicon glyphicon-info-sign"></span></a>
                        </h3>
                    </div>
                    <div class="panel-body">

                        <div class="btn-group">
                            <button class="btn btn-default btn-sm dropdown-toggle" type="button" data-toggle="dropdown" id="id_cubeButton" disabled="disabled">
                                <span class='cube-button-text'> Select Cube </span>
                                <span class="caret"></span>
                            </button>
                            <ul class="dropdown-menu" role="menu" id="id_cubeList">
                                <!--<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Example Cube 1</a></li>-->
                            </ul>
                        </div>

                    </div>
                </div>


                <!-- DIMENSIONS -->
                <div class="panel panel-default fade" id="id_dimensionPanel" data-toggle="popover" data-trigger="manual" data-content="Please choose one or more dimensions." data-placement="bottom">
                    <div class="panel-heading">
                        <h3 class="panel-title">Dimensions
                            <a class="side-glyph" id="id_infoDimension" tabindex="0" role="button" data-toggle="popover" data-delay="200" data-trigger="hover" title="Dimensions"><span class="glyphicon glyphicon-info-sign"></span></a>
                        </h3>
                    </div>
                    <div class="panel-body">

                        <div class="form-group">
                            <label>X</label>

                            <!--Buttons-->
                            <div id="id_xButtonArea">

                                <!--Plus Symbol-->
                                <div class="btn-group" id="id_xPlus">
                                    <button class="btn btn-default dropdown-toggle btn-sm" type="button" data-toggle="dropdown">
                                        <span class="glyphicon glyphicon-plus"></span>
                                    </button>
                                    <ul class="dropdown-menu" role="menu" id="id_xDimensionList">
                                        <!--<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Example Dimension</a></li>-->
                                    </ul>
                                </div>
                            </div>

                        </div>

                        <div class="dimension-divider"></div>

                        <div class="form-group">
                            <label>Y</label>

                            <div id="id_yButtonArea">

                                <!--Plus Symbol-->
                                <div class="btn-group" id="id_yPlus">
                                    <button class="btn btn-default dropdown-toggle btn-sm" type="button" data-toggle="dropdown">
                                        <span class="glyphicon glyphicon-plus"></span>
                                    </button>
                                    <ul class="dropdown-menu" role="menu" id="id_yDimensionList">
                                    </ul>
                                </div>
                            </div>

                        </div>

                        <div class="dimension-divider"></div>

                        <div class="form-group">
                            <label>Z</label>

                            <div id="id_zButtonArea">

                                <!--Plus Symbol-->
                                <div class="btn-group" id="id_zPlus">
                                    <button class="btn btn-default dropdown-toggle btn-sm" type="button"  data-toggle="dropdown">
                                        <span class="glyphicon glyphicon-plus"></span>
                                    </button>
                                    <ul class="dropdown-menu" role="menu" id="id_zDimensionList">
                                    </ul>
                                </div>
                            </div>

                        </div>


                    </div>
                </div>

                <!-- MEASURES -->
                <div class="panel panel-default fade" id="id_measurePanel" data-toggle="popover" data-trigger="manual" data-content="Please choose one or more measures (1-2?)." data-placement="bottom">
                    <div class="panel-heading">
                        <h3 class="panel-title">Measure
                            <a class="side-glyph" id="id_infoMeasure" tabindex="0" role="button" data-toggle="popover" data-delay="200" data-trigger="hover" title="Measures"><span class="glyphicon glyphicon-info-sign"></span></a>
                        </h3>
                    </div>
                    <div class="panel-body">

                        <div class="btn-group">
                            <button class="btn btn-default btn-sm dropdown-toggle" type="button" data-toggle="dropdown" id="id_measureButton">
                                <span class='measure-button-text'>Select Measure</span>
                                <span class="caret"></span>
                            </button>
                            <ul class="dropdown-menu" role="menu" id="id_measureList">
                                <!--<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Example Measure 1</a></li>-->
                            </ul>
                        </div>

                    </div>
                </div>

                <!-- FILTERS -->
                <div class="panel panel-default fade" id="id_filterPanel">
                    <div class="panel-heading">
                        <h3 class="panel-title">Filters
                            <a class="side-glyph" id="id_infoFilter" tabindex="0" role="button" data-toggle="popover" data-delay="200" data-trigger="hover" title="Filters"><span class="glyphicon glyphicon-info-sign"></span></a>
                        </h3>
                    </div>
                    <div class="panel-body">

                        <div id="id_filterButtonArea">

                            <!--Plus Button-->
                            <div class="btn-group" id="id_filterPlus">
                                <button class="btn btn-default dropdown-toggle btn-sm" type="button">
                                    <span class="glyphicon glyphicon-plus"></span>
                                </button>
                            </div>

                        </div>

                    </div>
                </div>

            </div>
        </nav>


        <!-- Visualization Area -->
        <div class="viz-area panel panel-default">
            <div class="panel-body">

                <div class="row">
                    <div class="col-lg-12">
                        <div class="page-header">
                            <h3 id="id_pageTitle"><img src="img/logo_100_3.png"> Rest2Sparql</h3>
                            <div class="viz-button-area">
                                <a href="#" id="id_resetViewButton" class="fade btn btn-link"><span class="glyphicon glyphicon-eye-open"></span> Reset View</a>
                                <a href="#" id="id_chartButton" class="fade btn btn-link"><span class="glyphicon glyphicon-stats"></span> Charts</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="id_cube"></div>

            </div>

            <div class="panel-footer applyArea">
                <div class="btn-group btn-group-justified fade" role="group" id="id_acceptArea">
                    <div class="btn-group" role="group">
                        <button type="button" class="btn btn-sm btn-default" id="id_cancelButton">Cancel</button>
                    </div>
                    <div class="btn-group" role="group">
                        <button type="button" class="btn btn-sm btn-primary" id="id_applyButton" data-toggle="tooltip" data-placement="right">Apply</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Measure Filter Modal (hidden by default) -->
        <div class="modal fade" id="id_filterModal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title">Add Filter</h4>
                    </div>
                    <div class="modal-body" id="id_filterModalBody">
                        <div class="input-group">
                            <!--Measure selection-->
                            <div class="input-group-btn">
                                <button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" id="id_filterMeasureButton">
                                    Select Measure <span class="caret"></span>
                                </button>
                                <ul class="dropdown-menu" role="menu" id="id_filterMeasureList">
                                    <!--<li role="presentation"><a href="#">Example</a></li>-->
                                </ul>
                            </div>
                            <!--Relation selection-->
                            <div class="input-group-btn">
                                <button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" id="id_filterRelationButton">
                                    rel <span class="caret"></span>
                                </button>
                                <ul class="dropdown-menu" role="menu" id="id_filterRelationList">
                                    <!--<li role="presentation"><a href="#">Example</a></li>-->
                                </ul>
                            </div>
                            <!--Number input-->
                            <div id="id_filterInputLine">
                                <input class="form-control" type="number" step="any" id="id_filterValue" value="0">
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="id_filterModalOkay">Apply</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Bookmark Modal (hidden by default) -->
        <div class="modal fade" id="id_bookmarkModal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title">Save Current State</h4>
                    </div>
                    <div class="modal-body">
                        <p>Bookmark the following url to save your current operation, or share it with others.</p>
                        <a href="#" id="id_bookmarkLink"></a>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Aggreagation Modal (hidden by default) -->
        <div class="modal fade" id="id_aggModal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title">Change Aggregation</h4>
                    </div>
                    <div class="modal-body" id="id_aggModalBody">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Color Modal (hidden by default) -->
        <div class="modal fade fade" id="id_colorModal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title">Change Measure Color</h4>
                    </div>
                    <div class="modal-body" id="id_colorModalBody">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Chart Modal (hidden by default) -->
        <div class="modal fade" id="id_chartModal">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <button type="button" id="id_chartInfoButton" class="close" data-toggle="popover" data-delay="200" data-trigger="hover" title="Chart Visualization">
                            <span class="glyphicon glyphicon-info-sign"></span>
                        </button>
                        <h4 class="modal-title"></h4>
                    </div>
                    <div class="modal-body">

                        <div class="btn-toolbar" role="toolbar">
                            <div class="btn-group" role="group" data-toggle="buttons">
                                <label class="btn btn-default btn-sm active">
                                    <input id="id_chartBarButton" type="radio" name="chartRadio" checked="checked">
                                    Bar
                                </label>
                                <label class="btn btn-default btn-sm">
                                    <input id="id_chartLineButton" type="radio" name="chartRadio">
                                    Line
                                </label>
                                <label class="btn btn-default btn-sm">
                                    <input id="id_chartAreaButton" type="radio" name="chartRadio">
                                    Area
                                </label>
                                <label class="btn btn-default btn-sm">
                                    <input id="id_chartPieButton" type="radio" name="chartRadio">
                                    Pie
                                </label>
                            </div>
                            <div class="btn-group" data-toggle="buttons">
                                <label class="btn btn-default btn-sm active">
                                    <input id="id_chartStackingButton" type="checkbox" checked="checked">
                                    Stacking
                                </label>
                            </div>
                        </div>

                        <p id="id_chartInfos"></p>

                        <div id="id_chart">
                            <!--C3-Chart here-->
                        </div>

                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Help Modal (hidden by default) -->
        <div class="modal fade fade" id="id_helpModal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title" id="id_helpModalTitle">Welcome</h4>
                    </div>
                    <div class="modal-body">

                        <p>
                            Rest2Sparql is an interactive, multi-dimensional data visualization prototype based on the
                            <a href="http://www.w3.org/TR/vocab-data-cube/">RDF Data Cube Vocabulary</a> and the principles of OLAP (Online Analytical Processing).
                        </p>

                        <h5>First Steps</h5>
                        <p>
                            You can select a dataset in the left panel. The dataset will be visualized right away with some pre-chosen dimensions and a measure.
                            You can then interact with your data.
                        </p>

                        <h5>Interaction</h5>
                        <p>
                            Both the side panel and the cube visualization can be used to interact with the given data. Use the <i>left mouse button</i>
                            or a one-finger-gesture (on mobile devices) to either select objects in the visualization or to rotate the view. To zoom in and out
                            use the <i>scrollwheel</i> or a two-finger-gesture. To pan (move) the current view use the <i>right mouse button</i> or a three-finger gesture.
                        </p>

                        <p id="id_helpInfo">
                            This help page can be shown again by clicking the help button in the top navigation.
                        </p>

                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- JavaScript -->

        <!-- alphanum sorting -->
        <script src="js/alphanum.js"></script>

        <!-- jQuery -->
        <script src="js/jquery/jquery-2.1.3.js"></script>
        <!--<script src="js/jquery/jquery-2.1.3.min.js"></script>-->
        <script src="js/jquery/jquery.cookie.js"></script>
        <script src="js/jquery/jquery-ui.min.js"></script>

        <!-- Bootstrap -->
        <script src="js/bootstrap/bootstrap.min.js"></script>
        <script src="js/bootstrap/bootbox.min.js"></script>

        <!-- THREE.js -->
        <script src="js/threejs/three.js"></script>
        <!--<script src="js/threejs/three.min.js"></script>-->
        <!--<script src="js/threejs/renderers/SVGRenderer.js"></script>-->
        <!--<script src="js/threejs/renderers/Projector.js"></script>-->
        <!--<script src="js/threejs/renderers/CSS2DRenderer.js"></script>-->
        <!--<script src="js/threejs/renderers/CSS3DRenderer.js"></script>-->
        <!--<script src="js/threejs/renderers/CanvasRenderer.js"></script>-->
        <script src="js/threejs/controls/OrbitControls.js"></script>
        <!--<script src="js/threejs/Octree.js"></script>-->

        <!-- D3.js -->
        <script src="js/d3/d3.min.js"></script>

        <!-- C3.js -->
        <script src="js/c3/c3.js"></script>

        <!-- Custom Scripts -->
        <script src="js/gui/classes.js"></script>
        <script src="js/gui/templates.js"></script>
        <script src="js/gui/olap/main.js"></script>
        <script src="js/gui/olap/webgl.js"></script>
        <script src="js/gui/olap/interface.js"></script>

        <!--Read bookmark parameter if given-->
        <%
            String bookmark = request.getParameter("bookmark");
            if (bookmark != null && bookmark != "") {
        %>
        <script type="text/javascript">
            var BOOKMARK = '<%=bookmark%>'; // Global bookmark variable
        </script>
        <%
            }
        %>


    </body>
</html>
