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
exports.setDate = function (object, property) {
	if (object[property]) {
		object[property] = new Date(object[property]).getTime();
	}
};

exports.setLocalDate = function (object, property) {
	if (object[property]) {
		object[property] = new Date(new Date(object[property]).setHours(-(new Date().getTimezoneOffset() / 60), 0, 0, 0)).toISOString();
	}
};

exports.setBoolean = function (object, property) {
	if (object[property] !== undefined) {
		object[property] = object[property] ? true : false;
	}
};