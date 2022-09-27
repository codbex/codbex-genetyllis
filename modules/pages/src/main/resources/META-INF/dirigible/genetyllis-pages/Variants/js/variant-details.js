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

var variantDetails = angular.module("variantDetails", ['ngStorage', 'angularUtils.directives.dirPagination', 'angularjs-dropdown-multiselect']);
variantDetails.config(function (paginationTemplateProvider) {
    paginationTemplateProvider.setPath('../../components/pagination.html');
});

variantDetails.controller('variantDetailsController', ['$scope', '$http', function ($scope, $http) {

    $scope.clinicalSignificance = ["Accession", "Pathology", "Significance", "Evaluation", "Review"]
    const patientsOptionsApi = '/services/v4/js/genetyllis-pages/services/api/patients/Patient.js';

    $scope.variants;

    $scope.selectedPerPage = 10;
    $scope.perPageData = [10, 20, 50, 100]
    $scope.currentPage = 1;
    $scope.totalItems;
    $scope.patientsTableModel = [];
    $scope.patientsTableData = [{ id: 1, label: "Filter" }, { id: 2, label: "Ethnicity" }];

    $scope.patientsTableSettings = {
        scrollableHeight: '200px',
        scrollable: true,
        enableSearch: true
    };

    $scope.selectFucn = function () {
        $scope.patientDetailsTable = ['PID', 'LabId', 'DOB', 'Gender', 'Clinical history', 'Family history', 'Analysis', 'Date'];

        $scope.patientDetailsTableInfo = ["Id", "LabId", "BirthDate", "GenderId", "Clinical history", "Family history", "Analysis", "Date"];
        for (let x = 0; x < $scope.patientsTableModel.length; x++) {
            let value = $scope.patientsTableData.find(e => e.id == $scope.patientsTableModel[x].id)
            $scope.patientDetailsTable.push(value.label);
            $scope.patientDetailsTableInfo.push(value.label);
        }
    }

    $scope.patientDetailsTable = ['PID', 'LabId', 'DOB', 'Gender', 'Clinical history', 'Family history', 'Analysis', 'Date'];
    $scope.patientDetailsTableInfo = ["Id", "LabId", "BirthDate", "GenderId", "Clinical history", "Family history", "Analysis", "Date"];




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
        GENETYLLIS_PATIENT_LABID: [],
        PATIENT_AGE_FROM: '',
        PATIENT_AGE_TO: '',
        PATIENT_GENDERID: [],
        GENETYLLIS_PATIENT_POPULATIONID: []
    }

    $scope.GENETYLLIS_CLINICALHISTORY = {
        PATHOLOGY_CUI: [],
        GENETYLLIS_CLINICALHISTORY_AGEONSET_FROM: '',
        GENETYLLIS_CLINICALHISTORY_AGEONSET_TO: ''
    }

    $scope.GENETYLLIS_FAMILYHISTORY = {
        PATHOLOGY_CUI: [],
        GENETYLLIS_CLINICALHISTORY_AGEONSET_FROM: '',
        GENETYLLIS_CLINICALHISTORY_AGEONSET_TO: ''
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
        $scope.GENETYLLIS_PATIENT.GENETYLLIS_PATIENT_LABID.push(labId)
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

    $scope.addVariantHgvsFilter = function (hgvs) {
        $scope.GENETYLLIS_VARIANT.VARIANT_HGVS.push(hgvs)
        $scope.selectedHgvs = '';
    }




    $scope.addLabIdFilter = function (args) {

        if ($scope.GENETYLLIS_PATIENT.GENETYLLIS_PATIENT_LABID.includes($scope.selectedLabId) || $scope.selectedLabId == '') return
        $scope.GENETYLLIS_PATIENT.GENETYLLIS_PATIENT_LABID.push($scope.selectedLabId);
        $scope.selectedLabId = ""

    }

    $scope.removeLabId = function (i) {
        $scope.GENETYLLIS_PATIENT.GENETYLLIS_PATIENT_LABID.splice(i, 1);
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
            $scope.GENETYLLIS_PATIENT.GENETYLLIS_PATIENT_POPULATIONID.push(12)
        } else {

            var index = $scope.GENETYLLIS_PATIENT.GENETYLLIS_PATIENT_POPULATIONID.indexOf(12);
            $scope.GENETYLLIS_PATIENT.GENETYLLIS_PATIENT_POPULATIONID.splice(index, 1)
        }
    }

    $scope.otherEthnicityFunc = function () {
        if (!$scope.otherEthnicity) {
            $scope.GENETYLLIS_PATIENT.GENETYLLIS_PATIENT_POPULATIONID.push(18)
        } else {
            var index = $scope.GENETYLLIS_PATIENT.GENETYLLIS_PATIENT_POPULATIONID.indexOf(12);
            $scope.GENETYLLIS_PATIENT.GENETYLLIS_PATIENT_POPULATIONID.splice(index, 1)
        }
    }

    $scope.getLocation = function (s) {
        $localStorage.$default({
            x: s
        });
    }

    $scope.redirectPatients = function (data) {
        console.log(data, "data");
        $localStorage.$default({
            key: data
        });
        // $localStorage.setItem('key', data);
    }



    $scope.clearAllFilters = function () {
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
            GENETYLLIS_PATIENT_LABID: [],
            PATIENT_AGE_FROM: '',
            PATIENT_AGE_TO: '',
            PATIENT_GENDERID: [],
            GENETYLLIS_PATIENT_POPULATIONID: []
        }

        $scope.GENETYLLIS_CLINICALHISTORY = {
            PATHOLOGY_CUI: [],
            GENETYLLIS_CLINICALHISTORY_AGEONSET_FROM: '',
            GENETYLLIS_CLINICALHISTORY_AGEONSET_TO: ''
        }

        $scope.GENETYLLIS_FAMILYHISTORY = {
            PATHOLOGY_CUI: [],
            GENETYLLIS_CLINICALHISTORY_AGEONSET_FROM: '',
            GENETYLLIS_CLINICALHISTORY_AGEONSET_TO: ''
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


    // GENETYLLIS_ANALYSIS GENETYLLIS_VARIANT GENETYLLIS_FAMILYHISTORY GENETYLLIS_CLINICALHISTORY 

    $scope.filter = function () {
        let query = {};
        query.GENETYLLIS_PATIENT = $scope.GENETYLLIS_PATIENT;
        query.GENETYLLIS_CLINICALHISTORY = $scope.GENETYLLIS_CLINICALHISTORY;
        query.GENETYLLIS_FAMILYHISTORY = $scope.GENETYLLIS_FAMILYHISTORY;
        query.GENETYLLIS_VARIANT = $scope.GENETYLLIS_VARIANT;
        query.GENETYLLIS_ANALYSIS = $scope.GENETYLLIS_ANALYSIS;
        query.perPage = $scope.selectedPerPage;
        query.currentPage = (($scope.currentPage - 1) * $scope.selectedPerPage);

        $http.post(patientsOptionsApi + "/filterPatients", JSON.stringify(query))
            .then(function (response) {
                $scope.variants = []
                console.log(response, "response")
                //  "", "",  ", "", ""];
                response.data.data.forEach(data => {
                    let variantObj = {}
                    console.log(data)
                    variantObj.LabId = data.GENETYLLIS_PATIENT_LABID;
                    variantObj.Id = data.PATIENT_ID;
                    variantObj.BirthDate = data.PATIENT_AGE.split("T")[0];

                    variantObj.GenderId = data.PATIENT_GENDERID === 1 ? "male" : data.PATIENT_GENDERID == 2 ? "female" : "Nonspecifed gender";
                    variantObj["Clinical history"] = data.clinicalHistory[0]?.pathology[0]?.PATHOLOGY_NAME;
                    variantObj["Family history"] = data.familyHistory[0]?.clinicalHistory[0]?.pathology[0]?.PATHOLOGY_NAME;
                    variantObj.Analysis = data.analysis[0]?.ANALYSIS_ID;
                    variantObj.Date = data.analysis[0]?.ANALYSIS_DATE.split("T")[0];
                    variantObj.Ethnicity = data.GENETYLLIS_PATIENT_POPULATIONID === 12 ? "Bulgarian" : data.GENETYLLIS_PATIENT_POPULATIONID === 18 ? "Other ethnicity" : "European (non-Finnish)";
                    $scope.variants.push(variantObj);
                });
                $scope.totalPages = response.data.totalPages;
                $scope.totalItems = response.data.totalItems;
            })
    }
    $scope.filter();

    $scope.pageChangeHandler = function (curPage) {
        $scope.currentPage = curPage;
        $scope.filter()
        $scope.patientsDetails = [];
    }
}]);


