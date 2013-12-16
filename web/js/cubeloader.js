//

// http://code-research.eu/resource/Dataset-96284d7c-6825-424a-9733-7f5e7e88fe92

//
// Const
//
var cubeURL = "./backend?func=<getCubes>";
var host = "http://localhost:8080/";
var queryPrefix = host + "backend?func=<execute>&";

//
// TEMPLATES
//
var dimsURL = "./backend?func=<getDimensions>&c=<__cube__>";
var measURL = "./backend?func=<getMeasures>&c=<__cube__>";
var entsURL = "./backend?func=<getEntities>&c=<__cube__>&d=<__dimension__>";

var queryFormTempl =
    "<th>__object__</th>" +
    "<th><input type=\"checkbox\"></th>" +
    "<th><input type=\"checkbox\"></th>" +
    "<th><input type=\"text\" class=\"form-control\" maxlength=\"3\" size=\"3\" value=\"-1\"></th>" +
    "<th><select class=\"selectpicker show-tick form-control\">" +
        "<option>NONE</option>" +
        "<option>COUNT</option>" +
        "<option>SUM</option>" +
        "<option>MIN</option>" +
        "<option>MAX</option>" +
        "<option>AVG</option>" +
        "<option>GROUP CONCAT</option>" +
    "</select></th>" +
    "<th><select class=\"selectpicker show-tick form-control\">" +
        "<option>NONE</option>" +
        "<option>&lt;</option>" +
        "<option>&lt;=</option>" +
        "<option>&gt;</option>" +
        "<option>&gt;=</option>" +
        "<option>==</option>" +
        "<option>!=</option>" +
    "</select></th>" +
    "<th><input type=\"text\" class=\"form-control\" size=\"3\"></th>";

var quDimTmpl = "d=<__dim__>,select=<__select__>,group=<__group__>,order=<__order__>,agg=<__agg__>,filterR=<__filterR__>,filterV=<__filterV__>";
var quMeasTmpl = "m=<__meas__>,select=<__select__>,group=<__group__>,order=<__order__>,agg=<__agg__>,filterR=<__filterR__>,filterV=<__filterV__>";
var quCubeTmpl = "c=<__cube__>";

var cubes;
var dims;
var meas;
var ents;

var selectedCube = null;
var selectedDim = null;

function loadCubes() {

    var ajaxReq = new XMLHttpRequest();

    ajaxReq.onreadystatechange = function () {
        if (ajaxReq.readyState == 4 && ajaxReq.status == 200) {
            cubes = JSON.parse(ajaxReq.responseText);
            //alert (cubes.results.bindings[0].CUBE_NAME.value);
            showCubes();
        }
    };

    ajaxReq.open("GET", cubeURL, true);
    ajaxReq.setRequestHeader("accept", "application/sparql-results+json");
    ajaxReq.send();

    addToQueryList(host + cubeURL.substr(2));

}

function loadDimensions() {

    applyCube(document.getElementById("to_getDCubeTxt").value);

    var ajaxReq = new XMLHttpRequest();

    ajaxReq.onreadystatechange = function () {
        if (ajaxReq.readyState == 4 && ajaxReq.status == 200) {
            dims = JSON.parse(ajaxReq.responseText);
            //alert(dims.results.bindings[0].CUBE_NAME.value);
            showDims();
        }
    };

    var tmp = dimsURL.replace("__cube__", selectedCube);
    ajaxReq.open("GET", tmp, true);
    ajaxReq.setRequestHeader("accept", "application/sparql-results+json");
    ajaxReq.send();

    addToQueryList(host + tmp.substr(2));

}

function loadMeasures() {

    applyCube(document.getElementById("to_getMCubeTxt").value);

    var ajaxReq = new XMLHttpRequest();

    ajaxReq.onreadystatechange = function () {
        if (ajaxReq.readyState == 4 && ajaxReq.status == 200) {
            meas = JSON.parse(ajaxReq.responseText);
            showMeasures();
        }
    };

    var tmp = measURL.replace("__cube__", selectedCube);
    ajaxReq.open("GET", tmp, true);
    ajaxReq.setRequestHeader("accept", "application/sparql-results+json");
    ajaxReq.send();

    addToQueryList(host + tmp.substr(2));

}

function loadEntities() {

    applyCube(document.getElementById("to_getECubeTxt").value);
    selectedDim = document.getElementById("to_getEDimTxt").value;

    var ajaxReq = new XMLHttpRequest();

    ajaxReq.onreadystatechange = function () {
        if (ajaxReq.readyState == 4 && ajaxReq.status == 200) {
            ents = JSON.parse(ajaxReq.responseText);
        }
    };

    var tmp = entsURL.replace("__cube__", selectedCube);
    tmp = tmp.replace("__dimension__", selectedDim);
    ajaxReq.open("GET", tmp, true);
    ajaxReq.setRequestHeader("accept", "application/sparql-results+json");
    ajaxReq.send();

    addToQueryList(host + tmp.substr(2));

}

function applyCube(cubeName) {

    var txtID = ["to_getDCubeTxt", "to_getMCubeTxt", "to_getECubeTxt"];

    for (var i = 0; i < txtID.length; i++) {
        var txt = document.getElementById(txtID[i]);
        txt.value = cubeName;
    }

    if (selectedCube != cubeName) {
        clearQueryBuilderForm();
    }

    selectedCube = cubeName;
}

//This function is added dynamically to items in a dropdown list. It is NOT unused!
//noinspection JSUnusedGlobalSymbols
function applyDim(dimName) {

    var txtID = "to_getEDimTxt";

    var txt = document.getElementById(txtID);
    txt.value = dimName;
    selectedDim = dimName;

}

function showCubes() {

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

        // Add Dimension to QueryBuilderForm
        //Fields from JSON
        //noinspection JSUnresolvedVariable
        addObjectToQueryBuilderForm(dims.results.bindings[i].DIMENSION_NAME.value, "dimension");

    }

}

function showMeasures() {

    //Fields from JSON
    //noinspection JSUnresolvedVariable
    for (var i = 0; i < meas.results.bindings.length; i++) {

        // Add Dimension to QueryBuilderForm
        //Fields from JSON
        //noinspection JSUnresolvedVariable
        addObjectToQueryBuilderForm(meas.results.bindings[i].MEASURE_NAME.value, "measure");

    }

}

function addObjectToQueryBuilderForm(name, objectType) {

    var tmp = queryFormTempl.replace("__object__", name);

    var tr = document.createElement("tr");
    tr.setAttribute("data-type", objectType);
    document.getElementById("to_queryForm").appendChild(tr);
    tr.innerHTML = tmp;

}

function clearQueryBuilderForm() {

    while (document.getElementById("to_queryForm").hasChildNodes()) {
        document.getElementById("to_queryForm").removeChild(document.getElementById("to_queryForm").firstChild);
    }

}

function createQuery() {

    var queryForm = document.getElementById("to_queryForm");
    var entries = queryForm.childNodes;
    var query = queryPrefix;

    for (var i = 0; i < entries.length; i++) {

        if (entries[i].getAttribute("data-type") == "measure") {

        } else if (entries[i].getAttribute("data-type") == "dimension") {

        }

    }

}

function addToQueryList(entry) {

    var tr = document.createElement("tr");
    var th = document.createElement("th");
    var a = document.createElement("a");
    a.setAttribute("href", entry);
    var text = document.createTextNode(entry);

    document.getElementById("to_historyTable").insertBefore(tr, document.getElementById("to_historyTable").firstChild);
    tr.appendChild(th);
    th.appendChild(a);
    a.appendChild(text);

}