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
const dao = require("genetyllis-app/gen/dao/users/Notification");
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
	let response = {};
	response = query.execute('SELECT * FROM "GENETYLLIS_NOTIFICATION" WHERE "NOTIFICATION_VARIANTID" = ?', [variantId]);

	if (response.length !== 0) {
		let notificationObject = {}

		notificationObject.NotificationId = response[0]?.NOTIFICATION_NOTIFICATIONID;
		notificationObject.UserUserId = response[0]?.NOTIFICATION_USERUSERID;
		notificationObject.VariantId = response[0]?.NOTIFICATION_VARIANTID;
		notificationObject.SeenFlag = response[0]?.NOTIFICATION_SEENFLAG;
		notificationObject.ChangeFlag = response[0]?.NOTIFICATION_CHANGEFLAG;
		notificationObject.Highlight = !response[0]?.NOTIFICATION_HIGHLIGHT;

		dao.update(notificationObject);
	} else {
		let notificationObject = {}

		notificationObject.UserUserId = null;
		notificationObject.VariantId = variantId;
		notificationObject.SeenFlag = false;
		notificationObject.ChangeFlag = false;
		notificationObject.Highlight = true;

		dao.create(notificationObject);
	}

	return response;
}
