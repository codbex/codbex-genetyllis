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

    const patientidOptionsApi = '/services/v4/js/genetyllis-pages/services/api/patients/Patient.js';
    const patientsOptionsApi = '/services/v4/js/genetyllis-pages/services/api/patients/Patient.js';
    const fileUploadApi = '/services/v4/js/genetyllis-pages/services/api/records/File.js';
    const analysisApi = '/services/v4/js/genetyllis-pages/services/api/analysis/Analysis.js';
    const providereDetailsApi = '/services/v4/js/genetyllis-pages/Home-page/services/provider.js';
    const platformDetailsApi = '/services/v4/js/genetyllis-pages/Home-page/services/platform.js';

    $scope.patientidOptions = [];
    function patientidOptionsLoad() {
        $http.get(patientidOptionsApi)
            .then(function (data) {
                $scope.patientidOptions = data.data;
            });
    }
    patientidOptionsLoad();

    $scope.files = [];
    function filesLoad() {
        $http.get(analysisApi + "/getFiles/" + analysisId)
            .then(function (data) {
                $scope.files = data.data;
                $scope.files.forEach(file => {
                    switch (file.FILE_UPLOADSTATUSID) {
                        case 1: file.UploadStatus = "Processing"; break;
                        case 2: file.UploadStatus = "Error"; break;
                        case 3: file.UploadStatus = "No uploads"; break;
                        case 4: file.UploadStatus = "Complete"; break;
                    }
                })
            });
    }

    console.log($scope.files)

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
    console.log($sessionStorage?.analysis?.Id === undefined)
    var analysisId = $sessionStorage?.analysis?.Id !== undefined ? $sessionStorage.analysis.Id : 0
    // console.log("id" + $sessionStorage.analysis.Id)
    uploader.uploadAllFiles = function () {
        uploader.queue.forEach(file => {
            uploader.uploadFile(file)
        })
    }

    uploader.uploadFile = function (fileItem) {
        $scope.file = {}
        $http.get(analysisApi + "/getFile/" + analysisId + "/" + fileItem.file.name)
            .then(function (data) {
                console.log("get" + JSON.stringify(data))
                $scope.file.Id = data.data[0].FILE_ID
                $scope.file.AnalysisId = data.data[0].FILE_ANALYSISID
                $scope.file.DateUploaded = data.data[0].FILE_DATEUPLOADED.split("T")[0]
                $scope.file.UploadStatusId = 1
                $scope.file.Path = data.data[0].FILE_PATH
                $http.put(fileUploadApi + "/" + $scope.file.Id, JSON.stringify($scope.file))
                    .then(function (resp) {
                        console.log(resp)
                    });
            });
    };

    uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {

    };

    uploader.onAfterAddingFile = function (fileItem) {
        let fileEntity = {
            Path: fileItem.file.name,
            AnalysisId: analysisId,
            DateUploaded: new Date().toISOString().slice(0, 10),
            UploadStatusId: 3
        }

        $http.post(fileUploadApi, [fileEntity])
            .then(function (response) {

            }, function (response) {
            });
    };

    uploader.onAfterAddingAll = function (addedFileItems) {

    };

    uploader.onBeforeUploadItem = function (item) {
        item.url = $scope.IMPORT_URL + "?PatientId=" + $scope.PatientId;
    };

    uploader.onProgressItem = function (fileItem, progress) {
        // console.log("data" + fileItem.formData)
    };

    uploader.onProgressAll = function (progress) {

    };

    uploader.onSuccessItem = function (fileItem, response, status, headers) {
        $scope.file = {}
        $http.get(analysisApi + "/getFile/" + analysisId + "/" + fileItem.file.name)
            .then(function (data) {
                console.log("get" + JSON.stringify(data))
                $scope.file.Id = data.data[0].FILE_ID
                $scope.file.AnalysisId = data.data[0].FILE_ANALYSISID
                $scope.file.DateUploaded = data.data[0].FILE_DATEUPLOADED.split("T")[0]
                $scope.file.UploadStatusId = 4
                $scope.file.Path = data.data[0].FILE_PATH
                $http.put(fileUploadApi + "/" + $scope.file.Id, JSON.stringify($scope.file))
                    .then(function (resp) {
                        console.log(resp)
                    });
            });
    };

    uploader.onErrorItem = function (fileItem, response, status, headers) {
        // alert('Error: ' + status + ' - ' + response.message);

        $scope.file = {}
        $http.get(analysisApi + "/getFile/" + analysisId + "/" + fileItem.file.name)
            .then(function (data) {
                console.log("get" + JSON.stringify(data))
                $scope.file.Id = data.data[0].FILE_ID
                $scope.file.AnalysisId = data.data[0].FILE_ANALYSISID
                $scope.file.DateUploaded = data.data[0].FILE_DATEUPLOADED.split("T")[0]
                $scope.file.UploadStatusId = 2
                $scope.file.Path = data.data[0].FILE_PATH
                $http.put(fileUploadApi + "/" + $scope.file.Id, JSON.stringify($scope.file))
                    .then(function (resp) {
                        console.log(resp)
                    });
            });
    };

    uploader.onCancelItem = function (fileItem, response, status, headers) {
        // console.log("cancel status  " + fileItem.isCancel)
    };

    uploader.onCompleteItem = function (fileItem, response, status, headers) {
        // console.log("uploaded status  " + fileItem.isUploaded)
    };

    uploader.onCompleteAll = function () {
        // console.log("complete all")
        // console.log("uploaded status  " + fileItem.isUploaded)
    };

    uploader.removeItem = function (fileItem) {
        // console.log("removed " + fileItem)
        // console.log("removed " + JSON.stringify(fileItem))
    }

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

    filesLoad();
}])
