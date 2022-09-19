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
const response = require("http/v4/response");
const extensions = require("core/v4/extensions");

let tiles = {};

let tileExtensions = extensions.getExtensions("genetyllis-app-tile");
for (let i = 0; tileExtensions !== null && i < tileExtensions.length; i++) {
    let tileExtension = require(tileExtensions[i]);
    let tile = tileExtension.getTile();
    if (!tiles[tile.group]) {
        tiles[tile.group] = [];
    }
    tiles[tile.group].push({
        name: tile.name,
        location: tile.location,
        caption: tile.caption,
        tooltip: tile.tooltip,
        order: tile.order
    });
}

for (let next in tiles) {
    tiles[next] = tiles[next].sort(function (a, b) {
        var result = a.order - b.order;
        return result;
    });
}

response.println(JSON.stringify(tiles));