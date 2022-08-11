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
var addPatient = angular.module("addPatient", []);

addPatient.controller('addPatientController', ['$scope', '$http', function ($scope, $http) {

    var api = "/services/v4/js/Home-page/services/patientInfo.js";
    var patientsOptionsApi = '/services/v4/js/genetyllis-app/gen/api/patients/Patient.js';
    var clinicalHistroryApi = '/services/v4/js/genetyllis-app/gen/api/patients/ClinicalHistory.js';
    var familyHistroryApi = '/services/v4/js/genetyllis-app/gen/api/patients/FamilyHistory.js';
    var populationApi = '/services/v4/js/genetyllis-app/gen/api/nomenclature/Population.js';
    var relationApi = '/services/v4/js/genetyllis-app/gen/api/nomenclature/Relation.js';
    var pathologyApi = '/services/v4/js/genetyllis-pages/Home-page/services/pathology.js';

    $scope.entity = {
        Id: '',
        LabId: '',
        Info: '',
        BirthDate: '',
        GenderId: ''
    }
    $scope.pathologyDatas = {}
    $scope.clinicalHistoryData = {};
    $scope.clinicalHistoryDataArray = [];
    $scope.familyClinicalHistoryData = {};
    $scope.familyClinicalHistoryDataArray = {
        Id: '',
        LabId: '',
        RelationId: '',
        RelationName: '',
        PatientId: '',
        FamilyMemberId: '',
        ClinicalHistoryDataArray: []
    };
    $scope.relationData = {}
    $scope.familyMembersArray = [];

    $scope.create = function () {
        if ($scope.entity.GenderId == 'male') $scope.entity.GenderId = 1
        else if ($scope.entity.GenderId == 'female') $scope.entity.GenderId = 2
        else $scope.entity.GenderId = 3;

        $http.post(patientsOptionsApi, JSON.stringify($scope.entity))
            .then(function (response) {
                $scope.entity.Id = response.data.Id

                persistClinicalHistory($scope.clinicalHistoryDataArray, $scope.entity.Id);

                persistFamilyMembers($scope.familyMembersArray);

            }, function (response) {
            });
    };

    function persistClinicalHistory(clinicalHistoryDataArray, patientId) {
        clinicalHistoryDataArray.forEach(clinicalHistory => {
            clinicalHistory.PatientId = patientId;
            $http.post(clinicalHistroryApi, JSON.stringify(clinicalHistory))
                .then(function (response) {
                    clinicalHistory.Id = response.Id
                }, function (response) {
                });
        });
    }

    function persistFamilyMembers(familyMembersArray) {
        familyMembersArray.forEach(familyMember => {
            familyMemberPatient = {}
            familyMemberPatient.Id = familyMember.Id;
            familyMemberPatient.LabId = familyMember.LabId;
            $http.post(patientsOptionsApi, JSON.stringify(familyMemberPatient))
                .then(function (response) {
                    familyMember.Id = response.data.Id

                    persistClinicalHistory(familyMember.ClinicalHistoryDataArray, familyMember.Id);

                    persistFamilyHistory(familyMember.Id, familyMember.RelationId);
                }, function (response) {
                });
        });
    }

    function persistFamilyHistory(familyMemberId, familyMemberRelation) {
        var familyHistory = {
            Id: '',
            PatientId: '',
            RelationId: '',
            FamilyMemberId: ''
        }

        familyHistory.PatientId = $scope.entity.Id;
        familyHistory.RelationId = familyMemberRelation;
        familyHistory.FamilyMemberId = familyMemberId;
        $http.post(familyHistroryApi, JSON.stringify(familyHistory))
            .then(function (response) {
                familyHistory.Id = response.data.Id
            }, function (response) {
            });
    }

    // function load() {
    //     $http.get(api)
    //         .then(function (data) {
    //             $scope.data = data.data;
    //             $scope.data.map(el => {
    //                 if (el.GenderId === 1) {
    //                     el.GenderId = "Male";
    //                 } else {
    //                     el.GenderId = "Female";
    //                 }
    //             })
    //         });
    // }
    // load();

    function patientsLoad() {
        $http.get(patientsOptionsApi)
            .then(function (data) {
                $scope.patientsOptions = data.data;
                console.log($scope.patientsOptions)
            });
    }
    patientsLoad();

    function pathologyLoad() {
        $http.get(pathologyApi)
            .then(function (data) {
                console.log(data)
                $scope.pathologyDatas = data.data;
            });
    }
    pathologyLoad();

    $scope.setPatientPathology = function (selectedPathology) {
        let pathology = $scope.pathologyDatas.find(el => el.PATHOLOGY_CUI == selectedPathology);
        $scope.clinicalHistoryData.PathologyName = pathology.PATHOLOGY_NAME;
    }

    $scope.setFamilyPathology = function (selectedPathology) {
        let pathology = $scope.pathologyDatas.find(el => el.PATHOLOGY_CUI == selectedPathology);
        $scope.familyClinicalHistoryData.PathologyName = pathology.PATHOLOGY_NAME;
    }

    // Clinical History
    function clinicalHistroryLoad() {

        $http.get(clinicalHistroryApi)
            .then(function (data) {
                familyClinicalHistoryDataArray = data.data;
            });
    }
    clinicalHistroryLoad();

    $scope.deleteClinicalHistory = function (history) {
        const index = this.clinicalHistoryDataArray.indexOf(history);
        this.clinicalHistoryDataArray.splice(index, 1);
    }

    $scope.deleteFamilyHistory = function (history) {
        const index = this.familyClinicalHistoryDataArray.ClinicalHistoryDataArray.indexOf(history);
        this.familyClinicalHistoryDataArray.ClinicalHistoryDataArray.splice(index, 1);
    }

    $scope.deleteFamilyMember = function (member) {
        const index = this.familyMembersArray.indexOf(member);
        this.familyMembersArray.splice(index, 1);
    }

    $scope.addEntryClinicalHistory = function () {
        $scope.clinicalHistoryDataArray.push($scope.clinicalHistoryData);
        $scope.clinicalHistoryData = {};
    };

    $scope.addEntryFamilyHistory = function () {
        $scope.familyClinicalHistoryDataArray.ClinicalHistoryDataArray.push($scope.familyClinicalHistoryData);
        $scope.familyClinicalHistoryData = {};
    };

    $scope.addEntryFamilyMember = function () {
        $scope.familyMembersArray.push(angular.copy($scope.familyClinicalHistoryDataArray));
        $scope.familyClinicalHistoryData = {};
        $scope.familyClinicalHistoryDataArray.LabId = '';
        $scope.familyClinicalHistoryDataArray.RelationId = '';
        $scope.familyClinicalHistoryDataArray.ClinicalHistoryDataArray = [];
    };

    function familyHistroryLoad() {

        $http.get(familyHistroryApi)
            .then(function (data) {
            })

    }
    familyHistroryLoad();

    // Relation
    $scope.getPatientsId = function () {
        console.log($scope.familyHistoryData.LabId);
        $http.get(patientsOptionsApi + "/" + $scope.familyHistoryData.LabId)
            .then(data => {
                console.log(data)
            })
    }

    function relationsLoad() {
        $http.get(relationApi)
            .then(function (data) {
                // let gosho = data.data.map(el=>el.find)
                $scope.relationData = data.data;
                console.log('Relation Data')
                console.log($scope.relationData)
            });
    }
    relationsLoad();

    $scope.setFamilyRelation = function (relationName) {
        $scope.familyClinicalHistoryDataArray.RelationId = $scope.relationData.find(el => el.RelationType == relationName).Id;
    }
}]);