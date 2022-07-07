var daoApi = require('db/v4/dao');
var dao = daoApi.create({
	'table': 'GENETYLLIS_PATIENT',
	'properties': [
		{
			'name': 'PATIENT_ID',
			'column': 'PATIENT_ID',
			'type': 'INTEGER',
			'id': true,
			'required': true
		}, {
			'name': 'PATIENT_GENDERID',
			'column': 'PATIENT_GENDERID',
			'type': 'INTEGER',
			'id': false,
			'required': false
		}, {
			'name': 'PATIENT_INFO',
			'column': 'PATIENT_INFO',
			'type': 'VARCHAR',
			'id': false,
			'required': false
		}, {
			'name': 'PATIENT_AGE',
			'column': 'PATIENT_AGE',
			'type': 'INTEGER',
			'id': false,
			'required': false
		}, {
			'name': 'GENETYLLIS_PATIENT_LABID',
			'column': 'GENETYLLIS_PATIENT_LABID',
			'type': 'VARCHAR',
			'id': false,
			'required': true
		}
	]
});

exports.list = function (settings) {
	return dao.list(settings);
};

exports.get = function (id) {
	return dao.find(id);
};

exports.create = function (entity) {
	return dao.insert(entity);
};

exports.update = function (entity) {
	return dao.update(entity);
};

exports.delete = function (id) {
	dao.remove(id);
};

