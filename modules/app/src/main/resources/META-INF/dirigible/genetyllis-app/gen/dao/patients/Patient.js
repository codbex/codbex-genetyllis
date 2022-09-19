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
	table: "GENETYLLIS_PATIENT",
	properties: [
		{
			name: "Id",
			column: "PATIENT_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "LabId",
			column: "GENETYLLIS_PATIENT_LABID",
			type: "VARCHAR",
		},
 {
			name: "BirthDate",
			column: "PATIENT_AGE",
			type: "DATE",
		},
 {
			name: "GenderId",
			column: "PATIENT_GENDERID",
			type: "INTEGER",
		},
 {
			name: "Info",
			column: "PATIENT_INFO",
			type: "VARCHAR",
		},
 {
			name: "PhysicianId",
			column: "GENETYLLIS_PATIENT_PHYSICIANID",
			type: "INTEGER",
		},
 {
			name: "PopulationId",
			column: "GENETYLLIS_PATIENT_POPULATIONID",
			type: "INTEGER",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setDate(e, "BirthDate");
		return e;
	});
};

exports.get = function(id) {
	let entity = dao.find(id);
	EntityUtils.setDate(entity, "BirthDate");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setLocalDate(entity, "BirthDate");
	let id = dao.insert(entity);
	triggerEvent("Create", {
		table: "GENETYLLIS_PATIENT",
		key: {
			name: "Id",
			column: "PATIENT_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	// EntityUtils.setLocalDate(entity, "BirthDate");
	dao.update(entity);
	triggerEvent("Update", {
		table: "GENETYLLIS_PATIENT",
		key: {
			name: "Id",
			column: "PATIENT_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "GENETYLLIS_PATIENT",
		key: {
			name: "Id",
			column: "PATIENT_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM GENETYLLIS_PATIENT");
	if (resultSet !== null && resultSet[0] !== null) {
		if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
			return resultSet[0].COUNT;
		} else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
			return resultSet[0].count;
		}
	}
	return 0;
};

exports.getPatientByLabId = function (labId) {
	paramArr = [];
	paramArr.push(labId)
	var resultSet = query.execute("SELECT * FROM GENETYLLIS_PATIENT WHERE GENETYLLIS_PATIENT_LABID = ? LIMIT 1", paramArr);
	return resultSet;
}

exports.getPatientAndHistoryByLabId = function (labId) {
	paramArr = [];
	paramArr.push(labId)
	var resultSet = query.execute("SELECT * FROM GENETYLLIS_PATIENT GP " +
		"JOIN GENETYLLIS_CLINICALHISTORY GC ON GP.PATIENT_ID = GC.CLINICALHISTORY_PATIENTID " +
		"JOIN GENETYLLIS_FAMILYHISTORY GF ON GP.PATIENT_ID = GF.FAMILYHISTORY_FAMILYMEMBERID  WHERE GENETYLLIS_PATIENT_LABID = ?", paramArr);
	return resultSet;
}

exports.suggestLabIds = function (labId) {
	paramArr = [];
	paramArr.push('%' + labId + '%')
	var resultSet = query.execute("SELECT * FROM GENETYLLIS_PATIENT WHERE GENETYLLIS_PATIENT_LABID LIKE ? LIMIT 10", paramArr);
	return resultSet;
}

exports.filterPatients = function (patient) {
	initFilterSql();

	var response = {};
	var countSql = "";

	filterSql = buildFilterSql(patient.GENETYLLIS_PATIENT, filterSql);
	filterSql = buildFilterSql(patient.GENETYLLIS_CLINICALHISTORY, filterSql);
	filterSql = buildFilterSql(patient.GENETYLLIS_VARIANT, filterSql);

	if (!isFamilyHsistoryEmpty(patient.GENETYLLIS_FAMILYHISTORY)) {
		buildFamilyHistoryFilterSql(patient.GENETYLLIS_FAMILYHISTORY);
	}

	countSql += filterSql;

	filterSql += " LIMIT " + patient.perPage + " OFFSET " + patient.currentPage;

	var resultSet = query.execute(filterSql, filterSqlParams);

	countSql = "SELECT COUNT(DISTINCT GP.PATIENT_ID)" + countSql.slice(20);

	var resultSetCount = query.execute(countSql, filterSqlParams);

	response.data = resultSet;
	response.totalItems = resultSetCount[0]["COUNT(DISTINCT GP.PATIENT_ID)"];
	response.totalPages = Math.floor(response.totalItems / patient.perPage) + (response.totalItems % patient.perPage == 0 ? 0 : 1);

	response.data.forEach(patientResult => {
		var params = [];
		params.push(patientResult.PATIENT_ID)

		patientResult.clinicalHistory = loadClinicalHistoryAndPathology(params);
		patientResult.familyHistory = loadFamilyMembersHistory(params);
		patientResult.variantRecords = loadVariantRecords(params);
		patientResult.analysis = loadAnalysis(params);
	})

	filterSql = "";

	return response;
}

function isFamilyHsistoryEmpty(object) {
	return (!object.PATHOLOGY_CUI || object.PATHOLOGY_CUI.length === 0)
		&& !object.GENETYLLIS_CLINICALHISTORY_AGEONSET_FROM
		&& !object.GENETYLLIS_CLINICALHISTORY_AGEONSET_TO;
}

function loadFamilyMembersHistory(params) {
	var familyHistory = query.execute("SELECT * FROM GENETYLLIS_FAMILYHISTORY WHERE FAMILYHISTORY_PATIENTID = ?", params);
	familyHistory.forEach(familyMember => {
		var familyParams = [];
		familyParams.push(familyMember.FAMILYHISTORY_FAMILYMEMBERID);
		familyMember.patients = query.execute("SELECT * FROM GENETYLLIS_PATIENT WHERE PATIENT_ID = ?", familyParams);
		familyMember.patients.forEach(familyPatient => {
			familyPatient.clinicalHistory = loadClinicalHistoryAndPathology(familyParams);
		})
	})

	return familyHistory;
}

function loadClinicalHistoryAndPathology(params) {
	var clinicalHistories = query.execute("SELECT * FROM GENETYLLIS_CLINICALHISTORY WHERE CLINICALHISTORY_PATIENTID = ?", params);
	clinicalHistories.forEach(clinicalHistory => {
		var historyParams = [];
		historyParams.push(clinicalHistory.CLINICALHISTORY_PATHOLOGYID)
		clinicalHistory.pathology = query.execute("SELECT * FROM GENETYLLIS_PATHOLOGY WHERE PATHOLOGY_ID = ?", historyParams);
	})

	return clinicalHistories;
}

function loadVariantRecords(params) {
	var variantRecords = query.execute("SELECT * FROM GENETYLLIS_VARIANTRECORD WHERE VARIANTRECORD_PATIENTID = ?", params);
	variantRecords.forEach(variantRecord => {
		var variantParams = [];
		variantParams.push(variantRecord.VARIANTRECORD_VARIANTID);
		variantRecord.variants = query.execute("SELECT * FROM GENETYLLIS_VARIANT WHERE VARIANT_ID = ?", variantParams);
	})

	return variantRecords;
}

function loadAnalysis(params) {
	return query.execute("SELECT * FROM GENETYLLIS_ANALYSIS WHERE GENETYLLIS_ANALYSIS_PATIENTID = ?", params);
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
				condition = "LOWER(" + keys[i] + ") " + addArrayValuesToSql(val);

			} else if (keys[i].toString().endsWith('_TO')) {
				condition = keys[i].slice(0, -3) + " <= ?";
				addFilterParam(val);

			} else if (keys[i].toString().endsWith('_FROM')) {
				condition = keys[i].slice(0, -5) + " >= ?";
				addFilterParam(val);

			} else {
				condition = "LOWER(" + keys[i] + ") " + " = ?";
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

	filterSql += "GF.FAMILYHISTORY_FAMILYMEMBERID IN (";
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
	filterSql = "SELECT DISTINCT GP.* FROM GENETYLLIS_PATIENT GP " +
		"LEFT JOIN GENETYLLIS_CLINICALHISTORY GC ON GP.PATIENT_ID = GC.CLINICALHISTORY_PATIENTID " +
		"LEFT JOIN GENETYLLIS_FAMILYHISTORY GF ON GP.PATIENT_ID = GF.FAMILYHISTORY_PATIENTID " +
		"LEFT JOIN GENETYLLIS_PATHOLOGY GPT ON GC.CLINICALHISTORY_PATHOLOGYID = GPT.PATHOLOGY_ID " +
		"LEFT JOIN GENETYLLIS_VARIANTRECORD GVR ON GP.PATIENT_ID = GVR.VARIANTRECORD_PATIENTID " +
		"LEFT JOIN GENETYLLIS_VARIANT GV ON GVR.VARIANTRECORD_VARIANTID = GV.VARIANT_ID";
	filterFamilyHistorySql = "SELECT PATIENT_ID " +
		"FROM GENETYLLIS_PATIENT GPF " +
		"JOIN GENETYLLIS_CLINICALHISTORY GCF ON GPF.PATIENT_ID = GCF.CLINICALHISTORY_PATIENTID " +
		"JOIN GENETYLLIS_PATHOLOGY GPTF ON GCF.CLINICALHISTORY_PATHOLOGYID = GPTF.PATHOLOGY_ID";
}

function addFilterParam(param) {
	if (isNaN(param)) {
		filterSqlParams.push(param.toString().toLowerCase());
	} else {
		filterSqlParams.push(param);
	}
}

function triggerEvent(operation, data) {
	producer.queue("genetyllis-app/Patients/Patient/" + operation).send(JSON.stringify(data));
}