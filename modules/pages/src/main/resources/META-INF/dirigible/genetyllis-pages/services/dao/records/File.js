const dao = require("genetyllis-app/gen/dao/records/File");
const EntityUtils = require("genetyllis-app/gen/dao/utils/EntityUtils");
const query = require("db/v4/query");

exports.list = function (settings) {
    return dao.list(settings);
};

exports.get = function (id) {
    return dao.get(id);
};

exports.create = function (entity) {
    // console.log("JSON.stringify(entdsaadsadsdsaadssadasdasdsdasdasadsdasadsdasity)")
    return dao.create(exports.checkNonExistantFiles(entity));
};

exports.update = function (entity) {
    // console.log(JSON.stringify(entity))
    // console.log("JSON.stringify(entity)")
    dao.update(entity);
};

exports.delete = function (id) {
    dao.delete(id);
};

exports.count = function () {
    return dao.count();
};

exports.customDataCount = function () {
    dao.customDataCount();
};

function triggerEvent(operation, data) {
    producer.queue("genetyllis-app/records/File/" + operation).send(JSON.stringify(data));
}

//function to return files that are not uploaded for a certain analysis
exports.checkNonExistantFiles = function (fileArray) {
    nonExistantFileEntries = [];
    fileArray.forEach(file => {
        let response = [];
        response = query.execute('SELECT * FROM "GENETYLLIS_FILE" WHERE "FILE_ANALYSISID" = ? AND "FILE_PATH" = ?', [file.AnalysisId, file.Path]);

        if (response.length == 0)
            nonExistantFileEntries.push(file)
    })

    return nonExistantFileEntries;


}

exports.getFile = function (file) {
    // console.log(file)
    // console.log("lkdasl;kdsakl;dsakl;ads;kldsa;klads;lkads")
    return query.execute('SELECT * FROM "GENETYLLIS_FILE" WHERE "FILE_ANALYSISID" = ? AND "FILE_PATH" = ?', [file.AnalysisId, file.Path]);
}