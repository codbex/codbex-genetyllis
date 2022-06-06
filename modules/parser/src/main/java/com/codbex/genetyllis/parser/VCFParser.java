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
package com.codbex.genetyllis.parser;

import java.io.File;

import htsjdk.variant.vcf.VCFFileReader;

/**
 * Parser utilities for VCF file format
 *
 */
public class VCFParser {
	
	/**
	 * Creates the VCF file reader
	 */
	public static final VCFFileReader createVCFFileReader(String path) {
		return new VCFFileReader(new File(path), false);
	}

}
