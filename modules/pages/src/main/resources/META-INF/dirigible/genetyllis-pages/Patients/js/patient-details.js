
var patientDetails = angular.module("patientDetails", ['ngStorage', 'angularUtils.directives.dirPagination']);
patientDetails.config(function (paginationTemplateProvider) {
    paginationTemplateProvider.setPath('../../components/pagination.html');
});
patientDetails.controller('patientDetailsController', ['$scope', '$http', '$localStorage', function ($scope, $http, $localStorage) {
    const variantDetailsApi = '/services/v4/js/genetyllis-pages/Variants/services/variants.js';
    const getPatientsIdApi = '/services/v4/js/genetyllis-pages/Variants/js/index.js';
    $scope.patientsDetails = $localStorage.x;
    console.log($localStorage.x, "localStorage");
    // localStorage.removeItem("ngStorage-x")
    $scope.variants;
    $scope.clickedUrl = "../../images/star.svg";
    $scope.notClickedUrl = "../../images/not-clicked-star.svg";

    // { Id: 2, url:  },
    // $scope.photo.clicked = true;
    // console.log($scope.photo.clicked)

    $http.get(variantDetailsApi)
        .then(function (data) {
            // $scope.pathologyDatas = data.data;
            $scope.variants = data.data;
            console.log("Hello", $scope.variants);
        });

    // $scope.imageHandler = function (index) {
    //     $scope.variants.splice(index, 1);

    // }
    $scope.addColumns = ["", "HGVS", "Filter", "Gene", "Pseudo", "Consequence", "Homozygous", "Pathology", "Clinical significance", "Allele Freq", "Af (men)", "AF (Bulgarian)", "Analysis"]
}]);

