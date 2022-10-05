const query = require("db/v4/query");
const producer = require("messaging/v4/producer");
const daoApi = require("db/v4/dao");
const EntityUtils = require("genetyllis-app/gen/dao/utils/EntityUtils");

let dao = daoApi.create({
	table: "GENETYLLIS_ALLELEFREQUENCY",
	properties: [
		{
			name: "Id",
			column: "ALLELEFREQUENCY_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "VariantId",
			column: "ALLELEFREQUENCY_VARIANTID",
			type: "INTEGER",
		},
 {
			name: "GenderId",
			column: "ALLELEFREQUENCY_GENDERID",
			type: "INTEGER",
		},
 {
			name: "PopulationId",
			column: "ALLELEFREQUENCY_POPULATIONID",
			type: "INTEGER",
		},
 {
			name: "Frequency",
			column: "ALLELEFREQUENCY_FREQUENCY",
			type: "DOUBLE",
		},
 {
			name: "Updated",
			column: "ALLELEFREQUENCY_UPDATED",
			type: "DATE",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setDate(e, "Updated");
		return e;
	});
};

exports.get = function(id) {
	let entity = dao.find(id);
	EntityUtils.setDate(entity, "Updated");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setLocalDate(entity, "Updated");
	let id = dao.insert(entity);
	triggerEvent("Create", {
		table: "GENETYLLIS_ALLELEFREQUENCY",
		key: {
			name: "Id",
			column: "ALLELEFREQUENCY_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	// EntityUtils.setLocalDate(entity, "Updated");
	dao.update(entity);
	triggerEvent("Update", {
		table: "GENETYLLIS_ALLELEFREQUENCY",
		key: {
			name: "Id",
			column: "ALLELEFREQUENCY_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "GENETYLLIS_ALLELEFREQUENCY",
		key: {
			name: "Id",
			column: "ALLELEFREQUENCY_ID",
			value: id
		}
	});
};

exports.count = function (VariantId) {
	let resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM \"GENETYLLIS_ALLELEFREQUENCY\" WHERE \"ALLELEFREQUENCY_VARIANTID\" = ?", [VariantId]);
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
	let resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM ALLELEFREQUENCY");
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
	producer.queue("genetyllis-app/variants/AlleleFrequency/" + operation).send(JSON.stringify(data));
}