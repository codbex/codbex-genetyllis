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
var parser = require("genetyllis-parser/vcf/parser");
var files = require("io/v4/files");
var daoVariantRecord = require("genetyllis-app/gen/dao/records/VariantRecord");
var daoVariant = require("genetyllis-app/gen/dao/variants/Variant");
var daoFilter = require("genetyllis-app/gen/dao/records/Filter");
var daoGene = require("genetyllis-app/gen/dao/genes/Gene");

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
    console.log("Temp file: " + fileName);
    files.writeBytes(fileName, content);
    var vcfReader = parser.createVCFFileReader(tempFile);


    let iteratorVariants = vcfReader.getVariantContextIterator();
    while (iteratorVariants.hasNext()) {
        let variantContext = iteratorVariants.next();
        let genotypes = variantContext.getGenotypes();
        for (i in genotypes) {
            let genotype = genotypes[i];
            console.log('Genotype DP: ' + genotype.getDP());
        }
    }

    var vcfHeader = vcfReader.getFileHeader();
    console.log('Column Count: ' + vcfHeader.getColumnCount());
    console.log('VCF Header Version: ' + vcfHeader.getVCFHeaderVersion());


    let lines = vcfHeader.getContigLines();
    lines.forEach(function (line) {
        console.log('Contig ID: ' + line.getID());
        console.log('Contig Key: ' + line.getKey());
        console.log('Contig Value: ' + line.getValue());
        console.log('Contig Index ' + line.getContigIndex());
        console.log('Contig SAM Sequence Record: ' + line.getSAMSequenceRecord());
        const fields = line.getGenericFields();
        fields.forEach(function (value, key) {
            console.log('    Contig Generic Field-Key: ' + key);
            console.log('    Contig Generic Field-Value: ' + value);
        })
    });

    lines = vcfHeader.getFilterLines();
    lines.forEach(function (line) {
        console.log('Filter ID: ' + line.getID());
        console.log('Filter Key: ' + line.getKey());
        console.log('Filter Value: ' + line.getValue());
        const fields = line.getGenericFields();
        fields.forEach(function (value, key) {
            console.log('    Filter Generic Field-Key: ' + key);
            console.log('    Filter Generic Field-Value: ' + value);
        })
    });
}