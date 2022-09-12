
var variantDetails = angular.module("variantDetails", ['ngStorage', 'angularUtils.directives.dirPagination']);
variantDetails.config(function (paginationTemplateProvider) {
    paginationTemplateProvider.setPath('../../components/pagination.html');
});

variantDetails.controller('variantDetailsController', ['$scope', '$http', function ($scope, $http) {
    $scope.addColumns = ["PID", "LabID", "DOB", "Gender", "Ethnicity", "Clinical history", "Family history", "Analysis", "Date", "Filter"]
    $scope.clinicalSignificance = ["Accession", "Pathology", "Significance", "Evaluation", "Review"]
    const variantDetailsApi = '/services/v4/js/genetyllis-pages/Variants/services/variants.js';
    $scope.variants;
    console.log("Hello")
    $http.get(variantDetailsApi)
        .then(function (data) {
            // $scope.pathologyDatas = data.data;
            $scope.variants = data.data;
            console.log("Hello", $scope.variants)
        });

}]);
