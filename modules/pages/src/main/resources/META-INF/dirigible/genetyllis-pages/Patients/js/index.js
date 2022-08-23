var patients = angular.module('patients', []);

patients.controller('patientsController', ['$scope', '$http', function ($scope, $http) {
    const variantDetailsApi = '/services/v4/js/genetyllis-pages/Variants/services/variants.js';
    const alleleFrDetailsApi = '/services/v4/js/genetyllis-pages/Patients/services/alleleFr.js';
    $scope.addColumns = ["PID", "LabID", "DOB", "Gender", "Ethnicity", "Clinical history", "Family history", "Analysis", "Dates"]

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
