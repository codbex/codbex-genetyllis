var page = angular.module("page", ['ngRoute']);

page.controller('PageController', ['$scope', '$http', function ($scope, $http) {
    console.log("Hello")
}]);

// page.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
//     // $routeProvider.when('../Home-page/partials/addAnalysis.html', { templateUrl: '/services/v4/web/genetyllis-pages/Home-page/partials/addAnalysis.html' });
//     // $routeProvider.when('/patients', { templateUrl: 'services/v4/web/genetyllis-pages/Home-page/index.html' });
//     $routeProvider.when('/variants', { templateUrl: 'services/v4/web/genetyllis-pages/navbar/partials/page2.html' });
//     $routeProvider.otherwise({ redirectTo: 'services/v4/web/genetyllis-pages/navbar/index.html' })
//     $locationProvider.html5Mode({ enabled: true, requireBase: false });
// }])
