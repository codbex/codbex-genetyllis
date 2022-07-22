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
var EntityUtils = require("genetyllis-app/gen/dao/utils/EntityUtils");

var dao = daoApi.create({
	table: "GENETYLLIS_GENE",
	properties: [
		{
			name: "Id",
			column: "GENE_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		}, {
			name: "GeneId",
			column: "GENE_GENEID",
			type: "INTEGER",
		}, {
			name: "Name",
			column: "GENE_NAME",
			type: "VARCHAR",
		}, {
			name: "Pseudo",
			column: "GENE_PSEUDO",
			type: "BOOLEAN",
		}]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setBoolean(e, "Pseudo");
		return e;
	});
};

exports.get = function(id) {
	var entity = dao.find(id);
	EntityUtils.setBoolean(entity, "Pseudo");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setBoolean(entity, "Pseudo");
	var id = dao.insert(entity);
	triggerEvent("Create", {
		table: "GENETYLLIS_GENE",
		key: {
			name: "Id",
			column: "GENE_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	EntityUtils.setBoolean(entity, "Pseudo");
	dao.update(entity);
	triggerEvent("Update", {
		table: "GENETYLLIS_GENE",
		key: {
			name: "Id",
			column: "GENE_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "GENETYLLIS_GENE",
		key: {
			name: "Id",
			column: "GENE_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	var resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM GENETYLLIS_GENE");
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
	producer.queue("genetyllis-app/genes/Gene/" + operation).send(JSON.stringify(data));
}