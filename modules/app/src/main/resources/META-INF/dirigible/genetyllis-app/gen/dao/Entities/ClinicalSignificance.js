var query = require("db/v4/query");
var producer = require("messaging/v4/producer");
var daoApi = require("db/v4/dao");
var EntityUtils = require("genetyllis-app/gen/dao/utils/EntityUtils");

var dao = daoApi.create({
	table: "CLINICALSIGNIFICANCE",
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
			name: "SignificanceTypeId",
			column: "CLINICALSIGNIFICANCE_SIGNIFICANCETYPEID",
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
		table: "CLINICALSIGNIFICANCE",
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
		table: "CLINICALSIGNIFICANCE",
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
		table: "CLINICALSIGNIFICANCE",
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
	var resultSet = query.execute("SELECT COUNT(*) AS COUNT FROM CLINICALSIGNIFICANCE");
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
	producer.queue("genetyllis-app/Entities/ClinicalSignificance/" + operation).send(JSON.stringify(data));
}