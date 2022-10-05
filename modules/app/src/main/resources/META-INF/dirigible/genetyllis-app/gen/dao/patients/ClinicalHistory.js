const query = require("db/v4/query");
const producer = require("messaging/v4/producer");
const daoApi = require("db/v4/dao");

let dao = daoApi.create({
	table: "GENETYLLIS_CLINICALHISTORY",
	properties: [
		{
			name: "Id",
			column: "CLINICALHISTORY_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "PatientId",
			column: "CLINICALHISTORY_PATIENTID",
			type: "INTEGER",
		},
 {
			name: "PathologyId",
			column: "CLINICALHISTORY_PATHOLOGYID",
			type: "INTEGER",
		},
 {
			name: "AgeOnset",
			column: "CLINICALHISTORY_AGEONSET",
			type: "INTEGER",
		},
 {
			name: "Notes",
			column: "CLINICALHISTORY_NOTES",
			type: "VARCHAR",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings);
};

exports.get = function(id) {
	return dao.find(id);
};

exports.create = function(entity) {
	let id = dao.insert(entity);
	triggerEvent("Create", {
		table: "GENETYLLIS_CLINICALHISTORY",
		key: {
			name: "Id",
			column: "CLINICALHISTORY_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	dao.update(entity);
	triggerEvent("Update", {
		table: "GENETYLLIS_CLINICALHISTORY",
		key: {
			name: "Id",
			column: "CLINICALHISTORY_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "GENETYLLIS_CLINICALHISTORY",
		key: {
			name: "Id",
			column: "CLINICALHISTORY_ID",
			value: id
		}
	});
};

exports.count = function (PatientId) {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "GENETYLLIS_CLINICALHISTORY" WHERE "CLINICALHISTORY_PATIENTID" = ?', [PatientId]);
	if (resultSet !== null && resultSet[0] !== null) {
		if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
			return resultSet[0].COUNT;
		} else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
			return resultSet[0].count;
		}
	}
	return 0;
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "GENETYLLIS_CLINICALHISTORY"');
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
	producer.queue("genetyllis-app/patients/ClinicalHistory/" + operation).send(JSON.stringify(data));
}