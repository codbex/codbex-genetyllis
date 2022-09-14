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

var filterSql = "";
var filterSqlParams = [];
var useWhere = true;

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
			name: "Start",
			column: "VARIANT_START",
			type: "INTEGER",
		}, {
			name: "End",
			column: "VARIANT_END",
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
			name: "Region",
			column: "GENETYLLIS_VARIANT_REGION",
			type: "VARCHAR",
		}, {
			name: "RegionNum",
			column: "GENETYLLIS_VARIANT_REGIONNUM",
			type: "VARCHAR",
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

exports.list = function (settings) {
	return dao.list(settings);
};

exports.get = function (id) {
	return dao.find(id);
};

exports.create = function (entity) {
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

exports.update = function (entity) {
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

exports.delete = function (id) {
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

exports.count = function () {
	return dao.count();
};

exports.customDataCount = function () {
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

exports.filterVariants = function (variant) {

	initFilterSql();

	var response = {};
	var countSql = "";
	buildFilterSql(variant.GENETYLLIS_VARIANT);
	buildFilterSql(variant.GENETYLLIS_GENE);
	buildFilterSql(variant.GENETYLLIS_PATHOLOGY);
	buildFilterSql(variant.GENETYLLIS_SIGNIFICANCE);
	buildFilterSql(variant.GENETYLLIS_ALLELEFREQUENCY);

	countSql += filterSql;

	filterSql += " LIMIT " + variant.perPage + " OFFSET " + variant.currentPage;

	var resultSet = query.execute(filterSql, filterSqlParams);

	countSql = "SELECT COUNT(DISTINCT GV.VARIANT_ID)" + countSql.slice(20);

	var resultSetCount = query.execute(countSql, filterSqlParams);

	response.data = resultSet;
	response.totalItems = resultSetCount[0]["COUNT(DISTINCT GV.VARIANT_ID)"];
	response.totalPages = Math.floor(response.totalItems / variant.perPage) + (response.totalItems % variant.perPage == 0 ? 0 : 1);

	response.data.forEach(variantResult => {
		var params = [];
		params.push(variantResult.VARIANT_ID)

		variantResult.clinicalSignificance = loadClinicalSignificance(params);
		variantResult.alleleFrequency = loadAlleleFrequency(params);

		params = [];
		params.push(variantResult.VARIANT_GENEID);
		variantResult.genes = loadGenes(params);
	})

	filterSql = "";

	return response;
}

function loadClinicalSignificance(params) {
	var clinicalSignificances = query.execute("SELECT * FROM GENETYLLIS_CLINICALSIGNIFICANCE WHERE CLINICALSIGNIFICANCE_VARIANTID = ?", params);

	clinicalSignificances.forEach(clinicalSignificance => {
		var clinicalParams = [];
		clinicalParams.push(clinicalSignificance.CLINICALSIGNIFICANCE_PATHOLOGYID)
		clinicalSignificance.pathology = query.execute("SELECT * FROM GENETYLLIS_PATHOLOGY WHERE PATHOLOGY_ID = ?", clinicalParams);

		clinicalParams = [];
		clinicalParams.push(clinicalSignificance.CLINICALSIGNIFICANCE_SIGNIFICANCEID)
		clinicalSignificance.significance = query.execute("SELECT * FROM GENETYLLIS_SIGNIFICANCE WHERE SIGNIFICANCE_ID = ?", clinicalParams);
	})
}

function loadAlleleFrequency(params) {
	return query.execute("SELECT * FROM GENETYLLIS_ALLELEFREQUENCY WHERE ALLELEFREQUENCY_VARIANTID = ?", params);
}

function loadGenes(params) {
	return query.execute("SELECT * FROM GENETYLLIS_GENE WHERE GENE_ID = ?", params);
}

function buildFilterSql(object) {
	var keys = Object.keys(object);
	for (var i = 0; i < keys.length; i++) {
		var val = object[keys[i]];
		if (Array.isArray(val) ? (val.length > 0) : (val !== undefined && val !== '' && val !== null)) {
			if (useWhere) {
				filterSql += " WHERE ";
			} else {
				filterSql += " AND ";
			}

			condition = "";
			if (Array.isArray(val)) {
				condition = keys[i] + addArrayValuesToSql(val);

			} else if (keys[i].toString().endsWith('_TO')) {
				condition = keys[i].slice(0, -3) + " <= ?";
				addFilterParam(val);

			} else if (keys[i].toString().endsWith('_FROM')) {
				condition = keys[i].slice(0, -5) + " >= ?";
				addFilterParam(val);

			} else {
				condition = keys[i] + " = ?";
				addFilterParam(val);
			}

			filterSql += condition;
			useWhere = false;
		}
	}

	return filterSql;
}

function addArrayValuesToSql(array) {
	var inStatement = " IN (";
	array.forEach(element => {
		inStatement += "?,";
		addFilterParam(element);
	})

	inStatement = inStatement.slice(0, -1)
	inStatement += ")";

	return inStatement;
}

function initFilterSql() {
	useWhere = true;
	filterSqlParams = [];
	filterSql = "SELECT DISTINCT GV.* FROM GENETYLLIS_VARIANT GV " +
		"LEFT JOIN GENETYLLIS_GENE GG ON GV.VARIANT_GENEID = GG.GENE_ID " +
		"LEFT JOIN GENETYLLIS_CLINICALSIGNIFICANCE GC ON GV.VARIANT_ID = GC.CLINICALSIGNIFICANCE_VARIANTID " +
		"LEFT JOIN GENETYLLIS_PATHOLOGY GP ON GC.CLINICALSIGNIFICANCE_PATHOLOGYID = GP.PATHOLOGY_ID " +
		"LEFT JOIN GENETYLLIS_SIGNIFICANCE GS ON GC.CLINICALSIGNIFICANCE_SIGNIFICANCEID = GS.SIGNIFICANCE_ID " +
		"LEFT JOIN GENETYLLIS_ALLELEFREQUENCY GA ON GV.VARIANT_ID = GA.ALLELEFREQUENCY_VARIANTID";
}

function addFilterParam(param) {
	if (isNaN(param)) {
		filterSqlParams.push(param.toString());
	} else {
		filterSqlParams.push(param);
	}
}

function triggerEvent(operation, data) {
	producer.queue("genetyllis-app/variants/Variant/" + operation).send(JSON.stringify(data));
}
