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

/**
 * Create a VCF File Reader
 */
exports.createVCFFileReader = function (path) {
	const vcfFileReader = new exports.VCFFileReader();
	vcfFileReader.native = Packages.com.codbex.genetyllis.parser.VCFParser.createVCFFileReader(path);
	return vcfFileReader;
};

/**
 * VCF File Reader
 */
exports.VCFFileReader = function () {

	this.getFileHeader = function () {
		const vcfFileHeader = new exports.VCFFileHeader();
		const native = this.native.getFileHeader();
		vcfFileHeader.native = native;
		return vcfFileHeader;
	};

};

/**
 * VCF File Header
 */
exports.VCFFileHeader = function () {

	this.getColumnCount = function () {
		return this.native.getColumnCount();
	};

	this.getVCFHeaderVersion = function () {
		return this.native.getVCFHeaderVersion();
	};

	this.getContigLines = function () {
		const list = new Array();
		const nativeList = this.native.getContigLines();
		for (let i in nativeList) {
			const vcfContigHeaderLine = new exports.VCFContigHeaderLine();
			vcfContigHeaderLine.native = nativeList[i];
			list.push(vcfContigHeaderLine);
		}
		return list;
	};

	this.getFilterLines = function () {
		const list = new Array();
		const nativeList = this.native.getFilterLines();
		for (let i in nativeList) {
			const vcfFilterHeaderLine = new exports.VCFFilterHeaderLine();
			vcfFilterHeaderLine.native = nativeList[i];
			list.push(vcfFilterHeaderLine);
		}
		return list;
	};

	this.getFormatHeaderLines = function () {
		const list = new Array();
		const nativeList = this.native.getFormatHeaderLines();
		for (let i in nativeList) {
			const vcfFormatHeaderLine = new exports.VCFFormatHeaderLine();
			vcfFormatHeaderLine.native = nativeList[i];
			list.push(vcfFormatHeaderLine);
		}
		return list;
	};

	this.getInfoHeaderLines = function () {
		const list = new Array();
		const nativeList = this.native.getInfoHeaderLines();
		for (let i in nativeList) {
			const vcfInfoHeaderLine = new exports.VCFInfoHeaderLine();
			vcfInfoHeaderLine.native = nativeList[i];
			list.push(vcfInfoHeaderLine);
		}
		return list;
	};

	this.getOtherHeaderLines = function () {
		const list = new Array();
		const nativeList = this.native.getOtherHeaderLines();
		for (let i in nativeList) {
			const vcfOtherHeaderLine = new exports.VCFOtherHeaderLine();
			vcfOtherHeaderLine.native = nativeList[i];
			list.push(vcfOtherHeaderLine);
		}
		return list;
	};

	this.getGenotypeSamples = function () {
		const list = new Array();
		const nativeList = this.native.getGenotypeSamples();
		for (let i in nativeList) {
			list.push(nativeList[i]);
		}
		return list;
	};

	this.getIDHeaderLines = function () {
		const list = new Array();
		const nativeList = this.native.getIDHeaderLines();
		for (let i in nativeList) {
			const vcfIDHeaderLine = new exports.VCFIDHeaderLine();
			vcfIDHeaderLine.native = nativeList[i];
			list.push(vcfIDHeaderLine);
		}
		return list;
	};

	this.getMetaDataInInputOrder = function () {
		const list = new Array();
		const nativeList = this.native.getMetaDataInInputOrder();
		for (let i in nativeList) {
			const vcfMetaDataInInputOrder = new exports.VCFMetaDataInInputOrder();
			vcfMetaDataInInputOrder.native = nativeList[i];
			list.push(vcfMetaDataInInputOrder);
		}
		return list;
	};




};

/**
 * VCF Contig Header Line
 */
exports.VCFContigHeaderLine = function () {

	this.getID = function () {
		return this.native.getID();
	};

	this.getKey = function () {
		return this.native.getKey();
	};

	this.getValue = function () {
		return this.native.getValue();
	};

	this.getContigIndex = function () {
		return this.native.getContigIndex();
	};

	this.getGenericFields = function () {
		const map = new Map();
		const nativeMap = this.native.getGenericFields();
		var entries = nativeMap.entrySet().iterator();
		while (entries.hasNext()) {
			var entry = entries.next();
			map.set(entry.getKey(), entry.getValue());
		}
		return map;
	};

	this.getSAMSequenceRecord = function () {
		return this.native.getSAMSequenceRecord();
	};

}

/**
 * VCF Filter Header Line
 */
exports.VCFFilterHeaderLine = function () {

	this.getID = function () {
		return this.native.getID();
	};

	this.getKey = function () {
		return this.native.getKey();
	};

	this.getValue = function () {
		return this.native.getValue();
	};

	this.getContigIndex = function () {
		return this.native.getContigIndex();
	};

	this.getGenericFields = function () {
		const map = new Map();
		const nativeMap = this.native.getGenericFields();
		var entries = nativeMap.entrySet().iterator();
		while (entries.hasNext()) {
			var entry = entries.next();
			map.set(entry.getKey(), entry.getValue());
		}
		return map;
	};
}

/**
 * VCF Format Header Line
 */
exports.VCFFormatHeaderLine = function () {

	this.getID = function () {
		return this.native.getID();
	};

	this.getKey = function () {
		return this.native.getKey();
	};

	this.getValue = function () {
		return this.native.getValue();
	};

	this.getContigIndex = function () {
		return this.native.getContigIndex();
	};

	this.isFixedCount = function () {
		return this.native.isFixedCount();
	};

	this.getCount = function () {
		return this.native.getCount();
	};

	this.getDescription = function () {
		return this.native.getDescription();
	};

	this.getSource = function () {
		return this.native.getSource();
	};

	this.getVersion = function () {
		return this.native.getVersion();
	};

	this.getCountType = function () {
		return this.native.getCountType().name;
	};

	this.getType = function () {
		return this.native.getType().name;
	};

}

/**
 * VCF Info Header Line
 */
exports.VCFInfoHeaderLine = function () {

	this.getID = function () {
		return this.native.getID();
	};

	this.getKey = function () {
		return this.native.getKey();
	};

	this.getValue = function () {
		return this.native.getValue();
	};

	this.getContigIndex = function () {
		return this.native.getContigIndex();
	};

	this.isFixedCount = function () {
		return this.native.isFixedCount();
	};

	this.getCount = function () {
		return this.native.getCount();
	};

	this.getDescription = function () {
		return this.native.getDescription();
	};

	this.getSource = function () {
		return this.native.getSource();
	};

	this.getVersion = function () {
		return this.native.getVersion();
	};

	this.getCountType = function () {
		return this.native.getCountType().name;
	};

	this.getType = function () {
		return this.native.getType().name;
	};

}

/**
 * VCF Other Header Line
 */
exports.VCFOtherHeaderLine = function () {

	this.getKey = function () {
		return this.native.getKey();
	};

	this.getValue = function () {
		return this.native.getValue();
	};

}

/**
 * VCF ID Header Line
 */
exports.VCFIDHeaderLine = function () {

	this.getID = function () {
		return this.native.getID();
	};

}

/**
 * VCF Meta Data In Input Order
 */
exports.VCFMetaDataInInputOrder = function () {

	this.getKey = function () {
		return this.native.getKey();
	};

	this.getValue = function () {
		return this.native.getValue();
	};

}

