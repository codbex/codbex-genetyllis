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
const dao = require("genetyllis-app/gen/dao/variants/Variant");

var filterSql = "";
var filterSqlParams = [];
var useWhere = true;

exports.list = function (settings) {
	return dao.list(settings);
};

exports.get = function (id) {
	return dao.get(id);
};

exports.create = function (entity) {
	return dao.create(entity);
};

exports.update = function (entity) {
	dao.update(entity);
};

exports.delete = function (id) {
	dao.delete(id);
};

exports.count = function () {
	return dao.count();
};

exports.filterVariants = function (variant) {

	initFilterSql();
	var response = {};
	var countSql = "";
	if (variant.GENETYLLIS_VARIANT) {
		buildFilterSql(variant.GENETYLLIS_VARIANT);

	}
	if (variant.GENETYLLIS_GENE) {
		buildFilterSql(variant.GENETYLLIS_GENE);

	}
	if (variant.GENETYLLIS_PATHOLOGY) {
		buildFilterSql(variant.GENETYLLIS_PATHOLOGY);
	}
	if (variant.GENETYLLIS_SIGNIFICANCE) {
		buildFilterSql(variant.GENETYLLIS_SIGNIFICANCE);

	}
	if (variant.GENETYLLIS_ALLELEFREQUENCY) {
		buildFilterSql(variant.GENETYLLIS_ALLELEFREQUENCY);

	}

	countSql += filterSql;

	filterSql += " LIMIT " + variant.perPage + " OFFSET " + variant.currentPage;

	var resultSet = query.execute(filterSql, filterSqlParams);

	countSql = 'SELECT COUNT(DISTINCT GV."VARIANT_ID") AS "COUNT"' + countSql.slice(20);

	var resultSetCount = query.execute(countSql, filterSqlParams);

	response.data = resultSet;
	response.totalItems = resultSetCount[0]["COUNT"];
	response.totalPages = Math.floor(response.totalItems / variant.perPage) + (response.totalItems % variant.perPage == 0 ? 0 : 1);

	let variantIds = response.data.map(foundVariant => foundVariant.VARIANT_ID);
	let variantIdsInStatement = addArrayValuesToSql(variantIds);

	/* LOAD CLINICALSIGNIFICANCE AND PATHOLOGY */
	let clinicalSignificanceQuery = 'SELECT * FROM "GENETYLLIS_CLINICALSIGNIFICANCE" WHERE "CLINICALSIGNIFICANCE_VARIANTID"' + variantIdsInStatement;
	let clinicalSignificance = query.execute(clinicalSignificanceQuery, variantIds);

	let pathologyIds = clinicalSignificance.map(significance => significance.CLINICALSIGNIFICANCE_PATHOLOGYID);
	let pathologyResult = [];
	if (pathologyIds.length > 0) {
		let pathologyIdsInStatement = addArrayValuesToSql(pathologyIds);
		let pathologyQuery = 'SELECT * FROM "GENETYLLIS_PATHOLOGY" WHERE "PATHOLOGY_ID"' + pathologyIdsInStatement;
		pathologyResult = query.execute(pathologyQuery, pathologyIds);
	}

	/* MAP PATHOLOGY TO CLINICALSIGNIFICANCE */
	clinicalSignificance.forEach(significance => {
		significance.pathology = pathologyResult.filter(pathology => pathology.PATHOLOGY_ID === significance.CLINICALSIGNIFICANCE_PATHOLOGYID)
	})

	/* LOAD ALLELEFREQUENCY */
	let alleleFrequencyQuery = 'SELECT * FROM "GENETYLLIS_ALLELEFREQUENCY" WHERE "ALLELEFREQUENCY_VARIANTID"' + variantIdsInStatement;
	let alleleFrequency = query.execute(alleleFrequencyQuery, variantIds);

	/* LOAD GENES */
	let geneIds = response.data.map(foundVariant => foundVariant.VARIANT_GENEID);
	let geneIdsInStatement = addArrayValuesToSql(geneIds);
	let geneQuery = 'SELECT * FROM "GENETYLLIS_GENE" WHERE "GENE_ID"' + geneIdsInStatement;
	let genes = query.execute(geneQuery, geneIds);

	/* MAP CLINICALSIGNIFICANCE, ALLELEFREQUENCY AND GENES TO VARIANT */
	response.data.forEach(foundVariant => {
		foundVariant.clinicalSignificance = clinicalSignificance.filter(significance => significance.CLINICALSIGNIFICANCE_VARIANTID === foundVariant.VARIANT_ID);
		foundVariant.alleleFrequency = alleleFrequency.filter(allele => allele.ALLELEFREQUENCY_VARIANTID === foundVariant.VARIANT_ID);
		foundVariant.genes = genes.filter(gene => gene.GENE_ID === foundVariant.VARIANT_GENEID);
	})

	filterSql = "";

	return response;
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
				condition = "LOWER(" + keys[i] + ") " + addArrayValuesToSql(val);

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
	filterSql = 'SELECT DISTINCT GV.* FROM "GENETYLLIS_VARIANT" GV ' +
		'LEFT JOIN "GENETYLLIS_GENE" GG ON GV."VARIANT_GENEID" = GG."GENE_ID" ' +
		'LEFT JOIN "GENETYLLIS_CLINICALSIGNIFICANCE" GC ON GV."VARIANT_ID" = GC."CLINICALSIGNIFICANCE_VARIANTID" ' +
		'LEFT JOIN "GENETYLLIS_PATHOLOGY" GP ON GC."CLINICALSIGNIFICANCE_PATHOLOGYID" = GP."PATHOLOGY_ID" ' +
		'LEFT JOIN "GENETYLLIS_SIGNIFICANCE" GS ON GC."CLINICALSIGNIFICANCE_SIGNIFICANCEID" = GS."SIGNIFICANCE_ID" ' +
		'LEFT JOIN "GENETYLLIS_ALLELEFREQUENCY" GA ON GV."VARIANT_ID" = GA."ALLELEFREQUENCY_VARIANTID"';
}

function addFilterParam(param) {
	if (isNaN(param)) {
		filterSqlParams.push(param.toString().toLowerCase());
	} else {
		filterSqlParams.push(param);
	}
}
