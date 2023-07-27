angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'genetyllis-app.patients.Patient';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/genetyllis-app/gen/api/patients/Patient.js";
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
					messageHub.showAlertError("Patient", `Unable to count Patient: '${response.message}'`);
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
						messageHub.showAlertError("Patient", `Unable to list Patient: '${response.message}'`);
						return;
					}
					if ($scope.data == null || $scope.dataReset) {
						$scope.data = [];
						$scope.dataReset = false;
					}

					response.data.forEach(e => {
						if (e.BirthDate) {
							e.BirthDate = new Date(e.BirthDate);
						}
					});

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
				optionsGenderId: $scope.optionsGenderId,
				optionsPhysicianId: $scope.optionsPhysicianId,
				optionsPopulationId: $scope.optionsPopulationId,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			$scope.action = "create";

			messageHub.postMessage("createEntity", {
				entity: {},
				optionsGenderId: $scope.optionsGenderId,
				optionsPhysicianId: $scope.optionsPhysicianId,
				optionsPopulationId: $scope.optionsPopulationId,
			});
		};

		$scope.updateEntity = function () {
			$scope.action = "update";
			messageHub.postMessage("updateEntity", {
				entity: $scope.selectedEntity,
				optionsGenderId: $scope.optionsGenderId,
				optionsPhysicianId: $scope.optionsPhysicianId,
				optionsPopulationId: $scope.optionsPopulationId,
			});
		};

		$scope.deleteEntity = function () {
			let id = $scope.selectedEntity.Id;
			messageHub.showDialogAsync(
				'Delete Patient?',
				`Are you sure you want to delete Patient? This action cannot be undone.`,
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
							messageHub.showAlertError("Patient", `Unable to delete Patient: '${response.message}'`);
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
		$scope.optionsGenderId = [];
		$scope.optionsPhysicianId = [];
		$scope.optionsPopulationId = [];

		$http.get("/services/js/genetyllis-app/gen/api/nomenclature/Gender.js").then(function (response) {
			$scope.optionsGenderId = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/js/genetyllis-app/gen/api/analysis/Physician.js").then(function (response) {
			$scope.optionsPhysicianId = response.data.map(e => {
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
		$scope.optionsGenderIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsGenderId.length; i++) {
				if ($scope.optionsGenderId[i].value === optionKey) {
					return $scope.optionsGenderId[i].text;
				}
			}
			return null;
		};
		$scope.optionsPhysicianIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsPhysicianId.length; i++) {
				if ($scope.optionsPhysicianId[i].value === optionKey) {
					return $scope.optionsPhysicianId[i].text;
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
