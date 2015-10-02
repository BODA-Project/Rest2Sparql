package de.uni_passau.fim.dimis.rest2sparql.merging.dao;

import de.uni_passau.fim.dimis.rest2sparql.merging.Vocabulary;
import de.uni_passau.fim.dimis.rest2sparql.merging.dto.Dimension;
import de.uni_passau.fim.dimis.rest2sparql.merging.dto.Entity;
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

    /**
     * Get all entities of the given graph
     *
     * @param graph
     * @return
     */
    public List<Entity> getEntities(String graph) {

        List<Entity> list = new ArrayList();
        return list;
    }

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
        // TODO
        List<Dimension> list = new ArrayList();
        return list;
    }

    /**
     * Get all measures of the given graph
     *
     * @param graph
     * @return
     */
    public List<Measure> getMeasures(String graph) {
        // TODO
        List<Measure> list = new ArrayList();
        return list;
    }

    /**
     * TODO parameters?
     */
    public void store() {

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
    }

    /**
     * Creates a map from UUIDs to entity objects for easier access.
     *
     * @param entities
     * @return
     */
    public Map<String, Entity> computeEntityMap(List<Entity> entities) {
        Map<String, Entity> entityMap = new HashMap();
        for (Entity entity : entities) {
            entityMap.put(entity.getResource(), entity);
        }
        return entityMap;
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
