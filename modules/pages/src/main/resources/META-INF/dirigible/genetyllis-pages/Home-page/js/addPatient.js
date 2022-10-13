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



var addPatient = angular.module("addPatient", ["ngAnimate", 'dx', 'ngStorage']);
addPatient.directive('ngConfirmClick', [
    function () {
        return {
            link: function (scope, element, attr) {
                var msg = attr.ngConfirmClick || "Are you sure?";
                var clickAction = attr.confirmedClick;
                element.bind('click', function (event) {
                    if (window.confirm(msg)) {
                        scope.$eval(clickAction)
                    }
                });
            }
        };
    }])

addPatient.controller('addPatientController', ['$scope', '$http', '$localStorage', '$sessionStorage', function ($scope, $http, $localStorage, $sessionStorage) {
    $scope.dataGridOptionsFamilyHistory = {}
    const gedPIDFromStorage = $sessionStorage.patientId;
    var api = "/services/v4/js/Home-page/services/patientInfo.js";
    var patientsOptionsApi = '/services/v4/js/genetyllis-pages/services/api/patients/Patient.js';
    var clinicalHistroryApi = '/services/v4/js/genetyllis-pages/services/api/patients/ClinicalHistory.js';
    var familyHistroryApi = '/services/v4/js/genetyllis-pages/services/api/patients/FamilyHistory.js';
    var relationApi = '/services/v4/js/genetyllis-pages/services/api/nomenclature/Relation.js';
    var pathologyApi = '/services/v4/js/genetyllis-pages/services/api/nomenclature/Pathology.js';

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

    const relationsMap = new Map([
        [2, 1], // Return Parent when Child
        [1, 2], // Return Child when Parent
        [3, 3], // Return Sibling when Sibling
        [4, 4], // Return Cousin when Cousin
        [10, 5], // Return Grandparent when Grandchild
        [9, 6], // Return Uncle when Nephew, Aunt handled separately
        [6, 9], // Return Nephew when Uncle, Niece handled separately
        [5, 10], // Return Grandchild when Grandparent
    ]);

    $scope.create = function () {
        if ($scope.entity.GenderId == 'male') $scope.entity.GenderId = 1
        else if ($scope.entity.GenderId == 'female') $scope.entity.GenderId = 2
        else $scope.entity.GenderId = 3;
        console.log($scope.entity)
        $http.post(patientsOptionsApi, $scope.entity)
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
            clinicalHistory.Id = clinicalHistory.Id;
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
            $http.post(patientsOptionsApi, familyMemberPatient)
            familyMemberPatient.PatientId = familyMember.PatientId;
            $http.post(patientsOptionsApi, JSON.stringify(familyMemberPatient))
                .then(function (response) {
                    familyMember.PatientId = response.data.PatientId
                    persistClinicalHistory(familyMember.ClinicalHistoryDataArray, familyMember.PatientId);

                    persistFamilyHistory(familyMember.PatientId, familyMember.RelationId, familyMember.Id);
                }, function (response) {
                });
        });
    }

    function persistFamilyHistory(familyMemberPatientId, familyMemberRelationId, familyHistoryId) {
        var familyHistory = {
            Id: '',
            PatientId: '',
            RelationId: '',
            FamilyMemberId: ''
        }

        // Patient to Family Member relation
        familyHistory.PatientId = $scope.entity.Id;
        familyHistory.RelationId = familyMemberRelationId;
        familyHistory.FamilyMemberId = familyMemberPatientId;
        familyHistory.Id = familyHistoryId;
        $http.post(familyHistroryApi, JSON.stringify(familyHistory))
            .then(function (response) {
                familyHistory.Id = response.data.Id
            }, function (response) {
            });

        // Family Member to Patient relation
        familyHistory.PatientId = familyMemberId;
        familyHistory.RelationId = getOppositeRelation(familyMemberRelationId);
        familyHistory.FamilyMemberId = $scope.entity.Id;
        $http.post(familyHistroryApi, JSON.stringify(familyHistory))
            .then(function (response) {
                familyHistory.Id = response.data.Id
            }, function (response) {
            });
    }

    function getOppositeRelation(relationId) {
        if ($scope.entity.GenderId === 2 && (relationId === 6 || relationId === 7)) {
            return 8;
        } else if ($scope.entity.GenderId === 2 && (relationId === 8 || relationId === 9)) {
            return 7;
        } else {
            return relationsMap.get(relationId);
        }
    }


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

    // function clinicalHistroryLoad() {

    //     $http.get(clinicalHistroryApi)
    //         .then(function (data) {
    //             familyClinicalHistoryDataArray = data.data;
    //         });
    // }
    // clinicalHistroryLoad();

    $scope.deleteClinicalHistory = function (history) {
        const index = this.clinicalHistoryDataArray.indexOf(history);
        this.clinicalHistoryDataArray.splice(index, 1);
        if ($scope.clinicalHistoryDataArray.length === 0) $scope.isEmptyTableClinicalHistory = false
    }

    $scope.deleteFamilyHistory = function (history) {
        const index = this.familyClinicalHistoryDataArray.ClinicalHistoryDataArray.indexOf(history);
        this.familyClinicalHistoryDataArray.ClinicalHistoryDataArray.splice(index, 1);

        if ($scope.familyClinicalHistoryDataArray.ClinicalHistoryDataArray.length === 0) $scope.isEmptyTableFamilyHistory = false;

    }

    $scope.deleteFamilyMember = function (member) {
        const index = this.familyMembersArray.indexOf(member);
        this.familyMembersArray.splice(index, 1);
        if ($scope.familyMembersArray.length === 0) $scope.isEmptyTableFamilyMember = false;

    }
    // add Entry Clinical history || check is empty
    $scope.isEmptyTableClinicalHistory = false
    $scope.addEntryClinicalHistory = function () {
        $scope.clinicalHistoryDataArray.push($scope.clinicalHistoryData);
        if ($scope.clinicalHistoryDataArray.length === 0) {
            $scope.isEmptyTableClinicalHistory = false

        }


        $scope.isEmptyTableClinicalHistory = true
        $scope.clinicalHistoryData = {};
    };


    $scope.isEmptyTableFamilyHistory = false;
    $scope.dataArray = []
    $scope.addEntryFamilyHistory = function () {
        $scope.isEmptyTableFamilyHistory = true;
        $scope.familyClinicalHistoryDataArray.ClinicalHistoryDataArray.push($scope.familyClinicalHistoryData);


        $scope.familyData = $scope.familyClinicalHistoryDataArray.ClinicalHistoryDataArray
        console.log($scope.familyData)

        // editFamilyHistoryEntry

        $scope.editFamilyHistoryEntry = function (index) {


        }
        if ($scope.familyClinicalHistoryDataArray.ClinicalHistoryDataArray.lenght === 0) $scope.isEmptyTableFamilyHistory = false;

        $scope.dataArray.push($scope.familyClinicalHistoryDataArray)
        console.log('dataArray: ', $scope.dataArray)

        $scope.familyClinicalHistoryData = {};
    };
    $scope.isEmptyTableFamilyMember = false;

    $scope.addEntryFamilyMember = function () {
        console.log('test: ', $scope.familyData)
        // console.log($scope.familyClinicalHistoryDataArray)
        // result.RelationName = el.RelationName
        // result.Notes = el.Notes
        $scope.dataArray[0].ClinicalHistoryDataArray.map(el => {
            let result = {}
            console.log(el, ":Leelee")
            result.LabId = $scope.dataArray[0].LabId;
            result.RelationName = $scope.dataArray[0].RelationName
            result.PathologyName = el.PathologyName
            result.AgeOnset = el.AgeOnset
            result.Notes = el.Notes

            $scope.familyMembersArray.push(result);
        })

        $scope.familyMemberData = $scope.familyMembersArray;
        // console.log("familyMemberData")
        // console.log($scope.familyMemberData)
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

        if ($scope.familyClinicalHistoryDataArray.ClinicalHistoryDataArray.length === 0) {
            $scope.isEmptyTableFamilyHistory = false
        }
        $scope.isEmptyTableFamilyMember = true;
        $scope.familyData = [];
        $scope.dataArray = []
        // $scope.familyMembersArray = []

    };

    $scope.existsLabId = function () {
        $http.get(patientsOptionsApi + "/getPatientByLabId/" + $scope.entity.LabId.toString())
            .then(data => {
                $scope.isLabIdTaken = data.data.length > 0
            })
    }
    console.log(gedPIDFromStorage, "gedPIDFromStorage")
    function loadPatientFormData() {
        $http.get(patientsOptionsApi + "/loadPatientFormData/" + gedPIDFromStorage)
            .then(data => {
                $scope.entity.Id = data.data.PATIENT_ID;
                $scope.entity.LabId = data.data.PATIENT_LABID;
                $scope.entity.Info = data.data.PATIENT_INFO;
                $scope.entity.BirthDate = data.data.PATIENT_AGE;
                $scope.entity.GenderId = data.data.PATIENT_GENDERID;
                console.log(data.data, "data")
                data.data.clinicalHistory.forEach(history => {

                    let loadedHistory = {};
                    loadedHistory.Id = history.CLINICALHISTORY_ID;
                    loadedHistory.PathologyName = history.pathology[0].PATHOLOGY_NAME;
                    loadedHistory.PathologyCui = history.pathology[0].PATHOLOGY_CUI;
                    loadedHistory.AgeOnset = history.CLINICALHISTORY_AGEONSET;
                    loadedHistory.Notes = history.CLINICALHISTORY_NOTES;
                    $scope.clinicalHistoryDataArray.push(loadedHistory);
                })
                $("#gridContainer").dxDataGrid("instance").refresh();
                data.data.familyHistory.forEach(member => {
                    console.log(member)
                    console.log("member")
                    let familyMember = {};
                    familyMember.ClinicalHistoryDataArray = [];
                    familyMember.patient = {};
                    familyMember.Id = member.FAMILYHISTORY_ID;
                    familyMember.LabId = member.patient[0]?.PATIENT_LABID;
                    familyMember.RelationId = member.FAMILYHISTORY_RELATIONID;
                    // TODO fix
                    // familyMember.RelationName = $scope.relationData.find(el => el.Id == member.FAMILYHISTORY_RELATIONID).RelationType;
                    familyMember.PatientId = member.FAMILYHISTORY_PATIENTID;
                    familyMember.FamilyMemberId = member.FAMILYHISTORY_FAMILYMEMBERID;
                    familyMember.patient.Id = member.patient[0]?.PATIENT_ID;
                    familyMember.patient.LabId = member.patient[0]?.PATIENT_LABID;
                    familyMember.patient.BirthDate = member.patient[0]?.PATIENT_AGE;
                    familyMember.patient.GenderId = member.patient[0]?.PATIENT_GENDERID;
                    familyMember.patient.Info = member.patient[0]?.PATIENT_INFO;

                    member.clinicalHistory.forEach((history, i) => {
                        let clinicalHistory = {};

                        clinicalHistory.ClinicalHistoryDataArray = [];
                        clinicalHistory.ClinicalHistoryDataArray.LabId = member.patient[0]?.PATIENT_LABID;
                        console.log(familyMember.patient.LabId)
                        console.log(i)
                        console.log("clinicalHistory.ClinicalHistoryDataArray.LabId")
                        clinicalHistory.ClinicalHistoryDataArray.RelationName = relation(member.FAMILYHISTORY_RELATIONID)
                        clinicalHistory.ClinicalHistoryDataArray.PathologyName = history.pathology[0].PATHOLOGY_NAME
                        clinicalHistory.ClinicalHistoryDataArray.AgeOnset = history.CLINICALHISTORY_AGEONSET
                        clinicalHistory.ClinicalHistoryDataArray.Notes = history.CLINICALHISTORY_NOTES;

                        // clinicalHistory.ClinicalHistoryDataArray.push(clinicalHistory);
                        $scope.familyMembersArray.push(clinicalHistory.ClinicalHistoryDataArray);
                    })
                    $scope.familyMemberData = $scope.familyMembersArray;
                })
                $("#familyMemberGrid").dxDataGrid("instance").refresh();
            })
        $sessionStorage.$reset();
    }

    // $scope.loadFamilyMemberId= function(){

    // }

    loadPatientFormData();

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
                        clinicalHistory.PathologyId = element.CLINICALHISTORY_PATHOLOGYID;
                        clinicalHistory.PathologyCui = element.PATHOLOGY_CUI;
                        clinicalHistory.PathologyName = element.PATHOLOGY_NAME;
                        clinicalHistory.Notes = element.GENETYLLIS_CLINICALHISTORY_NOTES;
                        clinicalHistory.AgeOnset = element.GENETYLLIS_CLINICALHISTORY_AGEONSET;
                        $scope.familyClinicalHistoryDataArray.ClinicalHistoryDataArray.push(clinicalHistory);
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


    $scope.dataGridOptionsClinicalHistory = {
        dataSource: $scope.clinicalHistoryDataArray,
        showBorders: true,
        paging: {
            enabled: false,
        },
        editing: {
            mode: 'row',
            allowUpdating: true,
            allowDeleting: true,
            allowAdding: true,
        },
        columns: [
            {
                dataField: 'PathologyCui',
                caption: 'Concept ID',
            },
            {
                dataField: 'PathologyName',
                caption: 'Disease',
            }, {
                caption: 'Age of Onset',
                dataField: 'AgeOnset',
            },
            {
                caption: 'Addition Info',
                dataField: 'Notes',
            },

        ],
        onEditingStart() {
        },
        onInitNewRow() {
        },
        onRowInserting() {
        },
        onRowInserted() {
        },
        onRowUpdating() {
        },
        onRowUpdated() {
        },
        onRowRemoving() {
        },
        onRowRemoved() {
            isEmptyTableClinicalHistory = false;

        },
        onSaving() {
        },
        onSaved() {
        },
        onEditCanceling() {
        },
        onEditCanceled() {
        },

    };

    $("#clinical-history-entry").on("click", function () {
        $("#gridContainer").dxDataGrid("instance").refresh();
    });

    $scope.familyData = $scope.familyClinicalHistoryDataArray.ClinicalHistoryDataArray
    $scope.dataGridOptionsFamilyHistory = {
        bindingOptions: {
            dataSource: "familyData"
        },
        // dataSource: $scope.familyData,
        showBorders: true,
        paging: {
            enabled: false,
        },
        editing: {
            mode: 'row',
            allowUpdating: true,
            allowDeleting: true,
            allowAdding: true,
        },
        columns: [
            {
                dataField: 'PathologyCui',
                caption: 'Concept ID',
            },
            {
                dataField: 'PathologyName',
                caption: 'Disease',
            }, {
                caption: 'Age of Onset',
                dataField: 'AgeOnset',
            },
            {
                caption: 'Addition Info',
                dataField: 'Notes',
            },

        ],
        onEditingStart() {
        },
        onInitNewRow() {
        },
        onRowInserting() {
        },
        onRowInserted() {
        },
        onRowUpdating() {
        },
        onRowUpdated() {
        },
        onRowRemoving() {
        },
        onRowRemoved() {

        },
        onSaving() {
        },
        onSaved() {
        },
        onEditCanceling() {
        },
        onEditCanceled() {
        },
    };

    $("#familyGridContainer").on("click", function () {
        $("#familyGridContainer").dxDataGrid("instance").refresh();


    });

    $scope.familyMemberData = [];
    $scope.dataGridOptionsFamilyMember = {
        bindingOptions: {
            dataSource: "familyMemberData"
        },
        showBorders: true,
        paging: {
            enabled: false,
        },
        editing: {
            mode: 'row',
            allowUpdating: true,
            allowDeleting: true,
            allowAdding: true,
        },
        columns: [
            {
                dataField: 'LabId',
                caption: 'Lab ID',
            },
            {
                dataField: 'RelationName',
                caption: 'Relation',
            }, {
                dataField: 'PathologyName',
                caption: 'Disease',
            },
            {
                dataField: 'AgeOnset',
                caption: 'Age of Onset',
            },
            {
                dataField: 'Notes',
                caption: 'Notes',
            },

        ],
        onEditingStart() {
        },
        onInitNewRow() {
        },
        onRowInserting() {
        },
        onRowInserted() {
        },
        onRowUpdating() {
        },
        onRowUpdated() {
        },
        onRowRemoving() {
        },
        onRowRemoved() {
            isEmptyTableClinicalHistory = false;

        },
        onSaving() {
        },
        onSaved() {
        },
        onEditCanceling() {
        },
        onEditCanceled() {
        },

    };

    $("#familyMemberGrid").on("click", function () {
        $("#familyMemberGrid").dxDataGrid("instance").refresh();


    });


    function relation(rel) {
        result = ""
        switch (rel) {
            case 1: result = "Parent";
                break;
            case 2: result = "Child";
                break;
            case 3: result = "Sibling";
                break;
            case 4: result = "Cousin";
                break;
            case 5: result = "Grandparent";
                break;
            case 6: result = "Uncle";
                break;
            case 7: result = "Aunt";
                break;
            case 8: result = "Niec";
                break;
            case 9: result = "Nephew";
                break;
            case 10: result = "Grandchild";
                break;
        }
        return result;
    }

    $scope.removeUser = function () {
        $http.delete(patientsOptionsApi + '/' + 11)
            .then(data => {
                console.log("data", data)

            })
    }
}]);
