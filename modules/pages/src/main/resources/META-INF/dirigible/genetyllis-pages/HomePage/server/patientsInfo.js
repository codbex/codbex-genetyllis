var dao = require("genetyllis-app/gen/dao/patients/Patient.js");
var rs = require('http/v4/rs');
var response = require('http/v4/response');

// HTTP 200
var sendResponseOk = function (entity) {
    sendResponse(200, entity);
};

// HTTP 201
var sendResponseCreated = function (entity) {
    sendResponse(201, entity);
};

// HTTP 200
var sendResponseNoContent = function () {
    sendResponse(204);
};

// HTTP 400
var sendResponseBadRequest = function (message) {
    sendResponse(404, {
        'code': 400,
        'message': message
    });
};

// HTTP 404
var sendResponseNotFound = function (message) {
    sendResponse(404, {
        'code': 404,
        'message': message
    });
};

// Generic
var sendResponse = function (status, body) {
    response.setContentType('application/json');
    response.setStatus(status);
    if (body) {
        response.println(JSON.stringify(body));
    }
};

rs.service()
    .resource('')
    .get(function () {
        console.log("get");
        var entities = dao.list();
        sendResponseOk(entities);
    })
    .resource('{id}')
    .get(function (ctx) {
        var id = ctx.pathParameters.id;
        var entity = dao.get(id);
        if (entity) {
            sendResponseOk(entity);
        } else {
            sendResponseNotFound('Books not found');
        }
    })
    .resource('')
    .post(function (ctx, request, response) {
        console.log("post" + request);
        var entity = request.getJSON();
        entity.id = dao.create(entity);
        response.setHeader('Content-Location', '/services/v4/js/genetyllis-app/dao/patients/Patient.js/' + entity.id);
        sendResponseCreated(entity);
    })
    .resource('{id}')
    .put(function (ctx, request) {
        var entity = request.getJSON();
        entity.id = ctx.pathParameters.id;
        dao.update(entity);
        sendResponseOk(entity);
    })
    .resource('{id}')
    .delete(function (ctx) {
        var id = ctx.pathParameters.id;
        var entity = dao.get(id);
        if (entity) {
            dao.delete(id);
            sendResponseNoContent();
        } else {
            sendResponseNotFound('Books not found');
        }
    })
    .execute();







// var daoPatient = require("genetyllis-app/gen/dao/patients/Patient.js");

// let entityPatient = {};

// var database = require("db/v4/database");
// var response = require("http/v4/response");
// var connection = database.getConnection("local", "DefaultDB");
// try {
//     var statement = connection.prepareStatement("select * from GENETYLLIS_PATIENT");
//     var resultSet = statement.executeQuery();
//     const patients = [];
//     let entityPatient = {};
//     // for (let i = 100; i < 130; i++) {
//     //     daoPatient.delete(i)
//     // }
//     // entityPatient.LabId = 'h11102';
//     // entityPatient.BirthDate = 103;
//     // entityPatient.GenderId = 1;
//     // entityPatient.Info = "Hello";
//     // daoPatient.create(entityPatient);

//     while (resultSet.next()) {
//         const patientInfo = resultSet.getString("PATIENT_INFO");
//         const patientAge = resultSet.getInt("PATIENT_AGE");
//         const patientId = resultSet.getInt("PATIENT_ID");
//         const patientGenderId = resultSet.getInt("PATIENT_GENDERID");
//         const patientLabId = resultSet.getString("GENETYLLIS_PATIENT_LABID");


//         patients.push({
//             patientInfo,
//             patientAge,
//             patientId,
//             patientGenderId,
//             patientLabId
//         })
//     }



//     response.println(JSON.stringify(patients));

//     resultSet.close();
//     statement.close();
// } catch (e) {
//     console.trace(e);
//     response.println(e.message);
// } finally {
//     connection.close();
// }
// exports.entityPatient;
// response.flush();
// response.close();