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
	var api = "/services/v4/js/genetyllis-pages/HomePage/server/patientsInfo.js";
	function load() {
		$http.get(api)
			.then(function (data) {
				$scope.data = data.data;
			});
	}
	load();

	$scope.openNewDialog = function () {
		$scope.actionType = 'new';
		$scope.entity = {};
		toggleEntityModal();
	};

	$scope.openEditDialog = function (entity) {
		$scope.actionType = 'update';
		$scope.entity = entity;
		toggleEntityModal();
	};

	$scope.openDeleteDialog = function (entity) {
		$scope.actionType = 'delete';
		$scope.entity = entity;
		toggleEntityModal();
	};

	$scope.close = function () {
		load();
		toggleEntityModal();
	};

	$scope.create = function () {

		$http.post(api, JSON.stringify($scope.entity))
			.then(function (data) {
				load();
				toggleEntityModal();
			}, function (data) {
				alert(JSON.stringify($scope.entity));
			});

	};

	$scope.update = function () {
		console.log("Hello");

		$http.put(api + '/' + $scope.entity.id, JSON.stringify($scope.entity))

			.then(function (data) {
				load();
				toggleEntityModal();
			}, function (data) {
				alert(JSON.stringify(data.data));
			})
	};

	$scope.delete = function () {
		console.log("Hello");
		$http.delete(api + '/' + $scope.entity.id)
			.then(function (data) {
				load();
				toggleEntityModal();
			}, function (data) {
				alert(JSON.stringify(data.data));
			});
	};


	function toggleEntityModal() {
		$('#entityModal').modal('toggle');
	}
});
