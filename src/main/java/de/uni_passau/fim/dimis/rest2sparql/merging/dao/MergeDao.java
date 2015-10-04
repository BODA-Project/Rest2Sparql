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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.commons.io.output.ByteArrayOutputStream;
import org.apache.jena.query.ParameterizedSparqlString;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.riot.Lang;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Class for database access (reading and writing) using Apache Jena. When
 * reading, the resource UUIDs are generally not returned since they will be
 * rewritten anyway, except when they are needed (Observations to Entities).
 */
public class MergeDao {

    private final Logger logger = LoggerFactory.getLogger(MergeDao.class);
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

        QueryExecution qe = QueryExecutionFactory.sparqlService(tripleStore, preparedQuery.toString());
        ResultSet rs = qe.execSelect();
        while (rs.hasNext()) {
            QuerySolution result = rs.next();
            Entity entity = new Entity();
            entity.setResource(result.get("res").toString());
            entity.setDefinedBy(result.get("def").toString());
            entity.setLabel(result.get("label").toString());
            list.add(entity);
        }
        qe.close();
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

        QueryExecution qe = QueryExecutionFactory.sparqlService(tripleStore, preparedQuery.toString());
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
        qe.close();
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

        QueryExecution qe = QueryExecutionFactory.sparqlService(tripleStore, preparedQuery.toString());
        ResultSet rs = qe.execSelect();
        while (rs.hasNext()) {
            QuerySolution result = rs.next();
            Dimension dim = new Dimension();
            dim.setResource(result.get("res").toString());
            dim.setSubpropertyOf(result.get("sub").toString());
            dim.setLabel(result.get("label").toString());
            list.add(dim);
        }
        qe.close();
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

        QueryExecution qe = QueryExecutionFactory.sparqlService(tripleStore, preparedQuery.toString());
        ResultSet rs = qe.execSelect();
        while (rs.hasNext()) {
            QuerySolution result = rs.next();
            Measure measure = new Measure();
            measure.setResource(result.get("res").toString());
            measure.setSubpropertyOf(result.get("sub").toString());
            measure.setLabel(result.get("label").toString());
            list.add(measure);
        }
        qe.close();
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

        QueryExecution qe = QueryExecutionFactory.sparqlService(tripleStore, preparedQuery.toString());
        ResultSet rs = qe.execSelect();
        Dataset ds = new Dataset();
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
        qe.close();
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
        Import imp = cube.getDataset().getImport();
        DatasetStructureDefinition dsd = cube.getDsd();
        List<Dimension> dimensions = cube.getDimensions();
        List<Measure> measures = cube.getMeasures();
        List<Entity> entities = cube.getEntities();
        List<Observation> observations = cube.getObservations();

        Model rootModel = ModelFactory.createDefaultModel();

//        RDFDataMgr.write(System.out, model, Lang.TURTLE);
        rootModel.write(System.out, "TURTLE"); // TODO TEST
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        rootModel.write(baos, Lang.N3.getName());
        String data = baos.toString();

        // TODO send "data" to triple store
        // Context uri = new UUID
        // TODO: create DSD from dimensions and measures!

        /* TODO: store:
         Prefixes
         Dimensions
         Measures
         Entities
         Observations
         Dataset-Infos
         Dataset-structure-definition
         */
        // TODO: return value? success / fail?
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

        QueryExecution qe = QueryExecutionFactory.sparqlService(tripleStore, preparedQuery.toString());
        ResultSet rs = qe.execSelect();
        while (rs.hasNext()) {
            QuerySolution result = rs.next();
            components.put(result.get("concept").toString(), result.get("component").toString());
        }
        qe.close();
        return components;
    }

}
