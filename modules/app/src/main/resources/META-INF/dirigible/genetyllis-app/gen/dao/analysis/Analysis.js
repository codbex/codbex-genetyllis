var query = require("db/v4/query");
var producer = require("messaging/v4/producer");
var daoApi = require("db/v4/dao");
var EntityUtils = require("genetyllis-app/gen/dao/utils/EntityUtils");

var dao = daoApi.create({
	table: "GENETYLLIS_ANALYSIS",
	properties: [
		{
			name: "Id",
			column: "ANALYSIS_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		}, {
			name: "Date",
			column: "ANALYSIS_DATE",
			type: "DATE",
		}, {
			name: "ProviderId",
			column: "ANALYSIS_PROVIDERID",
			type: "INTEGER",
		}, {
			name: "PlatformId",
			column: "ANALYSIS_PLATFORMID",
			type: "INTEGER",
		}, {
			name: "PatientId",
			column: "GENETYLLIS_ANALYSIS_PATIENTID",
			type: "INTEGER",
		}]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setLocalDate(e, "Date");
		return e;
	});
};

exports.get = function(id) {
	var entity = dao.find(id);
	EntityUtils.setLocalDate(entity, "Date");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setLocalDate(entity, "Date");
	var id = dao.insert(entity);
	triggerEvent("Create", {
		table: "GENETYLLIS_ANALYSIS",
		key: {
			name: "Id",
			column: "ANALYSIS_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	EntityUtils.setLocalDate(entity, "Date");
	dao.update(entity);
	triggerEvent("Update", {
		table: "GENETYLLIS_ANALYSIS",
		key: {
			name: "Id",
			column: "ANALYSIS_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "GENETYLLIS_ANALYSIS",
		key: {
			name: "Id",
			column: "ANALYSIS_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	var resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM GENETYLLIS_ANALYSIS");
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
	producer.queue("genetyllis-app/analysis/Analysis/" + operation).send(JSON.stringify(data));
}