var patients = angular.module('patients', []);

patients.controller('patientsController', ['$scope', '$http', function ($scope, $http) {
    const variantDetailsApi = '/services/v4/js/genetyllis-pages/Variants/services/variants.js';
    const alleleFrDetailsApi = '/services/v4/js/genetyllis-pages/Patients/services/alleleFr.js';
    const patientsOptionsApi = '/services/v4/js/genetyllis-app/gen/api/patients/Patient.js';
    $scope.addColumns = ["PID", "LabID", "DOB", "Gender", "Ethnicity", "Clinical history", "Family history", "Analysis", "Dates"]

    $scope.perPage = 20;
    $scope.currentPage = 1;

    $scope.labIds = [];
    $scope.selectedLabId = '';
    $scope.selectedLabIds = [];

    $scope.conceptIds = [];
    $scope.selectedPatientConceptId = '';
    $scope.selectedPatientConceptIds = [];

    $scope.selectedFamilyConceptId = '';
    $scope.selectedFamilyConceptIds = [];

    $scope.hgvs = [];
    $scope.selectedHgvs = '';
    $scope.selectedHgvsArr = [];

    $scope.GENETYLLIS_PATIENT = {
        GENETYLLIS_PATIENT_LABID: [],
        PATIENT_AGE_FROM: '',
        PATIENT_AGE_TO: '',
        PATIENT_GENDERID: '',
        GENETYLLIS_PATIENT_POPULATIONID: ''
    }

    $scope.GENETYLLIS_CLINICALHISTORY = {
        PATHOLOGY_CUI: [],
        GENETYLLIS_CLINICALHISTORY_AGEONSET_FROM: '',
        GENETYLLIS_CLINICALHISTORY_AGEONSET_TO: ''
    }

    $scope.GENETYLLIS_FAMILYHISTORY = {
        PATHOLOGY_CUI: [],
        GENETYLLIS_CLINICALHISTORY_AGEONSET_FROM: '',
        GENETYLLIS_CLINICALHISTORY_AGEONSET_TO: ''
    }

    $scope.GENETYLLIS_VARIANT = {
        VARIANT_HGVS: []
    }

    $scope.addLabIdFilter = function (labId) {
        $scope.GENETYLLIS_PATIENT.GENETYLLIS_PATIENT_LABID.push(labId)
        $scope.selectedLabId = '';
    }

    $scope.addClinicalHistoryCuiFilter = function (cui) {
        $scope.GENETYLLIS_CLINICALHISTORY.PATHOLOGY_CUI.push(cui)
        $scope.selectedPatientConceptId = '';
    }

    $scope.addFamilyHistoryCuiFilter = function (cui) {
        $scope.GENETYLLIS_FAMILYHISTORY.PATHOLOGY_CUI.push(cui)
        $scope.selectedFamilyConceptId = '';
    }

    $scope.addVariantHgvsFilter = function (hgvs) {
        $scope.GENETYLLIS_VARIANT.VARIANT_HGVS.push(hgvs)
        $scope.selectedHgvs = '';
    }

    $scope.filter = function () {
        var query = {};
        query.GENETYLLIS_PATIENT = $scope.GENETYLLIS_PATIENT;
        query.GENETYLLIS_CLINICALHISTORY = $scope.GENETYLLIS_CLINICALHISTORY;
        query.GENETYLLIS_FAMILYHISTORY = $scope.GENETYLLIS_FAMILYHISTORY;
        query.GENETYLLIS_VARIANT = $scope.GENETYLLIS_VARIANT;
        query.perPage = $scope.perPage;
        query.currentPage = (($scope.currentPage - 1) * $scope.perPage);

        $http.post(patientsOptionsApi + "/filterPatients", JSON.stringify(query))
            .then(function (response) {
                console.log('response')
                console.log(response.data)

            }, function (response) {
            });
    }

    $scope.variants
    $http.get(variantDetailsApi)
        .then(function (data) {
            // $scope.pathologyDatas = data.data;
            $scope.variants = data.data;
            console.log("Hello", $scope.variants)
        });
    $http.get(alleleFrDetailsApi)
        .then(function (data) {
            console.log(data.data)
            for (let a = 0; a < 3; a++) {
                $scope.variants[a].Gene = data.data[a].Frequency;
                $scope.variants[a].Filter = data.data[a].GenderId;
                console.log(data.data[a])
            }
        })
}]);
