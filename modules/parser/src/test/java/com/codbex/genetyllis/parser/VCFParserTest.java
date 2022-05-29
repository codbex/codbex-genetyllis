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
 * 
 */
package com.codbex.genetyllis.parser;

import java.io.File;
import java.io.IOException;
import java.util.EnumSet;

import org.junit.Test;

import htsjdk.variant.variantcontext.VariantContext;
import htsjdk.variant.variantcontext.writer.Options;
import htsjdk.variant.variantcontext.writer.VariantContextWriter;
import htsjdk.variant.variantcontext.writer.VariantContextWriterBuilder;
import htsjdk.variant.vcf.VCFFileReader;
import htsjdk.variant.vcf.VCFHeader;

/**
 * VCFParserTest Class
 */
public class VCFParserTest {

	@Test
	public void test() throws IOException {
		final File TEST_DIR = new File("src/test/resources/data/vcf");
		File vcfFile = new File(TEST_DIR, "PA.vcf");
		try (final VCFFileReader reader = new VCFFileReader(vcfFile, false)) {
			File output = createTemporaryIndexedFile("result", ".vcf");
			final VCFHeader header = reader.getFileHeader();
			try (final VariantContextWriter out = new VariantContextWriterBuilder()
					.setReferenceDictionary(header.getSequenceDictionary())
					.setOptions(EnumSet.of(Options.INDEX_ON_THE_FLY)).setOutputFile(output).build()) {
				out.writeHeader(header);
				for (final VariantContext ctx : reader) {
					out.add(ctx);
				}
			}
		}
	}

	public static File createTemporaryIndexedFile(final String prefix, final String suffix) throws IOException {
		final File out = File.createTempFile(prefix, suffix);
		out.deleteOnExit();
		if (suffix != null) {
			final File indexOut = new File(out.getAbsolutePath() + suffix);
			indexOut.deleteOnExit();
		}
		return out;
	}

}
