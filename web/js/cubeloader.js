
//

// http://code-research.eu/resource/Dataset-96284d7c-6825-424a-9733-7f5e7e88fe92
var cubeURL = "./backend?func=<getCubes>";
var dimsURL = "./backend?func=<getDimensions>&c=<__cube__>";
var measURL = "./backend?func=<getMeasures>&c=<__cube__>";
var entsURL = "./backend?func=<getEntities>&c=<__cube__>&d=<__dimension__>";

var cubes;
var dims;
var meas;
var ents;

var selectedCube = null;
var selectedDim = null;

function loadCubes() {

    var ajaxReq = new XMLHttpRequest();

    ajaxReq.onreadystatechange = function() {
        if (ajaxReq.readyState == 4 && ajaxReq.status == 200) {
            cubes = JSON.parse(ajaxReq.responseText);
            //alert (cubes.results.bindings[0].CUBE_NAME.value);
            showCubes();
        }  
    };

    ajaxReq.open("GET", cubeURL, true);
    ajaxReq.setRequestHeader("accept","application/sparql-results+json");
    ajaxReq.send();
}

function loadDimensions() {

    selectedCube = document.getElementById("to_getDCubeTxt").value;
    applyCube(selectedCube);

    var ajaxReq = new XMLHttpRequest();

    ajaxReq.onreadystatechange = function() {
        if (ajaxReq.readyState == 4 && ajaxReq.status == 200) {
            dims = JSON.parse(ajaxReq.responseText);
            //alert(dims.results.bindings[0].CUBE_NAME.value);
            showDims();
        }
    };

    var tmp = dimsURL.replace("__cube__", selectedCube);
    ajaxReq.open("GET", tmp, true);
    ajaxReq.setRequestHeader("accept","application/sparql-results+json");
    ajaxReq.send();

}

function loadMeasures() {

    selectedCube = document.getElementById("to_getMCubeTxt").value;
    applyCube(selectedCube);

    var ajaxReq = new XMLHttpRequest();

    ajaxReq.onreadystatechange = function() {
        if (ajaxReq.readyState == 4 && ajaxReq.status == 200) {
            meas = JSON.parse(ajaxReq.responseText);
        }  
    };

    var tmp = measURL.replace("__cube__", selectedCube);
    ajaxReq.open("GET", tmp, true);
    ajaxReq.setRequestHeader("accept","application/sparql-results+json");
    ajaxReq.send();

}

function loadEntities() {

    selectedCube = document.getElementById("to_getECubeTxt").value;
    applyCube(selectedCube);
    selectedDim = document.getElementById("to_getEDimTxt").value;

    var ajaxReq = new XMLHttpRequest();

    ajaxReq.onreadystatechange = function() {
        if (ajaxReq.readyState == 4 && ajaxReq.status == 200) {
            ents = JSON.parse(ajaxReq.responseText);
        }  
    };

    var tmp = entsURL.replace("__cube__", selectedCube);
    tmp = tmp.replace("__dimension__", selectedDim);
    ajaxReq.open("GET", tmp, true);
    ajaxReq.setRequestHeader("accept","application/sparql-results+json");
    ajaxReq.send();

}

function applyCube(cubeName) {
    
    var txtID = ["to_getDCubeTxt", "to_getMCubeTxt", "to_getECubeTxt"];

    for (var i = 0; i < txtID.length; i++) {
        var txt = document.getElementById(txtID[i]);
        txt.value = cubeName;
        selectedCube = cubeName;
    }

}

//This function is added dynamically to items in a dropdown list. It is NOT unused!
//noinspection JSUnusedGlobalSymbols
function applyDim(dimName) {

    var txtID = "to_getEDimTxt";

    var txt = document.getElementById(txtID);
    txt.value = dimName;
    selectedDim = dimName;

}

function showCubes () {

    var par = [document.getElementById("to_getDCubeLst"),
                        document.getElementById("to_getMCubeLst"),
                        document.getElementById("to_getECubeLst")];

    //var pText = ["to_getDCubeTxt", "to_getMCubeTxt", "to_getECubeTxt"];

    //Fields from JSON
    //noinspection JSUnresolvedVariable
    for (var i = 0; i < cubes.results.bindings.length; i++) {

        for (var j = 0; j < par.length; j++) {
            var href = document.createAttribute("href");

            //Fields from JSON
            //noinspection JSUnresolvedVariable
            href.nodeValue = "javascript:applyCube(\"" + cubes.results.bindings[i].CUBE_NAME.value + "\");";

            //Fields from JSON
            //noinspection JSUnresolvedVariable
            var aText = document.createTextNode(cubes.results.bindings[i].LABEL.value);

            var a = document.createElement("a");
            a.setAttributeNode(href);
            a.appendChild(aText);
        
            var li = document.createElement("li");
            li.appendChild(a);
        
            par[j].appendChild(li);
        }
    }
}

function showDims() {

    var par = document.getElementById("to_getEDimLst");

    // clear list
    while (par.hasChildNodes()) {

        par.removeChild(par.firstChild);

    }

    // fill list

    //Fields from JSON
    //noinspection JSUnresolvedVariable
    for (var i = 0; i < dims.results.bindings.length; i++) {

        var href = document.createAttribute("href");

        //Fields from JSON
        //noinspection JSUnresolvedVariable
        href.nodeValue = "javascript:applyDim(\"" + dims.results.bindings[i].DIMENSION_NAME.value + "\");";

        //Fields from JSON
        //noinspection JSUnresolvedVariable
        var aText = document.createTextNode(dims.results.bindings[i].LABEL.value);

        var a = document.createElement("a");
        a.setAttributeNode(href);
        a.appendChild(aText);
        
        var li = document.createElement("li");
        li.appendChild(a);
        
        par.appendChild(li);
    }

}


