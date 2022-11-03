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
const upload = require("http/v4/upload");
const request = require("http/v4/request");
const query = require("db/v4/query");
const parser = require("genetyllis-parser/vcf/parser");
const files = require("io/v4/files");
const httpClient = require("http/v4/client");
const database = require("db/v4/database");
const daoVariantRecord = require("genetyllis-app/gen/dao/records/VariantRecord");
const daoVariant = require("genetyllis-app/gen/dao/variants/Variant");
const daoGene = require("genetyllis-app/gen/dao/genes/Gene");
const daoFilter = require("genetyllis-app/gen/dao/records/Filter");
const daoClinicalSignificance = require("genetyllis-app/gen/dao/variants/ClinicalSignificance");
const daoPathology = require("genetyllis-app/gen/dao/nomenclature/Pathology");
const daoAlleleFreqeuncy = require("genetyllis-app/gen/dao/variants/AlleleFrequency.js");
const myVariantInfoUrl = "https://myvariant.info/v1/variant/";

if (request.getMethod() === "POST") {
    if (upload.isMultipartContent()) {
        let patientId = request.getParameter("PatientId");
        if (!patientId) {

        }

        var fileItems = upload.parseRequest();
        for (i = 0; i < fileItems.size(); i++) {
            var fileItem = fileItems.get(i);
            if (!fileItem.isFormField()) {

                var tempFile = files.createTempFile("genetyllis", ".vcf");
                try {
                    //TODO change later with patientId
                    processVCFFile(tempFile, fileItem.getBytes(), 5, 1);
                } finally {
                    files.deleteFile(tempFile);
                }
            } else {

            }
        }
    } else {

    }
} else if (request.getMethod() === "GET") {

}

function processVCFFile(fileName, content, patientId, analysisId) {

    files.writeBytes(fileName, content);
    var vcfReader = parser.createVCFFileReader(tempFile);

    let dbHgvsEntries = databaseQuery("SELECT VARIANT_HGVS FROM GENETYLLIS_VARIANT", []);


    let iteratorVariants = vcfReader.getVariantContextIterator();
    while (iteratorVariants.hasNext()) {
        let variantContext = iteratorVariants.next();

        //VARIANT
        entityVariant = addVariant(dbHgvsEntries, variantContext);

        entityVariant.forEach(variant => {
            //VARIANT RECORD
            let variantRecordId = addVariantRecord(variantContext, patientId, variant.Id, analysisId);

            //FILTER
            addVariantFilter(variantContext, variantRecordId);
        })


        // break;
    }
}

function addVariant(dbHgvsEntries, variantContext) {
    let entityVariant = {};
    // <chr>+":"+"g."+<pos><ref allele>+">"+"alt allele" -> chr1:g.10316791A>C
    entityVariant.HGVS = variantContext.getContig() + ":" + "g."
        + variantContext.getStart() + variantContext.getReferenceBaseString()
        + ">" + variantContext.getAlternateAlleles()[0].getBaseString();

    if (doesHgvsExist(dbHgvsEntries, entityVariant.HGVS)) {


        let variantFromDb = databaseQuery("SELECT * FROM GENETYLLIS_VARIANT WHERE VARIANT_HGVS = ?", [entityVariant.HGVS]);
        // let variantRecordFromDb = databaseQuery(" SELECT VARIANT_HGVS FROM GENETYLLIS_VARIANT JOIN GENETYLLIS_VARIANTRECORD ON GENETYLLIS_VARIANT.VARIANT_ID = GENETYLLIS_VARIANTRECORD.VARIANTRECORD_VARIANTID WHERE VARIANTRECORD_PATIENTID = ?", [entityVariant.HGVS]);

        return [variantFromDb];
    }
    else {
        let entityVariantArray = [];
        entityVariant.Chromosome = variantContext.getContig(); // chr1
        entityVariant.Start = variantContext.getStart(); // 10316791
        entityVariant.End = variantContext.getEnd(); // 10316791
        entityVariant.DBSNP = variantContext.getID(); // rs1264383
        entityVariant.Reference = variantContext.getReferenceBaseString(); // A
        entityVariant.Alternative = variantContext.getAlternateAlleles()[0].getBaseString() // C

        // entityVariant.Id = daoVariant.create(entityVariant);



        var httpResponse = httpClient.get(myVariantInfoUrl + entityVariant.HGVS.replace(">", "%3E"));

        const myVariantJSON = JSON.parse(httpResponse.text);

        if (!myVariantJSON.error) {
            if (myVariantJSON.cadd !== undefined && myVariantJSON.cadd.consequence !== undefined)
                entityVariant.Consequence = JSON.stringify(myVariantJSON["cadd"]["consequence"]);
            else
                entityVariant.Consequence = "";

            if (myVariantJSON.cadd !== undefined && myVariantJSON.cadd.consdetail !== undefined)
                entityVariant.ConsequenceDetails = JSON.stringify(myVariantJSON.cadd.consdetail);
            else
                entityVariant.ConsequenceDetails = "";

            //GENE
            if (myVariantJSON.cadd !== undefined && myVariantJSON.cadd.gene !== undefined) {
                entityVariantArray = addGene(myVariantJSON, entityVariant)
            }
            else {
                entityVariant.Region = "";
                entityVariant.RegionNum = "";
                entityVariant.GeneId = null;
                entityVariant.Id = daoVariant.create(entityVariant);
                entityVariantArray.push(entityVariant)
            }

            entityVariantArray.forEach(variant => {
                //CLINICAL SIGNIFICANCE
                addClinicalSignificance(myVariantJSON, variant);

                //ALLELE FREQUENCY
                addAlleleFrequency(myVariantJSON, variant.Id);
            })
        } else {
            entityVariant.GeneId = null;
            entityVariant.Region = "";
            entityVariant.RegionNum = "";
            entityVariant.Consequence = "";
            entityVariant.ConsequenceDetails = "";

            entityVariant.Id = daoVariant.create(entityVariant);
            entityVariantArray.push(entityVariant);
        }

        return entityVariantArray;
    }

}

function addGene(myVariantJSON, entityVariant) {

    entityVariantArray = [];
    geneArray = myVariantJSON.cadd.gene;

    if (geneArray.length !== undefined) {
        for (let i = 0; i < geneArray.length; i++) {
            if (geneArray[i].gene_id !== undefined) {
                var entityVariantBuff = Object.assign({}, entityVariant);


                let entityGene = {};
                entityGene.GeneId = JSON.stringify(geneArray[i].gene_id);
                entityGene.Name = JSON.stringify(geneArray[i].genename);

                if (myVariantJSON.cadd !== undefined && myVariantJSON.cadd.exon !== undefined) {
                    entityVariant.Region = "exon";
                    entityVariant.RegionNum = JSON.stringify(myVariantJSON.cadd.exon[i]);
                }
                else if (myVariantJSON.cadd !== undefined && myVariantJSON.cadd.intron !== undefined) {
                    entityVariant.Region = "intron";
                    entityVariant.RegionNum = JSON.stringify(myVariantJSON.cadd.intron[i]);
                }
                else {
                    entityVariant.Region = "";
                    entityVariant.RegionNum = "";
                }

                entityVariant.GeneId = daoGene.create(entityGene);

                entityVariantBuff.Id = daoVariant.create(entityVariantBuff)
                entityVariantArray.push(entityVariantBuff);
            }
            //TODO What if there's info but no gene_id
            else {
                entityVariant.Id = daoVariant.create(entityVariant);
                entityVariantArray.push(entityVariant);
            }
        }
    } else {
        let entityGene = {};
        if (myVariantJSON.cadd.gene.gene_id !== undefined) {
            entityGene.GeneId = JSON.stringify(myVariantJSON.cadd.gene.gene_id);
            entityGene.Name = JSON.stringify(myVariantJSON.cadd.gene.genename);

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

            entityVariant.GeneId = daoGene.create(entityGene);
            entityVariant.Id = daoVariant.create(entityVariant)
            entityVariantArray.push(entityVariant);
        }
        //TODO What if there's info but no gene_id
        else {
            entityVariant.Id = daoVariant.create(entityVariant);
            entityVariantArray.push(entityVariant);
        }
    }

    return entityVariantArray;
}

function addClinicalSignificance(myVariantJSON, entityVariant) {
    if (myVariantJSON.clinvar !== undefined && myVariantJSON.clinvar.rcv !== undefined) {

        var rcvArray = myVariantJSON.clinvar.rcv;

        if (rcvArray.length !== undefined) {
            rcvArray.forEach((rcv) => {
                var conditionsArray = rcv.conditions;
                if (conditionsArray.length !== undefined) {
                    conditionsArray.forEach((conditions) => {
                        if (conditions.identifiers !== undefined) {
                            let resultset = databaseQuery("SELECT PATHOLOGY_ID FROM GENETYLLIS_PATHOLOGY WHERE PATHOLOGY_CUI = ?", [conditions.identifiers.medgen])

                            resultset.forEach((clinsig) => {
                                createClinicalSignificanceEntity(rcv.accession, entityVariant.Id, clinsig.PATHOLOGY_ID, rcv.clinical_significance, rcv.last_evaluated, rcv.review_status)
                            });

                        } else {
                            createClinicalSignificanceEntity(rcv.accession, entityVariant.Id, null, rcv.clinical_significance, rcv.last_evaluated, rcv.review_status)
                        }
                    });
                } else {
                    if (rcv.conditions.identifiers !== undefined) {
                        let resultset = databaseQuery("SELECT PATHOLOGY_ID FROM GENETYLLIS_PATHOLOGY WHERE PATHOLOGY_CUI = ?", [rcv.conditions.identifiers.medgen])

                        resultset.forEach((clinsig) => {
                            createClinicalSignificanceEntity(rcv.accession, entityVariant.Id, clinsig.PATHOLOGY_ID, rcv.clinical_significance, rcv.last_evaluated, rcv.review_status)
                        });

                    } else {
                        createClinicalSignificanceEntity(rcv.accession, entityVariant.Id, null, rcv.clinical_significance, rcv.last_evaluated, rcv.review_status)
                    }
                }
            });
        } else {
            let resultset = databaseQuery("SELECT PATHOLOGY_ID FROM GENETYLLIS_PATHOLOGY WHERE PATHOLOGY_CUI = ?", [myVariantJSON.clinvar.rcv.conditions.identifiers.medgen])

            resultset.forEach((clinsig) => {
                createClinicalSignificanceEntity(myVariantJSON.clinvar.rcv.accession, entityVariant.Id, clinsig.PATHOLOGY_ID, myVariantJSON.clinvar.rcv.clinical_significance, myVariantJSON.clinvar.rcv.last_evaluated, myVariantJSON.clinvar.rcv.review_status)
            });
        }
    }
}

function createClinicalSignificanceEntity(accession, variantId, pathologyId, significance, evaluated, reviewSatus) {
    let entityClinicalSignificance = {};

    entityClinicalSignificance.Accession = accession;
    entityClinicalSignificance.VariantId = variantId;
    entityClinicalSignificance.PathologyId = pathologyId;
    entityClinicalSignificance.SignificanceId = getSignificance(significance);
    if (evaluated !== undefined)
        entityClinicalSignificance.Evaluated = evaluated;
    entityClinicalSignificance.ReviewStatus = reviewSatus;
    entityClinicalSignificance.Updated = new Date().toISOString().slice(0, 19);;

    daoClinicalSignificance.create(entityClinicalSignificance);
}

//TODO names may be differently spelled
function getSignificance(significance) {
    switch (significance) {
        case "Pathogenic":
            return 1;
        case "Likely pathogenic":
            return 2;
        case "Uncertain significance":
            return 3;
        case "Likely benign":
            return 4;
        case "Benign":
            return 5;
        default:
            return null;
    }
}

function addAlleleFrequency(myVariantJSON, variantId) {

    let entityAlleleFrequency = {};
    entityAlleleFrequency.VariantId = variantId;

    //2022-07-27 07:19:42
    entityAlleleFrequency.Updated = new Date().toISOString().slice(0, 19);

    if (myVariantJSON.gnomad_genome !== undefined) {
        if (myVariantJSON.gnomad_genome.af.af !== undefined)
            setFrequencyField(entityAlleleFrequency, myVariantJSON.gnomad_genome.af.af, 18, 3);
        if (myVariantJSON.gnomad_genome.af.af_nfe_bgr !== undefined)
            setFrequencyField(entityAlleleFrequency, myVariantJSON.gnomad_genome.af.af_nfe_bgr, 12, 3);
        if (myVariantJSON.gnomad_genome.af.af_nfe_male !== undefined)
            setFrequencyField(entityAlleleFrequency, myVariantJSON.gnomad_genome.af.af_nfe_male, 11, 1);
        if (myVariantJSON.gnomad_genome.af.af_nfe_female !== undefined)
            setFrequencyField(entityAlleleFrequency, myVariantJSON.gnomad_genome.af.af_nfe_female, 11, 2);
    }
}

function setFrequencyField(entityAlleleFrequency, myVariantJSONFrequency, populationId, genderId) {
    if (myVariantJSONFrequency !== undefined) {
        entityAlleleFrequency.PopulationId = populationId;
        entityAlleleFrequency.GenderId = genderId;
        entityAlleleFrequency.Frequency = myVariantJSONFrequency;
        daoAlleleFreqeuncy.create(entityAlleleFrequency);
    }
}

//returns variant record id
function addVariantRecord(variantContext, patientId, variantId, analysisId) {
    let entityVariantRecord = {};
    entityVariantRecord.PatientId = patientId;
    entityVariantRecord.VariantId = variantId;
    entityVariantRecord.Quality = variantContext.getPhredScaledQual();

    let genotypes = variantContext.getGenotypes();
    entityVariantRecord.Homozygous = isHomozygous(genotypes);

    entityVariantRecord.AlleleDepth = genotypes[0].getAD()[1]; // TODO to be created new variant if more than 2 AD elements are presents
    entityVariantRecord.Depth = genotypes[0].getDP();
    entityVariantRecord.AnalysisId = analysisId;

    return daoVariantRecord.create(entityVariantRecord);
}

function isHomozygous(genotypes) {
    if (genotypes[0].getAD().length == 2) {
        var a = genotypes[0].getAD()[0];
        var b = genotypes[0].getAD()[1];

        if (a / (a + b) >= 0.8 || b / (a + b) >= 0.8)
            return true;
        else if (b / (a + b) > 0.2 && b / (a + b) < 0.8)
            return false;
    }
    else if (genotypes[0].getAD().length == 3) {
        var a = genotypes[0].getAD()[0];
        var b = genotypes[0].getAD()[1];
        var c = genotypes[0].getAD()[2];

        if ((b / (a + b + c) >= 0.6 && a / (a + b + c) < 0.2 && c / (a + b + c) < 0.2) || (c / (a + b + c) >= 0.6 && a / (a + b + c) < 0.2) && b / (a + b + c) < 0.2)
            return true;
        else if ((b / (a + b + c) > 0.2 && b / (a + b + c) < 0.6 && a / (a + b + c) > 0.2 && a / (a + b + c) < 0.6) || (c / (a + b + c) > 0.2 && c / (a + b + c) < 0.6 && a / (a + b + c) > 0.2 && a / (a + b + c) < 0.6) || (b / (a + b + c) > 0.2 && b / (a + b + c) < 0.6 && c / (a + b + c) > 0.2 && c / (a + b + c) < 0.6))
            return false;
    }
}

function addVariantFilter(variantContext, variantRecordId) {
    let entityFilter = {};
    var filters = variantContext.getFilters();

    filters.forEach(filter => {
        if (filter) {
            entityFilter.Name = filter;
            entityFilter.VariantRecordId = variantRecordId;
            daoFilter.create(entityFilter);
        } else {
            entityFilter.Name = "Pass";
            entityFilter.VariantRecordId = variantRecordId;
            daoFilter.create(entityFilter);
        }
    });
}

function doesHgvsExist(hgvsArray, hgvs) {
    var hasMatch = false;
    for (var index = 0; index < hgvsArray.length; ++index) {

        var currentHGVS = hgvsArray[index];

        if (JSON.stringify(currentHGVS.VARIANT_HGVS) == JSON.stringify(hgvs)) {
            hasMatch = true;
            break;
        }
    }

    return hasMatch;
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
