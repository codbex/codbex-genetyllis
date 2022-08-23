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
    $scope.pathologyDatas = []
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
    $scope.isLabIdTaken = false;

    $scope.create = function () {
        if ($scope.entity.GenderId == 'male') $scope.entity.GenderId = 1
        else if ($scope.entity.GenderId == 'female') $scope.entity.GenderId = 2
        else $scope.entity.GenderId = 3;

        $http.post(patientsOptionsApi, JSON.stringify($scope.entity))
            .then(function (response) {
                $scope.entity.Id = response.data.Id

                persistClinicalHistory($scope.clinicalHistoryDataArray, $scope.entity.Id);

                persistFamilyMembers($scope.familyMembersArray);

                $scope.familyClinicalHistoryDataArray = {}

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

    function persistFamilyHistory(familyMemberId, familyMemberRelationId) {
        var familyHistory = {
            Id: '',
            PatientId: '',
            RelationId: '',
            FamilyMemberId: ''
        }

        familyHistory.PatientId = $scope.entity.Id;
        familyHistory.RelationId = familyMemberRelationId;
        familyHistory.FamilyMemberId = familyMemberId;
        $http.post(familyHistroryApi, JSON.stringify(familyHistory))
            .then(function (response) {
                familyHistory.Id = response.data.Id
            }, function (response) {
            });
    }

    function patientsLoad() {
        $http.get(patientsOptionsApi)
            .then(function (data) {
                $scope.patientsOptions = data.data;
                console.log($scope.patientsOptions)
            });
    }
    patientsLoad();

    $scope.setPatientPathology = function (selectedPathology) {
        if ($scope.pathologyDatas.length > 0) {
            let pathology = $scope.pathologyDatas.find(el => el.PATHOLOGY_CUI == selectedPathology);
            $scope.clinicalHistoryData.PathologyName = pathology.PATHOLOGY_NAME;
            $scope.clinicalHistoryData.PathologyId = pathology.PATHOLOGY_ID;
        }
    }

    $scope.setFamilyPathology = function (selectedPathology) {
        if ($scope.pathologyDatas.length > 0) {
            let pathology = $scope.pathologyDatas.find(el => el.PATHOLOGY_CUI == selectedPathology);
            $scope.familyClinicalHistoryData.PathologyName = pathology.PATHOLOGY_NAME;
            $scope.familyClinicalHistoryData.PathologyId = pathology.PATHOLOGY_ID;
        }
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
        $scope.familyClinicalHistoryDataArray = {
            Id: '',
            LabId: '',
            RelationId: '',
            RelationName: '',
            PatientId: '',
            FamilyMemberId: '',
            ClinicalHistoryDataArray: []
        };
    };

    $scope.existsLabId = function () {
        $http.get(patientsOptionsApi + "/getPatientByLabId/" + $scope.entity.LabId.toString())
            .then(data => {
                $scope.isLabIdTaken = data.data.length > 0
            })
    }

    $scope.loadFamilyMemberByLabId = function () {
        $http.get(patientsOptionsApi + "/loadPatientHistory/" + $scope.familyClinicalHistoryDataArray.LabId.toString())
            .then(data => {
                if (isFamilyMemberValid(data.data[0])) {
                    data.data.forEach(element => {
                        $scope.familyClinicalHistoryDataArray.Id = element.FAMILYHISTORY_ID;
                        $scope.familyClinicalHistoryDataArray.LabId = element.GENETYLLIS_PATIENT_LABID;
                        $scope.familyClinicalHistoryDataArray.RelationId = element.Id;
                        $scope.familyClinicalHistoryDataArray.RelationName = $scope.relationData.find(el => el.Id == element.FAMILYHISTORY_RELATIONID).RelationType;
                        $scope.familyClinicalHistoryDataArray.PatientId = element.FAMILYHISTORY_PATIENTID;
                        $scope.familyClinicalHistoryDataArray.FamilyMemberId = element.FAMILYHISTORY_FAMILYMEMBERID;
                        var clinicalHistory = {};
                        clinicalHistory.PathologyId = element.CLINICALHISTORY_PATHOLOGYID;
                        console.log('Loading family member')
                        console.log(element.CLINICALHISTORY_PATHOLOGYID)
                        clinicalHistory.PathologyId = element.CLINICALHISTORY_PATHOLOGYID;
                        clinicalHistory.PathologyCui = element.PATHOLOGY_CUI;
                        clinicalHistory.PathologyName = element.PATHOLOGY_NAME;
                        clinicalHistory.Notes = element.GENETYLLIS_CLINICALHISTORY_NOTES;
                        clinicalHistory.AgeOnset = element.GENETYLLIS_CLINICALHISTORY_AGEONSET;
                        $scope.familyClinicalHistoryDataArray.ClinicalHistoryDataArray.push(angular.copy(clinicalHistory));
                    });
                }
            })
    }

    function isFamilyMemberValid(familyMember) {
        if (!familyMember
            || !familyMember.FAMILYHISTORY_ID
            || $scope.familyMembersArray.some(e => e.Id === familyMember.FAMILYHISTORY_ID)
            || $scope.familyClinicalHistoryDataArray.Id === familyMember.FAMILYHISTORY_ID) {

            return false;
        }
        return true;
    }

    function relationsLoad() {
        $http.get(relationApi)
            .then(function (data) {
                $scope.relationData = data.data;
            });
    }
    relationsLoad();

    $scope.setFamilyRelation = function (relationName) {
        $scope.familyClinicalHistoryDataArray.RelationId = $scope.relationData.find(el => el.RelationType == relationName).Id;
    }

    function suggestPathology(pathologyId) {
        if (validateSuggestion(pathologyId)) {
            $http.get(pathologyApi + "/filterPathology/" + pathologyId)
                .then(data => {
                    $scope.pathologyDatas = data.data
                })
        }
    }

    $scope.suggestPatientPathology = function (pathologyId) {
        suggestPathology(pathologyId);
    }

    $scope.suggestFamilyPathology = function (pathologyId) {
        suggestPathology(pathologyId);
    }

    function validateSuggestion(suggestion) {
        return suggestion.length > 3;
    }
}]);
