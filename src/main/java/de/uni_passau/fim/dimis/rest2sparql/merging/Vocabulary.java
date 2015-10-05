package de.uni_passau.fim.dimis.rest2sparql.merging;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;

/**
 * CODE RDF Datacube vocabulary. VA and DC properties are copied from original.
 * TODO: No 42data vocabulary? "cubeDimensionNumeric" ok?
 */
public class Vocabulary {

    // TODO: rdfs:isDefinedBy?
    // Prefixes and URIs
    public static final String QB_PREFIX = "qb";
    public static final String QB_URI = "http://purl.org/linked-data/cube#";
    public static final String VA_PREFIX = "va";
    public static final String VA_URI = "http://code-research.eu/ontology/visual-analytics#";
    public static final String CODE_PREFIX = "code";
    public static final String CODE_URI = "http://code-research.eu/resource/";
    public static final String PROV_PREFIX = "prov";
    public static final String PROV_URI = "http://www.w3.org/ns/prov#";
    public static final String DC_PREFIX = "dc";
    public static final String DC_URI = "http://purl.org/dc/elements/1.1/";
    public static final String RDF_PREFIX = "rdf";
    public static final String RDF_URI = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
    public static final String RDFS_PREFIX = "rdfs";
    public static final String RDFS_URI = "http://www.w3.org/2000/01/rdf-schema#";

    private static final Model model = ModelFactory.createDefaultModel();

    // QB vocabulary
    public static final Resource QB_DSD = model.createResource(QB_URI + "DataStructureDefinition");
    public static final Resource QB_DATASET = model.createResource(QB_URI + "DataSet");
    public static final Resource QB_DIM_PROPERTY = model.createResource(QB_URI + "DimensionProperty");
    public static final Resource QB_MEASURE_PROPERTY = model.createResource(QB_URI + "MeasureProperty");
    public static final Resource QB_OBSERVATION = model.createResource(QB_URI + "Observation");
    public static final Property QB_COMPONENT = model.createProperty(QB_URI + "component");
    public static final Property QB_DIMENSION = model.createProperty(QB_URI + "dimension");
    public static final Property QB_MEASURE = model.createProperty(QB_URI + "measure");
    public static final Property QB_ATTRIBUTE = model.createProperty(QB_URI + "attribute");
    public static final Property QB_STRUCTURE = model.createProperty(QB_URI + "structure");
    public static final Property QB_DATASET_PROPERTY = model.createProperty(QB_URI + "dataSet");

    // PROV vocabulary
    public static final Property PROV_WAS_DERIVED_FROM = model.createProperty(PROV_URI + "wasDerivedFrom");
    public static final Property PROV_WAS_GENERATED_BY = model.createProperty(PROV_URI + "wasGeneratedBy");
    public static final Property PROV_WAS_STARTED_BY = model.createProperty(PROV_URI + "wasStartedBy");

    // DC vocabulary
    public static final Property DC_FORMAT = model.createProperty(DC_URI + "format");
    public static final Property DC_SOURCE = model.createProperty(DC_URI + "source");

    // CODE vocabulary (need UUID as suffix)
    public static final String CODE_DATASET = CODE_URI + "Dataset-";
    public static final String CODE_DSD = CODE_URI + "Dsd-";
    public static final String CODE_OBS = CODE_URI + "Obs-";
    public static final String CODE_IMPORT = CODE_URI + "Import-";
    public static final String CODE_IMPORTER = CODE_URI + "Importer-";
    public static final String CODE_ENTITY = CODE_URI + "Entity-";

    // VA vocabulary
    public static final String VA_OBSERVATION_NUMBER = VA_URI + "cubeObservationNumber";
    public static final String VA_DIMENSION_NOMINAL = VA_URI + "cubeDimensionNominal";
    public static final String VA_DIMENSION_NUMERIC = VA_URI + "cubeDimensionNumeric";
}
