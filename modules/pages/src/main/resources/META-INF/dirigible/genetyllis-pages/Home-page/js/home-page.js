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


let homePage = angular.module("home-page", ['angularUtils.directives.dirPagination', 'angularjs-dropdown-multiselect']);

homePage.config(function (paginationTemplateProvider) {
    paginationTemplateProvider.setPath('../components/pagination.html');
});

homePage.controller("homePageController", ['$scope', '$http', function ($scope, $http) {


    var patientsOptionsApi = '/services/v4/js/genetyllis-app/gen/api/patients/Patient.js';
    $scope.patientsDetail = []
    $http.get(patientsOptionsApi)
        .then(function (data) {
            $scope.patientsDetail = data.data;
            $scope.patientsInfo = data.data
            console.log($scope.homePageTable, "homePageTable")
            console.log($scope.patientsDetail, 'patientsDetail')
        });
    // _|_
    $scope.example1model = [];
    // $scope.example1data = [{ id: 5, label: "Platform" }, { id: 6, label: "Provider" }, { id: 7, label: "Status" }];
    $scope.example1data = [{ id: 5, label: "Platform" }, { id: 6, label: "Info" }, { id: 7, label: "PopulationId" }];
    $scope.setting2 = {
        scrollableHeight: '200px',
        scrollable: true,
        enableSearch: true
    };

    $scope.selectFucn = function () {
        $scope.homePageTable = ["Id", "Date", "Patient", "Analysis"];
        for (let x = 0; x < $scope.example1model.length; x++) {
            let value = $scope.example1data.find(e => e.id == $scope.example1model[x].id)
            $scope.homePageTable.push(value.label);
        }
    }

    $scope.homePageTable = ["Id", "Date", "Patient", "Analysis"]
    // _|_

    $scope.selectedPerPage = 10;
    $scope.perPageData = [10, 20, 50, 100];
    var patientsOptionsApi = '/services/v4/js/genetyllis-app/gen/api/patients/Patient.js';
    var notificationApi = '/services/v4/js/genetyllis-app/gen/api/users/Notification.js';
    var variantApi = '/services/v4/js/genetyllis-app/gen/api/variants/Variant.js';
    var notificationController = '/services/v4/js/genetyllis-pages/Home-page/services/notification.js';

    $scope.variants = [];

    $http.get(patientsOptionsApi)
        .then(function (data) {
            $scope.patientsOptions = data.data;
        });

    function loadNotifications() {
        $http.get(notificationApi)
            .then(function (data) {
                $scope.notifications = data.data.filter(el => el.UserUserId == 1 && el.SeenFlag == false);

                angular.forEach($scope.notifications, function (value, key) {
                    getVariant(value.VariantId);
                });

            });
    }

    loadNotifications();


    function getVariant(variantId) {
        $http.get(variantApi)
            .then(function (data) {
                $scope.variants.push(data.data.filter(el => el.Id == variantId)[0]);
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

    }


}]);
