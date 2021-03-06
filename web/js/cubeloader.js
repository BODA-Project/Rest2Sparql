//

// http://code-research.eu/resource/Dataset-96284d7c-6825-424a-9733-7f5e7e88fe92

//
// Const
//
var cubeURL = "./backend?func=<getCubes>&id=<__id__>&hash=<__hash__>";
var queryPrefix = "";

// wait for jquery
$(document).ready(function () {
    queryPrefix = $(location).attr('href') + "/backend?func=<execute>&id=<__id__>&hash=<__hash__>&";
});

var aggMap = {};
aggMap["<"] = "smaller";
aggMap["<="] = "smaller_or_eq";
aggMap["=="] = "eq";
aggMap["!="] = "not_eq";
aggMap[">"] = "bigger";
aggMap[">="] = "bigger_or_eq";

//
// TEMPLATES
//
var dimsURL = "./backend?func=<getDimensions>&c=<__cube__>&id=<__id__>&hash=<__hash__>";
var measURL = "./backend?func=<getMeasures>&c=<__cube__>&id=<__id__>&hash=<__hash__>";
var entsURL = "./backend?func=<getEntities>&c=<__cube__>&d=<__dimension__>&id=<__id__>&hash=<__hash__>";

var queryFormTempl =
    "<th>__object__</th>" +
    "<th><input type=\"checkbox\"></th>" +
    "<th><input type=\"checkbox\"></th>" +
    "<th><input type=\"text\" class=\"form-control\" maxlength=\"3\" size=\"3\" value=\"-1\"></th>" +
    "<th><select class=\"selectpicker show-tick form-control\">" +
        "<option>none</option>" +
        "<option>count</option>" +
        "<option>sum</option>" +
        "<option>min</option>" +
        "<option>max</option>" +
        "<option>avg</option>" +
        "<option>group_concat</option>" +
        "<option>sample</option>" +
    "</select></th>" +
    "<th><select class=\"selectpicker show-tick form-control\">" +
        "<option>none</option>" +
        "<option>&lt;</option>" +
        "<option>&lt;=</option>" +
        "<option>&gt;</option>" +
        "<option>&gt;=</option>" +
        "<option>==</option>" +
        "<option>!=</option>" +
    "</select></th>" +
    "<th><input type=\"text\" class=\"form-control\" size=\"3\"></th>" +
    "<th id=\"to_fix_field\"></th>";

var quDiMeTmpl = "__obj__,select=<__select__>,group=<__group__>,order=<__order__>,agg=<__agg__>,filterR=<__filterR__>,filterV=<__filterV__>,fix=<__fix__>";
var quCubeTmpl = "c=<__cube__>,select=<__select__>";

var cubes;
var dims;
var meas;
var ents = {};

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

    var tmp = cubeURL.replace("__id__", document.getElementById("to_authIDField").value);
    tmp = tmp.replace("__hash__", document.getElementById("to_authTokenField").value);
    ajaxReq.open("GET", tmp, true);
    ajaxReq.setRequestHeader("accept", "application/sparql-results+json");
    ajaxReq.send();

    addToQueryList($(location).attr('href') + tmp.substr(2));

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
    tmp = tmp.replace("__id__", document.getElementById("to_authIDField").value);
    tmp = tmp.replace("__hash__", document.getElementById("to_authTokenField").value);
    ajaxReq.open("GET", tmp, true);
    ajaxReq.setRequestHeader("accept", "application/sparql-results+json");
    ajaxReq.send();

    addToQueryList($(location).attr('href') + tmp.substr(2));

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
    tmp = tmp.replace("__id__", document.getElementById("to_authIDField").value);
    tmp = tmp.replace("__hash__", document.getElementById("to_authTokenField").value);
    ajaxReq.open("GET", tmp, true);
    ajaxReq.setRequestHeader("accept", "application/sparql-results+json");
    ajaxReq.send();

    addToQueryList($(location).attr('href') + tmp.substr(2));

}

function loadEntities(dim) {

    //applyCube(document.getElementById("to_getECubeTxt").value);
    //selectedDim = document.getElementById("to_getEDimTxt").value;

    var ajaxReq = new XMLHttpRequest();

    /*ajaxReq.onreadystatechange = function () {
        if (ajaxReq.readyState == 4 && ajaxReq.status == 200) {
            ents[selectedDim] = JSON.parse(ajaxReq.responseText);
        }
    };*/

    var tmp = entsURL.replace("__cube__", selectedCube);
    tmp = tmp.replace("__id__", document.getElementById("to_authIDField").value);
    tmp = tmp.replace("__hash__", document.getElementById("to_authTokenField").value);
    tmp = tmp.replace("__dimension__", dim);
    ajaxReq.open("GET", tmp, false);
    ajaxReq.setRequestHeader("accept", "application/sparql-results+json");
    ajaxReq.send();
    ents[dim] = JSON.parse(ajaxReq.responseText);

    //addToQueryList(host + tmp.substr(2));

}

function applyCube(cubeName) {

    var txtID = ["to_getDCubeTxt", "to_getMCubeTxt"]; //, "to_getECubeTxt"];

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
        document.getElementById("to_getMCubeLst")];
        //document.getElementById("to_getECubeLst")];

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

    /*var par = document.getElementById("to_getEDimLst");

    // clear list
    while (par.hasChildNodes()) {

        par.removeChild(par.firstChild);

    }*/

    // fill list

    //Fields from JSON
    //noinspection JSUnresolvedVariable
    for (var i = 0; i < dims.results.bindings.length; i++) {

        /*var href = document.createAttribute("href");

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

        par.appendChild(li);*/

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

    document.getElementById("to_fix_field").setAttribute("id", "to_fix_" + name);

    if (objectType == "dimension") {

        loadEntities(name);

        // add the selectpicker
        var select = document.createElement("select");
        select.className = "selectpicker show-tick form-control";
        document.getElementById("to_fix_" + name).appendChild(select);

        // add "none" as first option
        var opt = document.createElement("option");
        opt.setAttribute("value", "none");
        var txt = document.createTextNode("none");
        opt.appendChild(txt);
        select.appendChild(opt);

        /* *** Add further Entities *** */
        //Fields from JSON
        //noinspection JSUnresolvedVariable
        for (var i = 0; i < ents[name].results.bindings.length; i++) {
            opt = document.createElement("option");
            //Fields from JSON
            //noinspection JSUnresolvedVariable
            opt.setAttribute("value", ents[name].results.bindings[i].ENTITY_NAME.value);

            //Fields from JSON
            //noinspection JSUnresolvedVariable
            txt = document.createTextNode(ents[name].results.bindings[i].LABEL.value);
            opt.appendChild(txt);
            select.appendChild(opt);
        }
    }
}

function clearQueryBuilderForm() {

    while (document.getElementById("to_queryForm").hasChildNodes()) {
        document.getElementById("to_queryForm").removeChild(document.getElementById("to_queryForm").firstChild);
    }

}

function createQuery() {

    var queryForm = document.getElementById("to_queryForm");
    var entries = queryForm.childNodes;
    var query = queryPrefix.replace("__id__", document.getElementById("to_authIDField").value)
                .replace("__hash__", document.getElementById("to_authTokenField").value);

    for (var i = 0; i < entries.length; i++) {

        var tmp = quDiMeTmpl;

        if (entries[i].getAttribute("data-type") == "measure") {
            tmp = tmp.replace("__obj__", "m=<" + entries[i].firstChild.textContent + ">");

            // measures can't be fixed
            tmp = tmp.replace(",fix=<__fix__>", "");
        } else if (entries[i].getAttribute("data-type") == "dimension") {
            tmp = tmp.replace("__obj__", "d=<" + entries[i].firstChild.textContent + ">");

            // set fix if necessary
            // HACK - hide bug with duplicate dimensions
            if (!entries[i].childNodes[7].hasChildNodes() || entries[i].childNodes[7].firstChild.value == "none") {
                tmp = tmp.replace(",fix=<__fix__>", "");
            } else {
                tmp = tmp.replace("__fix__", entries[i].childNodes[7].firstChild.value);
            }
        }

        // set select, group and order
        tmp = tmp.replace("__select__", entries[i].childNodes[1].firstChild.checked.toString())
            .replace("__group__", entries[i].childNodes[2].firstChild.checked.toString())
            .replace("__order__", entries[i].childNodes[3].firstChild.value);

        // set aggregate if necessary
        if (entries[i].childNodes[4].firstChild.value != "none") {
            tmp = tmp.replace("__agg__", entries[i].childNodes[4].firstChild.value);
        } else {
            tmp = tmp.replace(",agg=<__agg__>", "");
        }

        // set filter if necessary
        if (entries[i].childNodes[5].firstChild.value != "none") {
            tmp = tmp.replace("__filterR__", aggMap[entries[i].childNodes[5].firstChild.value])
                .replace("__filterV__", entries[i].childNodes[6].firstChild.value);
        } else {
            tmp = tmp.replace(",filterR=<__filterR__>,filterV=<__filterV__>", "");
        }

        query += tmp;
        query += "&";

    }

    query += quCubeTmpl.replace("__cube__", selectedCube).replace("__select__", document.getElementById("to_selectCube").checked.toString());

    addToQueryList(query);
}

function addToQueryList(entry) {

    var tr = document.createElement("tr");
    var th = document.createElement("th");
    var a = document.createElement("a");
    a.setAttribute("href", entry);
    a.setAttribute("target", "_blank");
    var text = document.createTextNode(entry);

    document.getElementById("to_historyTable").insertBefore(tr, document.getElementById("to_historyTable").firstChild);
    tr.appendChild(th);
    th.appendChild(a);
    a.appendChild(text);

}