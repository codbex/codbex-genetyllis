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
	let response = [];
	response = query.execute('SELECT * FROM "GENETYLLIS_VARIANTRECORD" WHERE "VARIANTRECORD_VARIANTID" = ? AND "VARIANTRECORD_PATIENTID" = ?', [variantId.VARIANTRECORD_VARIANTID, variantId.VARIANTRECORD_PATIENTID]);
	if (response.length !== 0) {
		response.forEach(resp => {
			let variantRecordObject = {}

			variantRecordObject.Id = resp.VARIANTRECORD_ID;
			variantRecordObject.PatientId = resp.VARIANTRECORD_PATIENTID;
			variantRecordObject.VariantId = resp.VARIANTRECORD_VARIANTID;
			variantRecordObject.Homozygous = resp.VARIANTRECORD_HOMOZYGOUS;
			variantRecordObject.AlleleDepth = resp.VARIANTRECORD_ALLELEDEPTH;
			variantRecordObject.Depth = resp.VARIANTRECORD_DEPTH;
			variantRecordObject.Quality = resp.VARIANTRECORD_QUALITY;
			variantRecordObject.AnalysisId = resp.VARIANTRECORD_ANALYSISID;
			variantRecordObject.Highlight = !resp.VARIANTRECORD_HIGHLIGHT;

			dao.update(variantRecordObject);
		})
	}
	return response;

}