var variantDetails = angular.module("variantDetails", []);

variantDetails.controller('variantDetailsController', ['$scope', '$http', function ($scope, $http) {
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
