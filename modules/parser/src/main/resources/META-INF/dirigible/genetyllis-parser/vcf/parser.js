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

exports.createVCFFileReader = function (path) {
	const vcfFileReader = new exports.VCFFileReader();
	vcfFileReader.native = Packages.com.codbex.genetyllis.parser.VCFParser.createVCFFileReader(path);
	return vcfFileReader;
};


exports.VCFFileReader = function () {

	this.getFileHeader = function () {
		const vcfFileHeader = new exports.VCFFileHeader();
		const native = this.native.getFileHeader();
		vcfFileHeader.native = native;
		return vcfFileHeader;
	};

};

exports.VCFFileHeader = function () {

	this.getColumnCount = function () {
		return this.native.getColumnCount();
	};

};