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
var upload = require("http/v4/upload");
var request = require("http/v4/request");
var query = require("db/v4/query");
var parser = require("genetyllis-parser/vcf/parser");
var files = require("io/v4/files");
var httpClient = require("http/v4/client");
var database = require("db/v4/database");
var daoVariantRecord = require("genetyllis-app/gen/dao/records/VariantRecord");
var daoVariant = require("genetyllis-app/gen/dao/variants/Variant");
var daoGene = require("genetyllis-app/gen/dao/genes/Gene");
var daoFilter = require("genetyllis-app/gen/dao/records/Filter");
var daoClinicalSignificance = require("genetyllis-app/gen/dao/variants/ClinicalSignificance");
var daoPathology = require("genetyllis-app/gen/dao/nomenclature/Pathology");
var daoAlleleFreqeuncy = require("genetyllis-app/gen/dao/variants/AlleleFrequency.js");

if (request.getMethod() === "POST") {
    if (upload.isMultipartContent()) {
        let patientId = request.getParameter("PatientId");
        if (!patientId) {
            console.log("PatientId has to be set as a parameter in the URL");
        }
        console.log("PatientId: " + patientId);
        var fileItems = upload.parseRequest();
        for (i = 0; i < fileItems.size(); i++) {
            var fileItem = fileItems.get(i);
            if (!fileItem.isFormField()) {

                console.log("File Name: " + fileItem.getName());

                var tempFile = files.createTempFile("genetyllis", ".vcf");
                try {
                    processVCFFile(tempFile, fileItem.getBytes(), 3);
                } finally {
                    files.deleteFile(tempFile);
                }
            } else {
                console.error("Incorrect usage of the VCF upload");
            }
        }
    } else {
        console.error("The request's content must be 'multipart'");
    }
} else if (request.getMethod() === "GET") {
    console.warn("Use POST request.");
}

function processVCFFile(fileName, content, patientId) {
    console.log("Temp file: " + fileName);
    files.writeBytes(fileName, content);
    var vcfReader = parser.createVCFFileReader(tempFile);

    let iteratorVariants = vcfReader.getVariantContextIterator();
    while (iteratorVariants.hasNext()) {
        let variantContext = iteratorVariants.next();

        //VARIANT
        entityVariant = addVariant(variantContext);

        //VARIANT RECORD
        let variantRecordId = addVariantRecord(variantContext, patientId, entityVariant.Id, null);

        //FILTER
        addVariantFilter(variantContext, variantRecordId);

        break;
    }
}

function addVariant(variantContext) {
    let entityVariant = {};
    // <chr>+":"+"g."+<pos><ref allele>+">"+"alt allele" -> chr1:g.10316791A>C
    entityVariant.HGVS = variantContext.getContig() + ":" + "g."
        + variantContext.getStart() + variantContext.getReferenceBaseString()
        + ">" + variantContext.getAlternateAlleles()[0].getBaseString();
    entityVariant.Chromosome = variantContext.getContig(); // chr1
    entityVariant.Start = variantContext.getStart(); // 10316791
    entityVariant.End = variantContext.getEnd(); // 10316791
    entityVariant.DBSNP = variantContext.getID(); // rs1264383
    entityVariant.Reference = variantContext.getReferenceBaseString(); // A
    entityVariant.Alternative = variantContext.getAlternateAlleles()[0].getBaseString() // C

    // entityVariant.Id = daoVariant.create(entityVariant);

    console.log(entityVariant.HGVS);

    var httpResponse = httpClient.get("https://myvariant.info/v1/variant/" + entityVariant.HGVS.replace(">", "%3E"));

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
            daoVariant.update(entityVariant);
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

        daoVariant.update(entityVariant);
    }

    return entityVariant;
}

function addGene(myVariantJSON, entityVariant) {
    console.log("GENE");
    entityVariantArray = [];
    geneArray = myVariantJSON.cadd.gene;
    console.log(JSON.stringify(geneArray));
    console.log(geneArray.length);
    if (geneArray.length !== undefined) {
        for (let i = 0; i < geneArray.length; i++) {
            if (geneArray[i].gene_id !== undefined) {
                var entityVariantBuff = Object.assign({}, entityVariant);
                console.log("in array");

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
                console.log(JSON.stringify(entityGene));

                entityVariantBuff.Id = daoVariant.create(entityVariantBuff)
                entityVariantArray.push(entityVariantBuff);
            }
        }
    } else {
        let entityGene = {};
        console.log("not in array");
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
    }

    return entityVariantArray;
}

function addClinicalSignificance(myVariantJSON, entityVariant) {
    if (myVariantJSON.clinvar !== undefined && myVariantJSON.clinvar.rcv !== undefined) {
        console.log("CLINSIG");

        var rcvArray = myVariantJSON.clinvar.rcv;

        if (rcvArray.length !== undefined) {
            rcvArray.forEach((rcv) => {
                var conditionsArray = rcv.conditions;
                if (conditionsArray.length !== undefined) {
                    conditionsArray.forEach((conditions) => {
                        if (conditions.identifiers !== undefined) {
                            console.log("multiple conditions with identifiers");
                            let resultset = databaseQuery("SELECT PATHOLOGY_ID FROM GENETYLLIS_PATHOLOGY WHERE PATHOLOGY_CUI = ?", [conditions.identifiers.medgen])

                            resultset.forEach((clinsig) => {
                                createClinicalSignificanceEntity(entityVariant.Id, clinsig.PATHOLOGY_ID, myVariantJSON.clinvar.rcv.clinical_significance, myVariantJSON.clinvar.rcv.last_evaluated, myVariantJSON.clinvar.rcv.review_status)
                            });

                        } else {
                            console.log("multiple conditions without identifiers");
                            createClinicalSignificanceEntity(entityVariant.Id, null, myVariantJSON.clinvar.rcv.clinical_significance, myVariantJSON.clinvar.rcv.last_evaluated, myVariantJSON.clinvar.rcv.review_status)
                        }
                    });
                } else {
                    if (rcv.conditions.identifiers !== undefined) {
                        let resultset = databaseQuery("SELECT PATHOLOGY_ID FROM GENETYLLIS_PATHOLOGY WHERE PATHOLOGY_CUI = ?", [rcv.conditions.identifiers.medgen])

                        resultset.forEach((clinsig) => {
                            createClinicalSignificanceEntity(entityVariant.Id, clinsig.PATHOLOGY_ID, myVariantJSON.clinvar.rcv.clinical_significance, myVariantJSON.clinvar.rcv.last_evaluated, myVariantJSON.clinvar.rcv.review_status)
                        });

                    } else {
                        createClinicalSignificanceEntity(entityVariant.Id, null, myVariantJSON.clinvar.rcv.clinical_significance, myVariantJSON.clinvar.rcv.last_evaluated, myVariantJSON.clinvar.rcv.review_status)
                    }
                }
            });
        } else {
            //if rcv is a single entity
            let resultset = databaseQuery("SELECT PATHOLOGY_ID FROM GENETYLLIS_PATHOLOGY WHERE PATHOLOGY_CUI = ?", [myVariantJSON.clinvar.rcv.conditions.identifiers.medgen])

            resultset.forEach((clinsig) => {
                createClinicalSignificanceEntity(entityVariant.Id, clinsig.PATHOLOGY_ID, myVariantJSON.clinvar.rcv.clinical_significance, myVariantJSON.clinvar.rcv.last_evaluated, myVariantJSON.clinvar.rcv.review_status)
            });
        }
    }
}

function createClinicalSignificanceEntity(variantId, pathologyId, significance, evaluated, reviewSatus) {
    let entityClinicalSignificance = {};

    entityClinicalSignificance.VariantId = variantId;
    entityClinicalSignificance.PathologyId = pathologyId;
    entityClinicalSignificance.Significance = getSignificance(significance);
    entityClinicalSignificance.Evaluated = evaluated;
    entityClinicalSignificance.ReviewStatus = reviewSatus;
    entityClinicalSignificance.Update = Date.now;

    daoClinicalSignificance.create(entityClinicalSignificance);
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
        case "Likely bening":
            return 4;
        case "Bening":
            return 5;
        default:
            return null;
    }
}

function addAlleleFrequency(myVariantJSON, variantId) {
    console.log("ALLELE FREQ");

    let entityAlleleFrequency = {};
    entityAlleleFrequency.VariantId = variantId;

    //2022-07-27 07:19:42
    entityAlleleFrequency.Update = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (myVariantJSON.gnomad_genome !== undefined) {
        setFrequencyField(entityAlleleFrequency, myVariantJSON.gnomad_genome.af.af, 11, 1);
        setFrequencyField(entityAlleleFrequency, myVariantJSON.gnomad_genome.af.af_nfe_bgr, 11, 1);
        setFrequencyField(entityAlleleFrequency, myVariantJSON.gnomad_genome.af.af_nfe_male, 11, 1);
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
    console.log("VAR REC");
    let entityVariantRecord = {};
    entityVariantRecord.PatientId = patientId;
    entityVariantRecord.VariantId = variantId;
    entityVariantRecord.Quality = variantContext.getPhredScaledQual();

    let genotypes = variantContext.getGenotypes();
    entityVariantRecord.Homozygous = isHomozygous(genotypes);

    // entityVariantRecord.Homozygous = true; // TODO to be calculated -> AD - a:b, a:b:c;
    entityVariantRecord.AlleleDepth = genotypes[0].getAD[1]; // TODO to be created new variant if more than 2 AD elements are presents
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
    console.log("FILTER");
    let entityFilter = {};
    var filters = variantContext.getFilters();

    //TODO should null filters be added to DB
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

function databaseQuery(statement, args) {
    //args must be array
    return query.execute(
        statement,
        args,
        "local",
        "DefaultDB"
    );
}