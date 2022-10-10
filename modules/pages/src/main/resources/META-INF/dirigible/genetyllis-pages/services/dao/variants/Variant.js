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

exports.filterVariantsPatientDetails = function (variant) {

	initPatientDetailsSql();
	let response = {};
	let countSql = "";

	buildFilterSql(variant.GENETYLLIS_PATIENT);
	if (variant.GENETYLLIS_VARIANT) {
		buildFilterSql(variant.GENETYLLIS_VARIANT);
	}

	if (variant.GENETYLLIS_GENE) {
		buildFilterSql(variant.GENETYLLIS_GENE);
	}

	if (variant.GENETYLLIS_PATHOLOGY) {
		buildFilterSql(variant.GENETYLLIS_PATHOLOGY);
	}

	if (variant.GENETYLLIS_ANALYSIS) {
		buildFilterSql(variant.GENETYLLIS_ANALYSIS);
	}

	if (variant.GENETYLLIS_ALLELEFREQUENCY) {
		buildFilterSql(variant.GENETYLLIS_ALLELEFREQUENCY);
	}

	if (variant.GENETYLLIS_SIGNIFICANCE) {
		buildFilterSql(variant.GENETYLLIS_SIGNIFICANCE);
	}

	countSql += filterSql;
	filterSql += " LIMIT " + variant.perPage + " OFFSET " + variant.currentPage;

	let resultSet = query.execute(filterSql, filterSqlParams);
	countSql = 'SELECT COUNT(DISTINCT GV."VARIANT_ID") AS "COUNT"' + countSql.slice(20);
	let resultSetCount = query.execute(countSql, filterSqlParams);

	response.data = resultSet;
	response.totalItems = resultSetCount[0]["COUNT"];
	response.totalPages = Math.floor(response.totalItems / variant.perPage) + (response.totalItems % variant.perPage == 0 ? 0 : 1);

	let variantIds = response.data.map(foundVariant => foundVariant.VARIANT_ID);
	let variantIdsInStatement = addArrayValuesToSql(variantIds, false);
	if (variantIds.length > 0) {

		/* LOAD CLINICALSIGNIFICANCE AND PATHOLOGY */
		let clinicalSignificanceQuery = 'SELECT * FROM "GENETYLLIS_CLINICALSIGNIFICANCE" WHERE "CLINICALSIGNIFICANCE_VARIANTID"' + variantIdsInStatement;
		let clinicalSignificance = query.execute(clinicalSignificanceQuery, variantIds);
		let clinicalSignificancePathologyIds = clinicalSignificance.map(significance => significance.CLINICALSIGNIFICANCE_PATHOLOGYID);

		/* LOAD GENES */
		let geneIds = response.data.map(foundVariant => foundVariant.VARIANT_GENEID);
		let geneIdsInStatement = addArrayValuesToSql(geneIds, false);
		let geneQuery = 'SELECT * FROM "GENETYLLIS_GENE" WHERE "GENE_ID"' + geneIdsInStatement;
		let genes = query.execute(geneQuery, geneIds);

		/* LOAD VARIANTRECORD */
		let variantRecordQuery = 'SELECT * FROM "GENETYLLIS_VARIANTRECORD" WHERE "VARIANTRECORD_VARIANTID"' + variantIdsInStatement;
		let variantRecords = query.execute(variantRecordQuery, variantIds);

		/* LOAD PATIENTS */
		let patientsQuery = 'SELECT * FROM "GENETYLLIS_PATIENT" WHERE "PATIENT_ID" = ?';
		let patients = query.execute(patientsQuery, [variant.GENETYLLIS_PATIENT.PATIENT_ID]);

		/* LOAD FAMILYHISTORY */
		let familyHistoryQuery = 'SELECT * FROM "GENETYLLIS_FAMILYHISTORY" WHERE "FAMILYHISTORY_PATIENTID" = ?';
		let familyHistory = query.execute(familyHistoryQuery, [variant.GENETYLLIS_PATIENT.PATIENT_ID]);
		let familyPatientIds = familyHistory.map(member => member.FAMILYHISTORY_FAMILYMEMBERID);

		/* LOAD CLINICALHISTORY AND PATHOLOGY */
		familyPatientIds.push(variant.GENETYLLIS_PATIENT.PATIENT_ID);
		let familyAndPatientIdsInStatement = addArrayValuesToSql(familyPatientIds, false);
		let clinicalHistoryQuery = 'SELECT * FROM "GENETYLLIS_CLINICALHISTORY" WHERE "CLINICALHISTORY_PATIENTID"' + familyAndPatientIdsInStatement;
		let clinicalHistory = query.execute(clinicalHistoryQuery, familyPatientIds);
		let pathologyIds = clinicalHistory.map(memberHistory => memberHistory.CLINICALHISTORY_PATHOLOGYID);
		pathologyIds = pathologyIds.concat(clinicalSignificancePathologyIds);
		let pathologyResult = [];
		if (pathologyIds.length > 0) {
			let pathologyIdsInStatement = addArrayValuesToSql(pathologyIds, false);
			let pathologyQuery = 'SELECT * FROM "GENETYLLIS_PATHOLOGY" WHERE "PATHOLOGY_ID"' + pathologyIdsInStatement;
			pathologyResult = query.execute(pathologyQuery, pathologyIds);
		}

		/* MAP PATHOLOGY TO CLINICALSIGNIFICANCE */
		clinicalSignificance.forEach(significance => {
			significance.pathology = pathologyResult.filter(pathology => pathology.PATHOLOGY_ID === significance.CLINICALSIGNIFICANCE_PATHOLOGYID)
		})

		/* MAP PATHOLOGY TO CLINICALHISTORY */
		clinicalHistory.forEach(history => {
			history.pathology = pathologyResult.filter(pathology => pathology.PATHOLOGY_ID === history.CLINICALHISTORY_PATHOLOGYID)
		})

		/* MAP CLINICALHISTORY TO FAMILYHISTORY */
		familyHistory.forEach(member => {
			member.clinicalHistory = clinicalHistory.filter(history => history.CLINICALHISTORY_PATIENTID === member.FAMILYHISTORY_FAMILYMEMBERID)
		})

		/* MAP CLINICALHISTORY TO THE SINGLE PATIENT */
		patients[0].clinicalHistory = clinicalHistory.filter(history => history.CLINICALHISTORY_PATIENTID === patients[0].PATIENT_ID)
		patients[0].familyHistory = familyHistory;

		/* MAP PATIENTS TO VARIANTRECORD */
		variantRecords.forEach(variantRecord => {
			variantRecord.patients = patients.filter(patient => patient.PATIENT_ID === variantRecord.VARIANTRECORD_PATIENTID)
		})

		/* LOAD ALLELEFREQUENCY */
		let alleleFrequencyQuery = 'SELECT * FROM "GENETYLLIS_ALLELEFREQUENCY" WHERE "ALLELEFREQUENCY_VARIANTID"' + variantIdsInStatement;
		let alleleFrequency = query.execute(alleleFrequencyQuery, variantIds);

		/* MAP CLINICALSIGNIFICANCE, ALLELEFREQUENCY, GENES AND VARIANTRECORD TO VARIANT */
		response.data.forEach(foundVariant => {
			foundVariant.clinicalSignificance = clinicalSignificance.filter(significance => significance.CLINICALSIGNIFICANCE_VARIANTID === foundVariant.VARIANT_ID);
			foundVariant.alleleFrequency = alleleFrequency.filter(allele => allele.ALLELEFREQUENCY_VARIANTID === foundVariant.VARIANT_ID);
			foundVariant.genes = genes.filter(gene => gene.GENE_ID === foundVariant.VARIANT_GENEID);
			foundVariant.variantRecords = variantRecords.filter(variantRecord => variantRecord.VARIANTRECORD_VARIANTID === foundVariant.VARIANT_ID);
		})
	}

	filterSql = "";
	return response;
}

exports.filterVariants = function (variant) {
	console.log("HE;;p")
	initFilterSql();
	let response = {};
	let countSql = "";
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
	let resultSet = query.execute(filterSql, filterSqlParams);
	countSql = 'SELECT COUNT(DISTINCT GV."VARIANT_ID") AS "COUNT"' + countSql.slice(20);
	let resultSetCount = query.execute(countSql, filterSqlParams);
	response.data = resultSet;
	console.log("opdasodsap[as")

	response.totalItems = resultSetCount[0]["COUNT"];
	response.totalPages = Math.floor(response.totalItems / variant.perPage) + (response.totalItems % variant.perPage == 0 ? 0 : 1);
	let variantIds = response.data.map(foundVariant => foundVariant.VARIANT_ID);
	let variantIdsInStatement = addArrayValuesToSql(variantIds, false);
	if (variantIds.length > 0) {
		/* LOAD CLINICALSIGNIFICANCE AND PATHOLOGY */
		let clinicalSignificanceQuery = 'SELECT * FROM "GENETYLLIS_CLINICALSIGNIFICANCE" WHERE "CLINICALSIGNIFICANCE_VARIANTID"' + variantIdsInStatement;
		let clinicalSignificance = query.execute(clinicalSignificanceQuery, variantIds);
		let pathologyIds = clinicalSignificance.map(significance => significance.CLINICALSIGNIFICANCE_PATHOLOGYID);
		let pathologyResult = [];
		if (pathologyIds.length > 0) {
			let pathologyIdsInStatement = addArrayValuesToSql(pathologyIds, false);
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
		let geneIdsInStatement = addArrayValuesToSql(geneIds, false);
		let geneQuery = 'SELECT * FROM "GENETYLLIS_GENE" WHERE "GENE_ID"' + geneIdsInStatement;
		let genes = query.execute(geneQuery, geneIds);

		/* MAP CLINICALSIGNIFICANCE, ALLELEFREQUENCY AND GENES TO VARIANT */
		response.data.forEach(foundVariant => {
			foundVariant.clinicalSignificance = clinicalSignificance.filter(significance => significance.CLINICALSIGNIFICANCE_VARIANTID === foundVariant.VARIANT_ID);
			foundVariant.alleleFrequency = alleleFrequency.filter(allele => allele.ALLELEFREQUENCY_VARIANTID === foundVariant.VARIANT_ID);
			foundVariant.genes = genes.filter(gene => gene.GENE_ID === foundVariant.VARIANT_GENEID);
			let patientsCount = query.execute('SELECT DISTINCT VARIANTRECORD_PATIENTID FROM "GENETYLLIS_VARIANTRECORD" WHERE "VARIANTRECORD_VARIANTID" = ?', [foundVariant.VARIANT_ID]);
			foundVariant.patientsCount = patientsCount.length

			let patients = query.execute('SELECT DISTINCT * FROM "GENETYLLIS_PATIENT" GP JOIN "GENETYLLIS_VARIANTRECORD" GV ON GP."PATIENT_ID" = GV."VARIANTRECORD_PATIENTID" WHERE "VARIANTRECORD_VARIANTID" = ?', [foundVariant.VARIANT_ID]);
			foundVariant.patients = patients

			let highlight = query.execute('SELECT * FROM "GENETYLLIS_NOTIFICATION" WHERE "NOTIFICATION_VARIANTID" = ?', [foundVariant.VARIANT_ID]);
			foundVariant.highlight = highlight
		})

	}
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
			let isLower = isNaN(val);

			if (Array.isArray(val)) {
				condition = columnLowerCondition(keys[i], isLower) + addArrayValuesToSql(val, isLower);

			} else if (keys[i].toString().endsWith('_TO')) {
				condition = columnLowerCondition(keys[i].slice(0, -3), false) + " <= ?";
				addFilterParam(val, false);

			} else if (keys[i].toString().endsWith('_FROM')) {
				condition = columnLowerCondition(keys[i].slice(0, -5), false) + " >= ?";
				addFilterParam(val, false);

			} else {
				condition = columnLowerCondition(keys[i], isLower) + " = ?";
				addFilterParam(val, isLower);
			}

			filterSql += condition;
			useWhere = false;

		}
	}

	return filterSql;
}

function addArrayValuesToSql(array, isLower) {

	let inStatement = " IN (";
	array.forEach(element => {
		inStatement += "?,";
		addFilterParam(element, isLower);
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
function initPatientDetailsSql() {
	useWhere = true;
	filterSqlParams = [];
	filterSql = 'SELECT DISTINCT GV.* FROM "GENETYLLIS_VARIANT" GV ' +
		'LEFT JOIN "GENETYLLIS_VARIANTRECORD" GVR ON GV."VARIANT_ID" = GVR."VARIANTRECORD_VARIANTID" ' +
		'LEFT JOIN "GENETYLLIS_PATIENT" GP ON GVR."VARIANTRECORD_PATIENTID" = GP."PATIENT_ID" ' +
		'LEFT JOIN "GENETYLLIS_ANALYSIS" GAL ON GVR."VARIANTRECORD_ANALYSISID" = GAL."ANALYSIS_ID" ' +
		'LEFT JOIN "GENETYLLIS_GENE" GG ON GV."VARIANT_GENEID" = GG."GENE_ID" ' +
		'LEFT JOIN "GENETYLLIS_CLINICALSIGNIFICANCE" GC ON GV."VARIANT_ID" = GC."CLINICALSIGNIFICANCE_VARIANTID" ' +
		'LEFT JOIN "GENETYLLIS_PATHOLOGY" GPT ON GC."CLINICALSIGNIFICANCE_PATHOLOGYID" = GPT."PATHOLOGY_ID" ' +
		'LEFT JOIN "GENETYLLIS_SIGNIFICANCE" GS ON GC."CLINICALSIGNIFICANCE_SIGNIFICANCEID" = GS."SIGNIFICANCE_ID" ' +
		'LEFT JOIN "GENETYLLIS_ALLELEFREQUENCY" GA ON GV."VARIANT_ID" = GA."ALLELEFREQUENCY_VARIANTID"';
}

function addFilterParam(param, isLower) {
	if (isLower) {
		filterSqlParams.push(param.toString().toLowerCase());
	} else {
		filterSqlParams.push(param);
	}
}

function columnLowerCondition(column, isLower) {
	if (isLower) {
		return 'LOWER("' + column + '")'
	} else {
		return '"' + column + '"';
	}
}
