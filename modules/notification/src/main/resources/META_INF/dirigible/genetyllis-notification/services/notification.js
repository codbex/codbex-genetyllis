
var query = require("db/v4/query");
var httpClient = require("http/v4/client");
var daoNotification = require("genetyllis-app/gen/dao/users/Notification.js");

function getNotifications(userId) {
    var statement = "SELECT * FROM GENETYLLIS_NOTFICAITON WHERE NOTIFICATION_USERID = ? AND NOTIFICATION_SEENFLAG = 0";
    var resultset = query.execute(statement, [userId], "local", "DefaultDB");

    return resultset;
}
