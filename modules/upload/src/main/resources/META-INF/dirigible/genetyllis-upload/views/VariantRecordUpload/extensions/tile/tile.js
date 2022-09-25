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
var dao = require("genetyllis-app/gen/dao/records/VariantRecord.js")

exports.getTile = function (relativePath) {
	let count = "n/a";
	try {
		count = dao.count();
	} catch (e) {
		console.error("Error occured while involking 'genetyllis-pages/Home-page/services/dao/records/VariantRecord.count()': " + e);
	}
	return {
		name: "VariantRecordUpload",
		group: "records",
		icon: "upload",
		location: relativePath + "services/v4/web/genetyllis-app/gen/ui/records/index.html",
		count: count,
		order: "10"
	};
};
