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
const query = require("db/v4/query");
const producer = require("messaging/v4/producer");
const daoApi = require("db/v4/dao");
const EntityUtils = require("genetyllis-app/gen/dao/utils/EntityUtils");

let dao = daoApi.create({
	table: "GENETYLLIS_CLINICALSIGNIFICANCE",
	properties: [
		{
			name: "Id",
			column: "CLINICALSIGNIFICANCE_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Accession",
			column: "GENETYLLIS_CLINICALSIGNIFICANCE_ACCESSION",
			type: "VARCHAR",
		},
 {
			name: "VariantId",
			column: "CLINICALSIGNIFICANCE_VARIANTID",
			type: "INTEGER",
		},
 {
			name: "PathologyId",
			column: "CLINICALSIGNIFICANCE_PATHOLOGYID",
			type: "INTEGER",
		},
 {
			name: "SignificanceId",
			column: "CLINICALSIGNIFICANCE_SIGNIFICANCEID",
			type: "INTEGER",
		},
 {
			name: "Evaluated",
			column: "CLINICALSIGNIFICANCE_EVALUATED",
			type: "DATE",
		},
 {
			name: "ReviewStatus",
			column: "CLINICALSIGNIFICANCE_REVIEWSTATUS",
			type: "VARCHAR",
		},
 {
			name: "Updated",
			column: "CLINICALSIGNIFICANCE_UPDATED",
			type: "DATE",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setDate(e, "Evaluated");
		EntityUtils.setDate(e, "Updated");
		return e;
	});
};

exports.get = function(id) {
	let entity = dao.find(id);
	EntityUtils.setDate(entity, "Evaluated");
	EntityUtils.setDate(entity, "Updated");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setLocalDate(entity, "Evaluated");
	EntityUtils.setLocalDate(entity, "Updated");
	let id = dao.insert(entity);
	triggerEvent("Create", {
		table: "GENETYLLIS_CLINICALSIGNIFICANCE",
		key: {
			name: "Id",
			column: "CLINICALSIGNIFICANCE_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	// EntityUtils.setLocalDate(entity, "Evaluated");
	// EntityUtils.setLocalDate(entity, "Updated");
	dao.update(entity);
	triggerEvent("Update", {
		table: "GENETYLLIS_CLINICALSIGNIFICANCE",
		key: {
			name: "Id",
			column: "CLINICALSIGNIFICANCE_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "GENETYLLIS_CLINICALSIGNIFICANCE",
		key: {
			name: "Id",
			column: "CLINICALSIGNIFICANCE_ID",
			value: id
		}
	});
};

exports.count = function (VariantId) {
	let resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM GENETYLLIS_CLINICALSIGNIFICANCE WHERE CLINICALSIGNIFICANCE_VARIANTID = ?", [VariantId]);
	if (resultSet !== null && resultSet[0] !== null) {
		if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
			return resultSet[0].COUNT;
		} else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
			return resultSet[0].count;
		}
	}
	return 0;
};

exports.customDataCount = function() {
	let resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM GENETYLLIS_CLINICALSIGNIFICANCE");
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
	producer.queue("genetyllis-app/variants/ClinicalSignificance/" + operation).send(JSON.stringify(data));
}