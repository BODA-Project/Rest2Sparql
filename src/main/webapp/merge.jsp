<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="RDF Datacube Visualization">
        <link rel="shortcut icon" href="img/favicon_3.png">

        <title>REST 2 SPARQL | MERGE</title>

        <!-- CSS -->
        <link href="css/bootstrap/bootstrap.min.css" rel="stylesheet">
        <link href="css/bootstrap/bootstrap-theme.min.css" rel="stylesheet">
        <link href="css/d3/d3.parcoords.css" rel="stylesheet">
        <link href="css/gui/merge/main.css" rel="stylesheet">

    </head>
    <body>

        <!-- Navigation -->
        <nav class="navbar navbar-default navbar-static-top" role="navigation">

            <div class="navbar-header">
                <a class="navbar-brand" href="./">Rest2Sparql</a>
                <button type="button" class="btn btn-link btn-sm navbar-btn" id="id_changeUserButton">
                    <span class="glyphicon glyphicon-log-out"></span> Change User ID...
                </button>
            </div>
        </nav>

        <div class='container'>

            <section id="id_wizard">
                <div class="page-header">
                    <h1> <img src="img/logo_100_3.png" alt=""> Dataset Merging</h1>
                </div>

                <div id="id_rootWizard">
                    <div class="navbar">
                        <ul>
                            <li><a href="#id_tab1" data-toggle="tab">1. Selection</a></li>
                            <li><a href="#id_tab2" data-toggle="tab">2. Structure</a></li>
                            <li><a href="#id_tab3" data-toggle="tab">3. Visualization</a></li>
                            <li><a href="#id_tab4" data-toggle="tab">4. Storage</a></li>
                        </ul>
                    </div>
                    <div class="tab-content">
                        <div class="tab-pane" id="id_tab1">

                            <div class="panel panel-default">
                                <div class="panel-heading">
                                    <h4>Step 1: Select two Cubes to merge</h4>
                                </div>
                                <div class="panel-body">

                                    <!--CUBE 1-->
                                    <label for="id_cubeButton1">First Cube</label>
                                    <div class="btn-group">
                                        <button class="btn btn-default btn-sm dropdown-toggle" type="button" data-toggle="dropdown" id="id_cubeButton1">
                                            <span class="button-text"> Select Cube </span>
                                            <span class="caret"></span>
                                        </button>
                                        <ul class="dropdown-menu" role="menu" id="id_cubeList1">
                                            <!--<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Example Cube 1</a></li>-->
                                        </ul>
                                    </div>

                                    <br>
                                    <br>

                                    <!--CUBE 2-->
                                    <label for="id_cubeButton2">Second Cube</label>
                                    <div class="btn-group">
                                        <button class="btn btn-default btn-sm dropdown-toggle" type="button" data-toggle="dropdown" id="id_cubeButton2">
                                            <span class="button-text"> Select Cube </span>
                                            <span class="caret"></span>
                                        </button>
                                        <ul class="dropdown-menu" role="menu" id="id_cubeList2">
                                            <!--<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Example Cube 1</a></li>-->
                                        </ul>
                                    </div>

                                </div>
                            </div>

                        </div>

                        <div class="tab-pane" id="id_tab2">

                            <div class="panel panel-default">
                                <div class="panel-heading">
                                    <h4>Step 2: Match Dataset Structures</h4>
                                </div>
                                <div class="panel-body">

                                    <h4>Dimensions</h4>

                                    <table class="table table-bordered dimension-table" id="id_dimensionTable"></table>

                                    <h4>Measures</h4>

                                    <table class="table table-bordered measure-table" id="id_measureTable">

                                        <tr>
                                            <td></td>
                                            <th>Cube 1 Name</th>
                                            <th>Cube 2 Name</th>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td>Measure 1 Name</td>
                                            <td class="success"><span class="glyphicon glyphicon-ok"></span></td>
                                            <td><span class="glyphicon glyphicon-remove"></span></td>
                                            <td>
                                                <button class="btn btn-sm btn-default"><span class="glyphicon glyphicon-wrench"></span></button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Measure 2 Name</td>
                                            <td><span class="glyphicon glyphicon-remove"></span></td>
                                            <td class="success"><span class="glyphicon glyphicon-ok"></span></td>
                                            <td>
                                                <button class="btn btn-sm btn-default"><span class="glyphicon glyphicon-wrench"></span></button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Measure 3 Name</td>
                                            <td class="success"><span class="glyphicon glyphicon-ok"></span></td>
                                            <td class="success"><span class="glyphicon glyphicon-ok"></span></td>
                                            <td>
                                            </td>
                                        </tr>

                                    </table>

                                </div>
                            </div>

                        </div>

                        <div class="tab-pane" id="id_tab3">

                            <div class="panel panel-default">
                                <div class="panel-heading">
                                    <h4>Step 3: Visualize merged Dataset</h4>
                                </div>
                                <div class="panel-body">

                                    <div class="btn-group">
                                        <button id="id_sizeButton" class="btn btn-default btn-sm" type="button" id="id_cubeButton1">Full Size</button>
                                    </div>
                                    <div id="id_visualization" class="parcoords"></div>
                                    <div id="id_visInfo"></div>

                                </div>
                            </div>

                        </div>

                        <div class="tab-pane" id="id_tab4">

                            <div class="panel panel-default">
                                <div class="panel-heading">
                                    <h4>Step 4: Store merged Dataset</h4>
                                </div>
                                <div class="panel-body">

                                    <form id="id_mergeStoreForm">
                                        <div class="form-group">
                                            <label for="id_mergedCubeNameInput" class="control-label">Name for the merged Cube:</label>
                                            <input type="text" class="form-control" id="id_mergedCubeNameInput" placeholder="e.g. MergedCube">
                                        </div>

                                        <div class="form-group">

                                            <label class="control-label">Preference in Case of Overlap:</label>
                                            <div id="id_prefereCubeArea"></div>
                                        </div>

                                        <div class="form-group">
                                            <label class="control-label" for="id_mergeComment">Comment:</label>
                                            <textarea name="commentArea" class="form-control" id="id_mergeComment" placeholder="Optional Comment" rows="5"></textarea>
                                        </div>
                                    </form>

                                    <div class="btn-group">
                                        <button class="btn btn-default dropdown-toggle" type="button" id="id_acceptMergeButton">Save Cube</button>
                                    </div>

                                </div>
                            </div>

                        </div>
                        <ul class="pager wizard">
                            <li class="previous"><a href="#" id="id_wizardPrev">&larr; Previous</a></li>
                            <li class="next"><a href="#" id="id_wizardNext">Next &rarr;</a></li>
                        </ul>
                    </div>
                </div>


            </section>
        </div>



        <!-- Example Modal (hidden by default) -->
        <div class="modal fade" id="id_exampleModal">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title"></h4>
                    </div>
                    <div class="modal-body">
                        <!-- ... -->
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Dimension Modal (hidden by default) -->
        <div class="modal fade" id="id_addDimensionModal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title"></h4>
                    </div>
                    <div class="modal-body">
                        <form>
                            <div class="form-group">
                                <label for="id_addDimensionModalInput" class="control-label">Enter an Entity Label:</label>
                                <input type="text" class="form-control" id="id_addDimensionModalInput">
                            </div>
                        </form>
                        <label for="id_addDimensionModalDropdown" class="control-label">Or choose an existing Entity:</label>
                        <br>
                        <div class="btn-group" id="id_addDimensionModalDropdown">
                            <button class="btn btn-default dropdown-toggle btn-sm" type="button" data-toggle="dropdown">
                                <!-- ... -->
                            </button>
                            <ul class="dropdown-menu" role="menu">
                                <!-- ... -->
                            </ul>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="id_addDimensionModalOkay">Apply</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Distinction Modal to add a new dimension to both cubes (hidden by default) -->
        <div class="modal fade" id="id_distinctionModal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title">Add a new Dimension</h4>
                    </div>
                    <div class="modal-body">
                        <form>
                            <div class="form-group">
                                <label for="id_distinctionDimensionInput" class="control-label">Enter a Dimension Label:</label>
                                <input type="text" class="form-control" id="id_distinctionDimensionInput">
                            </div>
                            <div class="form-group">
                                <label for="id_distinctionEntity1Input" class="control-label"></label>
                                <input type="text" class="form-control" id="id_distinctionEntity1Input">
                            </div>
                            <div class="form-group">
                                <label for="id_distinctionEntity2Input" class="control-label"></label>
                                <input type="text" class="form-control" id="id_distinctionEntity2Input">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="id_distinctionModalOkay">Apply</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- JavaScript -->

        <!--Default first cube if given-->
        <%
            String cube1 = request.getParameter("cube1");
            if (cube1 != null && cube1 != "") {
        %>
        <script type="text/javascript">
            var CUBE_1 = '<%=cube1%>';
        </script>
        <%
            }
        %>

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
        <script src="js/bootstrap/jquery.bootstrap.wizard.min.js"></script>

        <!-- D3.js -->
        <script src="js/d3/d3.min.js"></script>
        <script src="js/d3/d3.parcoords.js"></script>
        <script src="js/d3/d3.svg.multibrush.js"></script>

        <!-- Custom Scripts -->
        <script src="js/gui/classes.js"></script>
        <script src="js/gui/templates.js"></script>
        <script src="js/gui/merge/main.js"></script>
        <script src="js/gui/merge/interface.js"></script>

    </body>
</html>
