var addPatient = angular.module("addPatient", []);

addPatient.controller('addPatientController', ['$scope', '$http', function ($scope, $http) {

    var api = "/services/v4/js/Home-page/services/patientInfo.js";
    var patientsOptionsApi = '/services/v4/js/genetyllis-app/gen/api/patients/Patient.js';
    var clinicalHistroryApi = '/services/v4/js/genetyllis-app/gen/api/patients/ClinicalHistory.js';
    var familyHistroryApi = '/services/v4/js/genetyllis-app/gen/api/patients/FamilyHistory.js';
    var populationApi = '/services/v4/js/genetyllis-app/gen/api/nomenclature/Population.js';
    var relationApi = '/services/v4/js/genetyllis-app/gen/api/nomenclature/Relation.js';
    var pathologyApi = '/services/v4/js/genetyllis-pages/Home-page/services/pathology.js';

    $scope.pathologyDatas = {}
    $scope.entity = {};
    $scope.clinicalHistoryData = {};
    $scope.familyHistoryData = {};
    $scope.relationData = {}
    let pathologyId;
    let familyPathologyId;
    let familyRelationId;
    let familyMebmer = {}
    $scope.savePatient = function () {

    }
    $scope.getPathologyId = function () {
        getId($scope.pathologyId)
    }
    $scope.getFamilyPathologyId = function () {
        getFamilyPathologyId($scope.familyPathologyId)
    }

    $scope.create = function () {

        if ($scope.entity.GenderId == 'male') $scope.entity.GenderId = 1
        else if ($scope.entity.GenderId == 'female') $scope.entity.GenderId = 2
        else $scope.entity.GenderId = 3;

        $http.post(api, JSON.stringify($scope.entity))
            .then(function (data) {
                // load();
            }, function (data) {
            });

    };

    // function load() {
    //     $http.get(api)
    //         .then(function (data) {
    //             $scope.data = data.data;
    //             $scope.data.map(el => {
    //                 if (el.GenderId === 1) {
    //                     el.GenderId = "Male";
    //                 } else {
    //                     el.GenderId = "Female";
    //                 }
    //             })
    //         });
    // }
    // load();

    function patientsLoad() {
        $http.get(patientsOptionsApi)
            .then(function (data) {
                $scope.patientsOptions = data.data;
                console.log($scope.patientsOptions)

            });
    }
    patientsLoad();

    function pathologyLoad() {
        $http.get(pathologyApi)
            .then(function (data) {
                console.log(data)
                $scope.pathologyDatas = data.data;
            });
    }
    pathologyLoad();

    function getId(id) {
        $scope.pathologyName = $scope.pathologyDatas.filter(el => id == el.PATHOLOGY_CUI);
        pathologyId = $scope.pathologyName[0].PATHOLOGY_ID;
    }

    function getFamilyPathologyId(id) {
        $scope.familyPathologyName = $scope.pathologyDatas.filter(el => id == el.PATHOLOGY_CUI);
        pathologyId = $scope.familyPathologyName[0].PATHOLOGY_ID;
    }


    // Clinical History
    function clinicalHistroryLoad() {

        $http.get(clinicalHistroryApi)
            .then(function (data) {
                familyMebmer = data.data;
            });
    }
    clinicalHistroryLoad();

    $scope.addEntryClinicalHistory = function () {

        $scope.clinicalHistoryData.PathologyId = pathologyId;
        $http.post(clinicalHistroryApi, JSON.stringify($scope.clinicalHistoryData))
            .then(function (data) {
                console.log(data);
            }, function (data) {
            });

    };

    // Family History 
    // let relationId = [];
    function familyHistroryLoad() {

        $http.get(familyHistroryApi)
            .then(function (data) {
            })

    }
    familyHistroryLoad();
    $scope.addEntryFamilyHistory = function () {
        $scope.familyHistoryData.PathologyId = pathologyId;
        console.log(familyMebmer)
        $http.post(familyHistroryApi, JSON.stringify($scope.familyHistoryData))
            .then(function (data) {

            }, function (data) {
            });

    };

    // Ralation

    $scope.getPatientsId = function () {
        console.log($scope.familyHistoryData.LabId);
        $http.get(patientsOptionsApi + "/" + $scope.familyHistoryData.LabId)
            .then(data => {
                console.log(data)
            })
    }
    function relationsLoad() {

        $http.get(relationApi)
            .then(function (data) {
                // let gosho = data.data.map(el=>el.find)
                $scope.relationData = data.data;
            });
    }
    relationsLoad();

    $scope.getRelationId = function () {
        familyRelationId = $scope.relationData.filter(el => el.RelationType == $scope.relationId)
        // if (familyRelationId[0]) familyRelationId[0].Id
        // return
    }
    $scope.resetGetRelationId = function ($event) {
        $event.target.value = ''
    }

}]);