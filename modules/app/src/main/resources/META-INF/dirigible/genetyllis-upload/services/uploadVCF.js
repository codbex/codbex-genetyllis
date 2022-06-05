var upload = require("http/v4/upload");
var request = require("http/v4/request");

if (request.getMethod() === "POST") {
    if (upload.isMultipartContent()) {
        var fileItems = upload.parseRequest();
        for (i = 0; i < fileItems.size(); i++) {
            var fileItem = fileItems.get(i);
            if (!fileItem.isFormField()) {
                // Getting the file name and bytes
                console.log("File Name: " + fileItem.getName());
                //console.log("File Bytes (as text): " + String.fromCharCode.apply(null, fileItem.getBytes()));
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