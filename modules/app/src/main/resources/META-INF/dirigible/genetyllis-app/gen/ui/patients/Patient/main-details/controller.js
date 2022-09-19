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
angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'genetyllis-app.Patients.Patient';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/v4/js/genetyllis-app/gen/api/Patients/Patient.js";
	}])
	.controller('PageController', ['$scope', 'messageHub', 'entityApi', function ($scope, messageHub, entityApi) {

		$scope.entity = {};
		$scope.formHeaders = {
			select: "Patient Details",
			create: "Create Patient",
			update: "Update Patient"
		};
		$scope.formErrors = {};
		$scope.action = 'select';

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("clearDetails", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.formErrors = {};
				$scope.optionsGenderId = [];
				$scope.optionsPhysicianId = [];
				$scope.optionsPopulationId = [];
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("entitySelected", function (msg) {
			$scope.$apply(function () {
				if (msg.data.entity.BirthDate) {
					msg.data.entity.BirthDate = new Date(msg.data.entity.BirthDate);
				}
				$scope.entity = msg.data.entity;
				$scope.optionsGenderId = msg.data.optionsGenderId;
				$scope.optionsPhysicianId = msg.data.optionsPhysicianId;
				$scope.optionsPopulationId = msg.data.optionsPopulationId;
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("createEntity", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsGenderId = msg.data.optionsGenderId;
				$scope.optionsPhysicianId = msg.data.optionsPhysicianId;
				$scope.optionsPopulationId = msg.data.optionsPopulationId;
				$scope.action = 'create';
				// Set Errors for required fields only
				$scope.formErrors = {
				};
			});
		});

		messageHub.onDidReceiveMessage("updateEntity", function (msg) {
			$scope.$apply(function () {
				if (msg.data.entity.BirthDate) {
					msg.data.entity.BirthDate = new Date(msg.data.entity.BirthDate);
				}
				$scope.entity = msg.data.entity;
				$scope.optionsGenderId = msg.data.optionsGenderId;
				$scope.optionsPhysicianId = msg.data.optionsPhysicianId;
				$scope.optionsPopulationId = msg.data.optionsPopulationId;
				$scope.action = 'update';
			});
		});
		//-----------------Events-------------------//

		$scope.isValid = function (isValid, property) {
			$scope.formErrors[property] = !isValid ? true : undefined;
			for (let next in $scope.formErrors) {
				if ($scope.formErrors[next] === true) {
					$scope.isFormValid = false;
					return;
				}
			}
			$scope.isFormValid = true;
		};

		$scope.create = function () {
			entityApi.create($scope.entity).then(function (response) {
				if (response.status != 201) {
					messageHub.showAlertError("Patient", `Unable to create Patient: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("Patient", "Patient successfully created");
			});
		};

		$scope.update = function () {
			entityApi.update($scope.entity.Id, $scope.entity).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("Patient", `Unable to update Patient: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("Patient", "Patient successfully updated");
			});
		};

		$scope.cancel = function () {
			messageHub.postMessage("clearDetails");
		};

	}]);