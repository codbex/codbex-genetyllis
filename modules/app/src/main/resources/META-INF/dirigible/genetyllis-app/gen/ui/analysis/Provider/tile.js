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
exports.getTile = function () {
    return {
        group: "Analysis",
        name: "Provider",
        caption: "Manage entity Provider",
        tooltip: "Provider",
        // icon: "file-o",
        location: "/services/v4/web/genetyllis-app/gen/ui/Analysis/index.html",
        order: "100",
        groupOrder: "50"
    };
};
