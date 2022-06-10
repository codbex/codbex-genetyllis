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

	this.getVariantContextIterator = function () {
		const iterator = new exports.VCFVariantContextIterator();
		const native = this.native.iterator();
		iterator.native = native;
		return iterator;
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

/**
 * VCF Variant Context Iterator
 */
exports.VCFVariantContextIterator = function () {

	this.hasNext = function () {
		return this.native.hasNext();
	};

	this.next = function () {
		const vcfVariantContext = new exports.VCFVariantContext();
		const native = this.native.next();
		vcfVariantContext.native = native;
		return vcfVariantContext;
	};

}

exports.VCFVariantContext = function () {

	this.getID = function () {
		return this.native.getID();
	};

	this.getCalledChrCount = function () {
		return this.native.getCalledChrCount();
	};

	this.getContig = function () {
		return this.native.getContig();
	};

	this.getStart = function () {
		return this.native.getStart();
	};

	this.getEnd = function () {
		return this.native.getEnd();
	};

	this.getHetCount = function () {
		return this.native.getHetCount();
	};

	this.getHomRefCount = function () {
		return this.native.getHomRefCount();
	};

	this.getHomVarCount = function () {
		return this.native.getHomVarCount();
	};

	this.getLengthOnReference = function () {
		return this.native.getLengthOnReference();
	};

	this.getLog10PError = function () {
		return this.native.getLog10PError();
	};

	this.getMixedCount = function () {
		return this.native.getMixedCount();
	};

	this.getNAlleles = function () {
		return this.native.getNAlleles();
	};

	this.getNoCallCount = function () {
		return this.native.getNoCallCount();
	};

	this.getNSamples = function () {
		return this.native.getNSamples();
	};

	this.getPhredScaledQual = function () {
		return this.native.getPhredScaledQual();
	};

	this.getReferenceBaseString = function () {
		return this.native.getReference().getBaseString();
	};

	this.getReferenceDisplayString = function () {
		return this.native.getReference().getDisplayString();
	};

	this.getSource = function () {
		return this.native.getSource();
	};

	this.getStructuralVariantType = function () {
		return this.native.getStructuralVariantType().name();
	};

	this.getType = function () {
		return this.native.getType().name();
	};

	this.isBiallelic = function () {
		return this.native.isBiallelic();
	};

	this.isComplexIndel = function () {
		return this.native.isComplexIndel();
	};

	this.isFiltered = function () {
		return this.native.isFiltered();
	};

	this.isNotFiltered = function () {
		return this.native.isNotFiltered();
	};

	this.isFullyDecoded = function () {
		return this.native.isFullyDecoded();
	};

	this.isIndel = function () {
		return this.native.isIndel();
	};

	this.isMixed = function () {
		return this.native.isMixed();
	};

	this.isMNP = function () {
		return this.native.isMNP();
	};

	this.isSNP = function () {
		return this.native.isSNP();
	};

	this.isMonomorphicInSamples = function () {
		return this.native.isMonomorphicInSamples();
	};

	this.isPolymorphicInSamples = function () {
		return this.native.isPolymorphicInSamples();
	};

	this.isPointEvent = function () {
		return this.native.isPointEvent();
	};

	this.isReferenceBlock = function () {
		return this.native.isReferenceBlock();
	};

	this.isSimpleDeletion = function () {
		return this.native.isSimpleDeletion();
	};

	this.isSimpleInsertion = function () {
		return this.native.isSimpleInsertion();
	};

	this.isSimpleIndel = function () {
		return this.native.isSimpleIndel();
	};

	this.isStructuralIndel = function () {
		return this.native.isStructuralIndel();
	};

	this.isSymbolic = function () {
		return this.native.isSymbolic();
	};

	this.isVariant = function () {
		return this.native.isVariant();
	};

	this.getAttributes = function () {
		const map = new Map();
		const nativeMap = this.native.getCommonInfo().getAttributes();
		var entries = nativeMap.entrySet().iterator();
		while (entries.hasNext()) {
			var entry = entries.next();
			map.set(entry.getKey(), entry.getValue());
		}
		return map;
	};

	this.getAlleles = function () {
		const list = new Array();
		const nativeList = this.native.getAlleles();
		for (let i in nativeList) {
			const vcfAllele = new exports.VCFAllele();
			vcfAllele.native = nativeList[i];
			list.push(vcfAllele);
		}
		return list;
	};

	this.getAlternateAlleles = function () {
		const list = new Array();
		const nativeList = this.native.getAlternateAlleles();
		for (let i in nativeList) {
			const vcfAllele = new exports.VCFAllele();
			vcfAllele.native = nativeList[i];
			list.push(vcfAllele);
		}
		return list;
	};

	this.getFilters = function () {
		const list = new Array();
		const nativeList = this.native.getFilters();
		for (let i in nativeList) {
			list.push(nativeList[i]);
		}
		return list;
	};

	this.getGenotypes = function () {
		const list = new Array();
		const nativeIterator = this.native.getGenotypes().iterator();
		while (nativeIterator.hasNext()) {
			const vcfGenotype = new exports.VCFGenotype();
			vcfGenotype.native = nativeIterator.next();
			list.push(vcfGenotype);
		}
		return list;
	};

	this.getGenotypeContextIterator = function () {
		const iterator = new exports.VCFGenotypeContextIterator();
		const native = this.native.getGenotypes().iterator();
		iterator.native = native;
		return iterator;
	};


}

/**
 * VCF Allele
 */
exports.VCFAllele = function () {

	this.getBaseString = function () {
		return this.native.getBaseString();
	};

	this.getDisplayString = function () {
		return this.native.getDisplayString();
	};

}

/**
* VCF Genotype Context Iterator
*/
exports.VCFGenotypeContextIterator = function () {

	this.hasNext = function () {
		return this.native.hasNext();
	};

	this.next = function () {
		const vcfGenotype = new exports.VCFGenotype();
		const native = this.native.next();
		vcfGenotype.native = native;
		return vcfGenotype;
	};

}

/**
 * VCF Genotype
 */
exports.VCFGenotype = function () {

	this.getAD = function () {
		const list = new Array();
		const nativeList = this.native.getAD();
		for (let i in nativeList) {
			list.push(nativeList[i]);
		}
		return list;
	};

	this.getDP = function () {
		return this.native.getDP();
	};

	this.getGQ = function () {
		return this.native.getGQ();
	};

	this.getPL = function () {
		const list = new Array();
		const nativeList = this.native.getPL();
		for (let i in nativeList) {
			list.push(nativeList[i]);
		}
		return list;
	};

	this.isPhased = function () {
		return this.native.isPhased();
	};

	this.getFilters = function () {
		return this.native.getFilters();
	};

	this.getGenotypeString = function () {
		return this.native.getGenotypeString();
	};

	this.getLikelihoodsString = function () {
		return this.native.getLikelihoodsString();
	};

	this.getPloidy = function () {
		return this.native.getPloidy();
	};

	this.getSampleName = function () {
		return this.native.getSampleName();
	};

	this.getType = function () {
		return this.native.getType();
	};

	this.getAlleles = function () {
		const list = new Array();
		const nativeList = this.native.getAlleles();
		for (let i in nativeList) {
			const vcfAllele = new exports.VCFAllele();
			vcfAllele.native = nativeList[i];
			list.push(vcfAllele);
		}
		return list;
	};

	this.getExtendedAttributes = function () {
		const map = new Map();
		const nativeMap = this.native.getExtendedAttributes();
		var entries = nativeMap.entrySet().iterator();
		while (entries.hasNext()) {
			var entry = entries.next();
			map.set(entry.getKey(), entry.getValue());
		}
		return map;
	};

}

