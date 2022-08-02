var request = require("http/v4/request");
var updateVariantService = require("genetyllis-update/services/updateVariant.js");

if (request.getMethod() === "POST") {
    const body = request.getJSON();
    let variantId = body.variantId;

    updateVariantService.updateTrigger(variantId);
} else if (request.getMethod() === "GET") {
    console.warn("Use POST request.");
}