var query = require("db/v4/query");
var producer = require("messaging/v4/producer");
var daoApi = require("db/v4/dao");
var EntityUtils = require("genetyllis-app/gen/dao/utils/EntityUtils");

var dao = daoApi.create({
	table: "GENETYLLIS_PATIENT",
	properties: [
		{
			name: "Id",
			column: "PATIENT_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		}, {
			name: "LabId",
			column: "GENETYLLIS_PATIENT_LABID",
			type: "VARCHAR",
		}, {
			name: "BirthDate",
			column: "PATIENT_AGE",
			type: "DATE",
		}, {
			name: "GenderId",
			column: "PATIENT_GENDERID",
			type: "INTEGER",
		}, {
			name: "Info",
			column: "PATIENT_INFO",
			type: "VARCHAR",
		}, {
			name: "PhysicianId",
			column: "GENETYLLIS_PATIENT_PHYSICIANID",
			type: "INTEGER",
		}, {
			name: "PopulationId",
			column: "GENETYLLIS_PATIENT_POPULATIONID",
			type: "INTEGER",
		}]
});

exports.list = function (settings) {
	return dao.list(settings).map(function (e) {
		EntityUtils.setLocalDate(e, "BirthDate");
		return e;
	});
};

exports.get = function (id) {
	var entity = dao.find(id);
	EntityUtils.setLocalDate(entity, "BirthDate");
	return entity;
};

exports.create = function (entity) {
	EntityUtils.setLocalDate(entity, "BirthDate");
	var id = dao.insert(entity);
	triggerEvent("Create", {
		table: "GENETYLLIS_PATIENT",
		key: {
			name: "Id",
			column: "PATIENT_ID",
			value: id
		}
	});
	return id;
};

exports.update = function (entity) {
	EntityUtils.setLocalDate(entity, "BirthDate");
	dao.update(entity);
	triggerEvent("Update", {
		table: "GENETYLLIS_PATIENT",
		key: {
			name: "Id",
			column: "PATIENT_ID",
			value: entity.Id
		}
	});
};

exports.delete = function (id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "GENETYLLIS_PATIENT",
		key: {
			name: "Id",
			column: "PATIENT_ID",
			value: id
		}
	});
};

exports.count = function () {
	return dao.count();
};

// exports.customDataCount = function() {
// 	var resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM GENETYLLIS_PATIENT");
// 	if (resultSet !== null && resultSet[0] !== null) {
// 		if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
// 			return resultSet[0].COUNT;
// 		} else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
// 			return resultSet[0].count;
// 		}
// 	}
// 	return 0;
// };

exports.customDataCount = function (cui) {
	var resultSet = query.execute("SELECT * FROM GENETYLLIS_PATHOLOGY WHERE PATHOLOGY_CUI LIKE '%" + cui + "%' LIMIT 10");
	console.log(resultSet);
	if (resultSet !== null && resultSet[0] !== null) {
		if (resultSet[0].PATHOLOGY_CUI !== undefined && resultSet[0].PATHOLOGY_CUI !== null) {
			return resultSet;
		}
	}
	return 0;
};

function triggerEvent(operation, data) {
	producer.queue("genetyllis-app/patients/Patient/" + operation).send(JSON.stringify(data));
}