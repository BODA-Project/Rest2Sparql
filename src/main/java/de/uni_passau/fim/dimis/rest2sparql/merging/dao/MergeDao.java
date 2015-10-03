package de.uni_passau.fim.dimis.rest2sparql.merging.dao;

import de.uni_passau.fim.dimis.rest2sparql.merging.Vocabulary;
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
import org.apache.jena.query.ParameterizedSparqlString;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.RDFNode;

/**
 * Class for database access (reading and writing) using Apache Jena.
 */
public class MergeDao {

    // TEMP: for testing purpose
    public static void main(String[] args) {

        // TODO: Importer, Import, DSD, Dataset
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
        System.out.println("==========================");
        for (Dimension dim : dimensions) {
            System.out.println(dim.getLabel() + "  =  " + dim.getSubpropertyOf() + "  =  " + dim.getResource());
        }
        System.out.println("");
        System.out.println("=========MEASURES=========");
        List<Measure> measures = dao.getMeasures("http://code-research.eu/resource/Dataset-1fb732fc-647d-4747-847d-c73eabbc737a");
        System.out.println(measures.size());
        System.out.println("==========================");
        for (Measure measure : measures) {
            System.out.println(measure.getLabel() + "  =  " + measure.getSubpropertyOf() + "  =  " + measure.getResource());
        }
    }

    /**
     * Get all entities of the given graph
     *
     * @param graph
     * @return
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
     * @param graph
     * @return
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
     * @param graph
     * @return
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
     * @param graph
     * @return
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
     * Stores the given merged configuration by creating Jena Models and storing
     * them to the triple store.
     *
     * @param ds the dataset metadata about the cube
     * @param dsd the dataset structure definition
     * @param imp the import information
     * @param dimensions all dimensions
     * @param measures all measures
     * @param entities all dimension entities
     * @param observations all observations
     */
    public void store(Dataset ds, DatasetStructureDefinition dsd, Import imp, List<Dimension> dimensions, List<Measure> measures, List<Entity> entities, List<Observation> observations) {

//        RDFDataMgr.write(System.out, model, Lang.TURTLE);
//   or:  model.write(System.out, "TURTLE") ;
//        ByteArrayOutputStream baos = new ByteArrayOutputStream();
//        model.write(baos, Lang.N3.getName());
//        String data = baos.toString();
        Model m;

        // Context uri = new UUID

        /* TODO: store:
         Prefixes
         Dimensions
         Measures
         Entities
         Observations
         Dataset-Infos
         Datastructure-definition
         Import
         Importer
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
        String queryFile = properties.getComponentQuery();

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
