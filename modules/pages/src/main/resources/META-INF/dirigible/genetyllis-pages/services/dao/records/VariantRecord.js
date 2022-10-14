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
const dao = require("genetyllis-app/gen/dao/records/VariantRecord");
const query = require("db/v4/query");

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

exports.getByVariantId = function (variantId) {
	console.log(variantId)
	let response = {};
	response = query.execute('SELECT * FROM "GENETYLLIS_VARIANTRECORD" WHERE "VARIANTRECORD_VARIANTID" = ? AND "VARIANTRECORD_PATIENTID" = ?', [variantId.VARIANTRECORD_VARIANTID, variantId.VARIANTRECORD_PATIENTID]);

	if (response.length !== 0) {
		let variantRecordObject = {}
		console.log("response");

		variantRecordObject.Id = response[0]?.VARIANTRECORD_ID;
		variantRecordObject.PatientId = response[0]?.VARIANTRECORD_PATIENTID;
		variantRecordObject.VariantId = response[0]?.VARIANTRECORD_VARIANTID;
		variantRecordObject.Homozygous = response[0]?.VARIANTRECORD_HOMOZYGOUS;
		variantRecordObject.AlleleDepth = response[0]?.VARIANTRECORD_ALLELEDEPTH;
		variantRecordObject.Depth = response[0]?.VARIANTRECORD_DEPTH;
		variantRecordObject.Quality = response[0]?.VARIANTRECORD_QUALITY;
		variantRecordObject.AnalysisId = response[0]?.VARIANTRECORD_ANALYSISID;
		variantRecordObject.Highlight = !response[0]?.VARIANTRECORD_HIGHLIGHT;

		console.log(JSON.stringify(variantRecordObject))
		console.log("responseresponseresponseresponseresponseresponseresponseresponseresponseresponseresponseresponseresponseresponseresponse");
		dao.update(variantRecordObject);
	}

	return response;
}