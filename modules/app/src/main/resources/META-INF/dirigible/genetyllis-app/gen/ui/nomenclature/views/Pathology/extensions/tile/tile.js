/*
 * Copyright (c) 2010-2021 SAP and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 * Contributors:
 * SAP - initial API and implementation
 */

var dao = require("genetyllis-app/gen/dao/nomenclature/Pathology.js")

exports.getTile = function(relativePath) {
	let count = "n/a";
	try {
		count = dao.customDataCount();	
	} catch (e) {
		console.error("Error occured while involking 'genetyllis-app/gen/dao/nomenclature/Pathology.customDataCount()': " + e);
	}
	return {
		name: "Pathology",
		group: "nomenclature",
		icon: "flash",
		location: relativePath + "services/v4/web/genetyllis-app/gen/ui/nomenclature/index.html",
		count: count,
		order: "100"
	};
};
