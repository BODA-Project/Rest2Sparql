package de.uni_passau.fim.dimis.rest2sparql.cubemanagement;

import de.uni_passau.fim.dimis.rest2sparql.queryfactory.QueryDescriptor;
import de.uni_passau.fim.dimis.rest2sparql.triplestore.ITripleStoreConnection;
import de.uni_passau.fim.dimis.rest2sparql.triplestore.util.ConnectionException;
import de.uni_passau.fim.dimis.rest2sparql.util.Cube;
import de.uni_passau.fim.dimis.rest2sparql.util.Dimension;
import de.uni_passau.fim.dimis.rest2sparql.util.PrefixCollection;
import de.uni_passau.fim.dimis.rest2sparql.util.SparqlPrefix;

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
        PrefixManager.addPrefix(new SparqlPrefix("prov", "http://www.w3.org/ns/prov#"));
        PrefixManager.addPrefix(new SparqlPrefix("xsd", "http://www.w3.org/2001/XMLSchema#"));
    }

    /**
     * Returns a list of all cubes in the database. The list includes the unique cubename, and a label and description, if available.
     *
     * @return a list of all cubes in the database.
     * @throws ConnectionException If the connection to the database failes.
     */
    public String getCubes() throws ConnectionException {

        String query = PrefixManager.createPrefixString() +
                "SELECT ?CUBE_NAME ?LABEL ?COMMENT " +
                "WHERE { ?CUBE_NAME a qb:DataSet. " +
                "?CUBE_NAME rdfs:label ?LABEL. " +
                "?CUBE_NAME rdfs:comment ?COMMENT.}";

        return connection.executeSPARQL(query, format);
    }

    /**
     * Returns the dimensions of the cube with the given name.
     *
     * @param cube The {@link Cube} to get the dimensions from.
     * @return the dimensions of the cube.
     * @throws ConnectionException If the connection to the database failes.
     */
    public String getDimensions(Cube cube) throws ConnectionException {

        cube.setVarName("CUBE_NAME", false);
        String query = PrefixManager.createPrefixString() +
                "SELECT ?CUBE_NAME ?DIMENSION_NAME ?LABEL " +
                "WHERE { ?CUBE_NAME qb:structure ?dsd. " +
                "?dsd qb:component ?compSpec. " +
                "?compSpec qb:dimension ?DIMENSION_NAME. " +
                "?DIMENSION_NAME rdfs:label ?LABEL. " + cube.buildFilterString() + "}";

        return connection.executeSPARQL(query, format);
    }

    /**
     * Returns the measures of the cube with the given name.
     *
     * @param cube The {@link Cube} to get the measures from.
     * @return the measures of the cube.
     * @throws ConnectionException If the connection to the database failes.
     */
    public String getMeasures(Cube cube) throws ConnectionException {

        cube.setVarName("CUBE_NAME", false);
        String query = PrefixManager.createPrefixString() +
                "SELECT ?CUBE_NAME ?MEASURE_NAME ?LABEL " +
                "WHERE { ?CUBE_NAME qb:structure ?dsd. " +
                "?dsd qb:component ?compSpec. " +
                "?compSpec qb:measure ?MEASURE_NAME. " +
                "?MEASURE_NAME rdfs:label ?LABEL. " + cube.buildFilterString() + "}";

        return connection.executeSPARQL(query, format);
    }

    /**
     * Returns the entities of a dimension.
     *
     * @param dimension The {@link Dimension} to get the Entities from.
     * @param cube      The {@link Cube} to get the Entities from.
     * @return The entities of the dimension.
     * @throws ConnectionException If the connection to the database failes.
     */
    public String getEntities(Dimension dimension, Cube cube) throws ConnectionException {

        cube.setVarName("CUBE_NAME", false);
        dimension.setVarName("DIMENSION_NAME", false);
        String query = PrefixManager.createPrefixString() +
                "SELECT ?CUBE_NAME ?DIMENSION_NAME ?ENTITY_NAME ?LABEL " +
                "WHERE { ?CUBE_NAME qb:structure ?dsd. " +
                "?dsd qb:component ?compSpec. " +
                "?compSpec qb:dimension ?DIMENSION_NAME. " +
                "?obs qb:dataSet ?CUBE_NAME. " +
                "?obs ?DIMENSION_NAME ?ENTITY_NAME. " +
                "?ENTITY_NAME rdfs:label ?LABEL. " +
                cube.buildFilterString() +
                dimension.buildFilterString() +
                "} GROUP BY ?CUBE_NAME ?DIMENSION_NAME ?ENTITY_NAME ?LABEL"; // TODO generalize filter

        return connection.executeSPARQL(query, format);
    }

    /**
     * Returns a list of all cubes in the database. The list includes the unique cubename, and a label and description, if available.
     *
     * @param ID The ID to get the cubes from.
     * @return a list of all cubes in the database.
     * @throws ConnectionException If the connection to the database failes.
     */
    public String getCubes(String ID) throws ConnectionException {

        String query = PrefixManager.createPrefixString() +
                "SELECT ?CUBE_NAME ?LABEL ?COMMENT " +
                "WHERE { ?CUBE_NAME a qb:DataSet. " +
                "?CUBE_NAME rdfs:label ?LABEL. " +
                "?CUBE_NAME rdfs:comment ?COMMENT. " +
                QueryDescriptor.buildIDCheck(ID) +
                "}";

        return connection.executeSPARQL(query, format);
    }

    /**
     * Returns the dimensions of the cube with the given name.
     *
     * @param cube The {@link Cube} to get the dimensions from.
     * @param ID   The ID to get the cubes from.
     * @return the dimensions of the cube.
     * @throws ConnectionException If the connection to the database failes.
     */
    public String getDimensions(Cube cube, String ID) throws ConnectionException {

        cube.setVarName("CUBE_NAME", false);
        String query = PrefixManager.createPrefixString() +
                "SELECT ?CUBE_NAME ?DIMENSION_NAME ?LABEL " +
                "WHERE { ?CUBE_NAME qb:structure ?dsd. " +
                "?dsd qb:component ?compSpec. " +
                "?compSpec qb:dimension ?DIMENSION_NAME. " +
                "?DIMENSION_NAME rdfs:label ?LABEL. " +
                QueryDescriptor.buildIDCheck(ID) +
                cube.buildFilterString() + "}";

        return connection.executeSPARQL(query, format);
    }

    /**
     * Returns the measures of the cube with the given name.
     *
     * @param cube The {@link Cube} to get the measures from.
     * @param ID   The ID to get the cubes from.
     * @return the measures of the cube.
     * @throws ConnectionException If the connection to the database failes.
     */
    public String getMeasures(Cube cube, String ID) throws ConnectionException {

        cube.setVarName("CUBE_NAME", false);
        String query = PrefixManager.createPrefixString() +
                "SELECT ?CUBE_NAME ?MEASURE_NAME ?LABEL " +
                "WHERE { ?CUBE_NAME qb:structure ?dsd. " +
                "?dsd qb:component ?compSpec. " +
                "?compSpec qb:measure ?MEASURE_NAME. " +
                "?MEASURE_NAME rdfs:label ?LABEL. " +
                QueryDescriptor.buildIDCheck(ID) +
                cube.buildFilterString() + "}";

        return connection.executeSPARQL(query, format);
    }

    /**
     * Returns the entities of a dimension.
     *
     * @param dimension The {@link Dimension} to get the Entities from.
     * @param cube      The {@link Cube} to get the Entities from.
     * @param ID        The ID to get the cubes from.
     * @return The entities of the dimension.
     * @throws ConnectionException If the connection to the database failes.
     */
    public String getEntities(Dimension dimension, Cube cube, String ID) throws ConnectionException {

        cube.setVarName("CUBE_NAME", false);
        dimension.setVarName("DIMENSION_NAME", false);
        String query = PrefixManager.createPrefixString() +
                "SELECT ?CUBE_NAME ?DIMENSION_NAME ?ENTITY_NAME ?LABEL " +
                "WHERE { ?CUBE_NAME qb:structure ?dsd. " +
                "?dsd qb:component ?compSpec. " +
                "?compSpec qb:dimension ?DIMENSION_NAME. " +
                "?obs qb:dataSet ?CUBE_NAME. " +
                "?obs ?DIMENSION_NAME ?ENTITY_NAME. " +
                "?ENTITY_NAME rdfs:label ?LABEL. " +
                QueryDescriptor.buildIDCheck(ID) +
                cube.buildFilterString() +
                dimension.buildFilterString() +
                "} GROUP BY ?CUBE_NAME ?DIMENSION_NAME ?ENTITY_NAME ?LABEL"; // TODO generalize filter

        return connection.executeSPARQL(query, format);
    }

    public void setOutputFormat(OutputFormat format) {
        this.format = format;
    }
}
