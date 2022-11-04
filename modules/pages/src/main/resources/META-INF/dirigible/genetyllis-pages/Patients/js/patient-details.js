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
patientDetails.controller('patientDetailsController', ['$scope', '$http', '$sessionStorage', function ($scope, $http, $sessionStorage) {
    const variantDetailsApi = '/services/v4/js/genetyllis-pages/services/api/variants/Variant.js';
    const patientsOptionsApi = '/services/v4/js/genetyllis-pages/services/api/patients/Patient.js';
    const variantRecordOptionsApi = '/services/v4/js/genetyllis-pages/services/api/records/VariantRecord.js';
    var pathologyApi = '/services/v4/js/genetyllis-pages/services/api/nomenclature/Pathology.js';

    let query = {}

    $scope.clickedUrl = "../images/flagged.svg";
    $scope.notClickedUrl = "../images/notFlagged.svg";

    $scope.fromData;
    $scope.patientIdFromStorage = $sessionStorage.patient

    $scope.editPatients = function () {
        $sessionStorage.$default({
            patientId: $scope.patientIdFromStorage
        });
    }
    $scope.showingItems;
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
    $scope.clinicalHistoryThead = ["Pathology", "Age of onset", "Notes"];
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

    $scope.GENETYLLIS_VARIANTRECORD = {
        VARIANTRECORD_VARIANTID: '',
        VARIANTRECORD_HIGHLIGHT: Boolean,
        VARIANTRECORD_HOMOZYGOUS: Boolean
    }

    $scope.highlight = function () {
        $scope.GENETYLLIS_VARIANTRECORD = {
            VARIANTRECORD_VARIANTID: '',
            VARIANTRECORD_HIGHLIGHT: Boolean,
        }
    }

    $scope.isHomozygousChecked = false
    $scope.isHeterozygousChecked = false


    // clinical significance
    $scope.clinicalSignificance = [
        { name: "Pathogenic variant", id: 1 },
        { name: "Likely pathogenic variant", id: 2 },
        { name: "Variant of uncerain significance", id: 3 },
        { name: "Likely benign variant", id: 4 },
        { name: "Benign variant", id: 5 },
    ];
    // $scope.clinicalSignificance = ['Benign', 'Likely benign', 'Pathogenic', 'Likely pathogenic', 'VUS'];
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

    // suggest pathology
    function suggestPathology(pathologyId) {
        if (validateSuggestion(pathologyId)) {
            $http.get(pathologyApi + "/filterPathology/" + pathologyId)
                .then(data => {
                    $scope.pathologyDatas = data.data
                })
        }
    }

    $scope.suggestVariantPathology = function (pathologyId) {
        suggestPathology(pathologyId);
    }


    function validateSuggestion(suggestion) {
        return suggestion.length > 3;
    }

    $scope.addVariantPathologyFilter = function (selectedPathology) {
        if (!$scope.pathologyDatas) return
        if ($scope.pathologyDatas.length > 0) {
            let pathology = $scope.pathologyDatas.find(el => el.PATHOLOGY_CUI == selectedPathology);
            $scope.clinicalHistoryData.PathologyName = pathology?.PATHOLOGY_NAME;
            $scope.clinicalHistoryData.PathologyId = pathology?.PATHOLOGY_ID;
        }
    }


    // add Pathology
    $scope.addPathologyFilter = function (cui) {
        if (!cui || $scope.GENETYLLIS_PATHOLOGY.PATHOLOGY_CUI.includes(cui)) return

        $scope.GENETYLLIS_PATHOLOGY.PATHOLOGY_CUI.push(cui)
        $scope.selectedPathologyCui = '';
        $scope.clinicalHistoryData.PathologyCui = ""
    }
    // remove pathologyCui
    $scope.removePathologyCui = function (index) {
        let removedItem = $scope.GENETYLLIS_PATHOLOGY.PATHOLOGY_CUI.splice(index, 1);
        $scope.selectConsequences.push(removedItem)
    }

    // clinical significance


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
        filter(query)
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

    $scope.addFilter = function () {
        if (($scope.isHomozygousChecked && $scope.isHeterozygousChecked) || (!$scope.isHomozygousChecked && !$scope.isHeterozygousChecked)) {
            $scope.GENETYLLIS_VARIANTRECORD.VARIANTRECORD_HOMOZYGOUS = Boolean
        } else if ($scope.homozygousCheck) {
            $scope.GENETYLLIS_VARIANTRECORD.VARIANTRECORD_HOMOZYGOUS = true
        } else {
            $scope.GENETYLLIS_VARIANTRECORD.VARIANTRECORD_HOMOZYGOUS = false
        }

        // query.GENETYLLIS_VARIANTRECORD = $scope.GENETYLLIS_VARIANTRECORD.VARIANTRECORD_HOMOZYGOUS
        query.GENETYLLIS_VARIANT = angular.copy($scope.GENETYLLIS_VARIANT)
        query.GENETYLLIS_GENE = angular.copy($scope.GENETYLLIS_GENE)
        query.GENETYLLIS_PATHOLOGY = angular.copy($scope.GENETYLLIS_PATHOLOGY)
        query.GENETYLLIS_SIGNIFICANCE = angular.copy($scope.GENETYLLIS_SIGNIFICANCE)
        query.GENETYLLIS_ALLELEFREQUENCY = angular.copy($scope.GENETYLLIS_ALLELEFREQUENCY)
        query.GENETYLLIS_VARIANTRECORD = angular.copy($scope.GENETYLLIS_VARIANTRECORD)
        filter(query)
    }

    function filter(query) {
        // var query = {};
        $scope.gender = ''
        //Gender Id

        query.GENETYLLIS_PATIENT = {};

        query.GENETYLLIS_PATIENT.PATIENT_ID = $scope.patientIdFromStorage
        query.perPage = $scope.selectedPerPage;
        query.currentPage = (($scope.currentPage - 1) * $scope.selectedPerPage);
        let patientObject = {};
        let patientClinicalHistoryObj = {}
        let patientfamilylHistoryObj = {}

        $http.post(variantDetailsApi + "/filterPatientDetails", JSON.stringify(query))
            .then(function (response) {
                $scope.patientsDetailsTable = [];
                $scope.patientClinicalHistory = []
                $scope.patientFamilylHistory = []

                // patient clinical history 

                let patientClinicalHistoryDetails = response.data.data[0]?.variantRecords[0]?.patients
                if (patientClinicalHistoryDetails) {
                    patientClinicalHistoryDetails = response.data.data[0]?.variantRecords[0]?.patients[0]?.clinicalHistory;

                    patientClinicalHistoryDetails.forEach((el, i) => {
                        patientClinicalHistoryObj = {}
                        patientClinicalHistoryObj['Age of onset'] = el.CLINICALHISTORY_AGEONSET
                        patientClinicalHistoryObj.Pathology = el.pathology[0]?.PATHOLOGY_NAME
                        patientClinicalHistoryObj.Notes = el.CLINICALHISTORY_NOTES
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
                        patientfamilylHistoryObj["Age of onset"] = el.clinicalHistory[0].CLINICALHISTORY_AGEONSET
                        patientfamilylHistoryObj.Pathology = el.clinicalHistory[0].pathology[0]?.PATHOLOGY_NAME
                        patientfamilylHistoryObj.Notes = el.clinicalHistory[0].CLINICALHISTORY_NOTES
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
                    //TODO add .name after making sure that info in db all has significance id
                    // patientObject["Clinical significance"] = $scope.clinicalSignificance[patientResult.clinicalSignificance[0]?.CLINICALSIGNIFICANCE_SIGNIFICANCEID - 1].name;
                    // patientObject["Clinical significance"] = $scope.clinicalSignificance?.CLINICALSIGNIFICANCE_SIGNIFICANCEID === 1 ? "Pathogenic variant" : data.clinicalSignificance[0].CLINICALSIGNIFICANCE_SIGNIFICANCEID === 2 ? "Likely pathogenic variant" : data.clinicalSignificance[0].CLINICALSIGNIFICANCE_SIGNIFICANCEID === 3 ? "Variant of uncerain significance (VUS)" : data.clinicalSignificance[0].CLINICALSIGNIFICANCE_SIGNIFICANCEID === 4 ? "Likely benign variant" : data.clinicalSignificance[0].CLINICALSIGNIFICANCE_SIGNIFICANCEID === 5 ? "Benign variant" : "";
                    let clinicalSignificanceResultArr = []
                    patientResult.clinicalSignificance.forEach(el => {
                        let clinicalSignificanceResult = el.CLINICALSIGNIFICANCE_SIGNIFICANCEID === 1 ? "Pathogenic variant" : el.CLINICALSIGNIFICANCE_SIGNIFICANCEID === 2 ? "Likely pathogenic variant" : el.CLINICALSIGNIFICANCE_SIGNIFICANCEID === 3 ? "Variant of uncerain significance (VUS)" : el.CLINICALSIGNIFICANCE_SIGNIFICANCEID === 4 ? "Likely benign variant" : el.CLINICALSIGNIFICANCE_SIGNIFICANCEID === 5 ? "Benign variant" : "";

                        clinicalSignificanceResultArr.push(clinicalSignificanceResult)
                    })
                    patientObject["Clinical significance"] = [...new Set(clinicalSignificanceResultArr)].join(', ')
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
                    patientResult.variantRecords.forEach(variantRecord => {
                        if (variantRecord.VARIANTRECORD_PATIENTID === $scope.patientIdFromStorage) {
                            patientObject[''] = variantRecord.VARIANTRECORD_HIGHLIGHT
                        }
                    })
                    $scope.patientsDetailsTable.push(patientObject);
                })
                $scope.showingItems = response.data.data.length;
                $scope.totalPages = response.data.totalPages;
                $scope.totalItems = response.data.totalItems;


            });
        // $sessionStorage.$reset();

    }
    $scope.clearAllFilters = function () {
        angular.forEach($scope.clinicalSignificance, function (item) {
            item.Selected = false;
        });
        $scope.homozygousCheck = false;
        $scope.heterozygous = false;
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

        $scope.GENETYLLIS_VARIANTRECORD = {
            VARIANTRECORD_VARIANTID: '',
            VARIANTRECORD_HIGHLIGHT: Boolean,
            VARIANTRECORD_HOMOZYGOUS: Boolean
        }
        query = {}
        filter(query)
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

        requestData = {}

        requestData.VARIANTRECORD_VARIANTID = data.VariantId
        requestData.VARIANTRECORD_PATIENTID = $scope.fromData.PATIENT_ID

        $scope.patientsDetailsTable.find(el => {
            if (el.VariantId == data.VariantId) {

                return el[''] = !el['']
            }
        });
        $http.post(variantRecordOptionsApi + "/getByVariantId", requestData)
            .then(function (responseNotification) {
            });
    }


    filter(query);

}]);
