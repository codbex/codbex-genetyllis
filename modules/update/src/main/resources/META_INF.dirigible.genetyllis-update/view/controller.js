angular.module('page', []);
angular.module('page').controller('PageController', function ($scope, $http) {
    var api = "/services/v4/js/genetyllis-update/view/updateRs.js";
    var apiUpload = "/services/v4/js/genetyllis-update/services/updateVariant.js";

    $scope.getVariantId = function () {
        $scope.variant = $scope.data.filter(v => {
            return v.Id == $scope.variant.Id;
        })

        $scope.variantInfo = $scope.variant[0];

        $scope.actionType = "show";

        $http.post(apiUpload, JSON.stringify({ variantId: $scope.variantInfo.Id }))
            .then(data => {
                console.log("asd", data);
            });
    }

    function load() {
        $http.get(api)
            .then(function (data) {
                $scope.data = data.data;
                console.log(data, " : patient");
            });
    }
    load();
});
