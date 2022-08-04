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
angular.module('page', []);
angular.module('page').controller('PageController', function ($scope, $http) {
    var api = "/services/v4/js/genetyllis-update/view/updateRs.js";
    // var apiUpload = "/services/v4/js/genetyllis-update/services/updateVariant.js";
    var updateVariantController = "/services/v4/js/genetyllis-update/services/updateController.js";

    $scope.getVariantId = function () {
        $scope.variant = $scope.data.filter(v => {
            return v.Id == $scope.variant.Id;
        })

        $scope.variantInfo = $scope.variant[0];

        $scope.actionType = "show";

        $http.post(updateVariantController, JSON.stringify({ variantId: $scope.variantInfo.Id }))
            .then(data => {
                console.log("asd", data);
            });
    }

    function load() {
        $http.get(api)
            .then(function (data) {
                $scope.data = data.data;
                console.log(data, " : patient");
            });
    }
    load();
});
