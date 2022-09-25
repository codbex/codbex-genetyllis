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
    var analysisCount = '/services/v4/js/genetyllis-pages/services/api/analysis/Analysis.js';

    var patientsOptionsApi = '/services/v4/js/genetyllis-pages/services/api/patients/Patient.js';
    var notificationApi = '/services/v4/js/genetyllis-pages/services/api/users/Notification.js';
    var variantApi = '/services/v4/js/genetyllis-pages/services/api/variants/Variant.js';
    $scope.selectedPerPage = 10;
    $scope.perPageData = [10, 20, 50, 100];
    $scope.currentPage = 1;
    $scope.variants = [];
    $scope.totalItems;
    $scope.patientsDetails = [];

    // $scope.homePageTable = ["AID", "Date", "Patient", "Provider", "Status",];
    // $scope.homePageTableInfo = ["ANALYSIS_DATE", "LabId", "BirthDate", "Clinical history", "Analysis"];
    function loadAnalysisCount() {
        $http.get(analysisCount + "/count")
            .then(function (data) {
                $scope.totalItems = data.data
            });
    };
    loadAnalysisCount()


    function loadPatients() {
        var query = {};
        query.perPage = $scope.selectedPerPage;
        query.currentPage = (($scope.currentPage - 1) * $scope.selectedPerPage);
        $http.post(patientsOptionsApi + "/filterPatients", JSON.stringify(query))
            .then(function (data) {
                $scope.patientsDetails = []
                // ["ANALYSIS_DATE", "ANALYSIS_ID", "ANALYSIS_PLATFORMID", "ANALYSIS_PROVIDERID", "GENETYLLIS_ANALYSIS_PATIENTID"]
                patientObject = {};
                data.data.data.forEach(patientResult => {
                    // patientObject = {};
                    // patientObject.Date = patientResult.analysis[0]?.ANALYSIS_DATE.split("T")[0];
                    // patientObject.Id = patientResult.analysis[0]?.ANALYSIS_ID;
                    // patientObject.Patient = patientResult.GENETYLLIS_PATIENT_LABID;
                    // patientObject.Platform = patientResult?.analysis[0]?.ANALYSIS_PLATFORMID;
                    // patientObject.Provider = patientResult.analysis[0]?.ANALYSIS_PROVIDERID;

                    // patientObject.Dates = patientResult.analysis[0]?.ANALYSIS_DATE.split('T')[0];
                    // patientObject.Gender = patientResult.PATIENT_GENDERID;
                    // patientObject.Ethnicity = patientResult.GENETYLLIS_PATIENT_POPULATIONID;
                    // patientObject["Family history"] = patientResult?.familyHistory[0]?.patients[0]?.clinicalHistory[0]?.pathology[0]?.PATHOLOGY_NAME;
                    // $scope.patientsDetails.push(patientObject);

                    if (patientResult.analysis.length > 0) {

                        patientResult.analysis.forEach(el => {

                            patientObject = {};
                            patientObject.Date = el.ANALYSIS_DATE.split("T")[0];
                            patientObject.Id = el.ANALYSIS_ID;
                            patientObject.Platform = el.ANALYSIS_PLATFORMID;
                            patientObject.Provider = el.ANALYSIS_PROVIDERID;
                            patientObject.Dates = el.ANALYSIS_DATE.split('T')[0];

                            patientObject.Patient = patientResult.GENETYLLIS_PATIENT_LABID;

                            patientObject.Gender = patientResult.PATIENT_GENDERID;
                            patientObject.Ethnicity = patientResult.GENETYLLIS_PATIENT_POPULATIONID;
                            patientObject["Family history"] = patientResult?.familyHistory[0]?.patients[0]?.clinicalHistory[0]?.pathology[0]?.PATHOLOGY_NAME;
                            $scope.patientsDetails.push(patientObject);
                        })
                    }
                })
                $scope.patientsDetails.sort((a, b) => {
                    return a.Id - b.Id
                })

            });
    }
    loadPatients();



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
    // _|_
    $scope.patientsTableModel = [];
    // $scope.patientsTableData = [{ id: 5, label: "Platform" }, { id: 6, label: "Provider" }, { id: 7, label: "Status" }];
    $scope.patientsTableData = [{ id: 7, label: "Gender" }, { id: 8, label: "Ethnicity" }, { id: 9, label: "Family history" }];
    $scope.patientsTableSettings = {
        scrollableHeight: '200px',
        scrollable: true,
        enableSearch: true
    };

    $scope.selectFucn = function () {
        $scope.homePageTable = ["AID", "Date", "Patient", "Platform", "Provider"];
        $scope.homePageTableInfo = ["Id", "Date", "Patient", "Platform", "Provider"];
        for (let x = 0; x < $scope.patientsTableModel.length; x++) {
            let value = $scope.patientsTableData.find(e => e.id == $scope.patientsTableModel[x].id)
            $scope.homePageTable.push(value.label);
            $scope.homePageTableInfo.push(value.label);

        }
    }

    $scope.checkColumn = function (e) {
        return e == 'Id'
    }
    $scope.notLink = function (e) {
        return e != 'Id'
    }

    $scope.homePageTable = ["AID", "Date", "Patient", "Platform", "Provider"];
    $scope.homePageTableInfo = ["Id", "Date", "Patient", "Platform", "Provider"];
    // ["ANALYSIS_DATE", "ANALYSIS_ID", "ANALYSIS_PLATFORMID", "ANALYSIS_PROVIDERID", "GENETYLLIS_ANALYSIS_PATIENTID"]


    // _|_

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

        $http.post(notificationApi, JSON.stringify({ notificationId: $scope.notiId[0].NotificationId }))
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

    $scope.pageChangeHandler = function (curPage) {
        $scope.currentPage = curPage;
        loadPatients()
        $scope.patientsDetails = [];
    }


}]);
