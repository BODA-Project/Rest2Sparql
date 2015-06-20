<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="RDF Datacube Visualization">
        <link rel="shortcut icon" href="img/favicon_3.png">

        <title>REST 2 SPARQL / MERGE</title>

        <!-- CSS -->
        <link href="css/bootstrap/bootstrap.min.css" rel="stylesheet">
        <link href="css/bootstrap/bootstrap-theme.min.css" rel="stylesheet">
        <link href="css/gui/merge/main.css" rel="stylesheet">

    </head>
    <body>

        <!-- Navigation -->
        <nav class="navbar navbar-default navbar-static-top" role="navigation">

            <div class="navbar-header">
                <a class="navbar-brand" href="./">Rest2Sparql</a> <!-- TODO link/name -->
                <!--<a class="navbar-text" href="./">CODE Research</a>-->
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
                                    <div class="btn-group">
                                        <button class="btn btn-default btn-sm dropdown-toggle" type="button" data-toggle="dropdown" id="id_cubeButton1">
                                            <span class="button-text"> First Cube </span>
                                            <span class="caret"></span>
                                        </button>
                                        <ul class="dropdown-menu" role="menu" id="id_cubeList1">
                                            <!--<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Example Cube 1</a></li>-->
                                        </ul>
                                    </div>

                                    <br>

                                    <!--CUBE 2-->
                                    <div class="btn-group">
                                        <button class="btn btn-default btn-sm dropdown-toggle" type="button" data-toggle="dropdown" id="id_cubeButton2">
                                            <span class="button-text"> Second Cube</span>
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

                                    TODO: Overview of dimensions and measures and options to add or match them

                                </div>
                            </div>

                        </div>

                        <div class="tab-pane" id="id_tab3">

                            <div class="panel panel-default">
                                <div class="panel-heading">
                                    <h4>Step 3: Visualize merged Dataset</h4>
                                </div>
                                <div class="panel-body">

                                    TODO: Visualize matched cube (diff -> overlapps, cube1, cube2)

                                </div>
                            </div>

                        </div>

                        <div class="tab-pane" id="id_tab4">

                            <div class="panel panel-default">
                                <div class="panel-heading">
                                    <h4>Step 4: Store merged Dataset</h4>
                                </div>
                                <div class="panel-body">

                                    TODO: Enter name to save (uri auto-generated)

                                </div>
                            </div>

                        </div>
                        <ul class="pager wizard">
                            <li class="previous first" style="display:none;"><a href="#">First</a></li>
                            <li class="previous"><a href="#">&larr; Previous</a></li>
                            <li class="next last" style="display:none;"><a href="#">Last</a></li>
                            <li class="next"><a href="#">Next &rarr;</a></li>
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

        <!--TODO: minified versions-->

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
        <script src="js/bootstrap/jquery.bootstrap.wizard.min.js"></script>

        <!-- THREE.js -->
        <script src="js/threejs/three.js"></script>
        <!--<script src="js/threejs/three.min.js"></script>-->
        <script src="js/threejs/controls/OrbitControls.js"></script>

        <!-- Custom Scripts -->
        <script src="js/gui/merge/main.js"></script>
        <!--<script src="js/gui/merge/TODO.js"></script>-->

        <!--Default first cube if given-->
        <%
            String cube1 = request.getParameter("cube1");
        %>
        <script type="text/javascript">
            var cube = '<%=cube1%>';
            if (cube !== "null" && cube !== "") {
                // TODO cube given
                alert("cube is '" + cube + "'");
            }
        </script>

    </body>
</html>
