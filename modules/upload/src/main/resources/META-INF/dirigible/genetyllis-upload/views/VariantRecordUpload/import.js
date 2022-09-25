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

let uploader = null;

angular
	.module('page', ['angularFileUpload'])
	.factory('httpRequestInterceptor', function () {
		let csrfToken = null;
		return {
			request: function (config) {
				config.headers['X-Requested-With'] = 'Fetch';
				config.headers['X-CSRF-Token'] = csrfToken ? csrfToken : 'Fetch';
				return config;
			},
			response: function (response) {
				let token = response.headers()['x-csrf-token'];
				if (token) {
					csrfToken = token;
					uploader.headers['X-CSRF-Token'] = csrfToken;
				}
				return response;
			}
		};
	})
	.config(['$httpProvider', function ($httpProvider) {
		$httpProvider.interceptors.push('httpRequestInterceptor');
	}])
	.factory('$messageHub', [function () {
		let messageHub = new FramesMessageHub();
		let message = function (evtName, evtData) {
			messageHub.post({ data: evtData }, evtName);
		};
		let on = function (topic, callback) {
			messageHub.subscribe(callback, topic);
		};
		return {
			message: message,
			on: on
		};
	}])
	.controller('ImportController', ['$scope', '$http', 'FileUploader', '$messageHub', function ($scope, $http, FileUploader, $messageHub) {

		var patientidOptionsApi = '/services/v4/js/genetyllis-pages/Home-page/services/api/patients/Patient.js';

		$scope.patientidOptions = [];
		function patientidOptionsLoad() {
			$http.get(patientidOptionsApi)
				.then(function (data) {
					$scope.patientidOptions = data.data;
				});
		}
		patientidOptionsLoad();



		$scope.IMPORT_URL = "/services/v4/js/genetyllis-upload/services/uploadVCF.js";

		// FILE UPLOADER

		$scope.uploader = uploader = new FileUploader({
			url: $scope.IMPORT_URL
		});

		// UPLOADER FILTERS

		uploader.filters.push({
			name: 'customFilter',
			fn: function (item, options) {
				return this.queue.length < 100;
			}
		});

		// UPLOADER CALLBACKS

		uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
		};
		uploader.onAfterAddingFile = function (fileItem) {
			console.log("Patient: " + $scope.PatientId, fileItem);
		};
		uploader.onAfterAddingAll = function (addedFileItems) {
		};
		uploader.onBeforeUploadItem = function (item) {
			item.url = $scope.IMPORT_URL + "?PatientId=" + $scope.PatientId;
		};
		uploader.onProgressItem = function (fileItem, progress) {
		};
		uploader.onProgressAll = function (progress) {
		};
		uploader.onSuccessItem = function (fileItem, response, status, headers) {
		};
		uploader.onErrorItem = function (fileItem, response, status, headers) {
			alert('Error: ' + status + ' - ' + response.message);
		};
		uploader.onCancelItem = function (fileItem, response, status, headers) {
		};
		uploader.onCompleteItem = function (fileItem, response, status, headers) {
		};
		uploader.onCompleteAll = function () {
		};

	}]);
