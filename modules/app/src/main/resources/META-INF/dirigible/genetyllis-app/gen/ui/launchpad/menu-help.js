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

const defaultMenuItems = [
    {
        label: "Help Portal",
        action: "open",
        order: 1,
        data: "https://www.dirigible.io/help/",
        divider: false
    },
    {
        label: "Contact Support",
        action: "open",
        order: 2,
        data: "https://github.com/eclipse/dirigible/issues",
        divider: false
    },
    {
        label: "Suggest a Feature",
        action: "open",
        order: 3,
        data: "https://github.com/eclipse/dirigible/issues/new?assignees=&labels=&template=feature_request.md&title=[New%20Feature]",
        divider: false
    },
    {
        label: "What's New",
        action: "open",
        order: 4,
        data: "https://twitter.com/dirigible_io",
        divider: false
    },
    {
        label: "Check for Updates",
        action: "open",
        order: 5,
        data: "http://download.dirigible.io/",
        divider: true
    }
];

let config = require("core/v4/configurations");

exports.getMenu = function () {
    let menu = {
        label: "Help",
        order: 900,
        items: [
            {
                label: "About",
                action: "openDialogWindow",
                order: 6,
                dialogId: "about",
                divider: false
            }]
    };

    let brandingHelpItems = config.get("DIRIGIBLE_BRANDING_HELP_ITEMS", "");
    if (brandingHelpItems && typeof brandingHelpItems === "string") {
        let helpItems = brandingHelpItems.split(",");
        helpItems.forEach(e => {
            let item = e.trim();
            menu.items.push({
                label: config.get(`DIRIGIBLE_BRANDING_HELP_ITEM_${item}_NAME`, item),
                order: parseInt(config.get(`DIRIGIBLE_BRANDING_HELP_ITEM_${item}_ORDER`, "0")),
                action: "open",
                data: config.get(`DIRIGIBLE_BRANDING_HELP_ITEM_${item}_URL`, "#"),
                divider: config.get(`DIRIGIBLE_BRANDING_HELP_ITEM_${item}_DIVIDER`, "false").toLowerCase() === "true"
            });
        });
    } else {
        menu.items = menu.items.concat(defaultMenuItems);
    }

    menu.items.sort((a, b) => a.order - b.order);
    return menu;
};