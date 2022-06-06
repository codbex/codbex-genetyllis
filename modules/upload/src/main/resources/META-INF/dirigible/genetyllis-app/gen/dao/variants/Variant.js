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
var query = require("db/v4/query");
var producer = require("messaging/v4/producer");
var daoApi = require("db/v4/dao");

var dao = daoApi.create({
	table: "GENETYLLIS_VARIANT",
	properties: [
		{
			name: "Id",
			column: "VARIANT_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		}, {
			name: "HGVS",
			column: "VARIANT_HGVS",
			type: "VARCHAR",
		}, {
			name: "Chromosome",
			column: "VARIANT_CHROMOSOME",
			type: "VARCHAR",
		}, {
			name: "Position",
			column: "VARIANT_POSITION",
			type: "INTEGER",
		}, {
			name: "DBSNP",
			column: "VARIANT_DBSNP",
			type: "VARCHAR",
		}, {
			name: "Reference",
			column: "VARIANT_REFERENCE",
			type: "VARCHAR",
		}, {
			name: "Alternative",
			column: "VARIANT_ALTERNATIVE",
			type: "VARCHAR",
		}, {
			name: "GeneId",
			column: "VARIANT_GENEID",
			type: "INTEGER",
		}, {
			name: "Consequence",
			column: "VARIANT_CONSEQUENCE",
			type: "VARCHAR",
		}, {
			name: "ConsequenceDetails",
			column: "VARIANT_CONSEQUENCEDETAILS",
			type: "VARCHAR",
		}]
});

exports.list = function(settings) {
	return dao.list(settings);
};

exports.get = function(id) {
	return dao.find(id);
};

exports.create = function(entity) {
	var id = dao.insert(entity);
	triggerEvent("Create", {
		table: "GENETYLLIS_VARIANT",
		key: {
			name: "Id",
			column: "VARIANT_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	dao.update(entity);
	triggerEvent("Update", {
		table: "GENETYLLIS_VARIANT",
		key: {
			name: "Id",
			column: "VARIANT_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "GENETYLLIS_VARIANT",
		key: {
			name: "Id",
			column: "VARIANT_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	var resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM GENETYLLIS_VARIANT");
	if (resultSet !== null && resultSet[0] !== null) {
		if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
			return resultSet[0].COUNT;
		} else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
			return resultSet[0].count;
		}
	}
	return 0;
};

function triggerEvent(operation, data) {
	producer.queue("genetyllis-app/variants/Variant/" + operation).send(JSON.stringify(data));
}