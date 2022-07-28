
var query = require("db/v4/query");
var httpClient = require("http/v4/client");
var daoNotification = require("genetyllis-app/gen/dao/users/Notification.js");
var request = require("http/v4/request");

if (request.getMethod() === "POST") {
    console.log("innn")
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
    console.log(JSON.stringify(resultset));
}

function markNotificationSeen(notificationId) {
    let entityNotification = daoNotification.get(notificationId)
    entityNotification.SeenFlag = true;
    entityNotification.ChangeFlag = false;
    daoNotification.update(entityNotification);
    console.log(JSON.stringify(entityNotification));
}


// exports.markNotificationSeen = function (notificationId) {
//     let entityNotification = daoNotification.get(notificationId)
//     entityNotification.SeenFlag = true;
//     entityNotification.ChangeFlag = false;
//     daoNotification.update(entityNotification);
//     console.log(JSON.stringify(entityNotification));
// }
