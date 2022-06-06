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

if (request.getMethod() === "POST") {
    if (upload.isMultipartContent()) {
        var fileItems = upload.parseRequest();
        for (i = 0; i < fileItems.size(); i++) {
            var fileItem = fileItems.get(i);
            if (!fileItem.isFormField()) {

                console.log("File Name: " + fileItem.getName());

                var tempFile = files.createTempFile("genetyllis", ".vcf");
                try {
                    processVCFFile(tempFile, fileItem.getBytes());
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

function processVCFFile(fileName, content) {
    console.log("Temp file: " + fileName);
    files.writeBytes(fileName, content);
    var vcfReader = parser.createVCFFileReader(tempFile);
    var vcfHeader = vcfReader.getFileHeader();
    console.log('Column Count: ' + vcfHeader.getColumnCount());
    console.log('VCF Header Version: ' + vcfHeader.getVCFHeaderVersion());
    console.log('SAM Sequence Record: ' + vcfHeader.getSAMSequenceRecord());

    let lines = vcfHeader.getContigLines();
    lines.forEach(function (line) {
        console.log('Contig ID: ' + line.getID());
        console.log('Contig Key: ' + line.getKey());
        console.log('Contig Value: ' + line.getValue());
        console.log('Contig Index ' + line.getContigIndex());
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