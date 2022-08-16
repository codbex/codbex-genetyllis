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
    var patientDetailsApi = '/services/v4/js/genetyllis-app/gen/api/patients/PatientDetails.js';
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
        GenderId: '',
        ClinicalHistoryDataArray: [
            {
                Id: '',
                PatientId: '',
                ConceptId: '',
                ConceptName: '',
                AgeOnset: '',
                Notes: ''
            }
        ],
        FamilyMembersArray: [
            {
                Id: '',
                LabId: '',
                RelationId: '',
                PatientId: '',
                FamilyMemberId: '',
                ClinicalHistoryDataArray: [
                    {
                        Id: '',
                        PatientId: '',
                        ConceptId: '',
                        ConceptName: '',
                        AgeOnset: '',
                        Notes: ''
                    }
                ]
            }
        ]
    }
    $scope.pathologyDatas = {}
    $scope.clinicalHistoryData = {};
    $scope.clinicalHistoryDataArray = [];
    $scope.familyClinicalHistoryData = {};
    $scope.familyClinicalHistoryDataArray = {
        LabId: '',
        RelationId: '',
        ClinicalHistoryDataArray: []
    };
    $scope.relationData = {}
    $scope.familyMembersArray = [];
    let pathologyId;
    let familyPathologyId;
    let familyRelationId;
    let familyMebmer = {}
    $scope.savePatient = function () {

    }
    $scope.getPathologyId = function () {
        getId($scope.pathologyId)
    }
    $scope.getFamilyPathologyId = function () {
        getFamilyPathologyId($scope.familyPathologyId)
    }

    $scope.create = function () {
        var patientEntity = {
            Id: '',
            LabId: '',
            Info: '',
            BirthDate: '',
            GenderId: ''
        };
        if ($scope.entity.GenderId == 'male') $scope.entity.GenderId = 1
        else if ($scope.entity.GenderId == 'female') $scope.entity.GenderId = 2
        else $scope.entity.GenderId = 3;

        $scope.entity.ClinicalHistoryDataArray = $scope.clinicalHistoryDataArray
        $scope.entity.FamilyMembersArray = $scope.familyMembersArray

        patientEntity.Id = $scope.entity.Id;
        patientEntity.LabId = $scope.entity.LabId;
        patientEntity.Info = $scope.entity.Info;
        patientEntity.BirthDate = $scope.entity.BirthDate;
        patientEntity.GenderId = $scope.entity.GenderId;

        // TODO split in methods and/or transfer logic to genetyllis-app/api
        $http.post(patientsOptionsApi, JSON.stringify(patientEntity))
            .then(function (response) {
                $scope.entity.Id = response.data.Id

                $scope.entity.ClinicalHistoryDataArray.forEach(clinicalHistory => {
                    clinicalHistory.PatientId = $scope.entity.Id;
                    $http.post(clinicalHistroryApi, JSON.stringify(clinicalHistory))
                        .then(function (response) {
                            clinicalHistory.Id = response.Id
                        }, function (response) {
                        });
                });


                $scope.entity.FamilyMembersArray.forEach(familyMember => {
                    // TODO if we don't use these patient fields, api returns 500, we can't pass only LabId
                    patientEntity.Id = familyMember.Id;
                    patientEntity.LabId = familyMember.LabId;
                    $http.post(patientsOptionsApi, JSON.stringify(patientEntity))
                        .then(function (response) {
                            familyMember.Id = response.data.Id

                            familyMember.ClinicalHistoryDataArray.forEach(clinicalHistory => {
                                clinicalHistory.PatientId = familyMember.Id;
                                $http.post(clinicalHistroryApi, JSON.stringify(clinicalHistory))
                                    .then(function (response) {
                                        clinicalHistory.Id = response.Id
                                    }, function (response) {
                                    });
                            });

                            var familyHistory = {
                                Id: '',
                                PatientId: '',
                                RelationId: 1,
                                FamilyMemberId: ''
                            }

                            familyHistory.PatientId = $scope.entity.Id;
                            // TODO replace with actual relation
                            familyHistory.RelationId = 1;
                            familyHistory.FamilyMemberId = familyMember.Id;
                            $http.post(familyHistroryApi, JSON.stringify(familyHistory))
                                .then(function (response) {
                                    familyHistory.Id = response.data.Id
                                }, function (response) {
                                });
                        }, function (response) {
                        });
                }, function (response) {
                });
            }, function (response) {
            });

        console.log($scope.entity)
    };

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
                console.log($scope.patientsOptions, "hello")

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

    function getId(id) {
        $scope.pathologyName = $scope.pathologyDatas.filter(el => id == el.PATHOLOGY_CUI);
        pathologyId = $scope.pathologyName[0].PATHOLOGY_ID;
    }

    function getFamilyPathologyId(id) {
        $scope.familyPathologyName = $scope.pathologyDatas.filter(el => id == el.PATHOLOGY_CUI);
        familyPathologyId = $scope.familyPathologyName[0].PATHOLOGY_ID;
    }


    // Clinical History
    function clinicalHistroryLoad() {

        $http.get(clinicalHistroryApi)
            .then(function (data) {
                familyMebmer = data.data;
            });
    }
    clinicalHistroryLoad();

    $scope.addEntryClinicalHistory = function () {
        $scope.clinicalHistoryData.PathologyId = pathologyId;
        $scope.clinicalHistoryDataArray.push($scope.clinicalHistoryData);
        $scope.clinicalHistoryData = {};
        pathologyId = '';
        console.log($scope.clinicalHistoryDataArray)
        // $http.post(clinicalHistroryApi, JSON.stringify($scope.clinicalHistoryData))
        //     .then(function (data) {
        //         console.log(data);
        //     }, function (data) {
        //     });

    };

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

    // Family History
    // let relationId = [];
    function familyHistroryLoad() {

        $http.get(familyHistroryApi)
            .then(function (data) {
            })

    }
    familyHistroryLoad();
    $scope.addEntryFamilyHistory = function () {
        $scope.familyClinicalHistoryData.PathologyId = familyPathologyId;
        $scope.familyClinicalHistoryDataArray.ClinicalHistoryDataArray.push($scope.familyClinicalHistoryData);
        $scope.familyClinicalHistoryData = {};
        console.log($scope.familyClinicalHistoryDataArray)
        // $http.post(familyHistroryApi, JSON.stringify($scope.familyHistoryData))
        //     .then(function (data) {

        //     }, function (data) {
        //     });

    };

    $scope.addEntryFamilyMember = function () {
        $scope.familyMembersArray.push(angular.copy($scope.familyClinicalHistoryDataArray));
        $scope.familyClinicalHistoryData = {};
        $scope.familyClinicalHistoryDataArray.LabId = '';
        $scope.familyClinicalHistoryDataArray.RelationId = '';
        $scope.familyClinicalHistoryDataArray.ClinicalHistoryDataArray = [];
        console.log($scope.familyMembersArray)
        // $http.post(familyHistroryApi, JSON.stringify($scope.familyHistoryData))
        //     .then(function (data) {

        //     }, function (data) {
        //     });

    };

    // Ralation

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
            });
    }
    relationsLoad();

    $scope.getRelationId = function () {
        familyRelationId = $scope.relationData.filter(el => el.RelationType == $scope.relationId)
        // if (familyRelationId[0]) familyRelationId[0].Id
        // return
    }
    $scope.resetGetRelationId = function ($event) {
        $event.target.value = ''
    }

}]);