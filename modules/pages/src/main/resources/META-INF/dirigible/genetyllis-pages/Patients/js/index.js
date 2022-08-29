var patients = angular.module('patients', []);

patients.controller('patientsController', ['$scope', '$http', function ($scope, $http) {
    const variantDetailsApi = '/services/v4/js/genetyllis-pages/Variants/services/variants.js';
    const alleleFrDetailsApi = '/services/v4/js/genetyllis-pages/Patients/services/alleleFr.js';
    $scope.addColumns = ["PID", "LabID", "DOB", "Gender", "Ethnicity", "Clinical history", "Family history", "Analysis", "Dates"]
    $scope.addedLabId = [];
    $scope.addedClinicalHistoryId = [];
    $scope.addedFamilyHistoryId = [];
    $scope.addedVariantId = [];

    $scope.variants
    $http.get(variantDetailsApi)
        .then(function (data) {
            // $scope.pathologyDatas = data.data;
            $scope.variants = data.data;
        });
    $http.get(alleleFrDetailsApi)
        .then(function (data) {
            for (let a = 0; a < 3; a++) {
                $scope.variants[a].Gene = data.data[a].Frequency;
                $scope.variants[a].Filter = data.data[a].GenderId;
            }
        })






    // LabID

    $scope.addLabId = function () {

        if ($scope.addedLabId.includes($scope.LabId) || $scope.LabId == undefined) return
        $scope.addedLabId.push($scope.LabId);
    }

    $scope.removeLabId = function (i) {
        $scope.addedLabId.splice(i, 1);
    }

    // Clinical History ID
    $scope.removeClinicalHistoryId = function (i) {
        $scope.addedClinicalHistoryId.splice(i, 1);

    }
    $scope.addClinicalHistoryId = function () {


        if ($scope.addedClinicalHistoryId.includes($scope.ClinicalHistoryId) || $scope.ClinicalHistoryId == undefined) return

        $scope.addedClinicalHistoryId.push($scope.ClinicalHistoryId);
    }

    // Family History ID
    $scope.addFamilyHistoryId = function () {

        if ($scope.addedFamilyHistoryId.includes($scope.FamiliHistoryId) || $scope.FamiliHistoryId == undefined) return

        $scope.addedFamilyHistoryId.push($scope.FamiliHistoryId);
    }
    $scope.removeFamilyHistoryId = function (i) {
        $scope.addedFamilyHistoryId.splice(i, 1);
    }
    // Variant

    $scope.addVariantId = function (index) {
        console.log($scope.selectedVariant)
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
    console.log($scope.chromList)



    $scope.clearAllFilters = function () {
        $scope.addedLabId = [];
        $scope.addedClinicalHistoryId = [];
        $scope.addedFamilyHistoryId = [];
        $scope.addedVariantId = [];
        $scope.isFemaleChecked = false
    }
    $scope.checkedV = function () {
        console.log($scope.isFemaleChecked)
    }
}]);

