angular.module('page', []);
angular.module('page').controller('PageController', function ($scope, $http) {

	// var api = '/services/v4/js/genetyllis-pages/service/patients.js';
	// $scope.data = [
	// 	{
	// 		patient_id: 1,
	// 		patient_genderId: 1,
	// 		patient_info: "test",
	// 		patient_age: 25,
	// 		genetyllis_patient_labId: "h1234"
	// 	},
	// 	{
	// 		patient_id: 1,
	// 		patient_genderId: 1,
	// 		patient_info: "test",
	// 		patient_age: 25,
	// 		genetyllis_patient_labId: "h1234"
	// 	}
	// ];

	$http({
		method: 'GET',
		url: "/services/v4/js/genetyllis-pages/HomePage/server/patientsInfo.js"
	}).then(function successCallback(response) {
		console.log(response.data, "HEE")
		$scope.data = response.data;
		$scope.dataInfo = response.data.map(el => el.name);
	}, function errorCallback(response) {
		console.log("error: " + response);
	});
	// function load() {
	// 	$http.get(api)
	// 	.then(function(data) {
	// 		$scope.data = data.data;
	// 	});
	// }
	// load();

	$scope.openNewDialog = function () {
		console.log("hello")
		$scope.actionType = 'new';
		$scope.entity = {};
		toggleEntityModal();
	};

	// $scope.openEditDialog = function(entity) {
	// 	$scope.actionType = 'update';
	// 	$scope.entity = entity;
	// 	toggleEntityModal();
	// };

	// $scope.openDeleteDialog = function(entity) {
	// 	$scope.actionType = 'delete';
	// 	$scope.entity = entity;
	// 	toggleEntityModal();
	// };

	// $scope.close = function() {
	// 	load();
	// 	toggleEntityModal();
	// };

	// $scope.create = function() {
	// 	$http.post(api, JSON.stringify($scope.entity))
	// 	.then(function(data) {
	// 		load();
	// 		toggleEntityModal();
	// 	}, function(data) {
	// 		alert(JSON.stringify(data.data));
	// 	});

	// };

	// $scope.update = function() {
	// 	$http.put(api + '/' + $scope.entity.id, JSON.stringify($scope.entity))

	// 	.then(function(data) {
	// 		load();
	// 		toggleEntityModal();
	// 	}, function(data) {
	// 		alert(JSON.stringify(data.data));
	// 	})
	// };

	// $scope.delete = function() {
	// 	$http.delete(api + '/' + $scope.entity.id)
	// 	.then(function(data) {
	// 		load();
	// 		toggleEntityModal();
	// 	}, function(data) {
	// 		alert(JSON.stringify(data.data));
	// 	});
	// };


	function toggleEntityModal() {
		$('#entityModal').modal('toggle');
	}
});
