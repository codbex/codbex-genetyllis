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
var addAnalysis = angular.module("addAnalysis", ['ngStorage', 'angularFileUpload']);

addAnalysis.factory('httpRequestInterceptor', function () {
    let csrfToken = null;
    return {
        request: function (config) {
            config.headers['X-Requested-With'] = 'Fetch';
            config.headers['X-CSRF-Token'] = csrfToken ? csrfToken : 'Fetch';
            return config;
        },
        response: function (response) {
            let token = response.headers()['x-csrf-token'];
            if (token) {
                csrfToken = token;
                uploader.headers['X-CSRF-Token'] = csrfToken;
            }
            return response;
        }
    };
})
addAnalysis.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('httpRequestInterceptor');
}])

addAnalysis.controller('addAnalysisController', ['$scope', '$http', 'FileUploader', '$sessionStorage', function ($scope, $http, FileUploader, $sessionStorage) {
    var patientidOptionsApi = '/services/v4/js/genetyllis-pages/services/api/patients/Patient.js';

    $scope.patientidOptions = [];
    function patientidOptionsLoad() {
        $http.get(patientidOptionsApi)
            .then(function (data) {
                $scope.patientidOptions = data.data;
            });
    }
    patientidOptionsLoad();



    $scope.IMPORT_URL = "/services/v4/js/genetyllis-upload/services/uploadVCF.js";

    // FILE UPLOADER

    $scope.uploader = uploader = new FileUploader({
        url: $scope.IMPORT_URL
    });

    // UPLOADER FILTERS

    uploader.filters.push({
        name: 'customFilter',
        fn: function (item, options) {
            return this.queue.length < 100;
        }
    });

    // UPLOADER CALLBACKS

    uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
    };
    uploader.onAfterAddingFile = function (fileItem) {
        console.log("Patient: " + $scope.PatientId, fileItem);
    };
    uploader.onAfterAddingAll = function (addedFileItems) {
    };
    uploader.onBeforeUploadItem = function (item) {
        item.url = $scope.IMPORT_URL + "?PatientId=" + $scope.PatientId;
    };
    uploader.onProgressItem = function (fileItem, progress) {
    };
    uploader.onProgressAll = function (progress) {
    };
    uploader.onSuccessItem = function (fileItem, response, status, headers) {
    };
    uploader.onErrorItem = function (fileItem, response, status, headers) {
        alert('Error: ' + status + ' - ' + response.message);
    };
    uploader.onCancelItem = function (fileItem, response, status, headers) {
    };
    uploader.onCompleteItem = function (fileItem, response, status, headers) {
    };
    uploader.onCompleteAll = function () {
    };



    const providereDetailsApi = '/services/v4/js/genetyllis-pages/Home-page/services/provider.js';
    const platformDetailsApi = '/services/v4/js/genetyllis-pages/Home-page/services/platform.js';
    const patientsOptionsApi = '/services/v4/js/genetyllis-pages/services/api/patients/Patient.js';

    $scope.providerData;
    $scope.platformData;
    $scope.labIds = []
    $scope.entity = {};
    $scope.vcfNames = [{ name: "gi" }, { name: "gu" }]

    // $http.get(providereDetailsApi)
    //     .then(function (data) {
    //         // $scope.pathologyDatas = data.data;
    //         $scope.providerData = data.data;
    //         console.log($scope.providerData)
    //     });
    // $http.get(platformDetailsApi)
    //     .then(function (data) {
    //         // $scope.pathologyDatas = data.data;
    //         $scope.platformData = data.data;
    //         console.log(data)
    //     });

    $scope.getLabId = function () {
        $scope.labIds.push($scope.entity.LabId)
    }

    $scope.suggestLabId = function (labId) {
        if (validateSuggestion(labId)) {
            fetchSimilarLabIds(labId);
        }
    }

    function fetchSimilarLabIds(labId) {
        $http.get(patientsOptionsApi + "/suggestLabIds/" + labId)
            .then(data => {
                $scope.labIds = data.data
            })
    }

    $scope.showLink = function (labId) {
        console.log(labId, "labid")
    }

    // fetchSimilarLabIds('%');

    function validateSuggestion(suggestion) {
        return suggestion.length > 3;
    }

    console.log($sessionStorage, "$sessionStorage");
    let analysis = $sessionStorage.analysis;
    console.log(analysis, "$analy");
    if (analysis != undefined) {
        $scope.isLoaded = true
        $scope.analysisId = analysis.Id;
        $scope.entity.LabId = analysis.Patient
        $scope.entity.PatientId = analysis.PatientId
        $scope.entity.Platform = analysis.Platform
        $scope.entity.Provider = analysis.Provider
        $scope.entity.Date = analysis.Date
    }
    else
        $scope.isLoaded = false
    $sessionStorage.$reset();


    $scope.redirectPatients = function (data, e) {
        console.log(data, "data", e)
        $sessionStorage.$default({
            patient: data[0].PATIENT_ID

            // $sessionStorage.$reset()
        })
    }
}])
