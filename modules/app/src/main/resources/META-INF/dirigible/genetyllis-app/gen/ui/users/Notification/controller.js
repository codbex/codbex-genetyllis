angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'genetyllis-app.users.Notification';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/genetyllis-app/gen/api/users/Notification.js";
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
					messageHub.showAlertError("Notification", `Unable to count Notification: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				entityApi.list(offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("Notification", `Unable to list Notification: '${response.message}'`);
						return;
					}
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
			messageHub.showDialogWindow("Notification-details", {
				action: "select",
				entity: entity,
				optionsUserUserId: $scope.optionsUserUserId,
				optionsVariantId: $scope.optionsVariantId,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("Notification-details", {
				action: "create",
				entity: {},
				optionsUserUserId: $scope.optionsUserUserId,
				optionsVariantId: $scope.optionsVariantId,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("Notification-details", {
				action: "update",
				entity: entity,
				optionsUserUserId: $scope.optionsUserUserId,
				optionsVariantId: $scope.optionsVariantId,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.NotificationId;
			messageHub.showDialogAsync(
				'Delete Notification?',
				`Are you sure you want to delete Notification? This action cannot be undone.`,
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
							messageHub.showAlertError("Notification", `Unable to delete Notification: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsUserUserId = [];
		$scope.optionsVariantId = [];

		$http.get("/services/js/genetyllis-app/gen/api/users/User.js").then(function (response) {
			$scope.optionsUserUserId = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Username
				}
			});
		});

		$http.get("/services/js/genetyllis-app/gen/api/variants/Variant.js").then(function (response) {
			$scope.optionsVariantId = response.data.map(e => {
				return {
					value: e.Id,
					text: e.HGVS
				}
			});
		});
		$scope.optionsUserUserIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsUserUserId.length; i++) {
				if ($scope.optionsUserUserId[i].value === optionKey) {
					return $scope.optionsUserUserId[i].text;
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
		//----------------Dropdowns-----------------//

	}]);
