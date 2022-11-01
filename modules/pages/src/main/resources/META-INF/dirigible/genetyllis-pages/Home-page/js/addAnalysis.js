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
        $http.get(analysisApi + "/getFiles/" + $sessionStorage.analysis.Id)
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
    filesLoad();

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

    console.log("id" + $sessionStorage.analysis.Id)
    var analysisId = $sessionStorage.analysis.Id
    uploader.uploadAllFiles = function () {
        let fileEntityArr = []
        uploader.queue.forEach(file => {
            let statusId;
            if (file.isError) {
                statusId = 2;
                file.Status = 2
            } else if (file.isUploading) {
                statusId = 1
                file.Status = 1
            } else if (file.isReady) {
                statusId = 4
                file.Status = 4
            } else {
                statusId = 3
                file.Status = 3
            }
            var fileEntity = {
                Path: file.file.name,
                AnalysisId: analysisId,
                DateUploaded: new Date().toISOString().slice(0, 10),
                UploadStatusId: statusId
            }
            fileEntityArr.push(fileEntity)
        })


        $http.post(fileUploadApi, fileEntityArr)
            .then(function (response) {
                // $scope.entity.Id = response.data.Id
                console.log(response, "GF");

                // persistClinicalHistory($scope.clinicalHistoryDataArray, $scope.entity.Id);

                // persistFamilyMembers($scope.familyMembersArray);

                // $scope.familyClinicalHistoryDataArray = {}
                // console.log(response)

            }, function (response) {
            });
    }

    uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
    };
    uploader.onAfterAddingFile = function (fileItem) {
        // console.log("Patient: " + $scope.PatientId, fileItem);
        // console.log("name  " + fileItem.file.name)
        // console.log("cancel status  " + fileItem.isCancel)
        // console.log("error status  " + fileItem.isError)
        // console.log("ready status  " + fileItem.isReady)
        // console.log("success status  " + fileItem.isSuccess)
        // console.log("uploaded status  " + fileItem.isUploaded)
        // console.log("uploading status  " + fileItem.isUploading)
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
        console.log(fileItem.file.name)
        var file = {}
        $http.get(analysisApi + "/getFile/" + analysisId + "/" + fileItem.file.name)
            .then(function (data) {
                console.log(data)
                // file = data[0];
            });
        file = {
            FILE_ID: 78,
            FILE_ANALYSISID: 1,
            FILE_DATEUPLOADED: '2022-11-01T00:00:00+0200',
            FILE_UPLOADSTATUSID: 1,
            FILE_PATH: 'test5.vcf'
        }
        // file.FILE_UPLOADSTATUSID = 4
        console.log(file)
        $http.put(fileUploadApi + "/" + file.FILE_ID, JSON.stringify(file))
            .then(function (data) {
                console.log(data)
            });
    };
    uploader.onErrorItem = function (fileItem, response, status, headers) {
        // console.log("error status  " + fileItem.isError)
        // alert('Error: ' + status + ' - ' + response.message);

        console.log(fileItem.file.name)
        $http.get(analysisApi + "/getFile/" + analysisId + fileItem.file.name)
            .then(function (data) {
                console.log(data)
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
}])
