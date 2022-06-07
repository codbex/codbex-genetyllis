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

import static org.junit.Assert.assertEquals;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.Collection;
import java.util.EnumSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.junit.Test;

import htsjdk.samtools.util.CloseableIterator;
import htsjdk.variant.variantcontext.Allele;
import htsjdk.variant.variantcontext.Genotype;
import htsjdk.variant.variantcontext.GenotypesContext;
import htsjdk.variant.variantcontext.VariantContext;
import htsjdk.variant.variantcontext.writer.Options;
import htsjdk.variant.variantcontext.writer.VariantContextWriter;
import htsjdk.variant.variantcontext.writer.VariantContextWriterBuilder;
import htsjdk.variant.vcf.VCFContigHeaderLine;
import htsjdk.variant.vcf.VCFFileReader;
import htsjdk.variant.vcf.VCFFilterHeaderLine;
import htsjdk.variant.vcf.VCFFormatHeaderLine;
import htsjdk.variant.vcf.VCFHeader;
import htsjdk.variant.vcf.VCFHeaderLine;
import htsjdk.variant.vcf.VCFIDHeaderLine;
import htsjdk.variant.vcf.VCFInfoHeaderLine;

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
	
	@Test
	public void testColumnCount() throws IOException {
		final File TEST_DIR = new File("src/test/resources/data/vcf");
		File vcfFile = new File(TEST_DIR, "PA.vcf");
		try (final VCFFileReader reader = new VCFFileReader(vcfFile, false)) {
			final VCFHeader header = reader.getFileHeader();
			assertEquals(10, header.getColumnCount());
		}
	}
	
	@Test
	public void testVersion() throws IOException {
		final File TEST_DIR = new File("src/test/resources/data/vcf");
		File vcfFile = new File(TEST_DIR, "PA.vcf");
		try (final VCFFileReader reader = new VCFFileReader(vcfFile, false)) {
			final VCFHeader header = reader.getFileHeader();
			assertEquals(null, header.getVCFHeaderVersion());
		}
	}
		
	@Test
	public void testContigHeaderLines() throws IOException {
		final File TEST_DIR = new File("src/test/resources/data/vcf");
		File vcfFile = new File(TEST_DIR, "PA.vcf");
		try (final VCFFileReader reader = new VCFFileReader(vcfFile, false)) {
			final VCFHeader header = reader.getFileHeader();
			List<VCFContigHeaderLine> contigHeaderLines = header.getContigLines();
			System.out.println(">>> Start Contig List");
			for (VCFContigHeaderLine headerLine : contigHeaderLines) {
				System.out.println("--------------------------------");
				System.out.println("ID: " + headerLine.getID());
				System.out.println("Key: " + headerLine.getKey());
				System.out.println("Value: " + headerLine.getValue());
				System.out.println("Contig Index: " + headerLine.getContigIndex());
				System.out.println("Generic Fields: " + headerLine.getGenericFields());
				System.out.println("SAM Sequence Record: " + headerLine.getSAMSequenceRecord());
				System.out.println("--------------------------------");
			}
			System.out.println(">>> End Contig List");
		}
	}
	
	@Test
	public void testFilterHeaderLines() throws IOException {
		final File TEST_DIR = new File("src/test/resources/data/vcf");
		File vcfFile = new File(TEST_DIR, "PA.vcf");
		try (final VCFFileReader reader = new VCFFileReader(vcfFile, false)) {
			final VCFHeader header = reader.getFileHeader();
			List<VCFFilterHeaderLine> filterHeaderLines = header.getFilterLines();
			System.out.println(">>> Start Filter List");
			for (VCFFilterHeaderLine headerLine : filterHeaderLines) {
				System.out.println("--------------------------------");
				System.out.println("ID: " + headerLine.getID());
				System.out.println("Key: " + headerLine.getKey());
				System.out.println("Value: " + headerLine.getValue());
				System.out.println("Generic Fields: " + headerLine.getGenericFields());
				System.out.println("--------------------------------");
			}
			System.out.println(">>> End Filter List");
		}
	}
	
	@Test
	public void testFormatHeaderLines() throws IOException {
		final File TEST_DIR = new File("src/test/resources/data/vcf");
		File vcfFile = new File(TEST_DIR, "PA.vcf");
		try (final VCFFileReader reader = new VCFFileReader(vcfFile, false)) {
			final VCFHeader header = reader.getFileHeader();
			Collection<VCFFormatHeaderLine> formatHeaderLines = header.getFormatHeaderLines();
			System.out.println(">>> Start Format List");
			for (VCFFormatHeaderLine headerLine : formatHeaderLines) {
				System.out.println("--------------------------------");
				System.out.println("ID: " + headerLine.getID());
				System.out.println("Key: " + headerLine.getKey());
				System.out.println("Value: " + headerLine.getValue());
				if (headerLine.isFixedCount()) {
					System.out.println("Count: " + headerLine.getCount());
				} else {
					System.out.println("Count: Not a fixed count");
				}
				System.out.println("Description: " + headerLine.getDescription());
				System.out.println("Source: " + headerLine.getSource());
				System.out.println("Version: " + headerLine.getVersion());
				System.out.println("Count Type: " + headerLine.getCountType().name());
				System.out.println("Type: " + headerLine.getType().name());
				System.out.println("--------------------------------");
			}
			System.out.println(">>> End Format List");
		}
	}
	
	@Test
	public void testInfoHeaderLines() throws IOException {
		final File TEST_DIR = new File("src/test/resources/data/vcf");
		File vcfFile = new File(TEST_DIR, "PA.vcf");
		try (final VCFFileReader reader = new VCFFileReader(vcfFile, false)) {
			final VCFHeader header = reader.getFileHeader();
			Collection<VCFInfoHeaderLine> infoHeaderLines = header.getInfoHeaderLines();
			System.out.println(">>> Start Info List");
			for (VCFInfoHeaderLine headerLine : infoHeaderLines) {
				System.out.println("--------------------------------");
				System.out.println("ID: " + headerLine.getID());
				System.out.println("Key: " + headerLine.getKey());
				System.out.println("Value: " + headerLine.getValue());
				if (headerLine.isFixedCount()) {
					System.out.println("Count: " + headerLine.getCount());
				} else {
					System.out.println("Count: Not a fixed count");
				}
				System.out.println("Description: " + headerLine.getDescription());
				System.out.println("Source: " + headerLine.getSource());
				System.out.println("Version: " + headerLine.getVersion());
				System.out.println("Count Type: " + headerLine.getCountType().name());
				System.out.println("Type: " + headerLine.getType().name());
				System.out.println("--------------------------------");
			}
			System.out.println(">>> End Info List");
		}
	}
	
	@Test
	public void testOtherHeaderLines() throws IOException {
		final File TEST_DIR = new File("src/test/resources/data/vcf");
		File vcfFile = new File(TEST_DIR, "PA.vcf");
		try (final VCFFileReader reader = new VCFFileReader(vcfFile, false)) {
			final VCFHeader header = reader.getFileHeader();
			Collection<VCFHeaderLine> otherHeaderLines = header.getOtherHeaderLines();
			System.out.println(">>> Start Filter List");
			for (VCFHeaderLine headerLine : otherHeaderLines) {
				System.out.println("--------------------------------");
				System.out.println("Key: " + headerLine.getKey());
				System.out.println("Value: " + headerLine.getValue());
				System.out.println("--------------------------------");
			}
			System.out.println(">>> End Filter List");
		}
	}
	
	@Test
	public void testGenotypeSamples() throws IOException {
		final File TEST_DIR = new File("src/test/resources/data/vcf");
		File vcfFile = new File(TEST_DIR, "PA.vcf");
		try (final VCFFileReader reader = new VCFFileReader(vcfFile, false)) {
			final VCFHeader header = reader.getFileHeader();
			List<String> genotypeSamples = header.getGenotypeSamples();
			System.out.println(">>> Start Genotype Samples List");
			for (String genotypeSample : genotypeSamples) {
				System.out.println("--------------------------------");
				System.out.println(genotypeSample);
				System.out.println("--------------------------------");
			}
			System.out.println(">>> End Genotype Samples List");
		}
	}
	
	@Test
	public void testIDHeaderLines() throws IOException {
		final File TEST_DIR = new File("src/test/resources/data/vcf");
		File vcfFile = new File(TEST_DIR, "PA.vcf");
		try (final VCFFileReader reader = new VCFFileReader(vcfFile, false)) {
			final VCFHeader header = reader.getFileHeader();
			List<VCFIDHeaderLine> headerLines = header.getIDHeaderLines();
			System.out.println(">>> Start ID Header List");
			for (VCFIDHeaderLine headerLine : headerLines) {
				System.out.println("--------------------------------");
				System.out.println("ID: " + headerLine.getID());
				System.out.println("--------------------------------");
			}
			System.out.println(">>> End ID Header List");
		}
	}
	
	@Test
	public void testMetaDataInInputLines() throws IOException {
		final File TEST_DIR = new File("src/test/resources/data/vcf");
		File vcfFile = new File(TEST_DIR, "PA.vcf");
		try (final VCFFileReader reader = new VCFFileReader(vcfFile, false)) {
			final VCFHeader header = reader.getFileHeader();
			Set<VCFHeaderLine> headerLines = header.getMetaDataInInputOrder();
			System.out.println(">>> Start Meta Data In Input List");
			for (VCFHeaderLine headerLine : headerLines) {
				System.out.println("--------------------------------");
				System.out.println("Key: " + headerLine.getKey());
				System.out.println("Value: " + headerLine.getValue());
				System.out.println("--------------------------------");
			}
			System.out.println(">>> End Meta Data In Input List");
		}
	}
	
	@Test
	public void testVariantContextLines() throws IOException {
		final File TEST_DIR = new File("src/test/resources/data/vcf");
		File vcfFile = new File(TEST_DIR, "PA.vcf");
		try (final VCFFileReader reader = new VCFFileReader(vcfFile, false)) {
			try (final CloseableIterator<VariantContext> iterator = reader.iterator()) {
				System.out.println(">>> Start VariantContext List");
				while (iterator.hasNext()) {
					VariantContext variantContext = iterator.next();
					System.out.println("--------------------------------");
					System.out.println("ID: " + variantContext.getID());
					System.out.println("Called Chr Count: " + variantContext.getCalledChrCount());
					System.out.println("Contig: " + variantContext.getContig());
					System.out.println("Start: " + variantContext.getStart());
					System.out.println("End: " + variantContext.getEnd());
					System.out.println("Het Count: " + variantContext.getHetCount());
					System.out.println("Hom Ref Count: " + variantContext.getHomRefCount());
					System.out.println("Hom Var Count: " + variantContext.getHomVarCount());
					System.out.println("Length On Reference: " + variantContext.getLengthOnReference());
					System.out.println("Log10 PError: " + variantContext.getLog10PError());
					System.out.println("Mixed Count: " + variantContext.getMixedCount());
					System.out.println("NAlleles: " + variantContext.getNAlleles());
					System.out.println("No Call Count: " + variantContext.getNoCallCount());
					System.out.println("NSamples: " + variantContext.getNSamples());
					System.out.println("Phred Scaled Qual: " + variantContext.getPhredScaledQual());
					System.out.println("Reference Allele - Base String: " + variantContext.getReference().getBaseString());
					System.out.println("Reference Allele - Display String: " + variantContext.getReference().getDisplayString());
					System.out.println("Source: " + variantContext.getSource());
					System.out.println("Structural Variant Type: " + variantContext.getStructuralVariantType().name());
					System.out.println("Type: " + variantContext.getType().name());
					
					System.out.println("Is Biallelic: " + variantContext.isBiallelic());
					System.out.println("Is Complex Indel: " + variantContext.isComplexIndel());
					System.out.println("Is Filtered: " + variantContext.isFiltered());
					System.out.println("Is Not Filtered: " + variantContext.isNotFiltered());
					System.out.println("Is Fully Decoded: " + variantContext.isFullyDecoded());
					System.out.println("Is Indel: " + variantContext.isIndel());
					System.out.println("Is Mixed: " + variantContext.isMixed());
					System.out.println("Is MNP: " + variantContext.isMNP());
					System.out.println("Is SNP: " + variantContext.isSNP());
					System.out.println("Is Monomorphic In Samples: " + variantContext.isMonomorphicInSamples());
					System.out.println("Is Polymorphic In Samples: " + variantContext.isPolymorphicInSamples());
					System.out.println("Is Point Event: " + variantContext.isPointEvent());
					System.out.println("Is Reference Block: " + variantContext.isReferenceBlock());
					System.out.println("Is Simple Deletion: " + variantContext.isSimpleDeletion());
					System.out.println("Is Simple Insertion: " + variantContext.isSimpleInsertion());
					System.out.println("Is Simple Indel: " + variantContext.isSimpleIndel());
					System.out.println("Is Structural Indel: " + variantContext.isStructuralIndel());
					System.out.println("Is Symbolic: " + variantContext.isSymbolic());
					System.out.println("Is Variant: " + variantContext.isVariant());
					
					Map<String, Object> attributes = variantContext.getCommonInfo().getAttributes();
					System.out.println("    >>> Start Attributes List: ");
					for (Entry<String, Object> entry : attributes.entrySet()) {
						System.out.println("    Attribute Key: " + entry.getKey());
						System.out.println("    Attributes Value: " + entry.getValue());
					}
					System.out.println("    <<< End Attributes List: ");
					
					List<Allele> alleles = variantContext.getAlleles();
					System.out.println("    >>> Start Alleles List: ");
					for (Allele allele : alleles) {
						System.out.println("    Allele - Base String: " + allele.getBaseString());
						System.out.println("    Allele - Display String: " + allele.getDisplayString());
					}
					System.out.println("    <<< End Alleles List: ");
					
					alleles = variantContext.getAlternateAlleles();
					System.out.println("    >>> Start Alternate Alleles List: ");
					for (Allele allele : alleles) {
						System.out.println("    Alternative Allele - Base String: " + allele.getBaseString());
						System.out.println("    Alternative Allele - Display String: " + allele.getDisplayString());
					}
					System.out.println("    <<< End Alternate Alleles List: ");
					
					Set<String> filters = variantContext.getFilters();
					System.out.println("    >>> Start Filters List: ");
					for (String filter : filters) {
						System.out.println("    Filter: " + filter);
					}
					System.out.println("    <<< End Filters List: ");
					
					GenotypesContext genotypesContext = variantContext.getGenotypes();
					Iterator<Genotype> genotypes = genotypesContext.iterator();
					System.out.println("    >>> Start Genotypes List: ");
					while (genotypes.hasNext()) {
						Genotype genotype = genotypes.next();
						System.out.println("    AD: " + Arrays.toString(genotype.getAD()));
						System.out.println("    DP: " + genotype.getDP());
						System.out.println("    GQ: " + genotype.getGQ());
						System.out.println("    PL: " + Arrays.toString(genotype.getPL()));
						System.out.println("    Is Phased: " + genotype.isPhased());
						System.out.println("    Filters: " + genotype.getFilters());
						System.out.println("    Genotype String: " + genotype.getGenotypeString());
//						System.out.println("    Likelihoods String: " + genotype.getLikelihoodsString());
						System.out.println("    * Log10 PError: " + genotype.getLog10PError());
						System.out.println("    * Phred Scaled Qual: " + genotype.getPhredScaledQual());
						System.out.println("    Ploidy: " + genotype.getPloidy());
						System.out.println("    GenotypeLikelihoods: " + genotype.getLikelihoods().getAsString());
						
						System.out.println("    Sample Name: " + genotype.getSampleName());
						System.out.println("    Type: " + genotype.getType().name());
						
						alleles = genotype.getAlleles();
						System.out.println("        >>> Start Alleles List: ");
						for (Allele allele : alleles) {
							System.out.println("        Allele - Base String: " + allele.getBaseString());
							System.out.println("        Allele - Display String: " + allele.getDisplayString());
						}
						System.out.println("        <<< End Alleles List: ");
						
						attributes = genotype.getExtendedAttributes();
						System.out.println("        >>> Start Extended Attributes List: ");
						for (Entry<String, Object> entry : attributes.entrySet()) {
							System.out.println("        Extended Attribute Key: " + entry.getKey());
							System.out.println("        Extended Attributes Value: " + entry.getValue());
						}
						System.out.println("        <<< End Extended Attributes List: ");
						
						
						
					}
					System.out.println("    <<< End Genotypes List: ");
					
					System.out.println("--------------------------------");
				}
			}
			System.out.println("<<< End VariantContext List");
		}
	}

}
