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
const dao = require("genetyllis-app/gen/dao/analysis/Institution");

exports.list = function(settings) {
	return dao.list(settings);
};

exports.get = function(id) {
	return dao.get(id);
};

exports.create = function(entity) {
	return dao.create(entity);
};

exports.update = function(entity) {
	dao.update(entity);
};

exports.delete = function(id) {
	dao.delete(id);
};

exports.count = function() {
	return dao.count();
};
