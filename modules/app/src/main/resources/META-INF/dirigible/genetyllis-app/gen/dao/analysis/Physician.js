var query = require("db/v4/query");
var producer = require("messaging/v4/producer");
var daoApi = require("db/v4/dao");

var dao = daoApi.create({
	table: "GENETYLLIS_PHYSICIAN",
	properties: [
		{
			name: "Id",
			column: "PHYSICIAN_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		}, {
			name: "Name",
			column: "PHYSICIAN_NAME",
			type: "VARCHAR",
		}, {
			name: "Email",
			column: "PHYSICIAN_EMAIL",
			type: "VARCHAR",
		}, {
			name: "InstitutionId",
			column: "PHYSICIAN_INSTITUTIONID",
			type: "INTEGER",
		}]
});

exports.list = function(settings) {
	return dao.list(settings);
};

exports.get = function(id) {
	return dao.find(id);
};

exports.create = function(entity) {
	var id = dao.insert(entity);
	triggerEvent("Create", {
		table: "GENETYLLIS_PHYSICIAN",
		key: {
			name: "Id",
			column: "PHYSICIAN_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	dao.update(entity);
	triggerEvent("Update", {
		table: "GENETYLLIS_PHYSICIAN",
		key: {
			name: "Id",
			column: "PHYSICIAN_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "GENETYLLIS_PHYSICIAN",
		key: {
			name: "Id",
			column: "PHYSICIAN_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	var resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM GENETYLLIS_PHYSICIAN");
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
	producer.queue("genetyllis-app/analysis/Physician/" + operation).send(JSON.stringify(data));
}