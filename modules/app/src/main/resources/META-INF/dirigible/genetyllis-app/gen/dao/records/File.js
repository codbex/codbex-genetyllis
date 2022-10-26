const query = require("db/v4/query");
const producer = require("messaging/v4/producer");
const daoApi = require("db/v4/dao");
const EntityUtils = require("genetyllis-app/gen/dao/utils/EntityUtils");

let dao = daoApi.create({
	table: "GENETYLLIS_FILE",
	properties: [
		{
			name: "Id",
			column: "FILE_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "AnalysisId",
			column: "FILE_ANALYSISID",
			type: "INTEGER",
		},
 {
			name: "DateUploaded",
			column: "FILE_DATEUPLOADED",
			type: "DATE",
		},
 {
			name: "UploadStatusId",
			column: "FILE_UPLOADSTATUSID",
			type: "INTEGER",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setDate(e, "DateUploaded");
		return e;
	});
};

exports.get = function(id) {
	let entity = dao.find(id);
	EntityUtils.setDate(entity, "DateUploaded");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setLocalDate(entity, "DateUploaded");
	let id = dao.insert(entity);
	triggerEvent("Create", {
		table: "GENETYLLIS_FILE",
		key: {
			name: "Id",
			column: "FILE_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	// EntityUtils.setLocalDate(entity, "DateUploaded");
	dao.update(entity);
	triggerEvent("Update", {
		table: "GENETYLLIS_FILE",
		key: {
			name: "Id",
			column: "FILE_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "GENETYLLIS_FILE",
		key: {
			name: "Id",
			column: "FILE_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM FILE");
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
	producer.queue("genetyllis-app/records/File/" + operation).send(JSON.stringify(data));
}