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

var page = angular.module("variant", ['ngStorage', 'angularUtils.directives.dirPagination', 'angularjs-dropdown-multiselect']);
page.config(function (paginationTemplateProvider) {
    paginationTemplateProvider.setPath('../components/pagination.html');
});
page.controller('VariantController', ['$scope', '$http', function ($scope, $http) {
    // const variantDetailsApi = '/services/v4/js/genetyllis-pages/Variants/services/variants.js';
    const variantOptionsApi = '/services/v4/js/genetyllis-app/gen/api/variants/Variant.js';

    $scope.selectedPerPage = 10;
    $scope.perPageData = [10, 20, 50, 100];
    let currentPage = 1
    $scope.pageChangeHandler = function (index) {
        currentPage = index
    }

    $scope.selectConsequences = ["intron", "exon", "intragenic", "regulatory", "stop", "synonymous", "coding", "non", "splice", "other"]
    $scope.geneIds = [];
    $scope.selectedGeneId = '';
    $scope.selectedGeneIds = [];

    $scope.consequences = [];
    $scope.selectedConsequence = '';
    $scope.selectedConsequences = [];

    $scope.pathologyCuis = [];
    $scope.selectedPathologyCui = '';
    $scope.selectedPathologyCuis = [];

    $scope.GENETYLLIS_VARIANT = {
        VARIANT_CHROMOSOME: '',
        VARIANT_START_FROM: '',
        VARIANT_END_TO: '',
        VARIANT_CONSEQUENCE: [],
        VARIANT_REFERENCE: "",
        VARIANT_ALTERNATIVE: ""
    }

    $scope.GENETYLLIS_GENE = {
        GENE_GENEID: [],
        GENE_NAME: [],
    }

    $scope.GENETYLLIS_PATHOLOGY = {
        PATHOLOGY_CUI: []
    }

    $scope.GENETYLLIS_SIGNIFICANCE = {
        SIGNIFICANCE_ID: []
    }



    $scope.GENETYLLIS_ALLELEFREQUENCY = {
        ALLELEFREQUENCY_FREQUENCY_FROM: '',
        ALLELEFREQUENCY_FREQUENCY_TO: ''
    }

    $scope.addGeneFilter = function () {
        $scope.GENETYLLIS_GENE.GENE_GENEID.push($scope.selectedGeneId)
        $scope.selectedGeneId = '';
    }

    // add conssequence
    $scope.addConsequenceFilter = function () {
        $scope.GENETYLLIS_VARIANT.VARIANT_CONSEQUENCE.push($scope.selectedConsequence)

        console.log($scope.GENETYLLIS_VARIANT.VARIANT_CONSEQUENCE);
        let indexOfSelectedConsequence = $scope.selectConsequences.indexOf($scope.selectedConsequence);
        $scope.selectConsequences.splice(indexOfSelectedConsequence, 1)
        $scope.selectedConsequence = '';
    }

    // remove Consequence
    $scope.removeConsequence = function (index) {
        let removedItem = $scope.GENETYLLIS_VARIANT.VARIANT_CONSEQUENCE.splice(index, 1);
        $scope.selectConsequences.push(removedItem)
    }

    // add Pathology

    $scope.addPathologyFilter = function (cui) {
        $scope.GENETYLLIS_PATHOLOGY.PATHOLOGY_CUI.push(cui)
        $scope.selectedPathologyCui = '';
    }
    // remove pathologyCui
    $scope.removePathologyCui = function (index) {
        let removedItem = $scope.GENETYLLIS_PATHOLOGY.PATHOLOGY_CUI.splice(index, 1);
        $scope.selectConsequences.push(removedItem)
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
        console.log($scope.selectionClinicalSignificance)
    };

    //  allelefrequency

    $scope.filter = function () {
        var query = {};
        query.GENETYLLIS_VARIANT = $scope.GENETYLLIS_VARIANT;
        query.GENETYLLIS_GENE = $scope.GENETYLLIS_GENE;
        query.GENETYLLIS_PATHOLOGY = $scope.GENETYLLIS_PATHOLOGY;
        query.GENETYLLIS_SIGNIFICANCE = $scope.GENETYLLIS_SIGNIFICANCE;
        query.GENETYLLIS_ALLELEFREQUENCY = $scope.GENETYLLIS_ALLELEFREQUENCY;
        query.perPage = $scope.selectedPerPage;
        console.log("TYka", query)
        query.currentPage = ((currentPage - 1) * $scope.selectedPerPage);
        let variantObj = {}
        $http.post(variantOptionsApi + "/filterVariants", JSON.stringify(query))
            .then(function (response) {
                // $scope.variants = [];
                console.log('response')
                console.log(response.data)

            }, function (response) {
            });
    }

    $scope.filter();

    $http.get(variantOptionsApi)
        .then(function (data) {
            // $scope.pathologyDatas = data.data;
            $scope.variants = data.data;
            console.log("Hello", $scope.variants)
        });

    $scope.variantTable = ['HGVS', 'Gene', 'Consequence', 'Pathologies', 'Clinical significance', 'allele frequency', 'Patients'];



}]);

    // $scope.variantTableModel = [];
    // $scope.variantTableData = [];
    // $scope.variantTableSettings = {
    //     scrollableHeight: '200px',
    //     scrollable: true,
    //     enableSearch: true
    // };

    // $scope.variantTableInfo = ["HGVS", "HGVS", "DBSNP", "Clinical history", "Alternative", "Dates"];

    // $scope.patientsTableModel = [];
    // // $scope.patientsTableData = [{ id: 5, label: "Platform" }, { id: 6, label: "Provider" }, { id: 7, label: "Status" }];
    // $scope.patientsTableData = [{ id: 7, label: "Gender" }, { id: 8, label: "Ethnicity" }, { id: 9, label: "Family history" }];
    // $scope.patientsTableSettings = {
    //     scrollableHeight: '200px',
    //     scrollable: true,
    //     enableSearch: true
    // };

    // $scope.selectFucn = function () {
    //     $scope.homePageTableInfo = ["Id", "LabId", "BirthDate", "Clinical history", "Analysis", "Dates"];
    //     $scope.homePageTable = ["PID", "LabId", "DOB", "Clinical history", "Analysis", "Dates"];
    //     for (let x = 0; x < $scope.patientsTableModel.length; x++) {
    //         let value = $scope.patientsTableData.find(e => e.id == $scope.patientsTableModel[x].id)
    //         $scope.homePageTable.push(value.label);
    //         $scope.homePageTableInfo.push(value.label);

    //     }
    // }

    // $scope.checkColumn = function (e) {
    //     return e == 'Id'
    // }
    // $scope.notLink = function (e) {
    //     return e != 'Id'
    // }