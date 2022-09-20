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
    const variantDetailsApi = '/services/v4/js/genetyllis-pages/Variants/services/variants.js';
    const getPatientsIdApi = '/services/v4/js/genetyllis-pages/Variants/js/index.js';
    $scope.patientsDetails = $localStorage.x;
    console.log($localStorage.x, "localStorage");
    // localStorage.removeItem("ngStorage-x")
    $scope.variants;
    $scope.clickedUrl = "../../images/star.svg";
    $scope.notClickedUrl = "../../images/not-clicked-star.svg";

    // { Id: 2, url:  },
    // $scope.photo.clicked = true;
    // console.log($scope.photo.clicked)

    $http.get(variantDetailsApi)
        .then(function (data) {
            // $scope.pathologyDatas = data.data;
            $scope.variants = data.data;
            console.log("Hello", $scope.variants);
        });

    // $scope.imageHandler = function (index) {
    //     $scope.variants.splice(index, 1);

    // }

    $scope.addColumns = ["", "HGVS", "Filter", "Gene", "Pseudo", "Consequence", "Homozygous", "Pathology", "Clinical significance", "Allele Freq", "Af (men)", "AF (Bulgarian)", "Analysis"]
    // Date
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
    console.log($scope.fromData, "fromData");

    // $scope.editPatients = function () {
    //     console.log("Heello");

    //     $window.location.href("")
    // }


    // $localStorage.$reset()





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






    $scope.patientInfoModel = [];
    // $scope.variantsTableData = [{ id: 5, label: "Platform" }, { id: 6, label: "Provider" }, { id: 7, label: "Status" }];
    $scope.variantsTableData = [{ id: 10, label: "AF(men)" }, { id: 11, label: "AF(Bulgarian)" }, { id: 12, label: "Analysis" }];
    $scope.patientsTableSettings = {
        scrollableHeight: '200px',
        scrollable: true,
        enableSearch: true
    };

    $scope.selectFucn = function () {
        console.log($scope.variants, "variants")
        $scope.variantTable = ['HGVS', 'Gene', 'Pseudo', 'Consequence', 'Homozygous', 'Pathology', 'Clinical significance', 'Allele frequency', 'Patients'];
        $scope.variantPageTableInfo = ["HGVS", "Gene", "VARIANT_CONSEQUENCE", "GeneId", "Reference", "Alternative", "Pathology"];
        for (let x = 0; x < $scope.patientInfoModel.length; x++) {
            let value = $scope.variantsTableData.find(e => e.id == $scope.patientInfoModel[x].id)
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
    $scope.variantTable = ['HGVS', 'Gene', 'Pseudo', 'Consequence', 'Homozygous', 'Pathology', 'Clinical significance', 'Allele frequency', 'Patients'];




    $scope.pageChangeHandler = function (curPage) {
        $scope.currentPage = curPage;
        $scope.filter()
        $scope.variantsDetails = [];
    }


}]);

