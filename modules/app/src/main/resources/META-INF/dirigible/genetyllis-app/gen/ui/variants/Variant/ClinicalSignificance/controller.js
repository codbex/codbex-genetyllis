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
		messageHubProvider.eventIdPrefix = 'genetyllis-app.variants.ClinicalSignificance';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/v4/js/genetyllis-app/gen/api/variants/ClinicalSignificance.js";
	}])
	.controller('PageController', ['$scope', '$http', '$http', 'messageHub', 'entityApi', function ($scope, $http, $http, messageHub, entityApi) {

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 10;
		}
		resetPagination();

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("genetyllis-app.variants.Variant.entitySelected", function (msg) {
			resetPagination();
			$scope.selectedMainEntityId = msg.data.selectedMainEntityId;
			$scope.loadPage($scope.dataPage);
		}, true);

		messageHub.onDidReceiveMessage("genetyllis-app.variants.Variant.clearDetails", function (msg) {
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
			let VariantId = $scope.selectedMainEntityId;
			$scope.dataPage = pageNumber;
			entityApi.count(VariantId).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("ClinicalSignificance", `Unable to count ClinicalSignificance: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let query = `VariantId=${VariantId}`;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				entityApi.filter(query, offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("ClinicalSignificance", `Unable to list ClinicalSignificance: '${response.message}'`);
						return;
					}

					response.data.forEach(e => {
						if (e.Evaluated) {
							e.Evaluated = new Date(e.Evaluated);
						}
						if (e.Updated) {
							e.Updated = new Date(e.Updated);
						}
					});

					$scope.data = response.data;
				});
			});
		};

		$scope.selectEntity = function (entity) {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = function (entity) {
			$scope.selectedEntity = entity;
			messageHub.showDialogWindow("ClinicalSignificance-details", {
				action: "select",
				entity: entity,
				optionsPathologyId: $scope.optionsPathologyId,
				optionsSignificanceId: $scope.optionsSignificanceId,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("ClinicalSignificance-details", {
				action: "create",
				entity: {},
				selectedMainEntityKey: "VariantId",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsPathologyId: $scope.optionsPathologyId,
				optionsSignificanceId: $scope.optionsSignificanceId,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("ClinicalSignificance-details", {
				action: "update",
				entity: entity,
				selectedMainEntityKey: "VariantId",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsPathologyId: $scope.optionsPathologyId,
				optionsSignificanceId: $scope.optionsSignificanceId,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete ClinicalSignificance?',
				`Are you sure you want to delete ClinicalSignificance? This action cannot be undone.`,
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
							messageHub.showAlertError("ClinicalSignificance", `Unable to delete ClinicalSignificance: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsPathologyId = [];
		$scope.optionsSignificanceId = [];

		$http.get("/services/v4/js/genetyllis-app/gen/api/nomenclature/Pathology.js").then(function (response) {
			$scope.optionsPathologyId = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/v4/js/genetyllis-app/gen/api/nomenclature/Significance.js").then(function (response) {
			$scope.optionsSignificanceId = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});
		$scope.optionsPathologyIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsPathologyId.length; i++) {
				if ($scope.optionsPathologyId[i].value === optionKey) {
					return $scope.optionsPathologyId[i].text;
				}
			}
			return null;
		};
		$scope.optionsSignificanceIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsSignificanceId.length; i++) {
				if ($scope.optionsSignificanceId[i].value === optionKey) {
					return $scope.optionsSignificanceId[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
