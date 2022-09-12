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
var httpClient = require("http/v4/client");
var daoVariant = require("genetyllis-app/gen/dao/variants/Variant.js");
var updateVariantService = require("genetyllis-update/services/updateVariant.js");

if (isDatabaseUpdated()) {
    daoVariant.list().forEach(variant => {
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
    // var lastBuildDate = new Date("2022-08-04T07:32:10.105Z").getTime();

    var currentTime = new Date().getTime()
    var timeDiffInDays = (currentTime - lastBuildDate) / (1000 * 3600 * 24)

    if (timeDiffInDays < 1)
        return true;
    else
        return false;
}
