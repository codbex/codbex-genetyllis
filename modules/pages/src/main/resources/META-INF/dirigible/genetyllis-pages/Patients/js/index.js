var patients = angular.module('patients', ['ui.bootstrap', 'ngStorage', 'angularUtils.directives.dirPagination', 'angularjs-dropdown-multiselect']);

patients.config(function (paginationTemplateProvider) {
    paginationTemplateProvider.setPath('../components/pagination.html');
});

patients.controller('patientsController', ['$scope', '$http', '$localStorage', function ($scope, $http, $localStorage) {

    const patientsOptionsApi = '/services/v4/js/genetyllis-app/gen/api/patients/Patient.js';
    $scope.patientsDetail = []
    $http.get(patientsOptionsApi)
        .then(function (data) {
            $scope.patientsDetail = data.data;
            $scope.patientsInfo = data.data
            console.log($scope.homePageTable, "homePageTable")
            console.log($scope.patientsDetail, 'patientsDetail')
        });
    // _|_
    $scope.example1model = [];
    // $scope.example1data = [{ id: 5, label: "Platform" }, { id: 6, label: "Provider" }, { id: 7, label: "Status" }];
    $scope.example1data = [{ id: 7, label: "Gender" }, { id: 8, label: "Ethnicity" }, { id: 9, label: "Family history" }];
    $scope.setting2 = {
        scrollableHeight: '200px',
        scrollable: true,
        enableSearch: true
    };

    $scope.selectFucn = function () {
        $scope.homePageTable = ["PID", "LabId", "DOB", "Clinical history", "Analysis", "Dates"];
        for (let x = 0; x < $scope.example1model.length; x++) {
            let value = $scope.example1data.find(e => e.id == $scope.example1model[x].id)
            $scope.homePageTable.push(value.label);
        }
    }

    $scope.homePageTable = ["PID", "LabId", "DOB", "Clinical history", "Analysis", "Dates"];
    // _|_

    // $scope.perPage = 5;
    console.log($scope.perPage)
    const variantDetailsApi = '/services/v4/js/genetyllis-pages/Variants/services/variants.js';
    const alleleFrDetailsApi = '/services/v4/js/genetyllis-pages/Patients/services/alleleFr.js';
    $scope.patientsDetails = []
    $scope.variantsRef = ['A', 'G', 'C', 'T', 'U']
    $scope.addedLabId = [];
    $scope.addedClinicalHistoryId = [];
    $scope.addedFamilyHistoryId = [];
    $scope.addedVariantId = [];

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
        PATIENT_GENDERID: [],
        GENETYLLIS_PATIENT_POPULATIONID: []
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
        VARIANT_CHROMOSOME: '',
        VARIANT_START_FROM: '',
        VARIANT_END_TO: '',
        VARIANT_REF: '',
        VARIANT_ALT: '',
        VARIANT_CONSEQUENCE: []
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
        query.perPage = 20;
        query.currentPage = (($scope.currentPage - 1) * $scope.perPage);

        $http.post(patientsOptionsApi + "/filterPatients", JSON.stringify(query))
            .then(function (response) {
                console.log('response')
                console.log(response.data)

            }, function (response) {
            });
    }
    $http.get(patientsOptionsApi)
        .then(function (data) {
            // $scope.pathologyDatas = data.data;
            $scope.patientsDetails = data.data;
            console.log(patientsOptionsApi, 'patientsOptionsApi')
        });

    $http.get(variantDetailsApi)
        .then(function (data) {
            // $scope.pathologyDatas = data.data;
            $scope.variants = data.data;
            console.log($scope.variants, 'variants')
        });
    $http.get(alleleFrDetailsApi)
        .then(function (data) {
            for (let a = 0; a < 3; a++) {
                $scope.variants[a].Gene = data.data[a].Frequency;
                $scope.variants[a].Filter = data.data[a].GenderId;
            }
        })


    // LabID

    $scope.addLabIdFilter = function (args) {

        if ($scope.GENETYLLIS_PATIENT.GENETYLLIS_PATIENT_LABID.includes($scope.selectedLabId) || $scope.selectedLabId == '') return
        $scope.GENETYLLIS_PATIENT.GENETYLLIS_PATIENT_LABID.push($scope.selectedLabId);
        console.log($scope.GENETYLLIS_PATIENT);
        console.log($scope.GENETYLLIS_CLINICALHISTORY);
        console.log($scope.GENETYLLIS_FAMILYHISTORY);
        console.log($scope.GENETYLLIS_VARIANT);

    }

    $scope.removeLabId = function (i) {
        $scope.GENETYLLIS_PATIENT.GENETYLLIS_PATIENT_LABID.splice(i, 1);
    }

    // Clinical History ID
    $scope.removeClinicalHistoryId = function (i) {
        $scope.GENETYLLIS_CLINICALHISTORY.PATHOLOGY_CUI.splice(i, 1);

    }
    $scope.addClinicalHistoryId = function () {



        if ($scope.GENETYLLIS_CLINICALHISTORY.PATHOLOGY_CUI.includes($scope.selectedPatientConceptId) || $scope.selectedPatientConceptId == '') return

        $scope.GENETYLLIS_CLINICALHISTORY.PATHOLOGY_CUI.push($scope.selectedPatientConceptId);
    }

    // Family History ID
    $scope.removeFamilyHistoryId = function (i) {
        $scope.GENETYLLIS_FAMILYHISTORY.PATHOLOGY_CUI.splice(i, 1);

    }
    $scope.addFamilyHistoryId = function () {
        if ($scope.GENETYLLIS_FAMILYHISTORY.PATHOLOGY_CUI.includes($scope.selectedFamilyConceptId) || $scope.selectedFamilyConceptId == '') return

        $scope.GENETYLLIS_FAMILYHISTORY.PATHOLOGY_CUI.push($scope.selectedFamilyConceptId);
    }


    $scope.addVariantId = function (index) {
        if ($scope.addedVariantId.includes($scope.selectedVariant) || $scope.selectedVariant == undefined) return
        $scope.addedVariantId.push($scope.selectedVariant);
    }
    $scope.removeVariantId = function (i) {
        $scope.addedVariantId.splice(i, 1);
    }



    $scope.chromList = []
    for (let a = 1; a <= 22; a++) {
        $scope.chromList.push(`chr${a}`)
    }
    $scope.chromList.push(`chrX`)
    $scope.chromList.push(`chrY`)




    $scope.clearAllFilters = function () {
        // $scope.addedLabId = [];
        // $scope.addedClinicalHistoryId = [];
        // $scope.addedFamilyHistoryId = [];
        // $scope.addedVariantId = [];
        $scope.maleCheckbox = false;
        $scope.femaleCheckbox = false;
        $scope.otherGender = false;
        $scope.otherEthnicity = false;
        $scope.bulgarian = false;
        $scope.GENETYLLIS_PATIENT = {
            GENETYLLIS_PATIENT_LABID: [],
            PATIENT_AGE_FROM: '',
            PATIENT_AGE_TO: '',
            PATIENT_GENDERID: [],
            GENETYLLIS_PATIENT_POPULATIONID: []
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

        $scope.GENETYLLIS_VARIANT.VARIANT_CHROMOSOME = ''
        $scope.GENETYLLIS_VARIANT.VARIANT_START_FROM = ''
        $scope.GENETYLLIS_VARIANT.VARIANT_END_TO = ''
        $scope.GENETYLLIS_VARIANT.VARIANT_REF = ''
        $scope.GENETYLLIS_VARIANT.VARIANT_ALT = ''
        $scope.GENETYLLIS_VARIANT.VARIANT_CONSEQUENCE = ''
        $scope.GENETYLLIS_VARIANT.VARIANT_REF = ''
    }

    if ($scope.maleCheckbox == undefined) $scope.maleCheckbox = false;
    if ($scope.femaleCheckbox == undefined) $scope.femaleCheckbox = false;
    if ($scope.otherGender == undefined) $scope.otherGender = false;
    if ($scope.bulgarian == undefined) $scope.bulgarian = false;
    if ($scope.otherEthnicity == undefined) $scope.otherEthnicity = false;
    $scope.maleFunc = function () {

        if (!$scope.maleCheckbox) {
            $scope.GENETYLLIS_PATIENT.PATIENT_GENDERID.push(0)
        } else {
            var index = $scope.GENETYLLIS_PATIENT.PATIENT_GENDERID.indexOf(0);
            $scope.GENETYLLIS_PATIENT.PATIENT_GENDERID.splice(index, 1);
        }

    }
    $scope.femaleFunc = function () {
        if (!$scope.femaleCheckbox) {

            $scope.GENETYLLIS_PATIENT.PATIENT_GENDERID.push(1)
        } else {
            var index = $scope.GENETYLLIS_PATIENT.PATIENT_GENDERID.indexOf(1);
            $scope.GENETYLLIS_PATIENT.PATIENT_GENDERID.splice(index, 1);

        }

    }

    $scope.otherGenderFunc = function () {
        if (!$scope.otherGender) {
            $scope.GENETYLLIS_PATIENT.PATIENT_GENDERID.push(2)
        } else {
            var index = $scope.GENETYLLIS_PATIENT.PATIENT_GENDERID.indexOf(2);
            $scope.GENETYLLIS_PATIENT.PATIENT_GENDERID.splice(index, 1);
        }

    }


    $scope.bulgarianFunc = function () {
        if (!$scope.bulgarian) {
            $scope.GENETYLLIS_PATIENT.GENETYLLIS_PATIENT_POPULATIONID.push(12)
        } else {

            var index = $scope.GENETYLLIS_PATIENT.GENETYLLIS_PATIENT_POPULATIONID.indexOf(12);
            $scope.GENETYLLIS_PATIENT.GENETYLLIS_PATIENT_POPULATIONID.splice(index, 1)
        }
    }

    $scope.otherEthnicityFunc = function () {
        if (!$scope.otherEthnicity) {
            $scope.GENETYLLIS_PATIENT.GENETYLLIS_PATIENT_POPULATIONID.push(18)
        } else {
            var index = $scope.GENETYLLIS_PATIENT.GENETYLLIS_PATIENT_POPULATIONID.indexOf(12);
            $scope.GENETYLLIS_PATIENT.GENETYLLIS_PATIENT_POPULATIONID.splice(index, 1)
        }
    }

    $scope.getLocation = function (s) {
        $localStorage.$default({
            x: s
        });
    }

}]);

// patients.filter('startFrom', function () {

// })

