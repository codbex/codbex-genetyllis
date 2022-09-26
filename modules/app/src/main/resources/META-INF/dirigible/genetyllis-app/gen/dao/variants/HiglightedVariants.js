const query = require("db/v4/query");
const producer = require("messaging/v4/producer");
const daoApi = require("db/v4/dao");
const EntityUtils = require("genetyllis-app/gen/dao/utils/EntityUtils");

let dao = daoApi.create({
	table: "GENETYLLIS_HIGLIGHTEDVARIANTS",
	properties: [
		{
			name: "HighlightedVariantId",
			column: "HIGLIGHTEDVARIANTS_HIGHLIGHTEDVARIANTID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "VariantRecordId",
			column: "HIGLIGHTEDVARIANTS_VARIANTRECORDID",
			type: "INTEGER",
		},
 {
			name: "VariantId",
			column: "HIGLIGHTEDVARIANTS_VARIANTID",
			type: "INTEGER",
		},
 {
			name: "Status",
			column: "HIGLIGHTEDVARIANTS_STATIS",
			type: "BOOLEAN",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setBoolean(e, "Status");
		return e;
	});
};

exports.get = function(id) {
	let entity = dao.find(id);
	EntityUtils.setBoolean(entity, "Status");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setBoolean(entity, "Status");
	let id = dao.insert(entity);
	triggerEvent("Create", {
		table: "GENETYLLIS_HIGLIGHTEDVARIANTS",
		key: {
			name: "HighlightedVariantId",
			column: "HIGLIGHTEDVARIANTS_HIGHLIGHTEDVARIANTID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	EntityUtils.setBoolean(entity, "Status");
	dao.update(entity);
	triggerEvent("Update", {
		table: "GENETYLLIS_HIGLIGHTEDVARIANTS",
		key: {
			name: "HighlightedVariantId",
			column: "HIGLIGHTEDVARIANTS_HIGHLIGHTEDVARIANTID",
			value: entity.HighlightedVariantId
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "GENETYLLIS_HIGLIGHTEDVARIANTS",
		key: {
			name: "HighlightedVariantId",
			column: "HIGLIGHTEDVARIANTS_HIGHLIGHTEDVARIANTID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM GENETYLLIS_HIGLIGHTEDVARIANTS");
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
	producer.queue("genetyllis-app/variants/HiglightedVariants/" + operation).send(JSON.stringify(data));
}