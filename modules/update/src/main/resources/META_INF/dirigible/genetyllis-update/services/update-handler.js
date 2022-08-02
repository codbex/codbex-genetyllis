var httpClient = require("http/v4/client");
var daoVariant = require("genetyllis-app/gen/dao/variants/Variant.js");
var updateVariantService = require("genetyllis-update/services/updateVariant.js");

if (isDatabaseUpdated()) {
    daoVariant.list().forEach(variant => {
        // console.log(variant.Id);
        //TODO remove if later
        if (variant.Id < 3)
            updateVariantService.updateTrigger(variant.Id);
        else return;
    });
}

function isDatabaseUpdated() {
    var httpResponse = httpClient.get("https://myvariant.info/v1/metadata");
    const myVariantJSON = JSON.parse(httpResponse.text);
    var lastBuildDate = new Date(myVariantJSON.build_date).getTime();
    // var lastBuildDate = new Date("2022-07-31T23:09:35.455Z").getTime();

    var currentTime = new Date().getTime()
    var timeDiffInDays = (currentTime - lastBuildDate) / (1000 * 3600 * 24)

    if (timeDiffInDays < 1)
        return true;
    else
        return false;
}
