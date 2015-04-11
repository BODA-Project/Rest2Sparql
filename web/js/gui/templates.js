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
    this.DIMENSION_ROLLUP_PART_URL = "&d=<__dimension__>,select=<true>,group=<false>,agg=<min>"; // TEST: agg=<min> liefert dimensionName, also z.b http://code-research.eu/resource/Country

    this.DIMENSION_FIX_PART_URL = ",fix=<__fix__>";
    this.MEASURE_PART_URL = "&m=<__measure__>,select=<true>,group=<false>,agg=<__agg__>";

    this.FILTER_DIMENSION_PART_URL = "&d=<__dimension__>,select=<false>,group=<false>,fix=<__fix__>";
    this.FILTER_MEASURE_PART_URL = "&m=<__measure__>,select=<false>,group=<false>,filterR=<__filterR__>,filterV=<__filterV__>";


    // HTML Templates

    this.MODAL_DIMENSION_TEMPLATE = '<div class="modal fade" id="id_modal"> <div class="modal-dialog modal-lg"> <div class="modal-content"> <div class="modal-header"> <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button> <h4 class="modal-title">Choose Entities for Dimension: &lt;__label__&gt;</h4><a href="#">select all</a> | <a href="#">select none</a> | <a href="#">previous 10</a> | <a href="#">next 10</a> | <a href="#">reset entities</a> (todo) </div> <div class="modal-body" id="id_modalBody"></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button><button type="button" class="btn btn-primary" data-dismiss="modal" id="id_modalOkay">Okay</button></div></div></div></div>';
    //this.MODAL_DIMENSION_TEMPLATE = '<div class="modal fade" id="id_modal"> <div class="modal-dialog"> <div class="modal-content"> <div class="modal-header"> <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button> <h4 class="modal-title">Choose Entities for Dimension: &lt;__label__&gt;</h4> </div> <div class="modal-body" id="id_modalBody"></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button><button type="button" class="btn btn-primary" data-dismiss="modal" id="id_modalOkay">Okay</button></div></div></div></div>';
    this.MODAL_LOGIN_TEMPLATE = '<div class="modal fade" id="id_loginModal"><div class="modal-dialog modal-sm"><div class="modal-content"><div class="modal-header"><h4 class="modal-title">Authentication</h4></div><div class="modal-body" id="id_loginModalBody"><form><div class="form-group"><label for="id_loginModalID" class="control-label">Please enter your user ID:</label><input type="text" class="form-control" id="id_loginModalID"></div></form></div><div class="modal-footer"><button type="button" class="btn btn-primary" data-dismiss="modal" id="id_loginModalOkay">Okay</button></div></div></div></div>';
    this.MODAL_LOADING_TEMPLATE = '<div class="modal fade" id="id_loadingModal"><div class="modal-dialog modal-sm"><div class="modal-content"><div class="modal-header"><h4 class="modal-title">__title__</h4></div><div class="modal-body"><div class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" style="width: 100%"></div></div></div></div></div></div>';

};






// TODO delete if not needed anymore:

// AJAX TESTS Queries
var testQuery1_getCubes = "./backend?func=<getCubes>&id=<8023903>&hash=<7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc>";
var testQuery2_old = "./backend?func=<execute>&id=<8023903>&hash=<7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc>&m=<http://code-research.eu/resource/Euro>,select=<true>,group=<false>,order=<-1>&d=<http://code-research.eu/resource/Country>,select=<true>,group=<false>,order=<-1>&d=<http://code-research.eu/resource/Species>,select=<false>,group=<false>,order=<-1>,fix=<http://code-research.eu/resource/Entity-279a95fa-ecb7-4ed3-9a1d-c250c6d1acd9>&d=<http://code-research.eu/resource/Year>,select=<true>,group=<false>,order=<-1>&c=<http://code-research.eu/resource/Dataset-173bbc55-68ca-4398-bd28-232415f7db4d>,select=<true>";
var testQuery3_getDimensions = "./backend?func=%3CgetDimensions%3E&c=%3Chttp://code-research.eu/resource/Dataset-173bbc55-68ca-4398-bd28-232415f7db4d%3E&id=%3C8023903%3E&hash=%3C7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc%3E";
var testQuery4_agg_1d = "./backend?func=%3Cexecute%3E&id=%3C8023903%3E&hash=%3C7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc%3E&d=%3Chttp://code-research.eu/resource/Country%3E,select=%3Ctrue%3E,group=%3Ctrue%3E,order=%3C-1%3E&d=%3Chttp://code-research.eu/resource/Species%3E,select=%3Cfalse%3E,group=%3Cfalse%3E,order=%3C-1%3E&d=%3Chttp://code-research.eu/resource/Year%3E,select=%3Cfalse%3E,group=%3Cfalse%3E,order=%3C-1%3E&m=%3Chttp://code-research.eu/resource/Euro%3E,select=%3Ctrue%3E,group=%3Cfalse%3E,order=%3C-1%3E,agg=%3Csum%3E&c=%3Chttp://code-research.eu/resource/Dataset-173bbc55-68ca-4398-bd28-232415f7db4d%3E,select=%3Cfalse%3E";
var testQuery5_agg_2d = "./backend?func=%3Cexecute%3E&id=%3C8023903%3E&hash=%3C7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc%3E&d=%3Chttp://code-research.eu/resource/Country%3E,select=%3Ctrue%3E,group=%3Ctrue%3E,order=%3C-1%3E&d=%3Chttp://code-research.eu/resource/Species%3E,select=%3Cfalse%3E,group=%3Cfalse%3E,order=%3C-1%3E&d=%3Chttp://code-research.eu/resource/Year%3E,select=%3Ctrue%3E,group=%3Ctrue%3E,order=%3C-1%3E&m=%3Chttp://code-research.eu/resource/Euro%3E,select=%3Ctrue%3E,group=%3Cfalse%3E,order=%3C-1%3E,agg=%3Csum%3E&c=%3Chttp://code-research.eu/resource/Dataset-173bbc55-68ca-4398-bd28-232415f7db4d%3E,select=%3Cfalse%3E";
var testQuery6_agg_3d = "./backend?func=%3Cexecute%3E&id=%3C8023903%3E&hash=%3C7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc%3E&d=%3Chttp://code-research.eu/resource/Country%3E,select=%3Ctrue%3E,group=%3Ctrue%3E,order=%3C-1%3E&d=%3Chttp://code-research.eu/resource/Species%3E,select=%3Ctrue%3E,group=%3Ctrue%3E,order=%3C-1%3E,fix=%3Chttp://code-research.eu/resource/Entity-23c3225d-ac7a-40a3-80de-a10ff10a7428,http://code-research.eu/resource/Entity-02de3c11-3f45-448d-b458-8db3534fedc6,http://code-research.eu/resource/Entity-02a8e8de-ad5c-4922-9775-5083e116a37f,http://code-research.eu/resource/Entity-dca07aa6-098e-4bb8-98f4-19d10335b9fa,http://code-research.eu/resource/Entity-25563186-cefe-45a8-a5ff-340c6e908124,http://code-research.eu/resource/Entity-246eacbc-86f1-414e-a0eb-3b80da81c917,http://code-research.eu/resource/Entity-2dcec751-567a-42d7-b0d1-9da463c5a7c2%3E&d=%3Chttp://code-research.eu/resource/Year%3E,select=%3Ctrue%3E,group=%3Ctrue%3E,order=%3C-1%3E&m=%3Chttp://code-research.eu/resource/Euro%3E,select=%3Ctrue%3E,group=%3Cfalse%3E,order=%3C-1%3E,agg=%3Csum%3E&c=%3Chttp://code-research.eu/resource/Dataset-173bbc55-68ca-4398-bd28-232415f7db4d%3E,select=%3Cfalse%3E";
var testQuery7_all_facts = "./backend?func=%3Cexecute%3E&id=%3C8023903%3E&hash=%3C7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc%3E&m=%3Chttp://code-research.eu/resource/Euro%3E,select=%3Ctrue%3E,group=%3Cfalse%3E,order=%3C-1%3E,agg=%3Csum%3E&d=%3Chttp://code-research.eu/resource/Species%3E,select=%3Ctrue%3E,group=%3Ctrue%3E,order=%3C-1%3E&d=%3Chttp://code-research.eu/resource/Country%3E,select=%3Ctrue%3E,group=%3Ctrue%3E,order=%3C-1%3E&d=%3Chttp://code-research.eu/resource/Year%3E,select=%3Ctrue%3E,group=%3Ctrue%3E,order=%3C-1%3E&c=%3Chttp://code-research.eu/resource/Dataset-173bbc55-68ca-4398-bd28-232415f7db4d%3E,select=%3Cfalse%3E";
var testQuery8_test = "./backend?func=<execute>&c=<http://code-research.eu/resource/Dataset-173bbc55-68ca-4398-bd28-232415f7db4d>,select=<false>&id=<8023903>&hash=<7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc>&d=<http://code-research.eu/resource/Country>,select=<true>,group=<true>,fix=<http://code-research.eu/resource/Entity-f36ea72d-9c8b-4c2e-81c8-675d2d613b29,http://code-research.eu/resource/Entity-806e4b72-f41f-48f5-83d3-349e3f20410e,http://code-research.eu/resource/Entity-58724794-f291-4ee3-80ff-32b46948d95b,http://code-research.eu/resource/Entity-0f0335de-1f58-46f4-bae2-bdb413b33410,http://code-research.eu/resource/Entity-6490cd2f-a883-4c66-8312-7cca78218a0f,http://code-research.eu/resource/Entity-a247a5f2-68e8-44da-a704-63fddea89c56,http://code-research.eu/resource/Entity-d970556f-b493-4b98-846d-06e76a321b62,http://code-research.eu/resource/Entity-cd924575-5e31-43e9-a23b-e6df99300e4f,http://code-research.eu/resource/Entity-28509081-1d0e-4b65-b74d-4233be5758e9,http://code-research.eu/resource/Entity-2d2719ec-ee4b-4608-a9dd-5ab3558076ab,http://code-research.eu/resource/Entity-a15344d6-68b0-43c4-b520-d8f4fb4e1719,http://code-research.eu/resource/Entity-7a19c463-b7a5-457b-a532-e1b973b6df00,http://code-research.eu/resource/Entity-c753cd28-967d-400f-a26b-f97a9f62bd0d,http://code-research.eu/resource/Entity-96e4ff5c-095e-4845-a5dc-4d67630e099c,http://code-research.eu/resource/Entity-6bae61ba-200d-4883-b990-0eb8d2009ed5,http://code-research.eu/resource/Entity-80869b46-9704-4b45-9a65-d104b07b5856,http://code-research.eu/resource/Entity-1b7500d2-6e12-42f0-a006-f38ae763418f,http://code-research.eu/resource/Entity-6485f973-7fa2-4696-b132-b1b97e4fb9ee,http://code-research.eu/resource/Entity-b5e33c93-74ff-418a-8c70-0f6024aa38ce,http://code-research.eu/resource/Entity-a2b52514-1fda-4fdd-9a36-413343787622>&d=<http://code-research.eu/resource/Species>,select=<true>,group=<true>,fix=<http://code-research.eu/resource/Entity-876d5090-1d1e-4c35-8e4c-8df5c6a1e8bc,http://code-research.eu/resource/Entity-f8765b24-fdbe-453d-95d5-0c8dd5682204,http://code-research.eu/resource/Entity-488082c9-390c-4c1d-81df-f90d52e30ae5,http://code-research.eu/resource/Entity-b7c6572e-3ba0-4c32-b668-326c4ab5d284,http://code-research.eu/resource/Entity-ecb8502e-1d92-44b3-b595-a918668cf750,http://code-research.eu/resource/Entity-41ae2883-f0a1-4aa2-b93d-facb72fcc4c1,http://code-research.eu/resource/Entity-458b0ae6-706e-4fab-b38b-065f13a498a5,http://code-research.eu/resource/Entity-25563186-cefe-45a8-a5ff-340c6e908124,http://code-research.eu/resource/Entity-825b1100-c375-434e-a2e1-dd3cb3e274c2,http://code-research.eu/resource/Entity-e1ab2fab-93dd-48f1-9b4e-4f567938241f,http://code-research.eu/resource/Entity-4a26dc02-6a66-4426-a9cd-3ef7d14a0927,http://code-research.eu/resource/Entity-069b5fa7-566b-474d-a109-ed1ab59491af,http://code-research.eu/resource/Entity-61d336ef-7f23-4ab4-883d-13020b57c259,http://code-research.eu/resource/Entity-96a1bfb6-0525-40a4-9cd9-2d53ccfa6c63,http://code-research.eu/resource/Entity-3d7d9fdb-aa32-4ebd-b373-305311594bb2,http://code-research.eu/resource/Entity-cd4955cc-ebba-4c17-a281-de7b4ad7c3bf,http://code-research.eu/resource/Entity-f4c70b83-668b-4650-bb3f-8e65d7a90311,http://code-research.eu/resource/Entity-a236243e-3920-421f-92d1-e7e3f530c459,http://code-research.eu/resource/Entity-c4db0260-56b8-49d6-ac52-c57a9adc922a,http://code-research.eu/resource/Entity-f089d4b5-413c-4321-a5ce-6b3bdef8e144>&d=<http://code-research.eu/resource/Year>,select=<true>,group=<true>,fix=<http://code-research.eu/resource/Entity-ba6add0e-2326-4570-9e9b-6a34a69f1a0b,http://code-research.eu/resource/Entity-70333490-1557-4c74-9215-3dedfa1ceb36,http://code-research.eu/resource/Entity-d62ce835-3f59-467e-8bf2-1ab6839d46c2,http://code-research.eu/resource/Entity-ac13007b-7a4c-4787-82cd-907e7219e3db,http://code-research.eu/resource/Entity-2e97ec57-bbe4-403a-a829-f06cd0b9e217,http://code-research.eu/resource/Entity-23ba2426-d022-463d-a7c5-c98979860e24,http://code-research.eu/resource/Entity-3ff13789-6290-4a4b-95c4-0bd27a01bed4,http://code-research.eu/resource/Entity-38e07069-c6ce-4561-8c89-13d523bed01c,http://code-research.eu/resource/Entity-2d641851-cd7d-4639-9fac-0e969039a886,http://code-research.eu/resource/Entity-57c8ffd6-9093-4a22-9a4b-1bda4f52155a,http://code-research.eu/resource/Entity-15c5abb9-14e0-44e7-b03e-f0173f35fe42>&m=<http://code-research.eu/resource/Euro>,select=<true>,group=<false>,agg=<sum>";
//var testQuery8_test = "func=<execute>&c=<http://code-research.eu/resource/Dataset-173bbc55-68ca-4398-bd28-232415f7db4d>,select=<false>&id=<8023903>&hash=<7fb2f0dd7d608ea6b82eaa9b6e38aa80e1b266d8f8610a2c4c2671368df2b7bc>&d=<http://code-research.eu/resource/Country>,select=<true>,group=<true>,fix=<http://code-research.eu/resource/Entity-f36ea72d-9c8b-4c2e-81c8-675d2d613b29,http://code-research.eu/resource/Entity-806e4b72-f41f-48f5-83d3-349e3f20410e,http://code-research.eu/resource/Entity-58724794-f291-4ee3-80ff-32b46948d95b,http://code-research.eu/resource/Entity-0f0335de-1f58-46f4-bae2-bdb413b33410,http://code-research.eu/resource/Entity-6490cd2f-a883-4c66-8312-7cca78218a0f,http://code-research.eu/resource/Entity-a247a5f2-68e8-44da-a704-63fddea89c56,http://code-research.eu/resource/Entity-d970556f-b493-4b98-846d-06e76a321b62,http://code-research.eu/resource/Entity-cd924575-5e31-43e9-a23b-e6df99300e4f,http://code-research.eu/resource/Entity-28509081-1d0e-4b65-b74d-4233be5758e9,http://code-research.eu/resource/Entity-2d2719ec-ee4b-4608-a9dd-5ab3558076ab,http://code-research.eu/resource/Entity-a15344d6-68b0-43c4-b520-d8f4fb4e1719,http://code-research.eu/resource/Entity-7a19c463-b7a5-457b-a532-e1b973b6df00,http://code-research.eu/resource/Entity-c753cd28-967d-400f-a26b-f97a9f62bd0d,http://code-research.eu/resource/Entity-96e4ff5c-095e-4845-a5dc-4d67630e099c,http://code-research.eu/resource/Entity-6bae61ba-200d-4883-b990-0eb8d2009ed5,http://code-research.eu/resource/Entity-80869b46-9704-4b45-9a65-d104b07b5856,http://code-research.eu/resource/Entity-1b7500d2-6e12-42f0-a006-f38ae763418f,http://code-research.eu/resource/Entity-6485f973-7fa2-4696-b132-b1b97e4fb9ee,http://code-research.eu/resource/Entity-b5e33c93-74ff-418a-8c70-0f6024aa38ce,http://code-research.eu/resource/Entity-a2b52514-1fda-4fdd-9a36-413343787622>&d=<http://code-research.eu/resource/Species>,select=<true>,group=<true>,fix=<http://code-research.eu/resource/Entity-876d5090-1d1e-4c35-8e4c-8df5c6a1e8bc,http://code-research.eu/resource/Entity-f8765b24-fdbe-453d-95d5-0c8dd5682204,http://code-research.eu/resource/Entity-488082c9-390c-4c1d-81df-f90d52e30ae5,http://code-research.eu/resource/Entity-b7c6572e-3ba0-4c32-b668-326c4ab5d284,http://code-research.eu/resource/Entity-ecb8502e-1d92-44b3-b595-a918668cf750,http://code-research.eu/resource/Entity-41ae2883-f0a1-4aa2-b93d-facb72fcc4c1,http://code-research.eu/resource/Entity-458b0ae6-706e-4fab-b38b-065f13a498a5,http://code-research.eu/resource/Entity-25563186-cefe-45a8-a5ff-340c6e908124,http://code-research.eu/resource/Entity-825b1100-c375-434e-a2e1-dd3cb3e274c2,http://code-research.eu/resource/Entity-e1ab2fab-93dd-48f1-9b4e-4f567938241f,http://code-research.eu/resource/Entity-4a26dc02-6a66-4426-a9cd-3ef7d14a0927,http://code-research.eu/resource/Entity-069b5fa7-566b-474d-a109-ed1ab59491af,http://code-research.eu/resource/Entity-61d336ef-7f23-4ab4-883d-13020b57c259,http://code-research.eu/resource/Entity-96a1bfb6-0525-40a4-9cd9-2d53ccfa6c63,http://code-research.eu/resource/Entity-3d7d9fdb-aa32-4ebd-b373-305311594bb2,http://code-research.eu/resource/Entity-cd4955cc-ebba-4c17-a281-de7b4ad7c3bf,http://code-research.eu/resource/Entity-f4c70b83-668b-4650-bb3f-8e65d7a90311,http://code-research.eu/resource/Entity-a236243e-3920-421f-92d1-e7e3f530c459,http://code-research.eu/resource/Entity-c4db0260-56b8-49d6-ac52-c57a9adc922a,http://code-research.eu/resource/Entity-f089d4b5-413c-4321-a5ce-6b3bdef8e144>&d=<http://code-research.eu/resource/Year>,select=<true>,group=<true>,fix=<http://code-research.eu/resource/Entity-ba6add0e-2326-4570-9e9b-6a34a69f1a0b,http://code-research.eu/resource/Entity-70333490-1557-4c74-9215-3dedfa1ceb36,http://code-research.eu/resource/Entity-d62ce835-3f59-467e-8bf2-1ab6839d46c2,http://code-research.eu/resource/Entity-ac13007b-7a4c-4787-82cd-907e7219e3db,http://code-research.eu/resource/Entity-2e97ec57-bbe4-403a-a829-f06cd0b9e217,http://code-research.eu/resource/Entity-23ba2426-d022-463d-a7c5-c98979860e24,http://code-research.eu/resource/Entity-3ff13789-6290-4a4b-95c4-0bd27a01bed4,http://code-research.eu/resource/Entity-38e07069-c6ce-4561-8c89-13d523bed01c,http://code-research.eu/resource/Entity-2d641851-cd7d-4639-9fac-0e969039a886,http://code-research.eu/resource/Entity-57c8ffd6-9093-4a22-9a4b-1bda4f52155a,http://code-research.eu/resource/Entity-15c5abb9-14e0-44e7-b03e-f0173f35fe42>&m=<http://code-research.eu/resource/Euro>,select=<true>,group=<false>,agg=<sum>";
