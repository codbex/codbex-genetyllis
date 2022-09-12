/*
 * Copyright (c) 2022 codbex or an codbex affiliate company and contributors
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-FileCopyrightText: 2022 codbex or an codbex affiliate company and contributors
 * SPDX-License-Identifier: EPL-2.0
 */
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
