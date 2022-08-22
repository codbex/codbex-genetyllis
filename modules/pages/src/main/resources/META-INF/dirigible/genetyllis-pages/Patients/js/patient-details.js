var patientDetails = angular.module("patientDetails", []);

patientDetails.controller('patientDetailsController', ['$scope', '$http', function ($scope, $http) {
    const variantDetailsApi = '/services/v4/js/genetyllis-pages/Variants/services/variants.js';
    $scope.variants;
    $scope.clickedUrl = "../../images/star.svg";
    $scope.notClickedUrl = "../../images/not-clicked-star.svg";
    // { Id: 2, url:  },
    console.log("Hello");
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
}]);


