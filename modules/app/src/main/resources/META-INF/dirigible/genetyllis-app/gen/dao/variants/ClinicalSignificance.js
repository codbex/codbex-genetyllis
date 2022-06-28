var query = require("db/v4/query");
var producer = require("messaging/v4/producer");
var daoApi = require("db/v4/dao");
var EntityUtils = require("genetyllis-app/gen/dao/utils/EntityUtils");

var dao = daoApi.create({
	table: "GENETYLLIS_CLINICALSIGNIFICANCE",
	properties: [
		{
			name: "Id",
			column: "CLINICALSIGNIFICANCE_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		}, {
			name: "VariantId",
			column: "CLINICALSIGNIFICANCE_VARIANTID",
			type: "INTEGER",
		}, {
			name: "PathologyId",
			column: "CLINICALSIGNIFICANCE_PATHOLOGYID",
			type: "INTEGER",
		}, {
			name: "SignificanceId",
			column: "CLINICALSIGNIFICANCE_SIGNIFICANCEID",
			type: "INTEGER",
		}, {
			name: "Evaluated",
			column: "CLINICALSIGNIFICANCE_EVALUATED",
			type: "DATE",
		}, {
			name: "ReviewStatus",
			column: "CLINICALSIGNIFICANCE_REVIEWSTATUS",
			type: "VARCHAR",
		}, {
			name: "Updated",
			column: "CLINICALSIGNIFICANCE_UPDATED",
			type: "DATE",
		}]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setLocalDate(e, "Evaluated");
		EntityUtils.setLocalDate(e, "Updated");
		return e;
	});
};

exports.get = function(id) {
	var entity = dao.find(id);
	EntityUtils.setLocalDate(entity, "Evaluated");
	EntityUtils.setLocalDate(entity, "Updated");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setLocalDate(entity, "Evaluated");
	EntityUtils.setLocalDate(entity, "Updated");
	var id = dao.insert(entity);
	triggerEvent("Create", {
		table: "GENETYLLIS_CLINICALSIGNIFICANCE",
		key: {
			name: "Id",
			column: "CLINICALSIGNIFICANCE_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	EntityUtils.setLocalDate(entity, "Evaluated");
	EntityUtils.setLocalDate(entity, "Updated");
	dao.update(entity);
	triggerEvent("Update", {
		table: "GENETYLLIS_CLINICALSIGNIFICANCE",
		key: {
			name: "Id",
			column: "CLINICALSIGNIFICANCE_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "GENETYLLIS_CLINICALSIGNIFICANCE",
		key: {
			name: "Id",
			column: "CLINICALSIGNIFICANCE_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	var resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM GENETYLLIS_CLINICALSIGNIFICANCE");
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
	producer.queue("genetyllis-app/variants/ClinicalSignificance/" + operation).send(JSON.stringify(data));
}