<%--
  Created by IntelliJ IDEA.
  User: tommy
  Date: 12/13/13
  Time: 1:11 PM
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">
    <link rel="shortcut icon" href="../../docs-assets/ico/favicon.png">

    <!-- Scripts for the API -->
    <script src="./js/cubeloader.js"></script>

    <title>Navbar Template for Bootstrap</title>

    <!-- Bootstrap core CSS -->
    <link href="./css/bootstrap.css" rel="stylesheet">

    <!-- Custom styles for this template -->
    <!-- <link href="navbar.css" rel="stylesheet"> -->
    <link href="grid.css" rel="stylesheet">

    <!-- Just for debugging purposes. Don't actually copy this line! -->
    <!--[if lt IE 9]><script src="../../docs-assets/js/ie8-responsive-file-warning.js"></script><![endif]-->

    <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
    <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
    <script src="https://oss.maxcdn.com/libs/respond.js/1.3.0/respond.min.js"></script>
    <![endif]-->
</head>

<body>

<script> loadCubes(); </script>

<div class="container">

    <!-- Static navbar -->
    <div class="navbar navbar-default" role="navigation">
        <div class="navbar-header">
            <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="#">Rest2Sparql</a>
        </div>
        <!--<div class="navbar-collapse collapse">
          <ul class="nav navbar-nav">
            <li class="active"><a href="#">Link</a></li>
            <li><a href="#">Link</a></li>
            <li><a href="#">Link</a></li>
            <li class="dropdown">
              <a href="#" class="dropdown-toggle" data-toggle="dropdown">Dropdown <b class="caret"></b></a>
              <ul class="dropdown-menu">
                <li><a href="#">Action</a></li>
                <li><a href="#">Another action</a></li>
                <li><a href="#">Something else here</a></li>
                <li class="divider"></li>
                <li class="dropdown-header">Nav header</li>
                <li><a href="#">Separated link</a></li>
                <li><a href="#">One more separated link</a></li>
              </ul>
            </li>
          </ul>
          <ul class="nav navbar-nav navbar-right">
            <li class="active"><a href="./">Default</a></li>
            <li><a href="../navbar-static-top/">Static top</a></li>
            <li><a href="../navbar-fixed-top/">Fixed top</a></li>
          </ul>
        </div>--><!--/.nav-collapse -->
    </div>

    <div class="page-header">
        <h1>Rest2Sparql</h1>
        <p class="lead">Query the code datacubes</p>
    </div>

    <h3>Get Dimensions</h3>

    <form class="bs-example bs-example-form" role="form">
        <div class="row">
            <div class="col-lg-12">
                <div class="input-group">
                    <div class="input-group-btn">
                        <button type="button" id="to_getDCubeBtn" class="to_CubeBtn btn btn-default dropdown-toggle" data-toggle="dropdown">Cube <span class="caret"></span></button>
                        <ul id="to_getDCubeLst" class="dropdown-menu to_CubeLst">
                        </ul>
                    </div>
                    <input type="text" id="to_getDCubeTxt" class="to_CubeTxt form-control" value="Please select a cube">
                    <div class="input-group-btn">
                        <button type="button" class="btn btn-default" tabindex="-1" onclick="loadDimensions()">Go!</button>
                    </div>
                </div><!-- /.input-group -->
            </div><!-- /.col-lg-12 -->
        </div><!-- /.row -->
    </form>


    <h3>Get Measures</h3>

    <form class="bs-example bs-example-form" role="form">
        <div class="row">
            <div class="col-lg-12">
                <div class="input-group">
                    <div class="input-group-btn">
                        <button type="button" id="to_getMCubeBtn" class="to_CubeBtn btn btn-default dropdown-toggle" data-toggle="dropdown">Cube <span class="caret"></span></button>
                        <ul id="to_getMCubeLst" class="dropdown-menu to_CubeLst">
                        </ul>
                    </div>
                    <input type="text" id="to_getMCubeTxt" class="to_CubeTxt form-control" value="Please select a cube">
                    <div class="input-group-btn">
                        <button type="button" class="btn btn-default" tabindex="-1" onclick="loadMeasures()">Go!</button>
                    </div>
                </div><!-- /.input-group -->
            </div><!-- /.col-lg-12 -->
        </div><!-- /.row -->
    </form>

    <h3>Get Entities</h3>

    <form class="bs-example bs-example-form" role="form">
        <div class="row">
            <div class="col-lg-12">
                <div class="input-group">
                    <div class="input-group-btn">
                        <button type="button" id="to_getECubeBtn" class="to_CubeBtn btn btn-default dropdown-toggle" data-toggle="dropdown">Cube <span class="caret"></span></button>
                        <ul id="to_getECubeLst" class="dropdown-menu to_CubeLst">
                        </ul>
                    </div>
                    <input type="text" id="to_getECubeTxt" class="form-control to_CubeTxt" value="Please select a cube">
                    <div class="input-group-btn">
                        <button type="button" id="to_getEDimBtn" class="to_DimBtn btn btn-default dropdown-toggle" data-toggle="dropdown">Dimension <span class="caret"></span></button>
                        <ul id="to_getEDimLst" class="to_DimLst dropdown-menu">
                        </ul>
                    </div>
                    <input id="to_getEDimTxt" type="text" class="to_DimTxt form-control" value="Please select a dimension">
                    <div class="input-group-btn">
                        <button type="button" class="btn btn-default" tabindex="-1" onclick="loadEntities()">Go!</button>
                    </div>
                </div><!-- /.input-group -->
            </div><!-- /.input-group -->
        </div><!-- /.col-lg-12 -->
</div><!-- /.row -->
</form>

<!-- Main component for a primary marketing message or call to action -->
<!--      <div class="jumbotron">
        <h1>Navbar example</h1>
        <p>This example is a quick exercise to illustrate how the default, static navbar and fixed to top navbar work. It includes the responsive CSS and HTML, so it also adapts to your viewport and device.</p>
        <p>
          <a class="btn btn-lg btn-primary" href="../../components/#navbar" role="button">View navbar docs &raquo;</a>
        </p>
      </div>
-->
</div> <!-- /container -->


<!-- Bootstrap core JavaScript
================================================== -->
<!-- Placed at the end of the document so the pages load faster -->
<script src="https://code.jquery.com/jquery-1.10.2.min.js"></script>
<script src="./js/bootstrap.min.js"></script>
</body>
</html>

