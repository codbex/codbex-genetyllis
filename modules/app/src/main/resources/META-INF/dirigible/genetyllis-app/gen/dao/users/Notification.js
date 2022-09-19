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
	table: "GENETYLLIS_NOTIFICATION",
	properties: [
		{
			name: "NotificationId",
			column: "NOTIFICATION_NOTIFICATIONID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "UserUserId",
			column: "NOTIFICATION_USERUSERID",
			type: "INTEGER",
		},
 {
			name: "VariantId",
			column: "NOTIFICATION_VARIANTID",
			type: "INTEGER",
		},
 {
			name: "SeenFlag",
			column: "NOTIFICATION_SEENFLAG",
			type: "BOOLEAN",
		},
 {
			name: "ChangeFlag",
			column: "NOTIFICATION_CHANGEFLAG",
			type: "BOOLEAN",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setBoolean(e, "SeenFlag");
		EntityUtils.setBoolean(e, "ChangeFlag");
		return e;
	});
};

exports.get = function(id) {
	let entity = dao.find(id);
	EntityUtils.setBoolean(entity, "SeenFlag");
	EntityUtils.setBoolean(entity, "ChangeFlag");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setBoolean(entity, "SeenFlag");
	EntityUtils.setBoolean(entity, "ChangeFlag");
	let id = dao.insert(entity);
	triggerEvent("Create", {
		table: "GENETYLLIS_NOTIFICATION",
		key: {
			name: "NotificationId",
			column: "NOTIFICATION_NOTIFICATIONID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	EntityUtils.setBoolean(entity, "SeenFlag");
	EntityUtils.setBoolean(entity, "ChangeFlag");
	dao.update(entity);
	triggerEvent("Update", {
		table: "GENETYLLIS_NOTIFICATION",
		key: {
			name: "NotificationId",
			column: "NOTIFICATION_NOTIFICATIONID",
			value: entity.NotificationId
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "GENETYLLIS_NOTIFICATION",
		key: {
			name: "NotificationId",
			column: "NOTIFICATION_NOTIFICATIONID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM GENETYLLIS_NOTIFICATION");
	if (resultSet !== null && resultSet[0] !== null) {
		if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
			return resultSet[0].COUNT;
		} else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
			return resultSet[0].count;
		}
	}
	return 0;
};

function triggerEvent(operation, data) {
	producer.queue("genetyllis-app/Users/Notification/" + operation).send(JSON.stringify(data));
}