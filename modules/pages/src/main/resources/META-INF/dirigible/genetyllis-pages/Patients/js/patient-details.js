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
    const patientsOptionsApi = '/services/v4/js/genetyllis-pages/services/api/patients/Patient.js';
    const variantRecordOptionsApi = '/services/v4/js/genetyllis-pages/services/api/records/VariantRecord.js';


    $scope.clickedUrl = "../images/flagged.svg";
    $scope.notClickedUrl = "../images/notFlagged.svg";

    $scope.fromData;
    $scope.patientIdFromStorage = $sessionStorage.patient

    $scope.editPatients = function () {
        $sessionStorage.$default({
            patientId: $scope.patientIdFromStorage
        });
    }
    $scope.getIdFromStorage = function () {
        $http.get(patientsOptionsApi + "/loadPatientFormData/" + $scope.patientIdFromStorage)
            .then(data => {
                $scope.fromData = data.data
                let currDate = new Date();
                let mlscndsNow = Date.parse(currDate)
                const mlscndsFrom = Date.parse(data.data.PATIENT_AGE);
                let patientAgeInMlscnds = mlscndsNow - mlscndsFrom;
                $scope.patientBirthDate = data.data.PATIENT_AGE.split('T')[0]
                $scope.patientYear = getDate(patientAgeInMlscnds).year - 1;

                $scope.patientsGender = $scope.fromData.Gender == 1 ? "male" : $scope.fromData.Gender == 2 ? "female" : "other";
                $scope.patientEthnicity = $scope.fromData.Ethnicity == 12 ? "Bulgarian" : "Other ethnicity"
                // $sessionStorage.$reset()
            })
    }
    $scope.getIdFromStorage()

    // $scope.fromData = $sessionStorage.patient

    $scope.variants;
    $scope.patientsDetailsTable = []
    $scope.selectedGeneId = '';
    $scope.selectedGeneIds = [];
    $scope.totalItems;
    $scope.clickedUrl = "../../images/star.svg";
    $scope.notClickedUrl = "../../images/not-clicked-star.svg";

    $scope.patientClinicalHistory = []
    $scope.clinicalHistoryThead = ["Age of onset", "Pathology", "Notes"];
    $scope.patientFamilylHistory = []
    $scope.familyHistoryThead = ["PID", "Relation", "Age of onset", "Pathology", "Notes"];

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
        $scope.patientDetailsTable = ['', 'HGVS', 'Gene', 'Consequence', 'Homozygous', 'Pathology', 'Clinical significance', 'Allele frequency'];

        $scope.patientDetailsTableInfo = ["", "HGVS", "GeneId", "Consequence", "Homozygous", "Pathology", "Clinical significance", "Allele frequency"];
        for (let x = 0; x < $scope.patientsTableModel.length; x++) {
            let value = $scope.patientsTableData.find(e => e.id == $scope.patientsTableModel[x].id)
            $scope.patientDetailsTable.push(value.label);
            $scope.patientDetailsTableInfo.push(value.label);
        }
    }

    $scope.patientDetailsTable = ['', 'HGVS', 'Gene', 'Consequence', 'Homozygous', 'Pathology', 'Clinical significance', 'Allele frequency'];
    $scope.patientDetailsTableInfo = ["", "HGVS", "GeneId", "Consequence", "Homozygous", "Pathology", "Clinical significance", "Allele frequency"];
    $scope.filter = function () {
        var query = {};
        $scope.gender = ''
        //Gender Id

        query.GENETYLLIS_PATIENT = {};

        query.GENETYLLIS_PATIENT.PATIENT_ID = $scope.patientIdFromStorage
        query.GENETYLLIS_VARIANT = $scope.GENETYLLIS_VARIANT;
        query.GENETYLLIS_GENE = $scope.GENETYLLIS_GENE
        query.GENETYLLIS_PATHOLOGY = $scope.GENETYLLIS_PATHOLOGY
        query.GENETYLLIS_SIGNIFICANCE = $scope.GENETYLLIS_SIGNIFICANCE
        query.GENETYLLIS_ALLELEFREQUENCY = $scope.GENETYLLIS_ALLELEFREQUENCY

        query.perPage = $scope.selectedPerPage;
        query.currentPage = (($scope.currentPage - 1) * $scope.selectedPerPage);
        let patientObject = {};
        let patientClinicalHistoryObj = {}
        let patientfamilylHistoryObj = {}

        $http.post(variantDetailsApi + "/filterPatientDetails", JSON.stringify(query))
            .then(function (response) {
                console.log(response.data.data, "res")
                $scope.patientsDetailsTable = [];
                $scope.patientClinicalHistory = []
                $scope.patientFamilylHistory = []

                // patient clinical history 
                response.data.data[0]?.variantRecords.forEach(variantRecord => {
                    console.log(variantRecord?.VARIANTRECORD_HIGHLIGHT, "variantRecord")
                })
                let patientClinicalHistoryDetails = response.data.data[0]?.variantRecords[0]?.patients
                if (patientClinicalHistoryDetails) {
                    patientClinicalHistoryDetails = response.data.data[0]?.variantRecords[0]?.patients[0]?.clinicalHistory;

                    patientClinicalHistoryDetails.forEach((el, i) => {
                        patientClinicalHistoryObj = {}
                        patientClinicalHistoryObj['Age of onset'] = el.GENETYLLIS_CLINICALHISTORY_AGEONSET
                        patientClinicalHistoryObj.Pathology = el.pathology[0]?.PATHOLOGY_NAME
                        patientClinicalHistoryObj.Notes = el.GENETYLLIS_CLINICALHISTORY_NOTES
                        $scope.patientClinicalHistory.push(patientClinicalHistoryObj);
                    })
                }
                // patient family history 
                let patientFamilyHistoryDetails = response.data.data[0]?.variantRecords[0]?.patients
                if (patientFamilyHistoryDetails !== undefined && patientFamilyHistoryDetails.length > 0) {
                    patientFamilyHistoryDetails = response.data.data[0].variantRecords[0]?.patients[0]?.familyHistory;

                    patientFamilyHistoryDetails.forEach((el, i) => {
                        patientfamilylHistoryObj = {}
                        patientfamilylHistoryObj.PID = el.FAMILYHISTORY_FAMILYMEMBERID
                        patientfamilylHistoryObj.Relation = el.FAMILYHISTORY_RELATIONID
                        patientfamilylHistoryObj["Age of onset"] = el.clinicalHistory[0].GENETYLLIS_CLINICALHISTORY_AGEONSET
                        patientfamilylHistoryObj.Pathology = el.clinicalHistory[0].pathology[0]?.PATHOLOGY_NAME
                        patientfamilylHistoryObj.Notes = el.clinicalHistory[0].GENETYLLIS_CLINICALHISTORY_NOTES
                        $scope.patientFamilylHistory.push(patientfamilylHistoryObj);

                    })

                }

                response.data.data.forEach((patientResult, i) => {
                    patientObject = {};
                    patientObject.VariantId = patientResult.VARIANT_ID
                    patientObject.HGVS = patientResult.VARIANT_HGVS;
                    if (patientResult.genes[0]) {
                        patientObject.GeneId = patientResult.genes[0]?.GENE_NAME != "NULL" ? patientResult.genes[0]?.GENE_NAME : "-";
                        patientObject.GeneLink = "";
                        if (patientResult.genes[0]?.GENE_NAME != "NULL") {
                            $http.get("https://clinicaltables.nlm.nih.gov/api/ncbi_genes/v3/search?terms=" + patientObject.GeneId)
                                .then(function (responseSite) {
                                    responseSite.data[3].forEach(gene => {
                                        if (gene.includes(patientResult.genes[0]?.GENE_NAME)) {
                                            patientObject.GeneLink = "https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/" + gene[1]
                                        }
                                    })
                                });
                        }
                    }
                    patientObject.Consequence = patientResult.VARIANT_CONSEQUENCE;
                    patientObject.Homozygous = patientResult.variantRecords[0]?.VARIANTRECORD_HOMOZYGOUS ? "Yes" : "No";
                    patientObject.Pathology = patientResult.clinicalSignificance[0]?.pathology[0]?.PATHOLOGY_NAME;

                    patientObject["Clinical significance"] = patientResult.clinicalSignificance[0]?.CLINICALSIGNIFICANCE_ID;
                    patientObject["Allele frequency"] = patientResult.alleleFrequency[0]?.ALLELEFREQUENCY_FREQUENCY;
                    if (patientResult.clinicalHistory) {
                        patientObject["Clinical history"] = patientResult.clinicalHistory[0]?.pathology[0]?.PATHOLOGY_NAME;
                    }
                    if (patientResult.analysis) {
                        // patientObject.HGVS = i;
                        patientObject.Dates = patientResult.analysis[0]?.ANALYSIS_DATE.split('T')[0];
                    }
                    patientObject.Ethnicity = patientResult?.GENETYLLIS_PATIENT_POPULATIONID;
                    if (patientResult.familyHistory && patientResult.familyHistory.clinicalHistory) {
                        patientObject["Family history"] = patientResult.familyHistory[0]?.clinicalHistory[0]?.pathology[0]?.PATHOLOGY_NAME;
                    }
                    let patientsInfo = patientResult.variantRecords[0]?.patients[0];
                    patientObject.Patients = patientsInfo?.GENETYLLIS_PATIENT_LABID;
                    patientObject.Gender = patientsInfo?.PATIENT_GENDERID === 1 ? "male" : "female";
                    patientObject.Ethnicity = patientsInfo?.GENETYLLIS_PATIENT_POPULATIONID === 12 ? "Bulgarian" : "Other ethnicity";
                    $scope.patientsDetailsTable.push(patientObject);
                })

                $scope.totalPages = response.data.totalPages;
                $scope.totalItems = response.data.totalItems;


            });
        // $sessionStorage.$reset();

    }
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


    function getDate(t) {
        let year,
            month,
            day,
            hour,
            minute,
            second;

        second = Math.floor(t / 1000);
        minute = Math.floor(second / 60);
        second = second % 60;
        hour = Math.floor(minute / 60);
        minute = minute % 60;
        day = Math.floor(hour / 24);
        hour = hour % 24;
        month = Math.floor(day / 30);
        day = day % 30;
        year = Math.floor(month / 12);
        month = month % 12;

        return { year, month, day, hour, minute, second };
    }

    $scope.checkColumn = function (e) {
        return e == 'Id'
    }
    $scope.notLink = function (e) {
        return e != 'Id'
    }
    $scope.isGene = function (e) {
        return e != '-'
    }

    $scope.redirectVariant = function (data) {

        $sessionStorage.$default({
            HGVS: data
        });
    }

    $scope.imageHandler = function (data) {
        console.log(data)
        data = {}
        data.VARIANTRECORD_VARIANTID = +data.VariantId
        data.VARIANTRECORD_PATIENTID = $scope.fromData.PATIENT_ID

        $http.post(variantRecordOptionsApi + "/getByVariantId", data)
            .then(function (responseNotification) {
                console.log(responseNotification, 'responseNotification')
            });
        // $scope.filter()
    }


    $scope.filter();

}]);
