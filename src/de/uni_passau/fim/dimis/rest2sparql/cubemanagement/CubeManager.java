package de.uni_passau.fim.dimis.rest2sparql.cubemanagement;

import de.uni_passau.fim.dimis.rest2sparql.triplestore.ITripleStoreConnection;
import de.uni_passau.fim.dimis.rest2sparql.util.PrefixCollection;
import de.uni_passau.fim.dimis.rest2sparql.util.SparqlPrefix;

import java.io.IOException;

import static de.uni_passau.fim.dimis.rest2sparql.triplestore.ITripleStoreConnection.OutputFormat;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/22/13
 * Time: 5:10 PM
 * <p/>
 * This class is used to fetch information about the cubes in the database.
 * The output is returned as an XML String by default.
 */
public class CubeManager {

    private ITripleStoreConnection connection;
    private OutputFormat format = OutputFormat.XML;
    private PrefixCollection PrefixManager = new PrefixCollection();

    /**
     * Creat a new CubeManager.
     *
     * @param connection The connection to the triple store.
     */
    public CubeManager(ITripleStoreConnection connection) {
        this.connection = connection;
        PrefixManager.addPrefix(new SparqlPrefix("qb", "http://purl.org/linked-data/cube#"));
        PrefixManager.addPrefix(new SparqlPrefix("code", "http://code-research.eu/resource/"));
        PrefixManager.addPrefix(new SparqlPrefix("rdfs", "http://www.w3.org/2000/01/rdf-schema#"));
    }

    /**
     * Returns a list of all cubes in the database. The list includes the unique cubename, and a label and description, if available.
     *
     * @return a list of all cubes in the database.
     * @throws IOException If the connection to the database failes.
     */
    public String getCubes() throws Exception {

        String query = PrefixManager.createPrefixString() +
                "SELECT ?CUBE_NAME ?LABEL ?COMMENT. " +
                "WHERE { ?CUBE_NAME a qb:DataSet. " +
                "?CUBE_NAME rdfs:label ?LABEL. " +
                "?CUBE_NAME rdfs:comment ?COMMENT.}";

        return connection.executeSPARQL(query, format);
    }

    /**
     * Returns the dimensions of the cube with the given name.
     * If the CubeName is an empty String, the dimensions of all cubes are returned.
     *
     * @param CubeName The name of the cube to get information from.
     * @return the dimensions of the cube.
     * @throws IOException If the connection to the database failes.
     */
    public String getDimensions(String CubeName) throws Exception {

        String query = PrefixManager.createPrefixString() +
                "SELECT ?CUBE_NAME ?DIMENSION_NAME ?LABEL " +
                "WHERE { ?CUBE_NAME qb:structure ?dsd. " +
                "?dsd qb:component ?compSpec. " +
                "?compSpec qb:dimension ?DIMENSION_NAME. " +
                "?DIMENSION_NAME rdfs:label ?LABEL. }";
        if (!CubeName.equals("")) {
            query = query.replace("}", "FILTER (?CUBE_NAME = code:" + CubeName + ").}"); // TODO generalize filter
        }

        return connection.executeSPARQL(query, format);
    }

    /**
     * Returns the measures of the cube with the given name.
     * If the CubeName is an empty String, the measures of all cubes are returned.
     *
     * @param CubeName The name of the cube to get information from.
     * @return the measures of the cube.
     * @throws IOException If the connection to the database failes.
     */
    public String getMeasures(String CubeName) throws Exception {
        String query = PrefixManager.createPrefixString() +
                "SELECT ?CUBE_NAME ?MEASURE_NAME ?LABEL " +
                "WHERE { ?CUBE_NAME qb:structure ?dsd. " +
                "?dsd qb:component ?compSpec. " +
                "?compSpec qb:measure ?MEASURE_NAME. " +
                "?MEASURE_NAME rdfs:label ?LABEL. }";
        if (!CubeName.equals("")) {
            query = query.replace("}", "FILTER (?CUBE_NAME = code:" + CubeName + ").}"); // TODO generalize filter
        }

        return connection.executeSPARQL(query, format);
    }

    /**
     * Returns the entities of a dimension. DimensionName and CubeName must not be empty!
     * @param DimensionName The name of the dimension. <b>MUST BE A WHOLE URL</b> without "<" and ">".
     * @param CubeName The name of the cube.
     * @return The entities of the dimension.
     * @throws IOException If the connection to the database failes.
     */
    public String getEntities(String DimensionName, String CubeName) throws Exception {
        String query = PrefixManager.createPrefixString() +
                "SELECT ?CUBE_NAME ?DIMENSION_NAME ?ENTITY_NAME ?LABEL " +
                "WHERE { ?CUBE_NAME qb:structure ?dsd. " +
                "?dsd qb:component ?compSpec. " +
                "?compSpec qb:dimension ?DIMENSION_NAME. " +
                "?obs qb:dataSet ?CUBE_NAME. " +
                "?obs ?DIMENSION_NAME ?ENTITY_NAME. " +
                "?ENTITY_NAME rdfs:label ?LABEL. " +
                "FILTER (?CUBE_NAME = code:" + CubeName + "). " +
                "FILTER (?DIMENSION_NAME = <" + DimensionName + ">). " +
                "} GROUP BY ?CUBE_NAME ?DIMENSION_NAME ?ENTITY_NAME ?LABEL"; // TODO generalize filter

        return connection.executeSPARQL(query, format);
    }

    public void setOutputFormat(OutputFormat format) {
        this.format = format;
    }
}
