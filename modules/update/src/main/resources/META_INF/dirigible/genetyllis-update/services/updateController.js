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
var request = require("http/v4/request");
var updateVariantService = require("genetyllis-update/services/updateVariant.js");

if (request.getMethod() === "POST") {
    const body = request.getJSON();
    let variantId = body.variantId;

    updateVariantService.updateTrigger(variantId);
} else if (request.getMethod() === "GET") {
    console.warn("Use POST request.");
}