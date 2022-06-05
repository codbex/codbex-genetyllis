
exports.getView = function (relativePath) {
	return {
		id: "UploadVariantRecord",
		name: "UploadVariantRecord",
		label: "Upload Variant Record",
		order: 100,
		factory: "frame",
		// region: "center-bottom",
		link: relativePath + "services/v4/web/genetyllis-upload/views/VariantRecordUpload/index.html"
	};
};
