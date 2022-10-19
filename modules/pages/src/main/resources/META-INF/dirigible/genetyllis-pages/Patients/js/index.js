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
var patients = angular.module('patients', ['ui.bootstrap', 'ngStorage', 'angularUtils.directives.dirPagination', 'angularjs-dropdown-multiselect']);

patients.config(function (paginationTemplateProvider) {
    paginationTemplateProvider.setPath('../components/pagination.html');
});

patients.controller('patientsController', ['$scope', '$http', '$localStorage', '$sessionStorage', function ($scope, $http, $localStorage, $sessionStorage) {
    const patientsOptionsApi = '/services/v4/js/genetyllis-pages/services/api/patients/Patient.js';

    const variantDetailsApi = '/services/v4/js/genetyllis-pages/services/variants.js';
    const alleleFrDetailsApi = '/services/v4/js/genetyllis-pages/services/alleleFr.js';
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
        $scope.homePageTable = ["PID", "LabId", "DOB", "Clinical history", "Analysis", "Dates"];
        $scope.homePageTableInfo = ["Id", "LabId", "BirthDate", "Clinical history", "Analysis", "Dates"];
        for (let x = 0; x < $scope.patientsTableModel.length; x++) {
            let value = $scope.patientsTableData.find(e => e.id == $scope.patientsTableModel[x].id)
            $scope.homePageTable.push(value.label);
            $scope.homePageTableInfo.push(value.label);

        }
    }



    $scope.homePageTable = ["PID", "LabId", "DOB", "Clinical history", "Analysis", "Dates"];
    $scope.homePageTableInfo = ["Id", "LabId", "BirthDate", "Clinical history", "Analysis", "Dates"];
    // _|_
    $scope.selectedPerPage = 10;
    $scope.perPageData = [10, 20, 50, 100]
    $scope.currentPage = 1;


    $scope.patientsDetails = []
    $scope.variantsRef = ['A', 'G', 'C', 'T', 'U']
    $scope.addedLabId = [];
    $scope.addedClinicalHistoryId = [];
    $scope.addedFamilyHistoryId = [];
    $scope.addedVariantId = [];


    $scope.labIds = [];
    $scope.selectedLabId = '';
    $scope.selectedLabIds = [];

    $scope.conceptIds = [];
    $scope.selectedPatientConceptId = '';
    $scope.selectedPatientConceptIds = [];

    $scope.selectedFamilyConceptId = '';
    $scope.selectedFamilyConceptIds = [];

    $scope.hgvs = [];
    $scope.selectedHgvs = '';
    $scope.selectedHgvsArr = [];

    $scope.GENETYLLIS_PATIENT = {
        PATIENT_LABID: [],
        PATIENT_AGE_FROM: '',
        PATIENT_AGE_TO: '',
        PATIENT_GENDERID: [],
        PATIENT_POPULATIONID: []
    }

    $scope.GENETYLLIS_CLINICALHISTORY = {
        PATHOLOGY_CUI: [],
        CLINICALHISTORY_AGEONSET_FROM: '',
        CLINICALHISTORY_AGEONSET_TO: ''
    }

    $scope.GENETYLLIS_FAMILYHISTORY = {
        PATHOLOGY_CUI: [],
        CLINICALHISTORY_AGEONSET_FROM: '',
        CLINICALHISTORY_AGEONSET_TO: ''
    }

    $scope.GENETYLLIS_VARIANT = {
        VARIANT_CHROMOSOME: '',
        VARIANT_START_FROM: '',
        VARIANT_END_TO: '',
        VARIANT_REF: '',
        VARIANT_ALT: '',
        VARIANT_CONSEQUENCE: []
    }
    $scope.GENETYLLIS_ANALYSIS = {
        ANALYSIS_DATE: "",
    }
    $scope.addLabIdFilter = function (labId) {
        $scope.GENETYLLIS_PATIENT.PATIENT_LABID.push(labId)
        $scope.selectedLabId = '';
    }

    $scope.addClinicalHistoryCuiFilter = function (cui) {
        $scope.GENETYLLIS_CLINICALHISTORY.PATHOLOGY_CUI.push(cui)
        $scope.selectedPatientConceptId = '';
    }

    $scope.addFamilyHistoryCuiFilter = function (cui) {
        $scope.GENETYLLIS_FAMILYHISTORY.PATHOLOGY_CUI.push(cui)
        $scope.selectedFamilyConceptId = '';
    }
    let patientObject = {};

    $scope.addVariantHgvsFilter = function (hgvs) {
        $scope.GENETYLLIS_VARIANT.VARIANT_HGVS.push(hgvs)
        $scope.selectedHgvs = '';
    }
    $scope.totalItems;
    $scope.totalPages;
    $scope.pathologyName = '';
    $scope.relationID = '';
    $scope.ageOnSet = ''
    $scope.isChecked = false;

    $scope.filter = function () {
        var query = {};

        query.GENETYLLIS_PATIENT = $scope.GENETYLLIS_PATIENT;
        query.GENETYLLIS_CLINICALHISTORY = $scope.GENETYLLIS_CLINICALHISTORY;
        query.GENETYLLIS_FAMILYHISTORY = $scope.GENETYLLIS_FAMILYHISTORY;
        query.GENETYLLIS_VARIANT = $scope.GENETYLLIS_VARIANT;
        query.GENETYLLIS_ANALYSIS = $scope.GENETYLLIS_ANALYSIS;
        query.perPage = $scope.selectedPerPage;
        query.currentPage = (($scope.currentPage - 1) * $scope.selectedPerPage);
        $scope.familyHistoryArr = []

        $http.post(patientsOptionsApi + "/filterPatients", JSON.stringify(query))
            .then(function (response) {
                $scope.patientsDetails = [];
                response.data.data.forEach((patientResult, i) => {
                    patientObject = {};
                    patientObject.Id = patientResult.PATIENT_ID;
                    patientObject.LabId = patientResult.PATIENT_LABID;
                    patientObject.BirthDate = patientResult.PATIENT_AGE.split('T')[0];
                    if (patientResult.clinicalHistory) {
                        patientObject["Clinical history"] = patientResult.clinicalHistory[0]?.pathology[0]?.PATHOLOGY_NAME;
                    }
                    if (patientResult.analysis) {
                        patientObject.Analysis = patientResult.analysis[0]?.ANALYSIS_ID;
                        patientObject.Dates = patientResult.analysis[0]?.ANALYSIS_DATE.split('T')[0];
                    }
                    patientObject.Gender = patientResult?.PATIENT_GENDERID === 1 ? "male" : patientResult?.PATIENT_GENDERID === 2 ? "female" : "Other";
                    patientObject.Ethnicity = patientResult?.PATIENT_POPULATIONID === 12 ? "Bulgarian" : "Other ethnicity";


                    patientResult.familyHistory.map((el, iindex) => {
                        el.clinicalHistory.map(fel => {

                            fel.pathology.map(pel => {
                                let result = ` ${pel.PATHOLOGY_NAME} (${relation(el.FAMILYHISTORY_RELATIONID)},${fel.CLINICALHISTORY_AGEONSET})`;
                                $scope.familyHistoryArr.push(result)
                            })
                        })
                    })
                    patientObject["Family history"] = $scope.familyHistoryArr.join(',')
                    $scope.patientsDetails.push(patientObject);

                })
                $scope.totalPages = response.data.totalPages;
                $scope.totalItems = response.data.totalItems;
            }, function (response) {
            });
        $scope.isChecked = false;
    }


    $scope.filter();

    $scope.pageChangeHandler = function (curPage) {
        $scope.isChecked = false;
        $scope.currentPage = curPage;
        $scope.filter()
        $scope.patientsDetails = [];
    }

    $scope.familyHistoryCheck = function (data) {
        console.log(data, ":datrasss")
    }

    // $http.get(variantDetailsApi)
    //     .then(function (data) {
    //         // $scope.pathologyDatas = data.data;
    //         $scope.variants = data.data;
    //     });
    // $http.get(alleleFrDetailsApi)
    //     .then(function (data) {
    //         for (let a = 0; a < 3; a++) {
    //             $scope.variants[a].Gene = data?.data[a]?.Frequency;
    //             $scope.variants[a].Filter = data?.data[a]?.GenderId;
    //         }
    //     })


    // LabID

    $scope.addLabIdFilter = function (args) {

        if ($scope.GENETYLLIS_PATIENT.PATIENT_LABID.includes($scope.selectedLabId) || $scope.selectedLabId == '') return
        $scope.GENETYLLIS_PATIENT.PATIENT_LABID.push($scope.selectedLabId);
        $scope.selectedLabId = ""

    }

    $scope.removeLabId = function (i) {
        $scope.GENETYLLIS_PATIENT.PATIENT_LABID.splice(i, 1);
    }

    // Clinical History ID
    $scope.removeClinicalHistoryId = function (i) {
        $scope.GENETYLLIS_CLINICALHISTORY.PATHOLOGY_CUI.splice(i, 1);

    }
    $scope.addClinicalHistoryId = function () {



        if ($scope.GENETYLLIS_CLINICALHISTORY.PATHOLOGY_CUI.includes($scope.selectedPatientConceptId) || $scope.selectedPatientConceptId == '') return

        $scope.GENETYLLIS_CLINICALHISTORY.PATHOLOGY_CUI.push($scope.selectedPatientConceptId);
        $scope.selectedPatientConceptId = ""
    }

    // Family History ID
    $scope.removeFamilyHistoryId = function (i) {
        $scope.GENETYLLIS_FAMILYHISTORY.PATHOLOGY_CUI.splice(i, 1);

    }
    $scope.addFamilyHistoryId = function () {
        if ($scope.GENETYLLIS_FAMILYHISTORY.PATHOLOGY_CUI.includes($scope.selectedFamilyConceptId) || $scope.selectedFamilyConceptId == '') return
        $scope.GENETYLLIS_FAMILYHISTORY.PATHOLOGY_CUI.push($scope.selectedFamilyConceptId);
        $scope.selectedFamilyConceptId = ""

    }


    $scope.addVariantId = function (index) {
        if ($scope.addedVariantId.includes($scope.selectedVariant) || $scope.selectedVariant == undefined) return
        $scope.addedVariantId.push($scope.selectedVariant);
    }
    $scope.removeVariantId = function (i) {
        $scope.addedVariantId.splice(i, 1);
    }




    $scope.chromList = []
    for (let a = 1; a <= 22; a++) {
        $scope.chromList.push(`chr${a}`)
    }
    $scope.chromList.push(`chrX`)
    $scope.chromList.push(`chrY`)

    if ($scope.maleCheckbox == undefined) $scope.maleCheckbox = false;
    if ($scope.femaleCheckbox == undefined) $scope.femaleCheckbox = false;
    if ($scope.otherGender == undefined) $scope.otherGender = false;
    if ($scope.bulgarian == undefined) $scope.bulgarian = false;
    if ($scope.otherEthnicity == undefined) $scope.otherEthnicity = false;
    $scope.maleFunc = function () {

        if (!$scope.maleCheckbox) {
            $scope.GENETYLLIS_PATIENT.PATIENT_GENDERID.push(1)
        } else {
            var index = $scope.GENETYLLIS_PATIENT.PATIENT_GENDERID.indexOf(0);
            $scope.GENETYLLIS_PATIENT.PATIENT_GENDERID.splice(index, 1);
        }
    }
    $scope.femaleFunc = function () {
        if (!$scope.femaleCheckbox) {

            $scope.GENETYLLIS_PATIENT.PATIENT_GENDERID.push(2)
        } else {
            var index = $scope.GENETYLLIS_PATIENT.PATIENT_GENDERID.indexOf(1);
            $scope.GENETYLLIS_PATIENT.PATIENT_GENDERID.splice(index, 1);

        }
    }

    $scope.otherGenderFunc = function () {
        if (!$scope.otherGender) {
            $scope.GENETYLLIS_PATIENT.PATIENT_GENDERID.push(3)
        } else {
            var index = $scope.GENETYLLIS_PATIENT.PATIENT_GENDERID.indexOf(2);
            $scope.GENETYLLIS_PATIENT.PATIENT_GENDERID.splice(index, 1);
        }
    }


    $scope.bulgarianFunc = function () {
        if (!$scope.bulgarian) {
            $scope.GENETYLLIS_PATIENT.PATIENT_POPULATIONID.push(12)
        } else {

            var index = $scope.GENETYLLIS_PATIENT.PATIENT_POPULATIONID.indexOf(12);
            $scope.GENETYLLIS_PATIENT.PATIENT_POPULATIONID.splice(index, 1)
        }
    }

    $scope.otherEthnicityFunc = function () {
        if (!$scope.otherEthnicity) {
            $scope.GENETYLLIS_PATIENT.PATIENT_POPULATIONID.push(18)
        } else {
            var index = $scope.GENETYLLIS_PATIENT.PATIENT_POPULATIONID.indexOf(12);
            $scope.GENETYLLIS_PATIENT.PATIENT_POPULATIONID.splice(index, 1)
        }
    }


    $scope.checkColumn = function (e) {
        return e == 'Id'
    }
    $scope.notLink = function (e) {
        return e != 'Id' && e != 'Analysis'
    }

    $scope.clearAllFilters = function () {
        $scope.isChecked = false;
        $scope.selectedLabId = ""
        selectedPatientConceptId = ""
        $scope.selectedPatientConceptId = ""
        $scope.selectedFamilyConceptId = ""
        $scope.maleCheckbox = false;
        $scope.femaleCheckbox = false;
        $scope.otherGender = false;
        $scope.otherEthnicity = false;
        $scope.bulgarian = false;
        $scope.GENETYLLIS_PATIENT = {
            PATIENT_LABID: [],
            PATIENT_AGE_FROM: '',
            PATIENT_AGE_TO: '',
            PATIENT_GENDERID: [],
            PATIENT_POPULATIONID: []
        }

        $scope.GENETYLLIS_CLINICALHISTORY = {
            PATHOLOGY_CUI: [],
            CLINICALHISTORY_AGEONSET_FROM: '',
            CLINICALHISTORY_AGEONSET_TO: ''
        }

        $scope.GENETYLLIS_FAMILYHISTORY = {
            PATHOLOGY_CUI: [],
            CLINICALHISTORY_AGEONSET_FROM: '',
            CLINICALHISTORY_AGEONSET_TO: ''
        }
        $scope.GENETYLLIS_ANALYSIS.ANALYSIS_DATE = ''
        $scope.GENETYLLIS_VARIANT.VARIANT_CHROMOSOME = ''
        $scope.GENETYLLIS_VARIANT.VARIANT_START_FROM = ''
        $scope.GENETYLLIS_VARIANT.VARIANT_END_TO = ''
        $scope.GENETYLLIS_VARIANT.VARIANT_REF = ''
        $scope.GENETYLLIS_VARIANT.VARIANT_ALT = ''
        $scope.GENETYLLIS_VARIANT.VARIANT_CONSEQUENCE = ''
        $scope.GENETYLLIS_VARIANT.VARIANT_REF = ''
        $scope.filter()
    }
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

    $scope.redirectPatients = function (data) {
        $sessionStorage.$default({
            patient: data.Id
        });
        console.log($sessionStorage.patient, "data");
        // $sessionStorage.$reset()
    }

    //TODO add more data to redirectData if needed
    $scope.redirectAnalysis = function (data) {

        let redirectData = {}
        redirectData.Id = data.Analysis
        $sessionStorage.$default({
            analysis: redirectData
        });
    }
}]);
