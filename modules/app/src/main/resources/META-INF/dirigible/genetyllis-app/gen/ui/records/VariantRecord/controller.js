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
		messageHubProvider.eventIdPrefix = 'genetyllis-app.Records.VariantRecord';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/v4/js/genetyllis-app/gen/api/Records/VariantRecord.js";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', function ($scope, $http, messageHub, entityApi) {

		$scope.dataPage = 1;
		$scope.dataCount = 0;
		$scope.dataOffset = 0;
		$scope.dataLimit = 10;
		$scope.action = "select";

		function refreshData() {
			$scope.dataReset = true;
			$scope.dataPage--;
		}

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("clearDetails", function (msg) {
			$scope.$apply(function () {
				$scope.selectedEntity = null;
				$scope.action = "select";
			});
		});

		messageHub.onDidReceiveMessage("entityCreated", function (msg) {
			refreshData();
			$scope.loadPage();
		});

		messageHub.onDidReceiveMessage("entityUpdated", function (msg) {
			refreshData();
			$scope.loadPage();
		});
		//-----------------Events-------------------//

		$scope.loadPage = function () {
			$scope.selectedEntity = null;
			entityApi.count().then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("VariantRecord", `Unable to count VariantRecord: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				$scope.dataPages = Math.ceil($scope.dataCount / $scope.dataLimit);
				let offset = ($scope.dataPage - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				if ($scope.dataReset) {
					offset = 0;
					limit = $scope.dataPage * $scope.dataLimit;
				}
				entityApi.list(offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("VariantRecord", `Unable to list VariantRecord: '${response.message}'`);
						return;
					}
					if ($scope.data == null || $scope.dataReset) {
						$scope.data = [];
						$scope.dataReset = false;
					}
					$scope.data = $scope.data.concat(response.data);
					$scope.dataPage++;
				});
			});
		};
		$scope.loadPage($scope.dataPage);

		$scope.selectEntity = function (entity) {
			$scope.selectedEntity = entity;
			messageHub.postMessage("entitySelected", {
				entity: entity,
				selectedMainEntityId: entity.Id,
				optionsPatientId: $scope.optionsPatientId,
				optionsVariantId: $scope.optionsVariantId,
				optionsAnalysisId: $scope.optionsAnalysisId,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			$scope.action = "create";

			messageHub.postMessage("createEntity", {
				entity: {},
				optionsPatientId: $scope.optionsPatientId,
				optionsVariantId: $scope.optionsVariantId,
				optionsAnalysisId: $scope.optionsAnalysisId,
			});
		};

		$scope.updateEntity = function () {
			$scope.action = "update";
			messageHub.postMessage("updateEntity", {
				entity: $scope.selectedEntity,
				optionsPatientId: $scope.optionsPatientId,
				optionsVariantId: $scope.optionsVariantId,
				optionsAnalysisId: $scope.optionsAnalysisId,
			});
		};

		$scope.deleteEntity = function () {
			let id = $scope.selectedEntity.Id;
			messageHub.showDialogAsync(
				'Delete VariantRecord?',
				`Are you sure you want to delete VariantRecord? This action cannot be undone.`,
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
							messageHub.showAlertError("VariantRecord", `Unable to delete VariantRecord: '${response.message}'`);
							return;
						}
						refreshData();
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsPatientId = [];
		$scope.optionsVariantId = [];
		$scope.optionsAnalysisId = [];

		$http.get("/services/v4/js/genetyllis-app/gen/api/Patients/Patient.js").then(function (response) {
			$scope.optionsPatientId = response.data.map(e => {
				return {
					value: e.Id,
					text: e.LabId
				}
			});
		});

		$http.get("/services/v4/js/genetyllis-app/gen/api/Variants/Variant.js").then(function (response) {
			$scope.optionsVariantId = response.data.map(e => {
				return {
					value: e.ID,
					text: e.HGVS
				}
			});
		});

		$http.get("/services/v4/js/genetyllis-app/gen/api/Analysis/Analysis.js").then(function (response) {
			$scope.optionsAnalysisId = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Date
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
		$scope.optionsVariantIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsVariantId.length; i++) {
				if ($scope.optionsVariantId[i].value === optionKey) {
					return $scope.optionsVariantId[i].text;
				}
			}
			return null;
		};
		$scope.optionsAnalysisIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsAnalysisId.length; i++) {
				if ($scope.optionsAnalysisId[i].value === optionKey) {
					return $scope.optionsAnalysisId[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
