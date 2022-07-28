let homePage = angular.module("home-page", ['ngRoute']);

homePage.controller("homePageController", ['$scope', '$http', function ($scope, $http) {
    var patientsOptionsApi = '/services/v4/js/genetyllis-app/gen/api/patients/Patient.js';
    var notificationApi = '/services/v4/js/genetyllis-app/gen/api/users/Notification.js';
    var variantApi = '/services/v4/js/genetyllis-app/gen/api/variants/Variant.js';
    var notificationController = '/services/v4/js/genetyllis-pages/Home-page/services/notification.js';

    $scope.variants = [];

    $http.get(patientsOptionsApi)
        .then(function (data) {
            $scope.patientsOptions = data.data;
            console.log("patientsOptions", $scope.patientsOptions);
        });

    function loadNotifications() {
        $http.get(notificationApi)
            .then(function (data) {
                $scope.notifications = data.data.filter(el => el.UserUserId == 1 && el.SeenFlag == false);

                angular.forEach($scope.notifications, function (value, key) {
                    console.log("value", value.VariantId);
                    getVariant(value.VariantId);
                });
                console.log("notifications", $scope.notifications);

            });
    }

    loadNotifications();


    function getVariant(variantId) {
        $http.get(variantApi)
            .then(function (data) {
                $scope.variants.push(data.data.filter(el => el.Id == variantId)[0]);
                console.log("variants", $scope.variants);
            });
    }

    $scope.markSeenNotification = function (id) {
        // console.log($scope.notifications.filter(function (noti) {
        //     return noti.VariantId == id;
        // }));

        $scope.notiId = $scope.notifications.filter(function (noti) {
            return noti.VariantId == id;
        });

        $http.post(notificationController, JSON.stringify({ notificationId: $scope.notiId[0].NotificationId }))
            .then(data => {
                console.log("asd", data);
                $scope.refreshNotifications()
            })
            .catch(function (err) { console.log("err", err); });

    }

    $scope.refreshNotifications = function () {
        // delete $scope.notifications;
        delete $scope.variants;
        $scope.variants = [];
        loadNotifications();
        // $scope.$apply();
    }


    $scope.addPatient = function () {
        console.log("Helo")

    }

}]);
homePage.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/homePage', {
            templateUrl: 'Home-page/partials/homePage.html'
        })
        .otherwise({
            redirectTo: '/home'
        });
}]);
