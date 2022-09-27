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

var patientDetails = angular.module("patientDetails", ['ngStorage', 'angularUtils.directives.dirPagination', 'angularjs-dropdown-multiselect']);
patientDetails.config(function (paginationTemplateProvider) {
    paginationTemplateProvider.setPath('../../components/pagination.html');
});
patientDetails.controller('patientDetailsController', ['$scope', '$http', '$localStorage', '$sessionStorage', function ($scope, $http, $localStorage, $sessionStorage) {
    const variantDetailsApi = '/services/v4/js/genetyllis-pages/services/api/variants/Variant.js';
    $scope.patientsDetails = $localStorage.x;
    $scope.variants;
    $scope.patientsDetailsTable = []
    $scope.selectedGeneId = '';
    $scope.selectedGeneIds = [];
    $scope.totalItems;
    $scope.clickedUrl = "../../images/star.svg";
    $scope.notClickedUrl = "../../images/not-clicked-star.svg";



    $scope.GENETYLLIS_GENE = {
        GENE_GENEID: [],
        GENE_NAME: [],
    }

    $scope.GENETYLLIS_VARIANT = {
        VARIANT_CHROMOSOME: '',
        VARIANT_START_FROM: '',
        VARIANT_END_TO: '',
        VARIANT_CONSEQUENCE: [],
        VARIANT_REFERENCE: "",
        VARIANT_ALTERNATIVE: ""
    }

    $scope.GENETYLLIS_SIGNIFICANCE = {
        SIGNIFICANCE_ID: []
    }

    $scope.GENETYLLIS_PATHOLOGY = {
        PATHOLOGY_CUI: []
    }


    $scope.GENETYLLIS_ALLELEFREQUENCY = {
        ALLELEFREQUENCY_FREQUENCY_FROM: '',
        ALLELEFREQUENCY_FREQUENCY_TO: ''
    }


    // clinical significance
    $scope.clinicalSignificance = ['Benign', 'Likely benign', 'Pathogenic', 'Likely pathogenic', 'VUS'];
    $scope.selectionClinicalSignificance = [];
    $scope.toggleSelection = function toggleSelection(clinicalSignificance) {
        var idx = $scope.selectionClinicalSignificance.indexOf(clinicalSignificance);
        if (idx > -1) {
            // remove clinical significance
            $scope.GENETYLLIS_SIGNIFICANCE.SIGNIFICANCE_ID.splice(idx, 1)
            $scope.selectionClinicalSignificance.splice(idx, 1);
        } else {
            // add clinical significance
            $scope.GENETYLLIS_SIGNIFICANCE.SIGNIFICANCE_ID.push(clinicalSignificance)
            $scope.selectionClinicalSignificance.push(clinicalSignificance);
        }

    };

    // add Pathology
    $scope.addPathologyFilter = function (cui) {
        if (!cui || $scope.GENETYLLIS_PATHOLOGY.PATHOLOGY_CUI.includes(cui)) return

        $scope.GENETYLLIS_PATHOLOGY.PATHOLOGY_CUI.push(cui)
        $scope.selectedPathologyCui = '';
    }
    // remove pathologyCui
    $scope.removePathologyCui = function (index) {
        let removedItem = $scope.GENETYLLIS_PATHOLOGY.PATHOLOGY_CUI.splice(index, 1);
        $scope.selectConsequences.push(removedItem)
    }

    // clinical significance
    $scope.clinicalSignificance = [
        { name: "Benign" },
        { name: "Likely benign" },
        { name: "Pathogenic" },
        { name: "Likely pathogenic" },
        { name: "VUS" }
    ];

    $scope.selectionClinicalSignificance = [];
    $scope.toggleSelection = function (clinicalSignificance) {
        var idx = $scope.selectionClinicalSignificance.indexOf(clinicalSignificance);
        if (idx > -1) {
            // remove clinical significance
            $scope.GENETYLLIS_SIGNIFICANCE.SIGNIFICANCE_ID.splice(idx, 1)
            $scope.selectionClinicalSignificance.splice(idx, 1);
        } else {
            // add clinical significance
            $scope.GENETYLLIS_SIGNIFICANCE.SIGNIFICANCE_ID.push(clinicalSignificance)
            $scope.selectionClinicalSignificance.push(clinicalSignificance);
        }
    };

    // add gene filters
    $scope.addGeneFilter = function () {
        if (!$scope.selectedGeneId || $scope.GENETYLLIS_GENE.GENE_NAME.includes($scope.selectedGeneId)) return
        $scope.GENETYLLIS_GENE.GENE_NAME.push($scope.selectedGeneId)
        $scope.selectedGeneId = '';

    }
    // remove gene filter
    $scope.removeGene = function (i) {
        $scope.GENETYLLIS_GENE.GENE_NAME.splice(i, 1)
    }

    // add conssequence
    $scope.selectConsequences = ["intron", "exon", "intragenic", "regulatory", "stop", "synonymous", "coding", "non", "splice", "other"]
    $scope.addConsequenceFilter = function () {
        $scope.GENETYLLIS_VARIANT.VARIANT_CONSEQUENCE.push($scope.selectedConsequence)

        let indexOfSelectedConsequence = $scope.selectConsequences.indexOf($scope.selectedConsequence);
        $scope.selectConsequences.splice(indexOfSelectedConsequence, 1)
        $scope.selectedConsequence = '';
    }

    // remove Consequence
    $scope.removeConsequence = function (index) {
        let removedItem = $scope.GENETYLLIS_VARIANT.VARIANT_CONSEQUENCE.splice(index, 1);
        $scope.selectConsequences.push(removedItem)
    }


    $scope.pageChangeHandler = function (curPage) {
        $scope.currentPage = curPage;
        $scope.filter()
        $scope.variantsDetails = [];
    }

    // table pagination
    $scope.selectedPerPage = 10;
    $scope.perPageData = [10, 20, 50, 100]
    $scope.currentPage = 1;
    $scope.patientsTableModel = [];
    $scope.patientsTableData = [{ id: 1, label: "Gender" }, { id: 2, label: "Ethnicity" }, { id: 3, label: "Family history" }];

    $scope.patientsTableSettings = {
        scrollableHeight: '200px',
        scrollable: true,
        enableSearch: true
    };

    $scope.selectFucn = function () {
        $scope.patientDetailsTable = ['HGVS', 'Gene', 'Consequence', 'Homozygous', 'Pathology', 'Clinical significance', 'Allele frequency', 'Patients'];

        $scope.patientDetailsTableInfo = ["HGVS", "GeneId", "Consequence", "Homozygous", "Pathology", "Clinical significance", "Allele frequency", "l"];
        for (let x = 0; x < $scope.patientsTableModel.length; x++) {
            let value = $scope.patientsTableData.find(e => e.id == $scope.patientsTableModel[x].id)
            $scope.patientDetailsTable.push(value.label);
            $scope.patientDetailsTableInfo.push(value.label);
        }
    }

    $scope.patientDetailsTable = ['HGVS', 'Gene', 'Consequence', 'Homozygous', 'Pathology', 'Clinical significance', 'Allele frequency', 'Patients'];
    $scope.patientDetailsTableInfo = ["HGVS", "GeneId", "Consequence", "Homozygous", "Pathology", "Clinical significance", "Allele frequency", "l"];

    // patientsDetailsTable
    $scope.filter = function () {
        var query = {};
        query.GENETYLLIS_VARIANT = $scope.GENETYLLIS_VARIANT;
        query.GENETYLLIS_GENE = $scope.GENETYLLIS_GENE
        query.GENETYLLIS_PATHOLOGY = $scope.GENETYLLIS_PATHOLOGY
        query.GENETYLLIS_SIGNIFICANCE = $scope.GENETYLLIS_SIGNIFICANCE
        query.GENETYLLIS_ALLELEFREQUENCY = $scope.GENETYLLIS_ALLELEFREQUENCY
        query.perPage = $scope.selectedPerPage;
        query.currentPage = (($scope.currentPage - 1) * $scope.selectedPerPage);
        let patientObject = {};

        $http.post(variantDetailsApi + "/filterPatientDetails", JSON.stringify(query))
            .then(function (response) {
                console.log('response', response)
                $scope.patientsDetailsTable = [];
                response.data.data.forEach((patientResult, i) => {
                    console.log(i, patientResult)
                    patientObject = {};
                    patientObject.HGVS = patientResult.VARIANT_HGVS;
                    patientObject.GeneId = patientResult.VARIANT_GENEID;
                    patientObject.Consequence = patientResult.VARIANT_CONSEQUENCE;
                    patientObject.Homozygous = patientResult.variantRecords[0].VARIANTRECORD_HOMOZYGOUS ? "Yes" : "No";
                    patientObject.Pathology = patientResult.clinicalSignificance[0].pathology[0].PATHOLOGY_NAME;

                    patientObject["Clinical significance"] = patientResult.clinicalSignificance[0].CLINICALSIGNIFICANCE_ID;
                    patientObject["Allele frequency"] = patientResult.alleleFrequency[0].ALLELEFREQUENCY_FREQUENCY;




                    if (patientResult.clinicalHistory) {
                        patientObject["Clinical history"] = patientResult.clinicalHistory[0]?.pathology[0]?.PATHOLOGY_NAME;
                    }
                    if (patientResult.analysis) {
                        // patientObject.HGVS = i;
                        patientObject.Dates = patientResult.analysis[0]?.ANALYSIS_DATE.split('T')[0];
                    }
                    patientObject.Gender = patientResult?.PATIENT_GENDERID;
                    patientObject.Ethnicity = patientResult?.GENETYLLIS_PATIENT_POPULATIONID;
                    if (patientResult.familyHistory && patientResult.familyHistory.clinicalHistory) {
                        patientObject["Family history"] = patientResult.familyHistory[0]?.clinicalHistory[0]?.pathology[0]?.PATHOLOGY_NAME;
                    }
                    $scope.patientsDetailsTable.push(patientObject);

                })
                $scope.totalPages = response.data.totalPages;
                $scope.totalItems = response.data.totalItems;
                console.log(" $scope.patientsDetails", $scope.patientsDetails)
            }, function (response) {
            });

    }

    $scope.filter();

    $scope.clearAllFilters = function () {
        angular.forEach($scope.clinicalSignificance, function (item) {
            item.Selected = false;
        });
        $scope.GENETYLLIS_ANALYSIS.ANALYSIS_DATE = ""
        $scope.GENETYLLIS_VARIANT.VARIANT_CHROMOSOME = ""
        $scope.GENETYLLIS_VARIANT.VARIANT_START_FROM = ""
        $scope.GENETYLLIS_VARIANT.VARIANT_END_TO = ""
        $scope.GENETYLLIS_VARIANT.VARIANT_REFERENCE = ""
        $scope.GENETYLLIS_VARIANT.VARIANT_ALTERNATIVE = ""
        $scope.GENETYLLIS_GENE.GENE_NAME = []
        $scope.GENETYLLIS_VARIANT.VARIANT_CONSEQUENCE = []
        $scope.GENETYLLIS_PATHOLOGY.PATHOLOGY_CUI = []
        $scope.GENETYLLIS_ALLELEFREQUENCY.ALLELEFREQUENCY_FREQUENCY_FROM = ""
        $scope.GENETYLLIS_ALLELEFREQUENCY.ALLELEFREQUENCY_FREQUENCY_TO = ""
        $scope.filter()
    }


    const newDate = new Date("1990-01-03T01:00:00.000Z");
    $scope.year = newDate.getFullYear();
    $scope.month = Number(newDate.getMonth()) + 1;
    $scope.day = newDate.getDay();

    $scope.fromData = $localStorage.key;
    $scope.gender = ''
    //Gender Id
    $scope.fromData.GenderId == 1 ? "male" : $scope.fromData == 2 ? "female" : "other"
    if ($scope.fromData.GenderId == 1) {
        $scope.gender = "male"
    } else if ($scope.fromData.GenderId == 2) {
        $scope.gender = "female"
    } else {
        $scope.gender = "other"
    }
    // population
    $scope.population = ''
    if ($scope.fromData.PopulationId == 18) {
        $scope.population = "Bulgarian";
    } else {
        $scope.population = "Other";

    }


}]);

