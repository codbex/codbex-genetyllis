angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'genetyllis-app.variants.AlleleFrequency';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/genetyllis-app/gen/api/variants/AlleleFrequency.js";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', function ($scope, $http, messageHub, entityApi) {

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
					messageHub.showAlertError("AlleleFrequency", `Unable to count AlleleFrequency: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let query = `VariantId=${VariantId}`;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				entityApi.filter(query, offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("AlleleFrequency", `Unable to list AlleleFrequency: '${response.message}'`);
						return;
					}

					response.data.forEach(e => {
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
			messageHub.showDialogWindow("AlleleFrequency-details", {
				action: "select",
				entity: entity,
				optionsVariantId: $scope.optionsVariantId,
				optionsGenderId: $scope.optionsGenderId,
				optionsPopulationId: $scope.optionsPopulationId,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("AlleleFrequency-details", {
				action: "create",
				entity: {},
				selectedMainEntityKey: "VariantId",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsVariantId: $scope.optionsVariantId,
				optionsGenderId: $scope.optionsGenderId,
				optionsPopulationId: $scope.optionsPopulationId,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("AlleleFrequency-details", {
				action: "update",
				entity: entity,
				selectedMainEntityKey: "VariantId",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsVariantId: $scope.optionsVariantId,
				optionsGenderId: $scope.optionsGenderId,
				optionsPopulationId: $scope.optionsPopulationId,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete AlleleFrequency?',
				`Are you sure you want to delete AlleleFrequency? This action cannot be undone.`,
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
							messageHub.showAlertError("AlleleFrequency", `Unable to delete AlleleFrequency: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsVariantId = [];
		$scope.optionsGenderId = [];
		$scope.optionsPopulationId = [];

		$http.get("/services/js/genetyllis-app/gen/api/variants/Variant.js").then(function (response) {
			$scope.optionsVariantId = response.data.map(e => {
				return {
					value: e.Id,
					text: e.HGVS
				}
			});
		});

		$http.get("/services/js/genetyllis-app/gen/api/nomenclature/Gender.js").then(function (response) {
			$scope.optionsGenderId = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/js/genetyllis-app/gen/api/nomenclature/Population.js").then(function (response) {
			$scope.optionsPopulationId = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});
		$scope.optionsVariantIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsVariantId.length; i++) {
				if ($scope.optionsVariantId[i].value === optionKey) {
					return $scope.optionsVariantId[i].text;
				}
			}
			return null;
		};
		$scope.optionsGenderIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsGenderId.length; i++) {
				if ($scope.optionsGenderId[i].value === optionKey) {
					return $scope.optionsGenderId[i].text;
				}
			}
			return null;
		};
		$scope.optionsPopulationIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsPopulationId.length; i++) {
				if ($scope.optionsPopulationId[i].value === optionKey) {
					return $scope.optionsPopulationId[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
