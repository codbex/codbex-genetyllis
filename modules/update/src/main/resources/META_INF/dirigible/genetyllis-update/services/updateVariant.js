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
    console.log("update ", variantId)
    updateVariant(variantId);
    markChangeForAllUsers(variantId);
}


function updateVariant(variantId) {

    console.log(variantId);
    if (!variantId) {
        console.log("VariantId has to be set as a parameter in the URL");
        return;
    }
    patientId = 1;

    //VARIANT
    let entityVariant = {};
    var resultset = databaseQuery("SELECT * FROM GENETYLLIS_VARIANT WHERE VARIANT_ID= ?", [variantId]);

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

    var httpResponse = httpClient.get("https://myvariant.info/v1/variant/" + entityVariant.HGVS.replace(">", "%3E"));
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
            // console.log(daoVariant.update(entityVariant));
        } else {
            //TODO change flag
            console.log("not the same")
            console.log(JSON.stringify(dbEntityVariant));
            console.log(JSON.stringify(entityVariant));

            markChangeForAllUsers(variantId);
            daoVariant.update(entityVariant);
        }


        //GENE
        //checkGene(myVariantJSON, entityVariant);

        //CLINICAL SIGNIFICANCE
        checkClinicalSignificance(myVariantJSON, entityVariant)

        //ALLELE FREQUENCY
        checkAlleleFrequency(myVariantJSON, entityVariant, patientId)
    }
}

//TODO make array of genes
function checkGene(myVariantJSON, entityVariant) {

    console.log("GENE");
    if (myVariantJSON.cadd !== undefined && myVariantJSON.cadd.gene !== undefined) {
        var resultsetGeneId = databaseQuery("SELECT VARIANT_GENEID FROM GENETYLLIS_VARIANT WHERE VARIANT_ID = ?", [entityVariant.Id])
        console.log(JSON.stringify(resultsetGeneId));
        if (resultsetGeneId[0].VARIANT_GENEID !== undefined) {
            updateGene(myVariantJSON, resultsetGeneId, entityVariant)
        } else {
            createGene(myVariantJSON, entityVariant)
        }
    }
}

function createGene(myVariantJSON, entityVariant) {
    console.log("GENE create");
    geneArray = myVariantJSON.cadd.gene;

    if (geneArray.length !== undefined) {
        geneArray.forEach(gene => {
            if (gene.gene_id !== undefined && gene.genename !== undefined) {
                let entityGene = {};
                entityGene.GeneId = gene.gene_id;
                entityGene.Name = JSON.stringify(gene.genename).substring(0, 19);

                entityVariant.GeneId = daoGene.create(entityGene);

                markChangeForAllUsers(entityVariant.Id);
                daoVariant.update(entityVariant)
            }
        });
    } else {
        if (myVariantJSON.cadd.gene.gene_id !== undefined && myVariantJSON.cadd.gene.genename !== undefined) {
            let entityGene = {};
            entityGene.GeneId = myVariantJSON.cadd.gene.gene_id;
            entityGene.Name = JSON.stringify(myVariantJSON.cadd.gene.genename);

            entityVariant.GeneId = daoGene.create(entityGene);

            markChangeForAllUsers(entityVariant.Id);
            daoVariant.update(entityVariant)
        }
    }
}

function updateGene(myVariantJSON, resultsetGeneId, entityVariant) {
    var geneArray = [];
    var resultset = databaseQuery("SELECT * FROM GENETYLLIS_GENE WHERE GENE_ID = ?", [resultsetGeneId[0].VARIANT_GENEID])

    let dbEntityGene = { Id: resultset[0].GENE_ID, GeneId: resultset[0].GENE_GENEID, Name: resultset[0].GENE_NAME };
    let entityGene = {};
    entityGene.Id = resultset[0].GENE_ID;

    geneArray = myVariantJSON.cadd.gene;
    if (geneArray.length !== undefined) {
        geneArray.forEach(gene => {
            if (gene.gene_id !== undefined && gene.genename !== undefined) {
                entityGene.GeneId = gene.gene_id;
                entityGene.Name = JSON.stringify(gene.genename);

                updateEntity(daoGene, dbEntityGene, entityGene, entityVariant);
            }

        });
    } else {
        if (myVariantJSON.cadd.gene.gene_id !== undefined && myVariantJSON.cadd.gene.genename !== undefined) {
            entityGene.GeneId = myVariantJSON.cadd.gene.gene_id;
            entityGene.Name = JSON.stringify(myVariantJSON.cadd.gene.genename).substring(0, 19);

            updateEntity(daoGene, dbEntityGene, entityGene, entityVariant);
        }
    }
}

function checkClinicalSignificance(myVariantJSON, entityVariant) {
    if (myVariantJSON.clinvar !== undefined && myVariantJSON.clinvar.rcv !== undefined) {
        console.log("CLINSIG");
        var resultset = databaseQuery("SELECT * FROM GENETYLLIS_CLINICALSIGNIFICANCE WHERE CLINICALSIGNIFICANCE_VARIANTID = ?", [entityVariant.Id]);

        //TODO Evaluated wont be the same because of date formats., ex. 2018-06-22T00:00:00+0300 and 2018-06-22
        if (resultset[0] !== undefined) {
            let dbEntityClinicalSignificance = { Id: resultset[0].CLINICALSIGNIFICANCE_ID, VariantId: resultset[0].CLINICALSIGNIFICANCE_VARIANTID, PathologyId: resultset[0].CLINICALSIGNIFICANCE_PATHOLOGYID, Evaluated: resultset[0].CLINICALSIGNIFICANCE_EVALUATED, ReviewStatus: resultset[0].CLINICALSIGNIFICANCE_REVIEWSTATUS };
            let entityClinicalSignificance = {};
            entityClinicalSignificance.Id = resultset[0].CLINICALSIGNIFICANCE_VARIANTID;

            var rcvArray = myVariantJSON.clinvar.rcv;

            if (rcvArray.length !== undefined) {
                rcvArray.forEach((rcv) => {
                    var conditionsArray = rcv.conditions;
                    if (conditionsArray.length !== undefined) {
                        conditionsArray.forEach((conditions) => {
                            if (conditions.identifiers !== undefined) {
                                console.log("multiple conditions with identifiers");
                                var resultset = databaseQuery("SELECT PATHOLOGY_ID FROM GENETYLLIS_PATHOLOGY WHERE PATHOLOGY_CUI = ?", [conditions.identifiers.medgen]);

                                resultset.forEach((clinsig) => {
                                    updateClinicalSignificance(dbEntityClinicalSignificance, entityClinicalSignificance, entityVariant.Id, clinsig.PATHOLOGY_ID, myVariantJSON.clinvar.rcv.clinical_significance, myVariantJSON.clinvar.rcv.last_evaluated, myVariantJSON.clinvar.rcv.review_status, entityVariant)
                                });
                            } else {
                                console.log("multiple conditions without identifiers");
                                updateClinicalSignificance(dbEntityClinicalSignificance, entityClinicalSignificance, entityVariant.Id, null, myVariantJSON.clinvar.rcv.clinical_significance, myVariantJSON.clinvar.rcv.last_evaluated, myVariantJSON.clinvar.rcv.review_status, entityVariant)
                            }
                        });
                    } else {
                        if (rcv.conditions.identifiers !== undefined) {
                            var resultset = databaseQuery("SELECT PATHOLOGY_ID FROM GENETYLLIS_PATHOLOGY WHERE PATHOLOGY_CUI = ?", [rcv.conditions.identifiers.medgen]);

                            resultset.forEach((clinsig) => {
                                updateClinicalSignificance(dbEntityClinicalSignificance, entityClinicalSignificance, entityVariant.Id, clinsig.PATHOLOGY_ID, myVariantJSON.clinvar.rcv.clinical_significance, myVariantJSON.clinvar.rcv.last_evaluated, myVariantJSON.clinvar.rcv.review_status, entityVariant)
                            });

                        } else {
                            updateClinicalSignificance(dbEntityClinicalSignificance, entityClinicalSignificance, entityVariant.Id, myVariantJSON.clinvar.rcv.clinical_significance, myVariantJSON.clinvar.rcv.clinical_significance, myVariantJSON.clinvar.rcv.last_evaluated, myVariantJSON.clinvar.rcv.review_status, entityVariant)
                        }
                    }
                });
            } else {
                //if rcv is a single entity
                var resultset = databaseQuery("SELECT PATHOLOGY_ID FROM GENETYLLIS_PATHOLOGY WHERE PATHOLOGY_CUI = ?", [myVariantJSON.clinvar.rcv.conditions.identifiers.medgen]);

                resultset.forEach((clinsig) => {
                    updateClinicalSignificance(dbEntityClinicalSignificance, entityClinicalSignificance, entityVariant.Id, clinsig.PATHOLOGY_ID, myVariantJSON.clinvar.rcv.clinical_significance, myVariantJSON.clinvar.rcv.last_evaluated, myVariantJSON.clinvar.rcv.review_status, entityVariant)
                });
            }
        } else {
            console.log("CLINSIG create");

            var rcvArray = myVariantJSON.clinvar.rcv;

            if (rcvArray.length !== undefined) {
                rcvArray.forEach((rcv) => {

                    var conditionsArray = rcv.conditions;
                    if (conditionsArray.length !== undefined) {
                        conditionsArray.forEach((conditions) => {
                            if (conditions.identifiers !== undefined) {
                                console.log("multiple conditions with identifiers");

                                var resultset = databaseQuery("SELECT PATHOLOGY_ID FROM GENETYLLIS_PATHOLOGY WHERE PATHOLOGY_CUI = ?", [conditions.identifiers.medgen]);

                                resultset.forEach((clinsig) => {
                                    createClinicalSignificanceEntity(entityVariant.Id, clinsig.PATHOLOGY_ID, myVariantJSON.clinvar.rcv.clinical_significance, myVariantJSON.clinvar.rcv.last_evaluated, myVariantJSON.clinvar.rcv.review_status)
                                    markChangeForAllUsers(variantId);
                                });

                            } else {
                                console.log("multiple conditions without identifiers");
                                createClinicalSignificanceEntity(entityVariant.Id, null, myVariantJSON.clinvar.rcv.clinical_significance, myVariantJSON.clinvar.rcv.last_evaluated, myVariantJSON.clinvar.rcv.review_status)
                                markChangeForAllUsers(variantId);
                            }
                        });
                    } else {
                        if (rcv.conditions.identifiers !== undefined) {
                            var resultset = databaseQuery("SELECT PATHOLOGY_ID FROM GENETYLLIS_PATHOLOGY WHERE PATHOLOGY_CUI = ?", [rcv.conditions.identifiers.medgen]);

                            resultset.forEach((clinsig) => {
                                createClinicalSignificanceEntity(entityVariant.Id, clinsig.PATHOLOGY_ID, myVariantJSON.clinvar.rcv.clinical_significance, myVariantJSON.clinvar.rcv.last_evaluated, myVariantJSON.clinvar.rcv.review_status)
                                markChangeForAllUsers(variantId);
                            });
                        } else {
                            createClinicalSignificanceEntity(entityVariant.Id, null, myVariantJSON.clinvar.rcv.clinical_significance, myVariantJSON.clinvar.rcv.last_evaluated, myVariantJSON.clinvar.rcv.review_status)
                            markChangeForAllUsers(variantId);
                        }
                    }
                });
            } else {
                //if rcv is a single entity
                var resultset = databaseQuery("SELECT PATHOLOGY_ID FROM GENETYLLIS_PATHOLOGY WHERE PATHOLOGY_CUI = ?", [myVariantJSON.clinvar.rcv.conditions.identifiers.medgen]);

                resultset.forEach((clinsig) => {
                    createClinicalSignificanceEntity(entityVariant.Id, clinsig.PATHOLOGY_ID, myVariantJSON.clinvar.rcv.clinical_significance, myVariantJSON.clinvar.rcv.last_evaluated, myVariantJSON.clinvar.rcv.review_status)
                    markChangeForAllUsers(variantId);
                });
            }
        }
    }
}

function createClinicalSignificanceEntity(variantId, pathologyId, significance, evaluated, reviewSatus) {
    let entityClinicalSignificance = {};

    entityClinicalSignificance.VariantId = variantId;
    entityClinicalSignificance.PathologyId = pathologyId;
    entityClinicalSignificance.SignificanceId = getSignificance(significance);
    if(evaluated !== undefined)
		entityClinicalSignificance.Evaluated = evaluated;
    entityClinicalSignificance.ReviewStatus = reviewSatus;
    entityClinicalSignificance.Updated = new Date().toISOString().slice(0, 19);

    daoClinicalSignificance.create(entityClinicalSignificance);
}

function updateClinicalSignificance(dbEntityClinicalSignificance, entityClinicalSignificance, variantId, pathologyId, significance, evaluated, reviewSatus, entityVariant) {
    entityClinicalSignificance.VariantId = variantId;
    entityClinicalSignificance.PathologyId = pathologyId;
    entityClinicalSignificance.Significance = getSignificance(significance);
	if(evaluated !== undefined)
		entityClinicalSignificance.Evaluated = evaluated;
    entityClinicalSignificance.ReviewStatus = reviewSatus;
    entityClinicalSignificance.Update = Date.now;

    updateEntity(daoClinicalSignificance, dbEntityClinicalSignificance, entityClinicalSignificance, entityVariant);

    return entityClinicalSignificance;
}

//TODO names may be differently spelled
function getSignificance(significance) {
    switch (significance) {
        case "Pathogenic":
            return 1;
        case "Likely pathogenic":
            return 2;
        case "Uncertain":
            return 3;
        case "Likely benign":
            return 4;
        case "Benign":
            return 5;
        default:
            return null;
    }
}

function checkAlleleFrequency(myVariantJSON, entityVariant, patientId) {
    //ALLELE FREQUENCY
    console.log("ALLELE FREQ");
    //TODO dates will never be the same, find a workaround
    let entityAlleleFrequency = {};

    var resultset = databaseQuery("SELECT * FROM GENETYLLIS_ALLELEFREQUENCY WHERE ALLELEFREQUENCY_VARIANTID = ?", [entityVariant.Id]);

    if (resultset[0] !== undefined) {
        resultset.forEach(result => {
            let dbEntityAlleleFreqeuncy = {
                Id: result.ALLELEFREQUENCY_ID, VariantId: result.ALLELEFREQUENCY_VARIANTID, GenderId: result.ALLELEFREQUENCY_GENDERID, PopulationId: result.ALLELEFREQUENCY_POPULATIONID,
                Freqeuncy: result.ALLELEFREQUENCY_FREQUENCY
            };

            console.log(JSON.stringify(dbEntityAlleleFreqeuncy))

            entityAlleleFrequency.Id = result.ALLELEFREQUENCY_ID;
            entityAlleleFrequency.VariantId = entityVariant.Id;

            var resultsetGene = databaseQuery("SELECT PATIENT_GENDERID FROM GENETYLLIS_PATIENT WHERE PATIENT_ID = ?", [patientId]);

            entityAlleleFrequency.GenderId = resultsetGene.PATIENT_GENDERID;
            entityAlleleFrequency.Updated = new Date().toISOString().slice(0, 19).replace('T', ' ');

            if (myVariantJSON.gnomad_genome !== undefined) {
				updateAlleleFrequency(myVariantJSON, entityAlleleFrequency, dbEntityAlleleFreqeuncy.VariantId)
                // if (myVariantJSON.gnomad_genome.af.af !== undefined) {
                    // entityAlleleFrequency.PopulationId = 18;
                    // entityAlleleFrequency.Frequency = myVariantJSON.gnomad_genome.af.af;
                    // updateAlleleFrequency(myVariantJSON, entityAlleleFrequency, entityVariant.Id)
                    // updateEntity(daoAlleleFreqeuncy, dbEntityAlleleFreqeuncy, entityAlleleFrequency, entityVariant);
                // }

                // if (myVariantJSON.gnomad_genome.af.af_nfe_bgr !== undefined) {
                    // entityAlleleFrequency.PopulationId = 12;
                    // entityAlleleFrequency.Frequency = myVariantJSON.gnomad_genome.af.af_nfe_bgr;
                    // updateAlleleFrequency(myVariantJSON, entityAlleleFrequency, entityVariant.Id)
                    // updateEntity(daoAlleleFreqeuncy, dbEntityAlleleFreqeuncy, entityAlleleFrequency, entityVariant);
                // }

                // if (myVariantJSON.gnomad_genome.af.af_nfe_male !== undefined) {
                    // entityAlleleFrequency.PopulationId = 11;
                    // entityAlleleFrequency.Frequency = myVariantJSON.gnomad_genome.af.af_nfe_male;
                    // updateAlleleFrequency(myVariantJSON, entityAlleleFrequency, entityVariant.Id)
                    // updateEntity(daoAlleleFreqeuncy, dbEntityAlleleFreqeuncy, entityAlleleFrequency, entityVariant);
                // }

                // if (myVariantJSON.gnomad_genome.af.af_nfe_female !== undefined) {
                    // entityAlleleFrequency.PopulationId = 11;
                    // entityAlleleFrequency.Frequency = myVariantJSON.gnomad_genome.af.af_nfe_female;
                    updateAlleleFrequency should return object that we pass to updateEntity
                    // updateAlleleFrequency(myVariantJSON, entityAlleleFrequency, entityVariant.Id)
                    // updateEntity(daoAlleleFreqeuncy, dbEntityAlleleFreqeuncy, entityAlleleFrequency, entityVariant);
                // }
            }

        })
    } else {
        console.log("ALLELE FREQ create");
        let entityAlleleFrequency = {};
        entityAlleleFrequency.VariantId = entityVariant.Id;
        createAlleleFrequency(myVariantJSON, entityAlleleFrequency, entityVariant.Id)
    }
}


function createAlleleFrequency(myVariantJSON, entityAlleleFrequency, variantId) {
    entityAlleleFrequency.VariantId = variantId;
    entityAlleleFrequency.Updated = new Date().toISOString().slice(0, 19);

    if (myVariantJSON.gnomad_genome !== undefined) {
		if(myVariantJSON.gnomad_genome.af.af !== undefined)
			daoAlleleFreqeuncy.create(setFrequencyField(entityAlleleFrequency, myVariantJSON.gnomad_genome.af.af, 18, 3));
		if(myVariantJSON.gnomad_genome.af.af !== undefined)
			daoAlleleFreqeuncy.create(setFrequencyField(entityAlleleFrequency, myVariantJSON.gnomad_genome.af.af_nfe_bgr, 12, 3));
		if(myVariantJSON.gnomad_genome.af.af !== undefined)
			daoAlleleFreqeuncy.create(setFrequencyField(entityAlleleFrequency, myVariantJSON.gnomad_genome.af.af_nfe_male, 11, 1));
		if(myVariantJSON.gnomad_genome.af.af !== undefined)
			daoAlleleFreqeuncy.create(setFrequencyField(entityAlleleFrequency, myVariantJSON.gnomad_genome.af.af_nfe_female, 11, 2));
    }
}

function updateAlleleFrequency(myVariantJSON, entityAlleleFrequency, variantId) {
    entityAlleleFrequency.VariantId = variantId;
    entityAlleleFrequency.Updated = new Date().toISOString().slice(0, 19);

    if (myVariantJSON.gnomad_genome !== undefined) {
        daoAlleleFreqeuncy.update(setFrequencyField(entityAlleleFrequency, myVariantJSON.gnomad_genome.af.af, 18, 3));
        daoAlleleFreqeuncy.update(setFrequencyField(entityAlleleFrequency, myVariantJSON.gnomad_genome.af.af_nfe_bgr, 12, 3));
        daoAlleleFreqeuncy.update(setFrequencyField(entityAlleleFrequency, myVariantJSON.gnomad_genome.af.af_nfe_male, 11, 1));
        daoAlleleFreqeuncy.update(setFrequencyField(entityAlleleFrequency, myVariantJSON.gnomad_genome.af.af_nfe_female, 11, 2));
    }
}

function setFrequencyField(entityAlleleFrequency, myVariantJSONFrequency, populationId, genderId) {
    if (myVariantJSONFrequency !== undefined) {
        entityAlleleFrequency.PopulationId = populationId;
        entityAlleleFrequency.GenderId = genderId;
        entityAlleleFrequency.Frequency = myVariantJSONFrequency;

        return entityAlleleFrequency;
    }
}

function updateEntity(dao, dbEntity, entity, entityVariant) {
    if (JSON.stringify(dbEntity) === JSON.stringify(entity)) {
        console.log("The same")
    } else {
        console.log("not the same")
        console.log(JSON.stringify(dbEntity));
        console.log(JSON.stringify(entity));

        markChangeForAllUsers(entityVariant.Id);
        dao.update(entity);
    }
}

function getUsersForVariantInterest(variantId) {
    var resultset = databaseQuery("SELECT * FROM GENETYLLIS_NOTIFICATION WHERE NOTIFICATION_VARIANTID = ?", [variantId])
    let users = resultset.map(notification => notification.NOTIFICATION_USERUSERID);

    return users;
}

function markChangeForAllUsers(variantId) {
    let userOfInterestArray = getUsersForVariantInterest(variantId);
    console.log(userOfInterestArray);
    userOfInterestArray.forEach(user => {
        var resultset = databaseQuery("SELECT * FROM GENETYLLIS_NOTIFICATION WHERE NOTIFICATION_USERUSERID = ? AND NOTIFICATION_VARIANTID = ?", [user, variantId])

        let entityNotification = {};
        entityNotification.NotificationId = resultset[0].NOTIFICATION_NOTIFICATIONID;
        entityNotification.SeenFlag = false;
        entityNotification.ChangeFlag = true;

        console.log(JSON.stringify(entityNotification));
        daoNotification.update(entityNotification);
    });
}

function databaseQuery(statement, args) {
    //args must be array
    return query.execute(
        statement,
        args,
        "local",
        "DefaultDB"
    );
}

const objectsEqual = (o1, o2) =>
    Object.keys(o1).length === Object.keys(o2).length
    && Object.keys(o1).every(p => o1[p] === o2[p]);

const arraysEqual = (a1, a2) =>
    a1.length === a2.length && a1.every((o, idx) => objectsEqual(o, a2[idx]));