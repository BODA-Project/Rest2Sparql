package de.uni_passau.fim.dimis.rest2sparql.cubemanagement;

import de.uni_passau.fim.dimis.rest2sparql.triplestore.TripleStoreConnection;

import java.io.IOException;

import static de.uni_passau.fim.dimis.rest2sparql.triplestore.TripleStoreConnection.*;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/22/13
 * Time: 5:10 PM
 * To change this template use File | Settings | File Templates.
 */
public class CubeManager {

    private TripleStoreConnection connection;
    private OutputFormat format = OutputFormat.XML;

    public CubeManager(TripleStoreConnection connection) {
        this.connection = connection;
    }

    public String getCubes() throws IOException {

        String query = "PREFIX qb: <http://purl.org/linked-data/cube#> " +
                "PREFIX code: <http://code-research.eu/resource/> " +
                "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> " +
                "SELECT ?CUBE_NAME ?LABEL ?COMMENT. " +
                "WHERE { ?CUBE_NAME a qb:DataSet. " +
                "?CUBE_NAME rdfs:label ?LABEL. " +
                "?CUBE_NAME rdfs:comment ?COMMENT.}";

        return connection.ExecuteSPARQL(query, format);
    }

    public String getDimensions(String CubeName) {
        return "";
    }

    public String getMeasures(String CubeName) {
        return "";
    }

    public void setOutputFormat(OutputFormat format) {
        this.format = format;
    }
}
