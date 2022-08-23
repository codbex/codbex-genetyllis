
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
var dao = require("genetyllis-app/gen/dao/variants/AlleleFrequency.js");
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
        var entity = request.getJSON();
        entity.id = dao.create(entity);
        response.setHeader('Content-Location', '/services/v4/js/genetyllis-app/gen/dao/variants/AlleleFrequency.js/' + entity.id);
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
            sendResponseNotFound('');
        }
    })
    .execute();