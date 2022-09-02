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
var addAnalysis = angular.module("addAnalysis", []);

// addAnalysis.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
//     console.log($routeProvider)
//     $routeProvider.when('/services/v4/web/genetyllis-pages/Home-page/partials/addAnalysis.html', { templateUrl: '/services/v4/web/genetyllis-upload/views/VariantRecordUpload/index.html' });
//     $routeProvider.otherwise({ redirectTo: 'services/v4/web/genetyllis-pages/Home-page/partials/addAnalysis.html' })

//     $locationProvider.html5Mode({ enabled: true, requireBase: false });
// }])z
addAnalysis.controller('addAnalysisController', ['$scope', '$http', function ($scope, $http) {
    const providereDetailsApi = '/services/v4/js/genetyllis-pages/Home-page/services/provider.js';
    const platformDetailsApi = '/services/v4/js/genetyllis-pages/Home-page/services/platform.js';
    $scope.providerData;
    $scope.platformData;
    $scope.labIds = []
    $scope.vcfNames = [{ name: "gi" }, { name: "gu" }]
    $http.get(providereDetailsApi)
        .then(function (data) {
            // $scope.pathologyDatas = data.data;
            $scope.providerData = data.data;
            console.log($scope.providerData)
        });
    $http.get(platformDetailsApi)
        .then(function (data) {
            // $scope.pathologyDatas = data.data;
            $scope.platformData = data.data;
            console.log(data)
        });

    $scope.getLabId = function () {
        $scope.labIds.push($scope.entity.LabId)
    }


}])

