angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'genetyllis-app.records.VariantRecord';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/v4/js/genetyllis-app/gen/api/records/VariantRecord.js";
	}])
	.controller('PageController', ['$scope', 'messageHub', 'entityApi', function ($scope, messageHub, entityApi) {

		$scope.entity = {};
		$scope.formHeaders = {
			select: "VariantRecord Details",
			create: "Create VariantRecord",
			update: "Update VariantRecord"
		};
		$scope.formErrors = {};
		$scope.action = 'select';

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("clearDetails", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.formErrors = {};
				$scope.optionsPatientId = [];
				$scope.optionsVariantId = [];
				$scope.optionsAnalysisId = [];
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("entitySelected", function (msg) {
			$scope.$apply(function () {
				$scope.entity = msg.data.entity;
				$scope.optionsPatientId = msg.data.optionsPatientId;
				$scope.optionsVariantId = msg.data.optionsVariantId;
				$scope.optionsAnalysisId = msg.data.optionsAnalysisId;
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("createEntity", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsPatientId = msg.data.optionsPatientId;
				$scope.optionsVariantId = msg.data.optionsVariantId;
				$scope.optionsAnalysisId = msg.data.optionsAnalysisId;
				$scope.action = 'create';
				// Set Errors for required fields only
				$scope.formErrors = {
				};
			});
		});

		messageHub.onDidReceiveMessage("updateEntity", function (msg) {
			$scope.$apply(function () {
				$scope.entity = msg.data.entity;
				$scope.optionsPatientId = msg.data.optionsPatientId;
				$scope.optionsVariantId = msg.data.optionsVariantId;
				$scope.optionsAnalysisId = msg.data.optionsAnalysisId;
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
					messageHub.showAlertError("VariantRecord", `Unable to create VariantRecord: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("VariantRecord", "VariantRecord successfully created");
			});
		};

		$scope.update = function () {
			entityApi.update($scope.entity.Id, $scope.entity).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("VariantRecord", `Unable to update VariantRecord: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("VariantRecord", "VariantRecord successfully updated");
			});
		};

		$scope.cancel = function () {
			messageHub.postMessage("clearDetails");
		};

	}]);