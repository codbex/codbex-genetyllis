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
var response = require("http/v4/response");
var daoVariantRecord = require("genetyllis-app/gen/dao/records/VariantRecord");
var daoVariant = require("genetyllis-app/gen/dao/variants/Variant");
var daoGene = require("genetyllis-app/gen/dao/genes/Gene");
var daoFilter = require("genetyllis-app/gen/dao/records/Filter");
var daoClinicalSignificane = require("genetyllis-app/gen/dao/variants/ClinicalSignificance");
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
                    processVCFFile(tempFile, fileItem.getBytes(), patientId);
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
    patientId = 3;
    console.log("Temp file: " + fileName);
    files.writeBytes(fileName, content);
    var vcfReader = parser.createVCFFileReader(tempFile);


    let iteratorVariants = vcfReader.getVariantContextIterator();
    while (iteratorVariants.hasNext()) {
        let variantContext = iteratorVariants.next();

        // TODO if (variantContext.getAlternateAlleles().size() > 1)

        //VARIANT
        let entityVariant = {};
        // <chr>+":"+"g."+<pos><ref allele>+">"+"alt allele" -> chr1:g.10316791A>C
        //TODO replace %3E with > later
        entityVariant.HGVS = variantContext.getContig() + ":" + "g."
            + variantContext.getStart() + variantContext.getReferenceBaseString()
            + "%3E" + variantContext.getAlternateAlleles()[0].getBaseString();
        entityVariant.Chromosome = variantContext.getContig(); // chr1
        entityVariant.Start = variantContext.getStart(); // 10316791
        entityVariant.End = variantContext.getEnd(); // 10316791
        entityVariant.DBSNP = variantContext.getID(); // rs1264383
        entityVariant.Reference = variantContext.getReferenceBaseString(); // A
        entityVariant.Alternative = variantContext.getAlternateAlleles()[0].getBaseString() // C

        entityVariant.Id = daoVariant.create(entityVariant);

        console.log(entityVariant.HGVS);

        var httpResponse = httpClient.get("https://myvariant.info/v1/variant/" + entityVariant.HGVS);

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
            if (myVariantJSON.dbsnp.gene !== undefined) {
                console.log("GENE");
                let entityGene = {};
                entityGene.GeneId = myVariantJSON.dbsnp.gene.geneid;
                //TODO change later to include full string
                entityGene.Name = JSON.stringify(myVariantJSON.dbsnp.gene.name).substring(0, 19);
                entityGene.Pseudo = myVariantJSON.dbsnp.gene.is_pseudo;

                entityVariant.GeneId = daoGene.create(entityGene);
                console.log("gene id" + entityVariant.GeneId);
                daoVariant.update(entityVariant)
            }
            else {
                entityVariant.GeneId = null;
                daoVariant.update(entityVariant);
            }

            //CLINICAL SIGNIFICANCE
            if (myVariantJSON.clinvar !== undefined && myVariantJSON.clinvar.rcv !== undefined) {
                console.log("CLINSIG");
                var rcvArray = myVariantJSON.clinvar.rcv;

                if (rcvArray.length !== undefined) {
                    rcvArray.forEach(rcv => {
                        var statement = "SELECT PATHOLOGY_ID FROM GENETYLLIS_PATHOLOGY WHERE PATHOLOGY_CUI = ?";
                        var resultset = query.execute(statement, [rcv.conditions.identifiers.medgen], "local", "DefaultDB");
                        console.log("resultset:");
                        console.log(resultset);

                        // while (resultset.next()) {
                        resultset.forEach(clinsig => {
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

                            entityClinicalSignificance.Evaluated = myVariantJSON.clinvar.rcv.last_evaluated;
                            entityClinicalSignificance.ReviewStatus = myVariantJSON.clinvar.rcv.review_status;
                            entityClinicalSignificance.Update = Date.now;

                            daoClinicalSignificane.create(entityClinicalSignificance);
                        });
                    });
                }
                else {
                    //if rcv is a single entity
                    var statement = "SELECT PATHOLOGY_ID FROM GENETYLLIS_PATHOLOGY WHERE PATHOLOGY_CUI = ?";
                    var resultset = query.execute(statement, [rcv.conditions.identifiers.medgen], "local", "DefaultDB");

                    while (resultset.next()) {
                        let entityClinicalSignificance = {};
                        entityClinicalSignificance.VariantId = entityVariant.Id;
                        entityClinicalSignificance.PathologyId = resultset.PATHOLOGY_ID;
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

                        daoClinicalSignificane.create(entityClinicalSignificance);
                    }
                }
            }

            //ALLELE FREQUENCY
            console.log("ALLELE FREQ");
            let entityAlleleFrequency = {};
            entityAlleleFrequency.VariantId = entityVariant.Id;

            var statement = "SELECT PATIENT_GENDERID FROM GENETYLLIS_PATIENT WHERE PATIENT_ID = ?";
            var resultset = query.execute(statement, [patientId], "local", "DefaultDB");

            entityAlleleFrequency.GenderId = resultset.PATIENT_GENDERID;

            entityAlleleFrequency.Update = Date.now;

            if (myVariantJSON.gnomad_genome.af.af !== undefined) {
                entityAlleleFrequency.PopulationId = 12;
                entityAlleleFrequency.Frequency = myVariantJSON.gnomad_genome.af.af;
                daoAlleleFreqeuncy.create(entityAlleleFrequency);
            }

            if (myVariantJSON.gnomad_genome.af.af_nfe_bgr !== undefined) {
                entityAlleleFrequency.PopulationId = 12;
                entityAlleleFrequency.Frequency = myVariantJSON.gnomad_genome.af.af_nfe_bgr;
                daoAlleleFreqeuncy.create(entityAlleleFrequency);
            }

        }
        else {
            entityVariant.GeneId = null;
            entityVariant.Region = "";
            entityVariant.RegionNum = "";
            entityVariant.Consequence = "";
            entityVariant.ConsequenceDetails = "";
            // variantId = daoVariant.create(entityVariant);
            daoVariant.update(entityVariant);
        }

        //VARIANT RECORD
        console.log("VAR REC");
        let entityVariantRecord = {};
        entityVariantRecord.PatientId = patientId;
        entityVariantRecord.VariantId = entityVariant.Id;
        entityVariantRecord.Quality = variantContext.getPhredScaledQual();

        let genotypes = variantContext.getGenotypes();
        if (genotypes[0].getAD().length == 2) {
            var a = genotypes[0].getAD()[0];
            var b = genotypes[0].getAD()[1];

            if (a / (a + b) >= 0.8 || b / (a + b) >= 0.8)
                entityVariantRecord.Homozygous = true;
            else if (b / (a + b) > 0.2 && b / (a + b) < 0.8)
                entityVariantRecord.Homozygous = false;
        }
        else if (genotypes[0].getAD().length == 3) {
            var a = genotypes[0].getAD()[0];
            var b = genotypes[0].getAD()[1];
            var c = genotypes[0].getAD()[2];

            if ((b / (a + b + c) >= 0.6 && a / (a + b + c) < 0.2 && c / (a + b + c) < 0.2) || (c / (a + b + c) >= 0.6 && a / (a + b + c) < 0.2) && b / (a + b + c) < 0.2)
                entityVariantRecord.Homozygous = true;
            else if ((b / (a + b + c) > 0.2 && b / (a + b + c) < 0.6 && a / (a + b + c) > 0.2 && a / (a + b + c) < 0.6) || (c / (a + b + c) > 0.2 && c / (a + b + c) < 0.6 && a / (a + b + c) > 0.2 && a / (a + b + c) < 0.6) || (b / (a + b + c) > 0.2 && b / (a + b + c) < 0.6 && c / (a + b + c) > 0.2 && c / (a + b + c) < 0.6))
                entityVariantRecord.Homozygous = false;
        }

        // entityVariantRecord.Homozygous = true; // TODO to be calculated -> AD - a:b, a:b:c;
        entityVariantRecord.AlleleDepth = genotypes[0].getAD[1]; // TODO to be created new variant if more than 2 AD elements are presents
        entityVariantRecord.Depth = genotypes[0].getDP();
        entityVariantRecord.AnalysisId = null;
        var variantRecordId = daoVariantRecord.update(entityVariantRecord);

        //FILTER
        console.log("FILTER");
        let entityFilter = {};
        var filters = variantContext.getFilters();

        filters.forEach(filter => {
            if (filter) {
                entityFilter.Name = "";
                entityFilter.VariantRecordId = variantRecordId;

                daoFilter.create(entityFilter);
            }
        });


        break;
    }

    response.flush();
    response.close();
}