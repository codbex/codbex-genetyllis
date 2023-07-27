angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'genetyllis-app.records.Filter';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/genetyllis-app/gen/api/records/Filter.js";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', function ($scope, $http, messageHub, entityApi) {

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 10;
		}
		resetPagination();

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("genetyllis-app.records.VariantRecord.entitySelected", function (msg) {
			resetPagination();
			$scope.selectedMainEntityId = msg.data.selectedMainEntityId;
			$scope.loadPage($scope.dataPage);
		}, true);

		messageHub.onDidReceiveMessage("genetyllis-app.records.VariantRecord.clearDetails", function (msg) {
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
			let VariantRecordId = $scope.selectedMainEntityId;
			$scope.dataPage = pageNumber;
			entityApi.count(VariantRecordId).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("Filter", `Unable to count Filter: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let query = `VariantRecordId=${VariantRecordId}`;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				entityApi.filter(query, offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("Filter", `Unable to list Filter: '${response.message}'`);
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
			messageHub.showDialogWindow("Filter-details", {
				action: "select",
				entity: entity,
				optionsVariantRecordId: $scope.optionsVariantRecordId,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("Filter-details", {
				action: "create",
				entity: {},
				selectedMainEntityKey: "VariantRecordId",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsVariantRecordId: $scope.optionsVariantRecordId,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("Filter-details", {
				action: "update",
				entity: entity,
				selectedMainEntityKey: "VariantRecordId",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsVariantRecordId: $scope.optionsVariantRecordId,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete Filter?',
				`Are you sure you want to delete Filter? This action cannot be undone.`,
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
							messageHub.showAlertError("Filter", `Unable to delete Filter: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsVariantRecordId = [];

		$http.get("/services/js/genetyllis-app/gen/api/records/VariantRecord.js").then(function (response) {
			$scope.optionsVariantRecordId = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Id
				}
			});
		});
		$scope.optionsVariantRecordIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsVariantRecordId.length; i++) {
				if ($scope.optionsVariantRecordId[i].value === optionKey) {
					return $scope.optionsVariantRecordId[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
