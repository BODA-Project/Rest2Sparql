package de.uni_passau.fim.dimis.rest2sparql.cubemanagement;

import de.uni_passau.fim.dimis.rest2sparql.triplestore.TripleStoreConnection;
import de.uni_passau.fim.dimis.util.PrefixCollection;
import de.uni_passau.fim.dimis.util.SparqlPrefix;

import java.io.IOException;

import static de.uni_passau.fim.dimis.rest2sparql.triplestore.TripleStoreConnection.OutputFormat;

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

    private TripleStoreConnection connection;
    private OutputFormat format = OutputFormat.XML;

    private PrefixCollection PrefixManager = new PrefixCollection();

    /**
     * Creat a new CubeManager.
     *
     * @param connection The connection to the triple store.
     */
    public CubeManager(TripleStoreConnection connection) {
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
    public String getCubes() throws IOException {

        String query = PrefixManager.createPrefixString() +
                "SELECT ?CUBE_NAME ?LABEL ?COMMENT. " +
                "WHERE { ?CUBE_NAME a qb:DataSet. " +
                "?CUBE_NAME rdfs:label ?LABEL. " +
                "?CUBE_NAME rdfs:comment ?COMMENT.}";

        return connection.ExecuteSPARQL(query, format);
    }

    public String getDimensions(String CubeName) {
        return ""; // TODO
    }

    public String getMeasures(String CubeName) {
        return ""; // TODO
    }

    public void setOutputFormat(OutputFormat format) {
        this.format = format;
    }
}
