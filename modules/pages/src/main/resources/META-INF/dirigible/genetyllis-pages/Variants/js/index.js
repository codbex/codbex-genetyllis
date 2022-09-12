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

var page = angular.module("variant", ['ngStorage', 'angularUtils.directives.dirPagination']);
page.config(function (paginationTemplateProvider) {
    paginationTemplateProvider.setPath('../components/pagination.html');
});
page.controller('VariantController', ['$scope', '$http', function ($scope, $http) {
    const variantDetailsApi = '/services/v4/js/genetyllis-pages/Variants/services/variants.js';
    const variantOptionsApi = '/services/v4/js/genetyllis-app/gen/api/variants/Variant.js';

    $scope.perPage = 20;
    $scope.currentPage = 1;

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
        VARIANT_CONSEQUENCE: []
    }

    $scope.GENETYLLIS_GENE = {
        GENE_GENEID: []
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

    $scope.addConsequenceFilter = function (consequence) {
        $scope.GENETYLLIS_VARIANT.VARIANT_CONSEQUENCE.push(consequence)
        $scope.selectedConsequence = '';
    }

    $scope.addGeneFilter = function (geneId) {
        $scope.GENETYLLIS_GENE.GENE_GENEID.push(geneId)
        $scope.selectedGeneId = '';
    }

    $scope.addPathologyFilter = function (cui) {
        $scope.GENETYLLIS_PATHOLOGY.PATHOLOGY_CUI.push(cui)
        $scope.selectedPathologyCui = '';
    }

    $scope.filter = function () {
        var query = {};
        query.GENETYLLIS_VARIANT = $scope.GENETYLLIS_VARIANT;
        query.GENETYLLIS_GENE = $scope.GENETYLLIS_GENE;
        query.GENETYLLIS_PATHOLOGY = $scope.GENETYLLIS_PATHOLOGY;
        query.GENETYLLIS_SIGNIFICANCE = $scope.GENETYLLIS_SIGNIFICANCE;
        query.GENETYLLIS_ALLELEFREQUENCY = $scope.GENETYLLIS_ALLELEFREQUENCY;
        query.perPage = $scope.perPage;
        query.currentPage = (($scope.currentPage - 1) * $scope.perPage);

        $http.post(variantOptionsApi + "/filterVariants", JSON.stringify(query))
            .then(function (response) {
                console.log('response')
                console.log(response.data)

            }, function (response) {
            });
    }

    $scope.variants
    $http.get(variantDetailsApi)
        .then(function (data) {
            // $scope.pathologyDatas = data.data;
            $scope.variants = data.data;
            console.log("Hello", $scope.variants)
        });

}]);
