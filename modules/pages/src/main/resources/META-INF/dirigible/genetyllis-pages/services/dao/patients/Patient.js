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
const dao = require("genetyllis-app/gen/dao/patients/Patient");

let filterSql = "";
let filterFamilyHistorySql = "";
let filterSqlParams = [];
let useWhere = true;

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

exports.getPatientByLabId = function (labId) {
	return query.execute('SELECT * FROM "GENETYLLIS_PATIENT" WHERE "PATIENT_LABID" = ? LIMIT 1', [labId]);
}

exports.getPatientAndHistoryByLabId = function (labId) {
	return query.execute('SELECT * FROM "GENETYLLIS_PATIENT" GP ' +
		'JOIN "GENETYLLIS_CLINICALHISTORY" GC ON GP."PATIENT_ID" = GC."CLINICALHISTORY_PATIENTID" ' +
		'JOIN "GENETYLLIS_FAMILYHISTORY" GF ON GP."PATIENT_ID" = GF."FAMILYHISTORY_FAMILYMEMBERID"  WHERE "PATIENT_LABID" = ?', [labId]);
}

exports.suggestLabIds = function (labId) {
	return query.execute('SELECT * FROM "GENETYLLIS_PATIENT" WHERE "PATIENT_LABID" LIKE ? LIMIT 10', [`%${labId}%`]);
}

exports.loadPatientFormData = function (id) {
	let patient = query.execute('SELECT * FROM "GENETYLLIS_PATIENT" WHERE "PATIENT_ID" = ?', [id])[0];

	/* LOAD FAMILYHISTORY */
	let familyHistory = query.execute('SELECT * FROM "GENETYLLIS_FAMILYHISTORY" WHERE "FAMILYHISTORY_PATIENTID" = ?', [id]);

	let familyPatientIds = familyHistory.map(member => member.FAMILYHISTORY_FAMILYMEMBERID);
	let familyPatientIdsInStatement = addArrayValuesToSql(familyPatientIds);
	let familyHistoryPatientsQuery = 'SELECT * FROM "GENETYLLIS_PATIENT" WHERE "PATIENT_ID"' + familyPatientIdsInStatement;
	let familyHistoryPatients = query.execute(familyHistoryPatientsQuery, familyPatientIds);

	/* LOAD CLINICALHISTORY AND PATHOLOGY */
	familyPatientIds.push(id);
	let familyAndPatientIdsInStatement = addArrayValuesToSql(familyPatientIds);
	let clinicalHistoryQuery = 'SELECT * FROM "GENETYLLIS_CLINICALHISTORY" WHERE "CLINICALHISTORY_PATIENTID"' + familyAndPatientIdsInStatement;
	let clinicalHistory = query.execute(clinicalHistoryQuery, familyPatientIds);

	let pathologyIds = clinicalHistory.map(memberHistory => memberHistory.CLINICALHISTORY_PATHOLOGYID);
	let pathologyResult = [];
	if (pathologyIds.length > 0) {
		let pathologyIdsInStatement = addArrayValuesToSql(pathologyIds);
		let pathologyQuery = 'SELECT * FROM "GENETYLLIS_PATHOLOGY" WHERE "PATHOLOGY_ID"' + pathologyIdsInStatement;

		pathologyResult = query.execute(pathologyQuery, pathologyIds);
	}

	/* MAP PATHOLOGY TO CLINICALHISTORY */
	clinicalHistory.forEach(history => {
		history.pathology = pathologyResult.filter(pathology => pathology.PATHOLOGY_ID === history.CLINICALHISTORY_PATHOLOGYID);
	})

	/* MAP CLINICALHISTORY AND PATIENT TO FAMILYHISTORY */
	familyHistory.forEach(member => {
		member.clinicalHistory = clinicalHistory.filter(history => history.CLINICALHISTORY_PATIENTID === member.FAMILYHISTORY_FAMILYMEMBERID);
		member.patient = familyHistoryPatients.filter(familyPatient => familyPatient.PATIENT_ID === member.FAMILYHISTORY_FAMILYMEMBERID);
	})

	patient.familyHistory = familyHistory;
	patient.clinicalHistory = clinicalHistory.filter(history => history.CLINICALHISTORY_PATIENTID === patient.PATIENT_ID);

	return patient;
}

exports.filterVariantDetails = function (patient) {
	initFilterSql();

	var response = {};
	var countSql = "";

	if (patient.GENETYLLIS_PATIENT) {
		filterSql = buildFilterSql(patient.GENETYLLIS_PATIENT, filterSql);
	}

	if (patient.GENETYLLIS_CLINICALHISTORY) {
		filterSql = buildFilterSql(patient.GENETYLLIS_CLINICALHISTORY, filterSql);
	}

	if (patient.GENETYLLIS_VARIANT) {
		filterSql = buildFilterSql(patient.GENETYLLIS_VARIANT, filterSql);
	}

	if (patient.GENETYLLIS_FAMILYHISTORY) {
		if (!isFamilyHsistoryEmpty(patient.GENETYLLIS_FAMILYHISTORY)) {
			buildFamilyHistoryFilterSql(patient.GENETYLLIS_FAMILYHISTORY);
		}
	}
	if (patient.GENETYLLIS_ANALYSIS) {
		filterSql = buildFilterSql(patient.GENETYLLIS_ANALYSIS, filterSql);
	}

	countSql += filterSql;

	filterSql += " LIMIT " + patient.perPage + " OFFSET " + patient.currentPage;

	var resultSet = query.execute(filterSql, filterSqlParams);

	countSql = 'SELECT COUNT(DISTINCT GP."PATIENT_ID") AS "COUNT"' + countSql.slice(20);

	var resultSetCount = query.execute(countSql, filterSqlParams);

	response.data = resultSet;
	response.totalItems = resultSetCount[0]["COUNT"];
	response.totalPages = Math.floor(response.totalItems / patient.perPage) + (response.totalItems % patient.perPage == 0 ? 0 : 1);

	let patientIds = response.data.map(foundPatient => foundPatient.PATIENT_ID);

	let patientIdsInStatement = addArrayValuesToSql(patientIds);

	if (patientIds.length > 0) {
		/* LOAD FAMILYHISTORY */
		let familyHistoryQuery = 'SELECT * FROM "GENETYLLIS_FAMILYHISTORY" WHERE "FAMILYHISTORY_PATIENTID"' + patientIdsInStatement;
		let familyHistory = query.execute(familyHistoryQuery, patientIds);

		let familyPatientIds = familyHistory.map(member => member.FAMILYHISTORY_FAMILYMEMBERID);

		/* LOAD CLINICALSIGNIFICANCE */
		let clinicalSignificanceQuery = 'SELECT GC.*, GV."VARIANTRECORD_PATIENTID"  FROM "GENETYLLIS_CLINICALSIGNIFICANCE" GC ' +
			'LEFT JOIN "GENETYLLIS_VARIANTRECORD" GV ON GC."CLINICALSIGNIFICANCE_VARIANTID" = GV."VARIANTRECORD_VARIANTID" ' +
			'WHERE "VARIANTRECORD_PATIENTID"' + patientIdsInStatement;
		let clinicalSignificance = query.execute(clinicalSignificanceQuery, patientIds);
		let clinicalSignificanePathologyIds = clinicalSignificance.map(foundClinicalSignificance => foundClinicalSignificance.CLINICALSIGNIFICANCE_PATHOLOGYID);
		let significanceIds = clinicalSignificance.map(foundClinicalSignificance => foundClinicalSignificance.CLINICALSIGNIFICANCE_SIGNIFICANCEID);
		let significanceIdsInStatement = addArrayValuesToSql(significanceIds);

		/* LOAD SIGNIFICANCE */
		let significanceQuery = 'SELECT * FROM "GENETYLLIS_SIGNIFICANCE" WHERE "SIGNIFICANCE_ID"' + significanceIdsInStatement;
		let significance = query.execute(significanceQuery, significanceIds);

		/* LOAD CLINICALHISTORY AND PATHOLOGY */
		let familyAndPatientIds = patientIds.concat(familyPatientIds)
		let familyAndPatientIdsInStatement = addArrayValuesToSql(familyAndPatientIds);
		let clinicalHistoryQuery = 'SELECT * FROM "GENETYLLIS_CLINICALHISTORY" WHERE "CLINICALHISTORY_PATIENTID"' + familyAndPatientIdsInStatement;
		let clinicalHistory = query.execute(clinicalHistoryQuery, familyAndPatientIds);

		let pathologyIds = clinicalHistory.map(memberHistory => memberHistory.CLINICALHISTORY_PATHOLOGYID);
		pathologyIds = pathologyIds.concat(clinicalSignificanePathologyIds);
		let pathologyResult = [];
		if (pathologyIds.length > 0) {
			let pathologyIdsInStatement = addArrayValuesToSql(pathologyIds);
			let pathologyQuery = 'SELECT * FROM "GENETYLLIS_PATHOLOGY" WHERE "PATHOLOGY_ID"' + pathologyIdsInStatement;

			pathologyResult = query.execute(pathologyQuery, pathologyIds);
		}

		/* MAP PATHOLOGY TO CLINICALHISTORY */
		clinicalHistory.forEach(history => {
			history.pathology = pathologyResult.filter(pathology => pathology.PATHOLOGY_ID === history.CLINICALHISTORY_PATHOLOGYID);
		})

		/* MAP PATHOLOGY TO CLINICALSIGNIFICANCE */
		clinicalSignificance.forEach(foundClinicalSignificance => {
			foundClinicalSignificance.pathology = pathologyResult.filter(pathology => pathology.PATHOLOGY_ID === foundClinicalSignificance.CLINICALSIGNIFICANCE_PATHOLOGYID);
			foundClinicalSignificance.significance = significance.filter(foundSignificance => foundSignificance.SIGNIFICANCE_ID === foundClinicalSignificance.CLINICALSIGNIFICANCE_SIGNIFICANCEID);
		})

		/* LOAD ANALYSIS */
		let analysisQuery = 'SELECT * FROM "GENETYLLIS_ANALYSIS" WHERE "ANALYSIS_PATIENTID"' + patientIdsInStatement;
		let analysis = query.execute(analysisQuery, patientIds);

		/* MAP CLINICALHISTORY AND PATIENT TO FAMILYHISTORY */
		familyHistory.forEach(member => {
			member.clinicalHistory = clinicalHistory.filter(history => history.CLINICALHISTORY_PATIENTID === member.FAMILYHISTORY_FAMILYMEMBERID)
		})

		/* MAP CLINICALHISTORY, FAMILYHISTORY AND ANALYSIS TO PATIENT */
		response.data.forEach(foundPatient => {
			foundPatient.clinicalHistory = clinicalHistory.filter(history => history.CLINICALHISTORY_PATIENTID === foundPatient.PATIENT_ID)
			foundPatient.familyHistory = familyHistory.filter(family => family.FAMILYHISTORY_PATIENTID === foundPatient.PATIENT_ID)
			foundPatient.analysis = analysis.filter(analysisElement => analysisElement.ANALYSIS_PATIENTID === foundPatient.PATIENT_ID)
			foundPatient.clinicalSignificance = clinicalSignificance.filter(foundClinicalSignificance => foundClinicalSignificance.VARIANTRECORD_PATIENTID === foundPatient.PATIENT_ID)
		})

	}

	filterSql = "";

	return response;
}

exports.filterPatients = function (patient) {
	initFilterSql();

	var response = {};
	var countSql = "";

	if (patient.GENETYLLIS_PATIENT) {
		filterSql = buildFilterSql(patient.GENETYLLIS_PATIENT, filterSql);
	}

	if (patient.GENETYLLIS_CLINICALHISTORY) {
		filterSql = buildFilterSql(patient.GENETYLLIS_CLINICALHISTORY, filterSql);
	}

	if (patient.GENETYLLIS_VARIANT) {
		filterSql = buildFilterSql(patient.GENETYLLIS_VARIANT, filterSql);
	}

	if (patient.GENETYLLIS_FAMILYHISTORY) {
		if (!isFamilyHsistoryEmpty(patient.GENETYLLIS_FAMILYHISTORY)) {
			buildFamilyHistoryFilterSql(patient.GENETYLLIS_FAMILYHISTORY);
		}
	}
	if (patient.GENETYLLIS_ANALYSIS) {
		filterSql = buildFilterSql(patient.GENETYLLIS_ANALYSIS, filterSql);
	}



	countSql += filterSql;

	filterSql += " LIMIT " + patient.perPage + " OFFSET " + patient.currentPage;

	var resultSet = query.execute(filterSql, filterSqlParams);

	countSql = 'SELECT COUNT(DISTINCT GP."PATIENT_ID") AS "COUNT"' + countSql.slice(20);

	var resultSetCount = query.execute(countSql, filterSqlParams);

	response.data = resultSet;
	response.totalItems = resultSetCount[0]["COUNT"];
	response.totalPages = Math.floor(response.totalItems / patient.perPage) + (response.totalItems % patient.perPage == 0 ? 0 : 1);

	let patientIds = response.data.map(foundPatient => foundPatient.PATIENT_ID);
	let patientIdsInStatement = addArrayValuesToSql(patientIds);

	if (patientIds.length > 0) {
		/* LOAD FAMILYHISTORY */
		let familyHistoryQuery = 'SELECT * FROM "GENETYLLIS_FAMILYHISTORY" WHERE "FAMILYHISTORY_PATIENTID"' + patientIdsInStatement;
		let familyHistory = query.execute(familyHistoryQuery, patientIds);

		let familyPatientIds = familyHistory.map(member => member.FAMILYHISTORY_FAMILYMEMBERID);

		/* LOAD CLINICALHISTORY AND PATHOLOGY */
		let familyAndPatientIds = patientIds.concat(familyPatientIds)
		let familyAndPatientIdsInStatement = addArrayValuesToSql(familyAndPatientIds);
		let clinicalHistoryQuery = 'SELECT * FROM "GENETYLLIS_CLINICALHISTORY" WHERE "CLINICALHISTORY_PATIENTID"' + familyAndPatientIdsInStatement;
		let clinicalHistory = query.execute(clinicalHistoryQuery, familyAndPatientIds);

		let pathologyIds = clinicalHistory.map(memberHistory => memberHistory.CLINICALHISTORY_PATHOLOGYID);
		let pathologyResult = [];
		if (pathologyIds.length > 0) {
			let pathologyIdsInStatement = addArrayValuesToSql(pathologyIds);
			let pathologyQuery = 'SELECT * FROM "GENETYLLIS_PATHOLOGY" WHERE "PATHOLOGY_ID"' + pathologyIdsInStatement;

			pathologyResult = query.execute(pathologyQuery, pathologyIds);
		}

		/* MAP PATHOLOGY TO CLINICALHISTORY */
		clinicalHistory.forEach(history => {
			history.pathology = pathologyResult.filter(pathology => pathology.PATHOLOGY_ID === history.CLINICALHISTORY_PATHOLOGYID)
		})

		/* LOAD ANALYSIS */
		let analysisQuery = 'SELECT * FROM "GENETYLLIS_ANALYSIS" WHERE "ANALYSIS_PATIENTID"' + patientIdsInStatement;
		let analysis = query.execute(analysisQuery, patientIds);

		if (analysis.length > 0) {
			let analysisProviderIds = analysis.map(foundPatient => foundPatient.ANALYSIS_PROVIDERID);
			let providerIdsInStatement = addArrayValuesToSql(analysisProviderIds, "here");

			/* LOAD PROVIDER */
			let providerQuery = 'SELECT * FROM "GENETYLLIS_PROVIDER" WHERE "PROVIDER_ID"' + providerIdsInStatement;
			let provider = query.execute(providerQuery, analysisProviderIds);
			analysis.forEach(el => {
				el.provider = provider.filter(pl => pl.PROVIDER_ID === el.ANALYSIS_PROVIDERID)
			})


			/* LOAD PLATFORM */
			let analysisPlatformIds = analysis.map(foundPatient => foundPatient.ANALYSIS_PLATFORMID);
			let platformIdsInStatement = addArrayValuesToSql(analysisPlatformIds);

			let platformQuery = 'SELECT * FROM "GENETYLLIS_PLATFORM" WHERE "PLATFORM_ID"' + platformIdsInStatement;
			let platform = query.execute(platformQuery, analysisPlatformIds);
			analysis.forEach(el => {
				el.platform = platform.filter(pl => pl.PLATFORM_ID === el.ANALYSIS_PLATFORMID)
			});
		}
		/* MAP CLINICALHISTORY AND PATIENT TO FAMILYHISTORY */
		familyHistory.forEach(member => {
			member.clinicalHistory = clinicalHistory.filter(history => history.CLINICALHISTORY_PATIENTID === member.FAMILYHISTORY_FAMILYMEMBERID)
		})

		/* MAP CLINICALHISTORY, FAMILYHISTORY AND ANALYSIS TO PATIENT */
		response.data.forEach(foundPatient => {
			foundPatient.clinicalHistory = clinicalHistory.filter(history => history.CLINICALHISTORY_PATIENTID === foundPatient.PATIENT_ID)
			foundPatient.familyHistory = familyHistory.filter(family => family.FAMILYHISTORY_PATIENTID === foundPatient.PATIENT_ID)
			foundPatient.analysis = analysis.filter(analysisElement => analysisElement.ANALYSIS_PATIENTID === foundPatient.PATIENT_ID)
		})


	}

	filterSql = "";

	return response;
}

function isFamilyHsistoryEmpty(object) {
	return (!object.PATHOLOGY_CUI || object.PATHOLOGY_CUI.length === 0)
		&& !object.CLINICALHISTORY_AGEONSET_FROM
		&& !object.CLINICALHISTORY_AGEONSET_TO;
}

function buildFilterSql(object, sql) {
	var keys = Object.keys(object);
	for (var i = 0; i < keys.length; i++) {
		var val = object[keys[i]];
		if (Array.isArray(val) ? (val.length > 0) : (val !== undefined && val !== '' && val !== null)) {
			if (useWhere) {
				sql += " WHERE ";
			} else {
				sql += " AND ";
			}

			condition = "";

			if (Array.isArray(val)) {
				condition = 'LOWER("' + keys[i] + '")' + addArrayValuesToSql(val);

			} else if (keys[i].toString().endsWith('_TO')) {
				condition = keys[i].slice(0, -3) + " <= ?";
				addFilterParam(val);

			} else if (keys[i].toString().endsWith('_FROM')) {
				condition = keys[i].slice(0, -5) + " >= ?";
				addFilterParam(val);

			} else {
				condition = '"' + keys[i] + '"' + " = ?";
				addFilterParam(val);
			}

			sql += condition;
			useWhere = false;

		}
	}

	return sql;
}

function buildFamilyHistoryFilterSql(object) {
	if (useWhere) {
		filterSql += " WHERE ";
	} else {
		filterSql += " AND ";
	}

	useWhere = false;

	filterSql += 'GF."FAMILYHISTORY_FAMILYMEMBERID" IN (';
	filterSql += buildFilterSql(object, filterFamilyHistorySql);
	filterSql += ")"
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
	filterSql = 'SELECT DISTINCT GP.* FROM "GENETYLLIS_PATIENT" GP ' +
		'LEFT JOIN "GENETYLLIS_CLINICALHISTORY" GC ON GP."PATIENT_ID" = GC."CLINICALHISTORY_PATIENTID" ' +
		'LEFT JOIN "GENETYLLIS_FAMILYHISTORY" GF ON GP."PATIENT_ID" = GF."FAMILYHISTORY_PATIENTID" ' +
		'LEFT JOIN "GENETYLLIS_ANALYSIS" GA ON GP."PATIENT_ID" = GA."ANALYSIS_PATIENTID" ' +
		'LEFT JOIN "GENETYLLIS_PROVIDER" GPR ON GA."ANALYSIS_PROVIDERID" = GPR."PROVIDER_ID" ' +
		'LEFT JOIN "GENETYLLIS_PATHOLOGY" GPT ON GC."CLINICALHISTORY_PATHOLOGYID" = GPT."PATHOLOGY_ID" ' +
		'LEFT JOIN "GENETYLLIS_VARIANTRECORD" GVR ON GP."PATIENT_ID" = GVR."VARIANTRECORD_PATIENTID" ' +
		'LEFT JOIN "GENETYLLIS_VARIANT" GV ON GVR."VARIANTRECORD_VARIANTID" = GV."VARIANT_ID"';
	filterFamilyHistorySql = 'SELECT "PATIENT_ID" ' +
		'FROM "GENETYLLIS_PATIENT" GPF ' +
		'JOIN "GENETYLLIS_CLINICALHISTORY" GCF ON GPF."PATIENT_ID" = GCF."CLINICALHISTORY_PATIENTID" ' +
		'JOIN "GENETYLLIS_PATHOLOGY" GPTF ON GCF."CLINICALHISTORY_PATHOLOGYID" = GPTF."PATHOLOGY_ID"';
}

function addFilterParam(param) {
	if (isNaN(param)) {
		filterSqlParams.push(param.toString());
	} else {
		filterSqlParams.push(param);
	}
}

function triggerEvent(operation, data) {
	producer.queue("genetyllis-app/patients/Patient/" + operation).send(JSON.stringify(data));
}
