const query = require("db/query");
const producer = require("messaging/producer");
const daoApi = require("db/dao");
const EntityUtils = require("genetyllis-app/gen/dao/utils/EntityUtils");

let dao = daoApi.create({
	table: "GENETYLLIS_VARIANTRECORD",
	properties: [
		{
			name: "Id",
			column: "VARIANTRECORD_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "PatientId",
			column: "VARIANTRECORD_PATIENTID",
			type: "INTEGER",
		},
 {
			name: "VariantId",
			column: "VARIANTRECORD_VARIANTID",
			type: "INTEGER",
		},
 {
			name: "Homozygous",
			column: "VARIANTRECORD_HOMOZYGOUS",
			type: "BOOLEAN",
		},
 {
			name: "AlleleDepth",
			column: "VARIANTRECORD_ALLELEDEPTH",
			type: "INTEGER",
		},
 {
			name: "Depth",
			column: "VARIANTRECORD_DEPTH",
			type: "INTEGER",
		},
 {
			name: "Quality",
			column: "VARIANTRECORD_QUALITY",
			type: "DOUBLE",
		},
 {
			name: "AnalysisId",
			column: "VARIANTRECORD_ANALYSISID",
			type: "INTEGER",
		},
 {
			name: "Highlight",
			column: "VARIANTRECORD_HIGHLIGHT",
			type: "BOOLEAN",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setBoolean(e, "Homozygous");
		EntityUtils.setBoolean(e, "Highlight");
		return e;
	});
};

exports.get = function(id) {
	let entity = dao.find(id);
	EntityUtils.setBoolean(entity, "Homozygous");
	EntityUtils.setBoolean(entity, "Highlight");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setBoolean(entity, "Homozygous");
	EntityUtils.setBoolean(entity, "Highlight");
	let id = dao.insert(entity);
	triggerEvent("Create", {
		table: "GENETYLLIS_VARIANTRECORD",
		key: {
			name: "Id",
			column: "VARIANTRECORD_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	EntityUtils.setBoolean(entity, "Homozygous");
	EntityUtils.setBoolean(entity, "Highlight");
	dao.update(entity);
	triggerEvent("Update", {
		table: "GENETYLLIS_VARIANTRECORD",
		key: {
			name: "Id",
			column: "VARIANTRECORD_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "GENETYLLIS_VARIANTRECORD",
		key: {
			name: "Id",
			column: "VARIANTRECORD_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "GENETYLLIS_VARIANTRECORD"');
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
	producer.queue("genetyllis-app/records/VariantRecord/" + operation).send(JSON.stringify(data));
}