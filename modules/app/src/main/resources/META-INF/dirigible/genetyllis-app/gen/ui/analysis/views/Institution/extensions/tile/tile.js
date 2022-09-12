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
var dao = require("genetyllis-app/gen/dao/analysis/Institution.js")

exports.getTile = function(relativePath) {
	let count = "n/a";
	try {
		count = dao.customDataCount();	
	} catch (e) {
		console.error("Error occured while involking 'genetyllis-app/gen/dao/analysis/Institution.customDataCount()': " + e);
	}
	return {
		name: "Institution",
		group: "analysis",
		icon: "file-o",
		location: relativePath + "services/v4/web/genetyllis-app/gen/ui/analysis/index.html",
		count: count,
		order: "100"
	};
};
