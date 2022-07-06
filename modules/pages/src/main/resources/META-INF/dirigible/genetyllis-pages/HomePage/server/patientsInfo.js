// var query = require("db/v4/query");
// var response = require("http/v4/response");
// var sql = "SELECT * FROM 'GENETYLLIS_PATIENT';"
// var resultset = query.execute(sql, null, "local", "DefaultDB");

var query = require("db/v4/query");
var response = require("http/v4/response");
var sql = "SELECT * FROM GENETYLLIS_PATIENT";
var resultset = query.execute(sql, [], "local", "DefaultDB");

response.println(JSON.stringify(resultset));


// var database = require("db/v4/database");
// var response = require("http/v4/response");

// var connection = database.getConnection("local", "DefaultDB");
// try {
//     var statement = connection.prepareStatement("select * from GENETYLLIS_PATIENT");
//     var resultSet = statement.executeQuery();
//     const patients = [];

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

// response.flush();
// response.close();


// const data = [
//     {
//         "name": "Id",
//         "column": "PATIENT_ID",
//         "type": "INTEGER",
//         "id": true,
//         "autoIncrement": true
//     },
//     {
//         "name": "LabId",
//         "column": "GENETYLLIS_PATIENT_LABID",
//         "type": "VARCHAR"
//     },
//     {
//         "name": "BirthDate",
//         "column": "PATIENT_AGE",
//         "type": "DATE"
//     },
//     {
//         "name": "GenderId",
//         "column": "PATIENT_GENDERID",
//         "type": "INTEGER"
//     },
//     {
//         "name": "Info",
//         "column": "PATIENT_INFO",
//         "type": "VARCHAR"
//     },
//     {
//         "name": "PhysicianId",
//         "column": "GENETYLLIS_PATIENT_PHYSICIANID",
//         "type": "INTEGER"
//     }
// ];

// response.println(JSON.stringify(data));
// response.flush();
// response.close();