package de.uni_passau.fim.dimis.rest2sparql.merging.dao;

import de.uni_passau.fim.dimis.rest2sparql.merging.Vocabulary;
import de.uni_passau.fim.dimis.rest2sparql.merging.dto.Cube;
import de.uni_passau.fim.dimis.rest2sparql.merging.dto.Dataset;
import de.uni_passau.fim.dimis.rest2sparql.merging.dto.DatasetStructureDefinition;
import de.uni_passau.fim.dimis.rest2sparql.merging.dto.Dimension;
import de.uni_passau.fim.dimis.rest2sparql.merging.dto.Entity;
import de.uni_passau.fim.dimis.rest2sparql.merging.dto.Import;
import de.uni_passau.fim.dimis.rest2sparql.merging.dto.Measure;
import de.uni_passau.fim.dimis.rest2sparql.merging.dto.Observation;
import de.uni_passau.fim.dimis.rest2sparql.util.MergeProperties;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.commons.io.IOUtils;
import org.apache.commons.io.output.ByteArrayOutputStream;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.apache.jena.datatypes.RDFDatatype;
import org.apache.jena.datatypes.xsd.XSDDatatype;
import org.apache.jena.query.ParameterizedSparqlString;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdf.model.Literal;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;
import org.apache.xerces.xni.grammars.XMLSchemaDescription;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Class for database access (reading and writing) using Apache Jena. When
 * reading, the resource UUIDs are generally not returned since they will be
 * rewritten anyway, except when they are needed (Observations to Entities).
 */
public class MergeDao {

    private final static String CONTEXT_URI = "?context-uri=";
    private final static String CONTENT_TYPE_TURTLE = "application/x-turtle";
    private final static String CONTENT_TYPE_N3 = "text/rdf+n3";
    private final static String CONTENT_TYPE_RDF_XML = "application/rdf+xml";

    private final Logger logger = LoggerFactory.getLogger(getClass());
    // TODO: log errors! + add try catch on queries!

    // TEMP: for testing purpose
    public static void main(String[] args) {

        MergeDao dao = new MergeDao();

        List<Observation> obs = dao.getObservations("http://code-research.eu/resource/Dataset-1fb732fc-647d-4747-847d-c73eabbc737a");
        for (Observation ob : obs) {
            System.out.println("");
            System.out.println("========DIMENSIONS========");
            for (Map.Entry<String, String> entrySet : ob.getDimensions().entrySet()) {
                String key = entrySet.getKey();
                String value = entrySet.getValue();
                System.out.println(key + " = " + value);
            }
            System.out.println("---------MEASURES---------");
            for (Map.Entry<String, Double> entrySet : ob.getMeasures().entrySet()) {
                String key = entrySet.getKey();
                Double value = entrySet.getValue();
                System.out.println(key + " = " + value);
            }
        }
        System.out.println("");
        System.out.println("========COMPONENTS========");
        Map<String, String> comps = dao.getComponentMap("http://code-research.eu/resource/Dataset-1fb732fc-647d-4747-847d-c73eabbc737a");
        for (Map.Entry<String, String> entrySet : comps.entrySet()) {
            String key = entrySet.getKey();
            String value = entrySet.getValue();

            System.out.println(key + "  =  " + value);
        }
        System.out.println("");
        System.out.println("=========ENTITIES=========");
        List<Entity> entities = dao.getEntities("http://code-research.eu/resource/Dataset-1fb732fc-647d-4747-847d-c73eabbc737a");
        System.out.println(entities.size());
        System.out.println("==========================");
        for (Entity entity : entities) {
            System.out.println(entity.getLabel() + "  =  " + entity.getDefinedBy() + "  =  " + entity.getResource());
        }
        System.out.println("");
        System.out.println("========DIMENSIONS========");
        List<Dimension> dimensions = dao.getDimensions("http://code-research.eu/resource/Dataset-1fb732fc-647d-4747-847d-c73eabbc737a");
        System.out.println(dimensions.size());
        System.out.println("--------------------------");
        for (Dimension dim : dimensions) {
            System.out.println(dim.getLabel() + "  =  " + dim.getSubpropertyOf() + "  =  " + dim.getResource());
        }
        System.out.println("");
        System.out.println("=========MEASURES=========");
        List<Measure> measures = dao.getMeasures("http://code-research.eu/resource/Dataset-1fb732fc-647d-4747-847d-c73eabbc737a");
        System.out.println(measures.size());
        System.out.println("--------------------------");
        for (Measure measure : measures) {
            System.out.println(measure.getLabel() + "  =  " + measure.getSubpropertyOf() + "  =  " + measure.getResource());
        }
        System.out.println("");
        System.out.println("=========DATASET==========");
        Dataset ds = dao.getDataset("http://code-research.eu/resource/Dataset-1fb732fc-647d-4747-847d-c73eabbc737a");
        System.out.println("getComment " + ds.getComment());
        System.out.println("getFormat " + ds.getFormat());
        System.out.println("getGeneratedBy " + ds.getGeneratedBy());
        System.out.println("getLabel " + ds.getLabel());
        System.out.println("getRelation " + ds.getRelation());
        System.out.println("getResource " + ds.getResource());
        System.out.println("getSource " + ds.getSource());
        System.out.println("getStructure " + ds.getStructure());
        System.out.println("auth / import label " + ds.getImport().getLabel());
    }

    /**
     * Get all dimension-entities of the given graph
     *
     * @param graph the named graph
     * @return list of entities
     */
    public List<Entity> getEntities(String graph) {
        MergeProperties properties = MergeProperties.getInstance();
        String tripleStore = properties.getTripleStore();
        String queryFile = properties.getEntityQuery();

        List<Entity> list = new ArrayList();

        // Prepare a query for the entities
        String queryString = QueryFactory.read(queryFile).toString();
        ParameterizedSparqlString preparedQuery = new ParameterizedSparqlString(queryString);
        preparedQuery.setIri("g", graph);

        try (QueryExecution qe = QueryExecutionFactory.sparqlService(tripleStore, preparedQuery.toString())) {
            ResultSet rs = qe.execSelect();
            while (rs.hasNext()) {
                QuerySolution result = rs.next();
                Entity entity = new Entity();
                entity.setResource(result.get("res").toString());
                entity.setDefinedBy(result.get("def").toString());
                entity.setLabel(result.get("label").toString());
                list.add(entity);
            }
        }
        return list;
    }

    /**
     * Get all observations of the given graph
     *
     * @param graph the named graph
     * @return list of observations
     */
    public List<Observation> getObservations(String graph) {
        MergeProperties properties = MergeProperties.getInstance();
        String tripleStore = properties.getTripleStore();
        String queryFile = properties.getObservationQuery();

        List<Observation> list = new ArrayList();
        Map<String, String> components = getComponentMap(graph);
        Map<String, Observation> observations = new HashMap();

        // Prepare a query for the observations
        String queryString = QueryFactory.read(queryFile).toString();
        ParameterizedSparqlString preparedQuery = new ParameterizedSparqlString(queryString);
        preparedQuery.setIri("g", graph);

        try (QueryExecution qe = QueryExecutionFactory.sparqlService(tripleStore, preparedQuery.toString())) {
            ResultSet rs = qe.execSelect();
            while (rs.hasNext()) {
                QuerySolution result = rs.next();

                // Read subject, predicate, object
                String obsResource = result.get("s").toString();
                String predicate = result.get("p").toString();
                RDFNode object = result.get("o"); // Can be string or numerical value

                // Create new observation if first triple
                if (!observations.containsKey(obsResource)) {
                    Observation observation = new Observation();
                    observations.put(obsResource, observation);
                    list.add(observation);
                }
                Observation observation = observations.get(obsResource);

                // Fill the observation object (dimensions and measures)
                if (Vocabulary.QB_MEASURE.getURI().equals(components.get(predicate))) {
                    double numValue = object.asLiteral().getDouble(); // Note: always interpreted as double -> might cause problems
                    observation.getMeasures().put(predicate, numValue);
                } else if (Vocabulary.QB_DIMENSION.getURI().equals(components.get(predicate))) {
                    observation.getDimensions().put(predicate, object.toString());
                }
            }
        }
        return list;
    }

    /**
     * Get all dimensions of the given graph
     *
     * @param graph the named graph
     * @return list of dimensions
     */
    public List<Dimension> getDimensions(String graph) {
        MergeProperties properties = MergeProperties.getInstance();
        String tripleStore = properties.getTripleStore();
        String queryFile = properties.getDimensionQuery();

        List<Dimension> list = new ArrayList();

        // Prepare a query for the dimensions
        String queryString = QueryFactory.read(queryFile).toString();
        ParameterizedSparqlString preparedQuery = new ParameterizedSparqlString(queryString);
        preparedQuery.setIri("g", graph);

        try (QueryExecution qe = QueryExecutionFactory.sparqlService(tripleStore, preparedQuery.toString())) {
            ResultSet rs = qe.execSelect();
            while (rs.hasNext()) {
                QuerySolution result = rs.next();
                Dimension dim = new Dimension();
                dim.setResource(result.get("res").toString());
                dim.setSubpropertyOf(result.get("sub").toString());
                dim.setLabel(result.get("label").toString());
                list.add(dim);
            }
        }
        return list;
    }

    /**
     * Get all measures of the given graph
     *
     * @param graph the named graph
     * @return list of measures
     */
    public List<Measure> getMeasures(String graph) {
        MergeProperties properties = MergeProperties.getInstance();
        String tripleStore = properties.getTripleStore();
        String queryFile = properties.getMeasureQuery();

        List<Measure> list = new ArrayList();

        // Prepare a query for the measures
        String queryString = QueryFactory.read(queryFile).toString();
        ParameterizedSparqlString preparedQuery = new ParameterizedSparqlString(queryString);
        preparedQuery.setIri("g", graph);

        try (QueryExecution qe = QueryExecutionFactory.sparqlService(tripleStore, preparedQuery.toString())) {
            ResultSet rs = qe.execSelect();
            while (rs.hasNext()) {
                QuerySolution result = rs.next();
                Measure measure = new Measure();
                measure.setResource(result.get("res").toString());
                measure.setSubpropertyOf(result.get("sub").toString());
                measure.setLabel(result.get("label").toString());
                list.add(measure);
            }
        }
        return list;
    }

    /**
     * Get the cube metadata (including the importer label)
     *
     * @param graph the named graph
     * @return the cube metadata
     */
    public Dataset getDataset(String graph) {
        MergeProperties properties = MergeProperties.getInstance();
        String tripleStore = properties.getTripleStore();
        String queryFile = properties.getDatasetQuery();

        // Prepare a query for the measures
        String queryString = QueryFactory.read(queryFile).toString();
        ParameterizedSparqlString preparedQuery = new ParameterizedSparqlString(queryString);
        preparedQuery.setIri("g", graph);

        Dataset ds;
        try (QueryExecution qe = QueryExecutionFactory.sparqlService(tripleStore, preparedQuery.toString())) {
            ResultSet rs = qe.execSelect();
            ds = new Dataset();
            while (rs.hasNext()) {
                QuerySolution result = rs.next();
                ds.setComment(result.get("comment").toString());
                ds.setFormat(result.get("format").toString());
                ds.setLabel(result.get("label").toString());
                ds.setRelation(result.get("relation").toString());
                ds.setSource(result.get("source").toString());
                Import imp = new Import();
                imp.setLabel(result.get("auth").toString());
                ds.setImport(imp);
            }
        }
        return ds;
    }

    /**
     * Stores the given merged configuration by creating Jena Models and storing
     * them to the triple store.
     *
     * @param cube the cube, containing all data.
     */
    public void store(Cube cube) {

        Dataset dataset = cube.getDataset();
        DatasetStructureDefinition dsd = cube.getDsd();
        List<Dimension> dimensions = cube.getDimensions();
        List<Measure> measures = cube.getMeasures();
        List<Entity> entities = cube.getEntities();
        List<Observation> observations = cube.getObservations();

        // Create jena models
        Model datasetModel = createDatasetModel(dataset);
        Model dsdModel = createDSDModel(dsd);
        Model dimensionModel = createDimensionModel(dimensions);
        Model measureModel = createMeasureModel(measures);
        Model entityModel = createEntityModel(entities);
        Model observationModel = createObservationModel(observations);

        // Combine the models into a single graph
        Model rootModel = ModelFactory.createDefaultModel();
        setNamespaces(rootModel);
        rootModel.add(datasetModel);
        rootModel.add(dsdModel);
        rootModel.add(dimensionModel);
        rootModel.add(measureModel);
        rootModel.add(entityModel);
        rootModel.add(observationModel);

        RDFDataMgr.write(System.out, rootModel, Lang.TURTLE);
        // Send the rdf data to the triple store
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        RDFDataMgr.write(baos, rootModel, Lang.TURTLE);
        String data = baos.toString();

        // Use the dataset resource as the context uri / graph name
        String storeURL = MergeProperties.getInstance().getTripleStore() + CONTEXT_URI + dataset.getResource();

        HttpClient httpClient = HttpClients.createDefault();
        HttpPost httpPost = new HttpPost(storeURL);
        httpPost.setHeader("Content-Type", CONTENT_TYPE_TURTLE);
        try {
            httpPost.setEntity(new StringEntity(data));
        } catch (UnsupportedEncodingException ex) {
            logger.error("Bad Encoding", ex);
        }
        HttpResponse response;
        String result = "";
        try {
            response = httpClient.execute(httpPost);
            HttpEntity entity = response.getEntity();
            result = IOUtils.toString(entity.getContent(), "UTF-8");
            EntityUtils.consume(entity);
        } catch (IOException ex) {
            logger.error("Error while executing storage post", ex);
        } finally {
            httpPost.releaseConnection();
        }

        logger.info("Merging result response: " + result);

        // TODO: return value? success / fail? / throw exceptions
    }

    /**
     * Gets a map of components and concepts to identify dimensions and measures
     * in observations later.
     *
     * @param graph the named graph
     * @return map of components and concepts
     */
    private Map<String, String> getComponentMap(String graph) {
        MergeProperties properties = MergeProperties.getInstance();
        String tripleStore = properties.getTripleStore();
        String queryFile = properties.getDSDQuery();

        Map<String, String> components = new HashMap();

        String queryString = QueryFactory.read(queryFile).toString();
        ParameterizedSparqlString preparedQuery = new ParameterizedSparqlString(queryString);
        preparedQuery.setIri("g", graph);

        try (QueryExecution qe = QueryExecutionFactory.sparqlService(tripleStore, preparedQuery.toString())) {
            ResultSet rs = qe.execSelect();
            while (rs.hasNext()) {
                QuerySolution result = rs.next();
                components.put(result.get("concept").toString(), result.get("component").toString());
            }
        }
        return components;
    }

    /**
     * Set the needed prefixes for the given model
     *
     * @param model the rdf model
     * @return the same model
     */
    private Model setNamespaces(Model model) {
        model.setNsPrefix(Vocabulary.QB_PREFIX, Vocabulary.QB_URI);
        model.setNsPrefix(Vocabulary.CODE_PREFIX, Vocabulary.CODE_URI);
        model.setNsPrefix(Vocabulary.RDF_PREFIX, Vocabulary.RDF_URI);
        model.setNsPrefix(Vocabulary.RDFS_PREFIX, Vocabulary.RDFS_URI);
        model.setNsPrefix(Vocabulary.VA_PREFIX, Vocabulary.VA_URI);
        model.setNsPrefix(Vocabulary.PROV_PREFIX, Vocabulary.PROV_URI);
        model.setNsPrefix(Vocabulary.DC_PREFIX, Vocabulary.DC_URI);
        return model;
    }

    /**
     * Creates a jena model of the given observations.
     *
     * @param observations the list of observations
     * @return a model of the given observations
     */
    private Model createObservationModel(List<Observation> observations) {
        Model model = ModelFactory.createDefaultModel();
        for (Observation obs : observations) {

            // Define Observation resource
            Resource obsResource = model.createResource(obs.getResource());
            Resource datasetResource = model.createResource(obs.getDataset());
            obsResource.addProperty(RDF.type, Vocabulary.QB_OBSERVATION);
            obsResource.addProperty(Vocabulary.QB_DATASET_PROPERTY, datasetResource);

            // Add dimensions
            for (String dimRes : obs.getDimensions().keySet()) {
                Resource entityResource = model.createResource(obs.getDimensions().get(dimRes));
                Property dimProperty = model.createProperty(dimRes);
                obsResource.addProperty(dimProperty, entityResource);
            }

            // Add measures
            for (String measureRes : obs.getMeasures().keySet()) {
                Literal literal = model.createTypedLiteral(obs.getMeasures().get(measureRes));
                Property measureProperty = model.createProperty(measureRes);
                obsResource.addLiteral(measureProperty, literal);
            }
        }
        return model;
    }

    /**
     * Creates a jena model of the given dataset
     *
     * @param dataset the dataset information
     * @return a model of the given dataset
     */
    private Model createDatasetModel(Dataset dataset) {
        Import imp = dataset.getImport();
        Model model = ModelFactory.createDefaultModel();
        Resource datasetResource = model.createResource(dataset.getResource());
        Resource structureResource = model.createResource(dataset.getStructure());
        Resource importResource = model.createResource(imp.getResource());
        Resource importerResource = model.createResource(imp.getStartedBy());
        importerResource.addLiteral(RDFS.label, model.createTypedLiteral(imp.getLabel(), XSDDatatype.XSD + "#string"));
        importResource.addProperty(Vocabulary.PROV_WAS_STARTED_BY, importerResource);
        datasetResource.addProperty(RDF.type, Vocabulary.QB_DATASET);
        datasetResource.addLiteral(RDFS.comment, dataset.getComment());
        datasetResource.addLiteral(RDFS.label, dataset.getLabel());
        datasetResource.addLiteral(Vocabulary.DC_FORMAT, dataset.getFormat());
        datasetResource.addLiteral(Vocabulary.DC_RELATION, dataset.getRelation());
        datasetResource.addLiteral(Vocabulary.DC_SOURCE, dataset.getSource());
        datasetResource.addProperty(Vocabulary.QB_STRUCTURE, structureResource);
        datasetResource.addProperty(Vocabulary.PROV_WAS_GENERATED_BY, importResource);
        return model;
    }

    /**
     * Creates a jena model of the given dataset structure definition
     *
     * @param dsd the dataset structure definition
     * @return a model of the given dataset structure definition
     */
    private Model createDSDModel(DatasetStructureDefinition dsd) {
        Model model = ModelFactory.createDefaultModel();
        Resource dsdResource = model.createResource(dsd.getResource());
        dsdResource.addProperty(RDF.type, Vocabulary.QB_DSD);

        // Add dimension components
        for (String dim : dsd.getDimensions()) {
            Resource tmp = model.createResource();
            Resource dimResource = model.createResource(dim);
            tmp.addProperty(Vocabulary.QB_DIMENSION, dimResource);
            dsdResource.addProperty(Vocabulary.QB_COMPONENT, tmp);
        }

        // Add measure components
        for (String measure : dsd.getMeasures()) {
            Resource tmp = model.createResource();
            Resource measureResource = model.createResource(measure);
            tmp.addProperty(Vocabulary.QB_MEASURE, measureResource);
            dsdResource.addProperty(Vocabulary.QB_COMPONENT, tmp);
        }

        return model;
    }

    /**
     * Creates a jena model of the given dimensions
     *
     * @param dimensions the dimensions
     * @return a model of the given dimensions
     */
    private Model createDimensionModel(List<Dimension> dimensions) {
        Model model = ModelFactory.createDefaultModel();
        for (Dimension dimension : dimensions) {
            Resource dimResource = model.createResource(dimension.getResource());
            Resource subPropertyOf = model.createResource(dimension.getSubpropertyOf());
            dimResource.addProperty(RDF.type, Vocabulary.QB_DIMENSION_PROPERTY);
            dimResource.addProperty(RDF.type, RDF.Property);
            dimResource.addProperty(RDFS.subPropertyOf, subPropertyOf);
            dimResource.addLiteral(RDFS.label, dimension.getLabel());
        }
        return model;
    }

    /**
     * Creates a jena model of the given measures
     *
     * @param measures the measures
     * @return a model of the given measures
     */
    private Model createMeasureModel(List<Measure> measures) {
        Model model = ModelFactory.createDefaultModel();
        for (Measure measure : measures) {
            Resource dimResource = model.createResource(measure.getResource());
            Resource subPropertyOfResource = model.createResource(measure.getSubpropertyOf());
            dimResource.addProperty(RDF.type, Vocabulary.QB_MEASURE_PROPERTY);
            dimResource.addProperty(RDF.type, RDF.Property);
            dimResource.addProperty(RDFS.subPropertyOf, subPropertyOfResource);
            dimResource.addLiteral(RDFS.label, measure.getLabel());
        }
        return model;
    }

    /**
     * Creates a jena model of the given entities
     *
     * @param entities the entities
     * @return a model of the given entities
     */
    private Model createEntityModel(List<Entity> entities) {
        Model model = ModelFactory.createDefaultModel();
        for (Entity entity : entities) {
            Resource entityResource = model.createResource(entity.getResource());
            Resource definedByResource = model.createResource(entity.getDefinedBy());
            entityResource.addProperty(RDF.type, Vocabulary.CODE_ENTITY_DEF);
            entityResource.addLiteral(RDFS.label, entity.getLabel());
            entityResource.addProperty(RDFS.isDefinedBy, definedByResource);
        }
        return model;
    }

}
