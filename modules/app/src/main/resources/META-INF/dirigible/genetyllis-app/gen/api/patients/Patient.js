/*
 * Copyright (c) 2022 codbex or an codbex affiliate company and contributors
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-FileCopyrightText: 2022 codbex or an codbex affiliate company and contributors
 * SPDX-License-Identifier: EPL-2.0
 */
var rs = require("http/v4/rs");
var dao = require("genetyllis-app/gen/dao/patients/Patient");
var http = require("genetyllis-app/gen/api/utils/http");

rs.service()
	.resource("")
	.get(function (ctx, request) {
		var queryOptions = {};
		var parameters = request.getParameterNames();
		for (var i = 0; i < parameters.length; i++) {
			queryOptions[parameters[i]] = request.getParameter(parameters[i]);
		}
		var entities = dao.list(queryOptions);
		http.sendResponseOk(entities);
	})
	.produces(["application/json"])
	.catch(function (ctx, error) {
		if (error.name === "ForbiddenError") {
			http.sendForbiddenRequest(error.message);
		} else if (error.name === "ValidationError") {
			http.sendResponseBadRequest(error.message);
		} else {
			http.sendInternalServerError(error.message);
		}
	})
	.resource("count")
	.get(function (ctx, request) {
		http.sendResponseOk(dao.count());
	})
	.catch(function (ctx, error) {
		if (error.name === "ForbiddenError") {
			http.sendForbiddenRequest(error.message);
		} else if (error.name === "ValidationError") {
			http.sendResponseBadRequest(error.message);
		} else {
			http.sendInternalServerError(error.message);
		}
	})
	.resource("{id}")
	.get(function (ctx) {
		var id = ctx.pathParameters.id;
		var entity = dao.existsPatientByLabId(id);
		if (entity) {
			http.sendResponseOk(entity);
		} else {
			http.sendResponseNotFound("Patient not found");
		}
	})
	.produces(["application/json"])
	.catch(function (ctx, error) {
		if (error.name === "ForbiddenError") {
			http.sendForbiddenRequest(error.message);
		} else if (error.name === "ValidationError") {
			http.sendResponseBadRequest(error.message);
		} else {
			http.sendInternalServerError(error.message);
		}
	})
	.resource("getPatientByLabId/{labId}")
	.get(function (ctx) {
		var labId = ctx.pathParameters.labId;
		var entity = dao.getPatientByLabId(labId);
		if (entity) {
			http.sendResponseOk(entity);
		} else {
			http.sendResponseNotFound("There was a problem with the database!");
		}
	})
	.produces(["application/json"])
	.catch(function (ctx, error) {
		if (error.name === "ForbiddenError") {
			http.sendForbiddenRequest(error.message);
		} else if (error.name === "ValidationError") {
			http.sendResponseBadRequest(error.message);
		} else {
			http.sendInternalServerError(error.message);
		}
	})
	.resource("loadPatientHistory/{labId}")
	.get(function (ctx) {
		var labId = ctx.pathParameters.labId;
		var entity = dao.getPatientAndHistoryByLabId(labId);
		if (entity) {
			http.sendResponseOk(entity);
		} else {
			http.sendResponseNotFound("Patient not found!");
		}
	})
	.produces(["application/json"])
	.catch(function (ctx, error) {
		if (error.name === "ForbiddenError") {
			http.sendForbiddenRequest(error.message);
		} else if (error.name === "ValidationError") {
			http.sendResponseBadRequest(error.message);
		} else {
			http.sendInternalServerError(error.message);
		}
	})
	.resource("filterPatients")
	.post(function (ctx, request, response) {
		var patient = request.getJSON();
		var result = dao.filterPatients(patient);
		if (result) {
			http.sendResponseOk(result);
		} else {
			http.sendResponseNotFound("Patient not found!");
		}
	})
	.produces(["application/json"])
	.catch(function (ctx, error) {
		if (error.name === "ForbiddenError") {
			http.sendForbiddenRequest(error.message);
		} else if (error.name === "ValidationError") {
			http.sendResponseBadRequest(error.message);
		} else {
			http.sendInternalServerError(error.message);
		}
	})
	.resource("")
	.post(function (ctx, request, response) {
		var entity = request.getJSON();
		if (entity.Id && entity.Id !== undefined) {
			dao.update(entity);
		} else {
			entity.Id = dao.create(entity);
		}
		response.setHeader("Content-Location", "/services/v4/js/genetyllis-app/gen/api/Patient.js/" + entity.Id);
		http.sendResponseCreated(entity);
	})
	.produces(["application/json"])
	.catch(function (ctx, error) {
		if (error.name === "ForbiddenError") {
			http.sendForbiddenRequest(error.message);
		} else if (error.name === "ValidationError") {
			http.sendResponseBadRequest(error.message);
		} else {
			http.sendInternalServerError(error.message);
		}
	})
	.resource("{id}")
	.put(function (ctx, request) {
		var entity = request.getJSON();
		entity.Id = ctx.pathParameters.id;
		dao.update(entity);
		http.sendResponseOk(entity);
	})
	.produces(["application/json"])
	.catch(function (ctx, error) {
		if (error.name === "ForbiddenError") {
			http.sendForbiddenRequest(error.message);
		} else if (error.name === "ValidationError") {
			http.sendResponseBadRequest(error.message);
		} else {
			http.sendInternalServerError(error.message);
		}
	})
	.resource("{id}")
	.delete(function (ctx) {
		var id = ctx.pathParameters.id;
		var entity = dao.get(id);
		if (entity) {
			dao.delete(id);
			http.sendResponseNoContent();
		} else {
			http.sendResponseNotFound("Patient not found");
		}
	})
	.catch(function (ctx, error) {
		if (error.name === "ForbiddenError") {
			http.sendForbiddenRequest(error.message);
		} else if (error.name === "ValidationError") {
			http.sendResponseBadRequest(error.message);
		} else {
			http.sendInternalServerError(error.message);
		}
	})
	.execute();
