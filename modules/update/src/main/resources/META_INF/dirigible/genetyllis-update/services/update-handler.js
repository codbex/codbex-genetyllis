var daoVariant = require("genetyllis-app/gen/dao/variants/Variant.js");
var updateVariantService = require("genetyllis-update/services/updateVariant.js");

daoVariant.list().forEach(variant => {
    // console.log(variant.Id);
    if (variant.Id < 4)
        updateVariantService.updateTrigger(variant.Id);
    else return;
});
