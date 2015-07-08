// HTML modal and URL templates

var TEMPLATES = new function () {

    // URL Templates

    this.CUBE_URL = "./backend?func=<getCubes>&id=<__id__>&hash=<__hash__>";
    this.DIMENSION_URL = "./backend?func=<getDimensions>&c=<__cube__>&id=<__id__>&hash=<__hash__>";
    this.MEASURE_URL = "./backend?func=<getMeasures>&c=<__cube__>&id=<__id__>&hash=<__hash__>";
    this.ENTITY_URL = "./backend?func=<getEntities>&c=<__cube__>&d=<__dimension__>&id=<__id__>&hash=<__hash__>";
    this.GET_HASH_URL = "./backend?func=<getHash>&id=<__id__>";
    this.EXECUTE_URL = "./backend?func=<execute>&c=<__cube__>,select=<false>&id=<__id__>&hash=<__hash__>";

    this.DIMENSION_PART_URL = "&d=<__dimension__>,select=<true>,group=<true>";
    this.DIMENSION_ROLLUP_PART_URL = "&d=<__dimension__>,select=<true>,group=<false>,agg=<min>"; // Note: agg=<min> provides dimensionName, e.g. http://code-research.eu/resource/Country
    this.DIMENSION_FIX_PART_URL = ",fix=<__fix__>";
    this.MEASURE_PART_URL = "&m=<__measure__>,select=<true>,group=<true>,agg=<__agg__>";

    this.FILTER_DIMENSION_PART_URL = "&d=<__dimension__>,select=<false>,group=<false>,fix=<__fix__>";
    this.FILTER_MEASURE_PART_URL = "&m=<__measure__>,select=<false>,filterR=<__filterR__>,filterV=<__filterV__>";

    // TODO: observation requests for merger
    this.MERGER_DIMENSION_PART_URL = "&d=<__dimension__>,select=<true>,group=<false>";
    this.MERGER_MEASURE_PART_URL = "&m=<__measure__>,select=<true>,group=<false>";



    // HTML Templates

    this.MODAL_DIMENSION_TEMPLATE = '<div class="modal fade" id="id_entityModal"> <div class="modal-dialog modal-lg"> <div class="modal-content"> <div class="modal-header"> <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button> <h4 class="modal-title">Select Entities of Dimension "__label__" <span class="modal-subtitle">URI: __uri__</h4><div class="btn-group" id="id_entityModalNavigation"></div></div> <div class="modal-body" id="id_entityModalBody"></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button><button type="button" class="btn btn-primary" data-dismiss="modal" id="id_entityModalOkay">Apply</button></div></div></div></div>';
    this.MODAL_LOGIN_TEMPLATE = '<div class="modal fade" id="id_loginModal"><div class="modal-dialog modal-sm"><div class="modal-content"><div class="modal-header"><h4 class="modal-title">Authentication</h4></div><div class="modal-body" id="id_loginModalBody"><form><div class="form-group"><label for="id_loginModalID" class="control-label">Please enter your user ID:</label><input type="text" class="form-control" id="id_loginModalID"></div></form></div><div class="modal-footer"><button type="button" class="btn btn-primary" data-dismiss="modal" id="id_loginModalOkay">Login</button></div></div></div></div>';
    this.MODAL_LOADING_TEMPLATE = '<div class="modal fade" id="id_loadingModal"><div class="modal-dialog modal-sm"><div class="modal-content"><div class="modal-header"><h4 class="modal-title">__title__</h4></div><div class="modal-body"><div class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" style="width: 100%"></div></div></div></div></div></div>';
    this.MODAL_RESULT_TEMPLATE = '<div class="modal fade" id="id_resultModal"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title">Data Cell Summary</h4></div><div class="modal-body" id="id_resultModalBody"></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>';

    this.MERGE_TABLE_HEAD = '<tr><th></th><th>__cube1__</th><th>__cube2__</th><th></th></tr>';

    // Text Templates

    // Info tooltip messages

    this.HINT_CUBE = "Select one of your datasets here. A default configuration of dimensions and their entities as well a measure will be loaded.";
    this.HINT_DIMENSION = "Assign dimensions to up to three axes. Use the plus icon to add dimensions and drag & drop to move them up or down. Select a dimension's entities to regulate the number of results. For a conventional tabular layout just use the X and Y axes.";
    this.HINT_MEASURE = "Select a measure to be displayed. Higher values will be closer to the currently selected accent color.";
    this.HINT_FILTER = "Add filters to downsize the number of results. Note that filtering is applied at observation level (before any aggregation).";
    this.HINT_CHART = 'The shown chart displays all given combinations of dimensions (the observations) as rows. The last dimension of all the axes lists is encoded in color - in this case the dimension "__dimension__".';
};