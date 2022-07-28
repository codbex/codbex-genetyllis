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
var daoApi = require('db/v4/dao');
var dao = daoApi.create({
	'table': 'GENETYLLIS_PATIENT',
	'properties': [
		{
			'name': 'PATIENT_ID',
			'column': 'PATIENT_ID',
			'type': 'INTEGER',
			'id': true,
			'required': true
		}, {
			'name': 'PATIENT_GENDERID',
			'column': 'PATIENT_GENDERID',
			'type': 'INTEGER',
			'id': false,
			'required': false
		}, {
			'name': 'PATIENT_INFO',
			'column': 'PATIENT_INFO',
			'type': 'VARCHAR',
			'id': false,
			'required': false
		}, {
			'name': 'PATIENT_AGE',
			'column': 'PATIENT_AGE',
			'type': 'INTEGER',
			'id': false,
			'required': false
		}, {
			'name': 'GENETYLLIS_PATIENT_LABID',
			'column': 'GENETYLLIS_PATIENT_LABID',
			'type': 'VARCHAR',
			'id': false,
			'required': true
		}
	]
});

exports.list = function (settings) {
	return dao.list(settings);
};

exports.get = function (id) {
	return dao.find(id);
};

exports.create = function (entity) {
	return dao.insert(entity);
};

exports.update = function (entity) {
	return dao.update(entity);
};

exports.delete = function (id) {
	dao.remove(id);
};

