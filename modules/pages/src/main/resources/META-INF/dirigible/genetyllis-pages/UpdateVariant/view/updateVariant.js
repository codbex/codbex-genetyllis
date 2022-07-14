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

var request = require("http/v4/request");
var query = require("db/v4/query");
var httpClient = require("http/v4/client");
var response = require("http/v4/response");
var daoVariantRecord = require("genetyllis-app/gen/dao/records/VariantRecord");
var daoVariant = require("genetyllis-app/gen/dao/variants/Variant");
var daoGene = require("genetyllis-app/gen/dao/genes/Gene");
var daoFilter = require("genetyllis-app/gen/dao/records/Filter");
var daoClinicalSignificance = require("genetyllis-app/gen/dao/variants/ClinicalSignificance");
var daoPathology = require("genetyllis-app/gen/dao/nomenclature/Pathology");
var daoAlleleFreqeuncy = require("genetyllis-app/gen/dao/variants/AlleleFrequency.js");
var rs = require('http/v4/rs');

if (request.getMethod() === "POST") {
    const body = request.getJSON();
    let variantId = body.variantId;

    updateVariant(variantId);
} else if (request.getMethod() === "GET") {
    console.warn("Use POST request.");
}

function updateVariant(variantId) {
    console.log(variantId);
    if (!variantId) {
        console.log("VariantId has to be set as a parameter in the URL");
        return;
    }
    patientId = null;

    //VARIANT
    let entityVariant = {};
    var statement = "SELECT * FROM GENETYLLIS_VARIANT WHERE VARIANT_ID= ?";
    var resultset = query.execute(statement, [variantId], "local", "DefaultDB");

    entityVariant.Id = resultset[0].VARIANT_ID;
    entityVariant.HGVS = resultset[0].VARIANT_HGVS;
    entityVariant.GeneId = resultset[0].VARIANT_GENEID;
    console.log(entityVariant.HGVS);

    var httpResponse = httpClient.get("https://myvariant.info/v1/variant/" + entityVariant.HGVS);
    const myVariantJSON = JSON.parse(httpResponse.text);

    if (!myVariantJSON.error) {
        if (myVariantJSON.cadd !== undefined && myVariantJSON.cadd.consequence !== undefined)
            entityVariant.Consequence = JSON.stringify(myVariantJSON.cadd.consequence);
        else
            entityVariant.Consequence = "";

        if (myVariantJSON.cadd !== undefined && myVariantJSON.cadd.consdetail !== undefined)
            entityVariant.ConsequenceDetails = JSON.stringify(myVariantJSON.cadd.consdetail);
        else
            entityVariant.ConsequenceDetails = "";

        if (myVariantJSON.cadd !== undefined && myVariantJSON.cadd.exon !== undefined) {
            entityVariant.Region = "exon";
            entityVariant.RegionNum = JSON.stringify(myVariantJSON.cadd.exon);
        }
        else if (myVariantJSON.cadd !== undefined && myVariantJSON.cadd.intron !== undefined) {
            entityVariant.Region = "intron";
            entityVariant.RegionNum = JSON.stringify(myVariantJSON.cadd.intron);
        }
        else {
            entityVariant.Region = "";
            entityVariant.RegionNum = "";
        }

        //GENE
        if (myVariantJSON.dbsnp.gene !== undefined && entityVariant.GeneId != null) {
            var statement = "SELECT VARIANT_GENEID FROM GENETYLLIS_VARIANT WHERE VARIANT_ID = ?";
            var resultset = query.execute(statement, [variantId], "local", "DefaultDB");

            let entityGene = {};
            entityGene.GeneId = myVariantJSON.dbsnp.gene.geneid;
            //TODO change later to include full string
            entityGene.Name = JSON.stringify(myVariantJSON.dbsnp.gene.name).substring(0, 19);
            entityGene.Pseudo = myVariantJSON.dbsnp.gene.is_pseudo;

            entityVariant.GeneId = daoGene.update(entityGene);
            daoVariant.update(entityVariant);
        }
        else if (myVariantJSON.dbsnp.gene !== undefined) {
            let entityGene = {};
            entityGene.GeneId = myVariantJSON.dbsnp.gene.geneid;
            //TODO change later to include full string
            entityGene.Name = JSON.stringify(myVariantJSON.dbsnp.gene.name).substring(0, 19);
            entityGene.Pseudo = myVariantJSON.dbsnp.gene.is_pseudo;

            entityVariant.GeneId = daoGene.create(entityGene);
            daoVariant.update(entityVariant)
        }
        else {
            entityVariant.GeneId = null;
            daoVariant.update(entityVariant);
        }

        //CLINICAL SIGNIFICANCE
        if (myVariantJSON.clinvar !== undefined && myVariantJSON.clinvar.rcv !== undefined) {
            console.log("CLINSIG");

            let entityClinicalSignificance = {};
            var statement = "SELECT * FROM GENETYLLIS_CLINICALSIGNIFICANCE WHERE CLINICALSIGNIFICANCE_VARIANTID = ?";
            var resultset = query.execute(statement, [variantId], "local", "DefaultDB");

            entityClinicalSignificance.Id = resultset[0].CLINICALSIGNIFICANCE_VARIANTID;

            var rcvArray = myVariantJSON.clinvar.rcv;
            if (rcvArray.length !== undefined) {
                rcvArray.forEach(rcv => {
                    var statement = "SELECT PATHOLOGY_ID FROM GENETYLLIS_PATHOLOGY WHERE PATHOLOGY_CUI = ?";
                    var resultset = query.execute(statement, [rcv.conditions.identifiers.medgen], "local", "DefaultDB");

                    while (resultset.next()) {
                        entityClinicalSignificance.VariantId = variantId;
                        entityClinicalSignificance.PathologyId = resultSet.getInt("PATHOLOGY_ID");
                        switch (myVariantJSON.clinvar.rcv.clinical_significance) {
                            case "Pathogenic":
                                entityClinicalSignificance.Significance = 1;
                                break;
                            case "Likely pathogenic":
                                entityClinicalSignificance.Significance = 2;
                                break;
                            case "Uncertain":
                                entityClinicalSignificance.Significance = 3;
                                break;
                            case "Likely bening":
                                entityClinicalSignificance.Significance = 4;
                                break;
                            case "Bening":
                                entityClinicalSignificance.Significance = 5;
                                break;
                            default:
                                entityClinicalSignificance.Significance = null;
                        }

                        entityClinicalSignificance.Evaluated = myVariantJSON.clinvar.rcv.last_evaluated;
                        entityClinicalSignificance.ReviewStatus = myVariantJSON.clinvar.rcv.review_status;
                        entityClinicalSignificance.Update = Date.now;

                        daoClinicalSignificane.update(entityClinicalSignificance);
                    }
                });
            }
            else {
                var statement = "SELECT PATHOLOGY_ID FROM GENETYLLIS_PATHOLOGY WHERE PATHOLOGY_CUI = ?";
                var resultset = query.execute(statement, [myVariantJSON.clinvar.rcv.conditions.identifiers.medgen], "local", "DefaultDB");

                while (resultset.next()) {
                    let entityClinicalSignificance = {};
                    entityClinicalSignificance.VariantId = variantId;
                    entityClinicalSignificance.PathologyId = resultSet.getInt("PATHOLOGY_ID");
                    switch (myVariantJSON.clinvar.rcv.clinical_significance) {
                        case "Pathogenic":
                            entityClinicalSignificance.Significance = 1;
                            break;
                        case "Likely pathogenic":
                            entityClinicalSignificance.Significance = 2;
                            break;
                        case "Uncertain":
                            entityClinicalSignificance.Significance = 3;
                            break;
                        case "Likely bening":
                            entityClinicalSignificance.Significance = 4;
                            break;
                        case "Bening":
                            entityClinicalSignificance.Significance = 5;
                            break;
                        default:
                            entityClinicalSignificance.Significance = null;
                    }

                    entityClinicalSignificance.Evaluated = myVariantJSON.clinvar.rcv.last_evaluated;
                    entityClinicalSignificance.ReviewStatus = myVariantJSON.clinvar.rcv.review_status;
                    entityClinicalSignificance.Update = Date.now;

                    daoClinicalSignificane.update(entityClinicalSignificance);
                }
            }
        }

        //ALLELE FREQUENCY
        console.log("ALLELE FREQ");
        let entityAlleleFrequency = {};

        var statement = "SELECT * FROM GENETYLLIS_ALLELEFREQEUNCEY WHERE ALLELEFREQUENCY_VARIANTID = ?";
        var resultset = query.execute(statement, [variantId], "local", "DefaultDB");
        entityAlleleFrequency.Id = resultset[0].ALLELEFREQUENCY_VARIANTID;

        entityAlleleFrequency.VariantId = variantId;

        //TODO what happens if we have a variant which applies to both genders
        var statement = "SELECT DISTINCT PATIENT_GENDERID FROM GENETYLLIS_PATIENT INNER JOIN GENETYLLIS_VARIANTRECORD ON VARIANTRECORD_VARIANTID = ?";
        var resultset = query.execute(statement, [variantId], "local", "DefaultDB");

        entityAlleleFrequency.GenderId = resultSet[0].PATIENT_GENDERID;

        entityAlleleFrequency.Update = Date.now;

        if (myVariantJSON.gnomad_genome.af.af !== undefined) {
            entityAlleleFrequency.PopulationId = 12;
            entityAlleleFrequency.Frequency = myVariantJSON.gnomad_genome.af.af;
            daoAlleleFreqeuncy.create(entityAlleleFrequency);
        }

        if (myVariantJSON.gnomad_genome.af.af_nfe_bgr !== undefined) {
            entityAlleleFrequency.PopulationId = 12;
            entityAlleleFrequency.Frequency = myVariantJSON.gnomad_genome.af.af_nfe_bg;
            daoAlleleFreqeuncy.update(entityAlleleFrequency);
        }

    }

    response.flush();
    response.close();
}