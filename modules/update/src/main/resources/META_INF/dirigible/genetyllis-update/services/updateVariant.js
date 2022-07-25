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

var query = require("db/v4/query");
var httpClient = require("http/v4/client");
var daoVariantRecord = require("genetyllis-app/gen/dao/records/VariantRecord");
var daoVariant = require("genetyllis-app/gen/dao/variants/Variant");
var daoGene = require("genetyllis-app/gen/dao/genes/Gene");
var daoFilter = require("genetyllis-app/gen/dao/records/Filter");
var daoClinicalSignificance = require("genetyllis-app/gen/dao/variants/ClinicalSignificance");
var daoPathology = require("genetyllis-app/gen/dao/nomenclature/Pathology");
var daoAlleleFreqeuncy = require("genetyllis-app/gen/dao/variants/AlleleFrequency.js");
var daoNotification = require("genetyllis-app/gen/dao/users/Notification.js");

exports.updateTrigger = function (variantId) {
    updateVariant(variantId);
}

//TODO make array with extracted info for every table and compare it to myvariantinfo array corresponding to id
// if theres a difference then change a boolean to let know that the variant must be updated in Notification
function updateVariant(variantId) {
    console.log(variantId);
    if (!variantId) {
        console.log("VariantId has to be set as a parameter in the URL");
        return;
    }
    patientId = 1;

    //VARIANT
    let entityVariant = {};
    var statement = "SELECT * FROM GENETYLLIS_VARIANT WHERE VARIANT_ID= ?";
    var resultset = query.execute(statement, [variantId], "local", "DefaultDB");
    console.log(JSON.stringify(resultset));
    // console.log(JSON.stringify(resultset[0]));
    let dbEntityVariant = {
        Id: resultset[0].VARIANT_ID, HGVS: resultset[0].VARIANT_HGVS, GeneId: resultset[0].VARIANT_GENEID,
        Consequence: resultset[0].VARIANT_CONSEQUENCE, ConsequenceDetails: resultset[0].VARIANT_CONSEQUENCEDETAILS,
        Region: resultset[0].GENETYLLIS_VARIANT_REGION, RegionNum: resultset[0].GENETYLLIS_VARIANT_REGIONNUM
    };

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

        if (JSON.stringify(dbEntityVariant) === JSON.stringify(entityVariant)) {
            console.log("The same")
            console.log(daoVariant.update(entityVariant));
        } else {
            //TODO change flag
            console.log("not the same")
            console.log(JSON.stringify(dbdbEntityVariantTest));
            console.log(JSON.stringify(entityVariant));
            daoVariant.update(entityVariant);
        }

        //GENE
        if (myVariantJSON.dbsnp !== undefined && myVariantJSON.dbsnp.gene !== undefined) {
            console.log("GENE");
            var statement = "SELECT VARIANT_GENEID FROM GENETYLLIS_VARIANT WHERE VARIANT_ID = ?";
            var resultsetGeneId = query.execute(statement, [entityVariant.Id], "local", "DefaultDB");

            var statement = "SELECT * FROM GENETYLLIS_GENE WHERE GENE_ID = ?";
            var resultset = query.execute(statement, [resultsetGeneId[0].VARIANT_GENEID], "local", "DefaultDB");

            console.log(JSON.stringify(resultset[0]));

            if (resultset[0] !== undefined) {
                let dbEntityGene = { Id: resultset[0].GENE_ID, GeneId: resultset[0].GENE_GENEID, Name: resultset[0].GENE_NAME, Pseudo: resultset[0].GENE_PSEUDO };
                let entityGene = {};
                entityGene.Id = resultset[0].GENE_ID;

                geneArray = myVariantJSON.dbsnp.gene;
                if (geneArray.length !== undefined) {
                    geneArray.forEach(gene => {

                        entityGene.GeneId = gene.geneid;
                        //TODO change later to include full string
                        entityGene.Name = JSON.stringify(gene.name).substring(0, 19);
                        entityGene.Pseudo = gene.is_pseudo;

                        if (JSON.stringify(dbEntityGene) === JSON.stringify(entityGene)) {
                            console.log("The same")
                        } else {
                            console.log("not the same")
                            console.log(JSON.stringify(dbEntityGene));
                            console.log(JSON.stringify(entityGene));
                            daoGene.update(entityGene);
                        }
                    });
                } else {
                    entityGene.GeneId = myVariantJSON.dbsnp.gene.geneid;
                    //TODO change later to include full string
                    entityGene.Name = JSON.stringify(myVariantJSON.dbsnp.gene.name).substring(0, 19);
                    entityGene.Pseudo = myVariantJSON.dbsnp.gene.is_pseudo;

                    if (JSON.stringify(dbEntityGene) === JSON.stringify(entityGene)) {
                        console.log("The same")
                    } else {
                        console.log("not the same")
                        console.log(JSON.stringify(dbEntityGene));
                        console.log(JSON.stringify(entityGene));
                        daoGene.update(entityGene);
                    }
                }
            } else {
                console.log("GENE create");

                geneArray = myVariantJSON.dbsnp.gene;

                if (geneArray.length !== undefined) {
                    geneArray.forEach(gene => {
                        let entityGene = {};
                        entityGene.GeneId = gene.geneid;
                        //TODO change later to include full string
                        entityGene.Name = JSON.stringify(gene.name).substring(0, 19);
                        entityGene.Pseudo = gene.is_pseudo;

                        entityVariant.GeneId = daoGene.create(entityGene);
                        console.log("gene id" + entityVariant.GeneId);

                        console.log(JSON.stringify(entityGene));
                        //TODO update flag in variant
                        daoVariant.update(entityVariant)
                    });
                } else {
                    let entityGene = {};
                    entityGene.GeneId = myVariantJSON.dbsnp.gene.geneid;
                    //TODO change later to include full string
                    entityGene.Name = JSON.stringify(myVariantJSON.dbsnp.gene.name).substring(0, 19);
                    entityGene.Pseudo = myVariantJSON.dbsnp.gene.is_pseudo;

                    entityVariant.GeneId = daoGene.create(entityGene);
                    console.log("gene id" + entityVariant.GeneId);

                    console.log(JSON.stringify(entityGene));
                    //TODO update flag in variant
                    daoVariant.update(entityVariant)
                }
            }
        }

        //CLINICAL SIGNIFICANCE
        if (myVariantJSON.clinvar !== undefined && myVariantJSON.clinvar.rcv !== undefined) {
            console.log("CLINSIG");

            // let entityClinicalSignificance = {};
            var statement = "SELECT * FROM GENETYLLIS_CLINICALSIGNIFICANCE WHERE CLINICALSIGNIFICANCE_VARIANTID = ?";
            var resultset = query.execute(statement, [entityVariant.Id], "local", "DefaultDB");
            console.log(JSON.stringify(resultset[0]));
            let dbEntityClinicalSignificance = { Id: resultset[0].CLINICALSIGNIFICANCE_ID, VariantId: resultset[0].CLINICALSIGNIFICANCE_VARIANTID, PathologyId: resultset[0].CLINICALSIGNIFICANCE_PATHOLOGYID, Evaluated: resultset[0].CLINICALSIGNIFICANCE_EVALUATED, ReviewStatus: resultset[0].CLINICALSIGNIFICANCE_REVIEWSTATUS };
            let entityClinicalSignificance = {};


            //TODO Evaluated wont be the same because of date formats., ex. 2018-06-22T00:00:00+0300 and 2018-06-22
            if (resultset[0] !== undefined) {
                entityClinicalSignificance.Id = resultset[0].CLINICALSIGNIFICANCE_VARIANTID;

                var rcvArray = myVariantJSON.clinvar.rcv;

                if (rcvArray.length !== undefined) {
                    rcvArray.forEach((rcv) => {
                        var conditionsArray = rcv.conditions;
                        if (conditionsArray.length !== undefined) {
                            conditionsArray.forEach((conditions) => {
                                if (conditions.identifiers !== undefined) {
                                    console.log("multiple conditions with identifiers");
                                    var statement =
                                        "SELECT PATHOLOGY_ID FROM GENETYLLIS_PATHOLOGY WHERE PATHOLOGY_CUI = ?";
                                    var resultset = query.execute(
                                        statement,
                                        [conditions.identifiers.medgen],
                                        "local",
                                        "DefaultDB"
                                    );

                                    resultset.forEach((clinsig) => {
                                        entityClinicalSignificance.VariantId = entityVariant.Id;
                                        entityClinicalSignificance.PathologyId = clinsig.PATHOLOGY_ID;
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

                                        entityClinicalSignificance.Evaluated =
                                            myVariantJSON.clinvar.rcv.last_evaluated;
                                        entityClinicalSignificance.ReviewStatus =
                                            myVariantJSON.clinvar.rcv.review_status;
                                        entityClinicalSignificance.Update = Date.now;

                                        console.log(entityClinicalSignificance);


                                        if (JSON.stringify(dbEntityClinicalSignificance) === JSON.stringify(entityClinicalSignificance)) {
                                            console.log("The same")
                                        } else {
                                            console.log("not the same1")
                                            // console.log(JSON.stringify(entityClinicalSignificance));
                                            // console.log(JSON.stringify(entityGene));
                                            daoClinicalSignificance.update(entityClinicalSignificance);
                                        }
                                        // daoClinicalSignificance.update(entityClinicalSignificance);
                                    });

                                } else {
                                    // console.log("multiple conditions without identifiers");

                                    entityClinicalSignificance.VariantId = entityVariant.Id;
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

                                    entityClinicalSignificance.Evaluated =
                                        myVariantJSON.clinvar.rcv.last_evaluated;
                                    entityClinicalSignificance.ReviewStatus =
                                        myVariantJSON.clinvar.rcv.review_status;
                                    entityClinicalSignificance.Update = Date.now;

                                    console.log(entityClinicalSignificance);

                                    if (JSON.stringify(dbEntityClinicalSignificance) === JSON.stringify(entityClinicalSignificance)) {
                                        console.log("The same")
                                    } else {
                                        console.log("not the same2")
                                        // console.log(JSON.stringify(entityClinicalSignificance));
                                        // console.log(JSON.stringify(entityGene));
                                        daoClinicalSignificance.update(entityClinicalSignificance);
                                    }
                                }
                            });
                        } else {
                            if (rcv.conditions.identifiers !== undefined) {
                                var statement =
                                    "SELECT PATHOLOGY_ID FROM GENETYLLIS_PATHOLOGY WHERE PATHOLOGY_CUI = ?";
                                var resultset = query.execute(
                                    statement,
                                    [rcv.conditions.identifiers.medgen],
                                    "local",
                                    "DefaultDB"
                                );

                                resultset.forEach((clinsig) => {
                                    let entityClinicalSignificance = {};
                                    entityClinicalSignificance.VariantId = entityVariant.Id;
                                    entityClinicalSignificance.PathologyId = clinsig.PATHOLOGY_ID;
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

                                    entityClinicalSignificance.Evaluated =
                                        myVariantJSON.clinvar.rcv.last_evaluated;
                                    entityClinicalSignificance.ReviewStatus =
                                        myVariantJSON.clinvar.rcv.review_status;
                                    entityClinicalSignificance.Update = Date.now;

                                    console.log(entityClinicalSignificance);

                                    if (JSON.stringify(dbEntityClinicalSignificance) === JSON.stringify(entityClinicalSignificance)) {
                                        console.log("The same")
                                    } else {
                                        console.log("not the same3")
                                        // console.log(JSON.stringify(entityClinicalSignificance));
                                        // console.log(JSON.stringify(entityGene));
                                        daoClinicalSignificance.update(entityClinicalSignificance);
                                    }
                                });

                            } else {
                                let entityClinicalSignificance = {};

                                entityClinicalSignificance.VariantId = entityVariant.Id;
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

                                entityClinicalSignificance.Evaluated =
                                    myVariantJSON.clinvar.rcv.last_evaluated;
                                entityClinicalSignificance.ReviewStatus =
                                    myVariantJSON.clinvar.rcv.review_status;
                                entityClinicalSignificance.Update = Date.now;

                                console.log(entityClinicalSignificance);

                                if (JSON.stringify(dbEntityClinicalSignificance) === JSON.stringify(entityClinicalSignificance)) {
                                    console.log("The same")
                                } else {
                                    console.log("not the same4")
                                    // console.log(JSON.stringify(dbEntityGene));
                                    // console.log(JSON.stringify(entityGene));
                                    daoClinicalSignificance.update(entityClinicalSignificance);
                                }
                            }
                        }
                    });
                } else {
                    //if rcv is a single entity
                    var statement =
                        "SELECT PATHOLOGY_ID FROM GENETYLLIS_PATHOLOGY WHERE PATHOLOGY_CUI = ?";
                    var resultset = query.execute(
                        statement,
                        [myVariantJSON.clinvar.rcv.conditions.identifiers.medgen],
                        "local",
                        "DefaultDB"
                    );

                    resultset.forEach((clinsig) => {
                        entityClinicalSignificance.VariantId = entityVariant.Id;
                        entityClinicalSignificance.PathologyId = clinsig.PATHOLOGY_ID;
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

                        entityClinicalSignificance.Evaluated =
                            myVariantJSON.clinvar.rcv.last_evaluated;
                        entityClinicalSignificance.ReviewStatus =
                            myVariantJSON.clinvar.rcv.review_status;
                        entityClinicalSignificance.Update = Date.now;

                        console.log(entityClinicalSignificance);

                        if (JSON.stringify(dbEntityClinicalSignificance) === JSON.stringify(entityClinicalSignificance)) {
                            console.log("The same")
                        } else {
                            console.log("not the same5")
                            console.log(JSON.stringify(dbEntityClinicalSignificance));
                            console.log(JSON.stringify(entityClinicalSignificance));
                            daoClinicalSignificance.update(entityClinicalSignificance);
                        }
                    });
                }
            } else {
                console.log("CLINSIG create");

                var rcvArray = myVariantJSON.clinvar.rcv;

                if (rcvArray.length !== undefined) {
                    rcvArray.forEach((rcv) => {
                        // console.log("rcv array");
                        // console.log(JSON.stringify(rcv));

                        var conditionsArray = rcv.conditions;
                        if (conditionsArray.length !== undefined) {
                            conditionsArray.forEach((conditions) => {
                                if (conditions.identifiers !== undefined) {
                                    console.log("multiple conditions with identifiers");
                                    var statement =
                                        "SELECT PATHOLOGY_ID FROM GENETYLLIS_PATHOLOGY WHERE PATHOLOGY_CUI = ?";
                                    var resultset = query.execute(
                                        statement,
                                        [conditions.identifiers.medgen],
                                        "local",
                                        "DefaultDB"
                                    );

                                    resultset.forEach((clinsig) => {
                                        let entityClinicalSignificance = {};
                                        entityClinicalSignificance.VariantId = entityVariant.Id;
                                        entityClinicalSignificance.PathologyId = clinsig.PATHOLOGY_ID;
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

                                        entityClinicalSignificance.Evaluated =
                                            myVariantJSON.clinvar.rcv.last_evaluated;
                                        entityClinicalSignificance.ReviewStatus =
                                            myVariantJSON.clinvar.rcv.review_status;
                                        entityClinicalSignificance.Update = Date.now;

                                        console.log(entityClinicalSignificance);

                                        //TODO change flag
                                        daoClinicalSignificance.create(entityClinicalSignificance);
                                    });

                                } else {
                                    console.log("multiple conditions without identifiers");

                                    let entityClinicalSignificance = {};

                                    entityClinicalSignificance.VariantId = entityVariant.Id;
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

                                    entityClinicalSignificance.Evaluated =
                                        myVariantJSON.clinvar.rcv.last_evaluated;
                                    entityClinicalSignificance.ReviewStatus =
                                        myVariantJSON.clinvar.rcv.review_status;
                                    entityClinicalSignificance.Update = Date.now;

                                    console.log(entityClinicalSignificance);

                                    //TODO change flag
                                    daoClinicalSignificance.create(entityClinicalSignificance);
                                }
                            });
                        } else {
                            if (rcv.conditions.identifiers !== undefined) {
                                var statement =
                                    "SELECT PATHOLOGY_ID FROM GENETYLLIS_PATHOLOGY WHERE PATHOLOGY_CUI = ?";
                                var resultset = query.execute(
                                    statement,
                                    [rcv.conditions.identifiers.medgen],
                                    "local",
                                    "DefaultDB"
                                );

                                resultset.forEach((clinsig) => {
                                    let entityClinicalSignificance = {};
                                    entityClinicalSignificance.VariantId = entityVariant.Id;
                                    entityClinicalSignificance.PathologyId = clinsig.PATHOLOGY_ID;
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

                                    entityClinicalSignificance.Evaluated =
                                        myVariantJSON.clinvar.rcv.last_evaluated;
                                    entityClinicalSignificance.ReviewStatus =
                                        myVariantJSON.clinvar.rcv.review_status;
                                    entityClinicalSignificance.Update = Date.now;

                                    console.log(entityClinicalSignificance);

                                    //TODO change flag
                                    daoClinicalSignificance.create(entityClinicalSignificance);
                                });

                            } else {
                                let entityClinicalSignificance = {};

                                entityClinicalSignificance.VariantId = entityVariant.Id;
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

                                entityClinicalSignificance.Evaluated =
                                    myVariantJSON.clinvar.rcv.last_evaluated;
                                entityClinicalSignificance.ReviewStatus =
                                    myVariantJSON.clinvar.rcv.review_status;
                                entityClinicalSignificance.Update = Date.now;

                                console.log(entityClinicalSignificance);

                                //TODO change flag
                                daoClinicalSignificance.create(entityClinicalSignificance);
                            }
                        }
                    });
                } else {
                    //if rcv is a single entity
                    var statement =
                        "SELECT PATHOLOGY_ID FROM GENETYLLIS_PATHOLOGY WHERE PATHOLOGY_CUI = ?";
                    var resultset = query.execute(
                        statement,
                        [myVariantJSON.clinvar.rcv.conditions.identifiers.medgen],
                        "local",
                        "DefaultDB"
                    );

                    resultset.forEach((clinsig) => {
                        let entityClinicalSignificance = {};
                        entityClinicalSignificance.VariantId = entityVariant.Id;
                        entityClinicalSignificance.PathologyId = clinsig.PATHOLOGY_ID;
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

                        entityClinicalSignificance.Evaluated =
                            myVariantJSON.clinvar.rcv.last_evaluated;
                        entityClinicalSignificance.ReviewStatus =
                            myVariantJSON.clinvar.rcv.review_status;
                        entityClinicalSignificance.Update = Date.now;

                        console.log(entityClinicalSignificance);

                        //TODO Change flag
                        daoClinicalSignificance.create(entityClinicalSignificance);
                    });
                }
            }
        }

        //ALLELE FREQUENCY
        console.log("ALLELE FREQ");
        let entityAlleleFrequency = {};

        var statement = "SELECT * FROM GENETYLLIS_ALLELEFREQUENCY WHERE ALLELEFREQUENCY_VARIANTID = ?";
        var resultset = query.execute(statement, [entityVariant.Id], "local", "DefaultDB");
        console.log(JSON.stringify(resultset[0]));

        if (resultset[0] !== undefined) {
            entityAlleleFrequency.Id = resultset[0].ALLELEFREQUENCY_VARIANTID;
            entityAlleleFrequency.VariantId = entityVariant.Id;

            var statement = "SELECT PATIENT_GENDERID FROM GENETYLLIS_PATIENT WHERE PATIENT_ID = ?";
            var resultset = query.execute(statement, [patientId], "local", "DefaultDB");

            entityAlleleFrequency.GenderId = resultset.PATIENT_GENDERID;
            entityAlleleFrequency.Update = Date.now;

            if (myVariantJSON.gnomad_genome !== undefined) {
                if (myVariantJSON.gnomad_genome.af.af !== undefined) {
                    entityAlleleFrequency.PopulationId = 12;
                    entityAlleleFrequency.Frequency = myVariantJSON.gnomad_genome.af.af;

                    console.log(entityAlleleFrequency);

                    daoAlleleFreqeuncy.update(entityAlleleFrequency);
                }

                if (myVariantJSON.gnomad_genome.af.af_nfe_bgr !== undefined) {
                    entityAlleleFrequency.PopulationId = 12;
                    entityAlleleFrequency.Frequency = myVariantJSON.gnomad_genome.af.af_nfe_bgr;
                    console.log(entityAlleleFrequency);
                    daoAlleleFreqeuncy.update(entityAlleleFrequency);
                }

                if (myVariantJSON.gnomad_genome.af.af_nfe_male !== undefined) {
                    entityAlleleFrequency.PopulationId = 12;
                    entityAlleleFrequency.Frequency = myVariantJSON.gnomad_genome.af.af_nfe_male;
                    console.log(entityAlleleFrequency);
                    daoAlleleFreqeuncy.update(entityAlleleFrequency);
                }

                if (myVariantJSON.gnomad_genome.af.af_nfe_female !== undefined) {
                    entityAlleleFrequency.PopulationId = 12;
                    entityAlleleFrequency.Frequency = myVariantJSON.gnomad_genome.af.af_nfe_female;
                    console.log(entityAlleleFrequency);
                    daoAlleleFreqeuncy.update(entityAlleleFrequency);
                }
            }
        } else {
            console.log("ALLELE FREQ create");
            let entityAlleleFrequency = {};
            entityAlleleFrequency.VariantId = entityVariant.Id;

            var statement = "SELECT PATIENT_GENDERID FROM GENETYLLIS_PATIENT WHERE PATIENT_ID = ?";
            var resultset = query.execute(statement, [patientId], "local", "DefaultDB");

            entityAlleleFrequency.GenderId = resultset[0].PATIENT_GENDERID;

            entityAlleleFrequency.Update = Date.now;


            //TODO depending on the populationId or the GenderId change the corresponding field
            if (myVariantJSON.gnomad_genome !== undefined) {
                if (myVariantJSON.gnomad_genome.af.af !== undefined) {
                    entityAlleleFrequency.PopulationId = 12;
                    entityAlleleFrequency.Frequency = myVariantJSON.gnomad_genome.af.af;
                    // console.log(entityAlleleFrequency);
                    daoAlleleFreqeuncy.create(entityAlleleFrequency);
                }

                if (myVariantJSON.gnomad_genome.af.af_nfe_bgr !== undefined) {
                    entityAlleleFrequency.PopulationId = 12;
                    entityAlleleFrequency.Frequency = myVariantJSON.gnomad_genome.af.af_nfe_bgr;
                    // console.log(entityAlleleFrequency);
                    daoAlleleFreqeuncy.create(entityAlleleFrequency);
                }

                if (myVariantJSON.gnomad_genome.af.af_nfe_male !== undefined) {
                    entityAlleleFrequency.PopulationId = 12;
                    entityAlleleFrequency.Frequency = myVariantJSON.gnomad_genome.af.af_nfe_male;
                    // console.log(entityAlleleFrequency);
                    daoAlleleFreqeuncy.create(entityAlleleFrequency);
                }

                if (myVariantJSON.gnomad_genome.af.af_nfe_female !== undefined) {
                    entityAlleleFrequency.PopulationId = 12;
                    entityAlleleFrequency.Frequency = myVariantJSON.gnomad_genome.af.af_nfe_female;
                    // console.log(entityAlleleFrequency);
                    daoAlleleFreqeuncy.create(entityAlleleFrequency);
                }
            }
        }
    }
}

function markChange(userId, variantId) {
    var statement = "SELECT * FROM GENETYLLIS_NOTIFICATION WHERE NOTIFICATION_USERUSERID = ? AND NOTIFICATION_VARIANTID = ?";
    var resultset = query.execute(statement, [userId, variantId], "local", "DefaultDB");
    // console.log(JSON.stringify(resultset));

    let entityNotification = {};
    entityNotification.Id = resultset[0].NotificationId;
    entityNotification.SeenFlag = false;
    entityNotification.ChangeFlag = true;

    daoNotification.update(entityNotification);
}