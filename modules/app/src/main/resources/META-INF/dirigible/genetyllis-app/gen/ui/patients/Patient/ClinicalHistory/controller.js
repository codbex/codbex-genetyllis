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
		messageHubProvider.eventIdPrefix = 'genetyllis-app.patients.ClinicalHistory';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/v4/js/genetyllis-app/gen/api/patients/ClinicalHistory.js";
	}])
	.controller('PageController', ['$scope', '$http', '$http', 'messageHub', 'entityApi', function ($scope, $http, $http, messageHub, entityApi) {

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 10;
		}
		resetPagination();

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("genetyllis-app.patients.Patient.entitySelected", function (msg) {
			resetPagination();
			$scope.selectedMainEntityId = msg.data.selectedMainEntityId;
			$scope.loadPage($scope.dataPage);
		}, true);

		messageHub.onDidReceiveMessage("genetyllis-app.patients.Patient.clearDetails", function (msg) {
			$scope.$apply(function () {
				resetPagination();
				$scope.selectedMainEntityId = null;
				$scope.data = null;
			});
		}, true);

		messageHub.onDidReceiveMessage("clearDetails", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("entityCreated", function (msg) {
			$scope.loadPage($scope.dataPage);
		});

		messageHub.onDidReceiveMessage("entityUpdated", function (msg) {
			$scope.loadPage($scope.dataPage);
		});
		//-----------------Events-------------------//

		$scope.loadPage = function (pageNumber) {
			let PatientId = $scope.selectedMainEntityId;
			$scope.dataPage = pageNumber;
			entityApi.count(PatientId).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("ClinicalHistory", `Unable to count ClinicalHistory: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let query = `PatientId=${PatientId}`;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				entityApi.filter(query, offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("ClinicalHistory", `Unable to list ClinicalHistory: '${response.message}'`);
						return;
					}
					$scope.data = response.data;
				});
			});
		};

		$scope.selectEntity = function (entity) {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = function (entity) {
			$scope.selectedEntity = entity;
			messageHub.showDialogWindow("ClinicalHistory-details", {
				action: "select",
				entity: entity,
				optionsPatientId: $scope.optionsPatientId,
				optionsPathologyId: $scope.optionsPathologyId,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("ClinicalHistory-details", {
				action: "create",
				entity: {},
				selectedMainEntityKey: "PatientId",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsPatientId: $scope.optionsPatientId,
				optionsPathologyId: $scope.optionsPathologyId,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("ClinicalHistory-details", {
				action: "update",
				entity: entity,
				selectedMainEntityKey: "PatientId",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsPatientId: $scope.optionsPatientId,
				optionsPathologyId: $scope.optionsPathologyId,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete ClinicalHistory?',
				`Are you sure you want to delete ClinicalHistory? This action cannot be undone.`,
				[{
					id: "delete-btn-yes",
					type: "emphasized",
					label: "Yes",
				},
				{
					id: "delete-btn-no",
					type: "normal",
					label: "No",
				}],
			).then(function (msg) {
				if (msg.data === "delete-btn-yes") {
					entityApi.delete(id).then(function (response) {
						if (response.status != 204) {
							messageHub.showAlertError("ClinicalHistory", `Unable to delete ClinicalHistory: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsPatientId = [];
		$scope.optionsPathologyId = [];

		$http.get("/services/v4/js/genetyllis-app/gen/api/patients/Patient.js").then(function (response) {
			$scope.optionsPatientId = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Info
				}
			});
		});

		$http.get("/services/v4/js/genetyllis-app/gen/api/nomenclature/Pathology.js").then(function (response) {
			$scope.optionsPathologyId = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});
		$scope.optionsPatientIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsPatientId.length; i++) {
				if ($scope.optionsPatientId[i].value === optionKey) {
					return $scope.optionsPatientId[i].text;
				}
			}
			return null;
		};
		$scope.optionsPathologyIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsPathologyId.length; i++) {
				if ($scope.optionsPathologyId[i].value === optionKey) {
					return $scope.optionsPathologyId[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
