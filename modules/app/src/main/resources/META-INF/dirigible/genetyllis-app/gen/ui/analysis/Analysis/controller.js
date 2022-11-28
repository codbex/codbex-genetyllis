angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'genetyllis-app.analysis.Analysis';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/v4/js/genetyllis-app/gen/api/analysis/Analysis.js";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', function ($scope, $http, messageHub, entityApi) {

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 20;
		}
		resetPagination();

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("entityCreated", function (msg) {
			$scope.loadPage($scope.dataPage);
		});

		messageHub.onDidReceiveMessage("entityUpdated", function (msg) {
			$scope.loadPage($scope.dataPage);
		});
		//-----------------Events-------------------//

		$scope.loadPage = function (pageNumber) {
			$scope.dataPage = pageNumber;
			entityApi.count().then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("Analysis", `Unable to count Analysis: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				entityApi.list(offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("Analysis", `Unable to list Analysis: '${response.message}'`);
						return;
					}

					response.data.forEach(e => {
						if (e.Date) {
							e.Date = new Date(e.Date);
						}
					});

					$scope.data = response.data;
				});
			});
		};
		$scope.loadPage($scope.dataPage);

		$scope.selectEntity = function (entity) {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = function (entity) {
			$scope.selectedEntity = entity;
			messageHub.showDialogWindow("Analysis-details", {
				action: "select",
				entity: entity,
				optionsProviderId: $scope.optionsProviderId,
				optionsPlatformId: $scope.optionsPlatformId,
				optionsPatientId: $scope.optionsPatientId,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("Analysis-details", {
				action: "create",
				entity: {},
				optionsProviderId: $scope.optionsProviderId,
				optionsPlatformId: $scope.optionsPlatformId,
				optionsPatientId: $scope.optionsPatientId,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("Analysis-details", {
				action: "update",
				entity: entity,
				optionsProviderId: $scope.optionsProviderId,
				optionsPlatformId: $scope.optionsPlatformId,
				optionsPatientId: $scope.optionsPatientId,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete Analysis?',
				`Are you sure you want to delete Analysis? This action cannot be undone.`,
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
							messageHub.showAlertError("Analysis", `Unable to delete Analysis: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsProviderId = [];
		$scope.optionsPlatformId = [];
		$scope.optionsPatientId = [];

		$http.get("/services/v4/js/genetyllis-app/gen/api/analysis/Provider.js").then(function (response) {
			$scope.optionsProviderId = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/v4/js/genetyllis-app/gen/api/analysis/Platform.js").then(function (response) {
			$scope.optionsPlatformId = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/v4/js/genetyllis-app/gen/api/patients/Patient.js").then(function (response) {
			$scope.optionsPatientId = response.data.map(e => {
				return {
					value: e.Id,
					text: e.LabId
				}
			});
		});
		$scope.optionsProviderIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsProviderId.length; i++) {
				if ($scope.optionsProviderId[i].value === optionKey) {
					return $scope.optionsProviderId[i].text;
				}
			}
			return null;
		};
		$scope.optionsPlatformIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsPlatformId.length; i++) {
				if ($scope.optionsPlatformId[i].value === optionKey) {
					return $scope.optionsPlatformId[i].text;
				}
			}
			return null;
		};
		$scope.optionsPatientIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsPatientId.length; i++) {
				if ($scope.optionsPatientId[i].value === optionKey) {
					return $scope.optionsPatientId[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);