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
    const variantOptionsApi = '/services/v4/js/genetyllis-pages/services/api/variants/Variant.js';

    $scope.variantsDetails = [];
    $scope.selectedPerPage = 10;
    $scope.perPageData = [10, 20, 50, 100];
    $scope.currentPage = 1;
    $scope.totalItems;
    $scope.totalPages;

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
        $scope.GENETYLLIS_GENE.GENE_NAME.push($scope.selectedGeneId)
        $scope.selectedGeneId = '';
        console.log($scope.GENETYLLIS_GENE.GENE_NAME)
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
        query.currentPage = (($scope.currentPage - 1) * $scope.selectedPerPage);
        $http.post(variantOptionsApi + "/filterVariants", JSON.stringify(query))
            .then(function (response) {
                $scope.variantsDetails = [];
                console.log(response.data)
                response.data.data.forEach(data => {
                    let variantObj = {}
                    variantObj.HGVS = data.VARIANT_HGVS
                    variantObj.Gene = data.genes[0].GENE_NAME
                    variantObj.VARIANT_CONSEQUENCE = data.VARIANT_CONSEQUENCE
                    variantObj.GeneId = data.VARIANT_GENEID
                    variantObj.Reference = data.VARIANT_REFERENCE
                    variantObj.Alternative = data.VARIANT_ALTERNATIVE
                    variantObj.Pathology = data.clinicalSignificance?.pathology[0]?.PATHOLOGY_NAME;

                    variantObj.Ethnicity = data.alleleFrequency[0]?.ALLELEFREQUENCY_POPULATIONID

                    $scope.variantsDetails.push(variantObj)
                })

                $scope.totalPages = response.data.totalPages;
                $scope.totalItems = response.data.totalItems;

            }, function (response) {
            });
    }

    $scope.filter();


    // _|_
    $scope.variantTableModel = [];
    // $scope.variantsTableData = [{ id: 5, label: "Platform" }, { id: 6, label: "Provider" }, { id: 7, label: "Status" }];
    $scope.variantsTableData = [{ id: 7, label: "Ethnicity" }, { id: 8, label: "Gender" }];
    $scope.patientsTableSettings = {
        scrollableHeight: '200px',
        scrollable: true,
        enableSearch: true
    };

    $scope.selectFucn = function () {
        console.log($scope.variants, "variants")
        $scope.variantTable = ['HGVS', 'Gene', 'Consequence', 'Pathologies', 'Clinical significance', 'Allele frequency', 'Patients'];
        $scope.variantPageTableInfo = ["HGVS", "Gene", "VARIANT_CONSEQUENCE", "GeneId", "Reference", "Alternative", "Pathology"];
        for (let x = 0; x < $scope.variantTableModel.length; x++) {
            let value = $scope.variantsTableData.find(e => e.id == $scope.variantTableModel[x].id)
            $scope.variantTable.push(value.label);
            $scope.variantPageTableInfo.push(value.label);

        }
    }


    $scope.checkColumn = function (e) {
        return e == 'Id'
    }
    $scope.notLink = function (e) {
        return e != 'Id'
    }

    $scope.variantPageTableInfo = ["HGVS", "Gene", "VARIANT_CONSEQUENCE", "GeneId", "Reference", "Alternative", "Pathology"];
    $scope.variantTable = ['HGVS', 'Gene', 'Consequence', 'Pathologies', 'Clinical significance', 'Allele frequency', 'Patients']



    $scope.pageChangeHandler = function (curPage) {
        $scope.currentPage = curPage;
        $scope.filter()
        $scope.variantsDetails = [];
    }
}]);
