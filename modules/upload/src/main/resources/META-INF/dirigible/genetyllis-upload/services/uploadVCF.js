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
                // Getting the file name and bytes
                console.log("File Name: " + fileItem.getName());
                //console.log("File Bytes (as text): " + String.fromCharCode.apply(null, fileItem.getBytes()));

                var tempFile = files.createTempFile("genetyllis", ".vcf");
                try {
                    console.log("Temp file: " + tempFile);
                    files.writeBytes(tempFile, fileItem.getBytes());
                    var vcfReader = parser.createVCFFileReader(tempFile);
                    var vcfHeader = vcfReader.getFileHeader();
                    console.log('------------- ' + vcfHeader.getColumnCount());
                } finally {
                    files.deleteFile(tempFile);
                }
            } else {
                // Getting the headers
                var fileItemHeaders = fileItem.getHeaders();
                var fileItemHeaderNames = fileItemHeaders.getHeaderNames();

                var fieldHeaders = {};
                for (j = 0; j < fileItemHeaderNames.size(); j++) {
                    var headerName = fileItemHeaderNames.get(j);
                    var headerValue = fileItemHeaders.getHeader(headerName);
                    fieldHeaders[headerName] = headerValue;
                }
                console.log("Field Headers: " + JSON.stringify(fieldHeaders));

                // Getting the field name and value
                console.log("Field Name: " + fileItem.getFieldName());
                console.log("Field Text: " + fileItem.getText());
            }
        }
    } else {
        console.error("The request's content must be 'multipart'");
    }
} else if (request.getMethod() === "GET") {
    console.warn("Use POST request.");
}