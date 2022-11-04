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

var query = require("db/v4/query");
var httpClient = require("http/v4/client");
var daoNotification = require("genetyllis-app/gen/dao/users/Notification.js");
var request = require("http/v4/request");

if (request.getMethod() === "POST") {

    const body = request.getJSON();
    let notificationId = body.notificationId;
    markNotificationSeen(notificationId);
} else if (request.getMethod() === "GET") {
    console.warn("Use POST request.");
}

getNotifications(1);
markNotificationSeen(1);

function getNotifications(userId) {
    var statement = "SELECT * FROM GENETYLLIS_NOTIFICATION WHERE NOTIFICATION_USERUSERID = ? AND NOTIFICATION_SEENFLAG = FALSE AND NOTIFICATION_CHANGEFLAG = TRUE";
    var resultset = query.execute(statement, [userId], "local", "DefaultDB");

    // return resultset;
}

function markNotificationSeen(notificationId) {
    let entityNotification = daoNotification.get(notificationId)
    entityNotification.SeenFlag = true;
    entityNotification.ChangeFlag = false;
    daoNotification.update(entityNotification);

}


// exports.markNotificationSeen = function (notificationId) {
//     let entityNotification = daoNotification.get(notificationId)
//     entityNotification.SeenFlag = true;
//     entityNotification.ChangeFlag = false;
//     daoNotification.update(entityNotification);
//     console.log(JSON.stringify(entityNotification));
// }
